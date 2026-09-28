import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  needsFirstAdminFn,
  registerFirstAdminFn,
  loginFn,
} from "@/lib/admin";
import { getRecaptchaPublicFn } from "@/lib/public.functions";
import { inputCls, btnPrimary } from "@/components/admin/AdminShell";
import { AuthCard } from "@/components/admin/AuthCard";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Painel ICNV Cerâmica" },
      { name: "description", content: "Acesso ao painel administrativo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; theme?: string },
      ) => number;
      getResponse: (id?: number) => string;
      reset: (id?: number) => void;
    };
    ___onRecaptchaLoad?: () => void;
  }
}

function Login() {
  const nav = useNavigate();
  const [boot, setBoot] = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [siteKey, setSiteKey] = useState("");
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    needsFirstAdminFn()
      .then((r) => setBoot(r.needsSetup))
      .catch(() => {});
    getRecaptchaPublicFn()
      .then((r) => setSiteKey(r.siteKey || ""))
      .catch(() => {});
  }, []);

  // Carrega e renderiza reCAPTCHA v2 quando a chave existe
  useEffect(() => {
    if (!siteKey || !captchaRef.current) return;
    const render = () => {
      if (!window.grecaptcha || !captchaRef.current || widgetId.current !== null) return;
      try {
        widgetId.current = window.grecaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          theme: "light",
        });
      } catch {
        /* já renderizado */
      }
    };
    if (window.grecaptcha) {
      render();
      return;
    }
    window.___onRecaptchaLoad = render;
    const existing = document.querySelector('script[data-icnv-recaptcha]');
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?onload=___onRecaptchaLoad&render=explicit";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-icnv-recaptcha", "1");
      document.head.appendChild(s);
    }
  }, [siteKey]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let recaptchaToken = "";
      if (siteKey) {
        recaptchaToken = window.grecaptcha?.getResponse(widgetId.current ?? undefined) || "";
        if (!recaptchaToken) {
          toast.error("Confirme o reCAPTCHA.");
          setBusy(false);
          return;
        }
      }

      if (boot) {
        const r = await registerFirstAdminFn({
          data: { name: f.name, email: f.email, password: f.password },
        });
        if (!r.ok) {
          toast.error(r.error);
          setBusy(false);
          return;
        }
      }
      const result = await loginFn({
        data: { email: f.email, password: f.password, recaptchaToken },
      });
      if (!result.ok) {
        toast.error("error" in result ? result.error : "E-mail ou senha incorretos.");
        if (siteKey && window.grecaptcha && widgetId.current !== null) {
          window.grecaptcha.reset(widgetId.current);
        }
        setBusy(false);
        return;
      }
      if ("token" in result && result.token) {
        const maxAge = 14 * 24 * 60 * 60;
        const secure = location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `icnv_session=${result.token}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
      }
      nav({ to: "/admin" });
    } catch {
      toast.error("Não foi possível autenticar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title={boot ? "Criar administrador" : "Entrar no painel"}>
      {boot && (
        <p className="mb-4 text-sm text-muted-foreground">
          Primeiro acesso: crie a conta do administrador principal. Depois deste cadastro,
          novos usuários só podem ser criados pelo painel.
        </p>
      )}
      <form onSubmit={submit} className="grid gap-3">
        {boot && (
          <input
            className={inputCls}
            placeholder="Seu nome"
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        )}
        <input
          className={inputCls}
          type="email"
          placeholder="E-mail"
          required
          autoComplete="username"
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
        <input
          className={inputCls}
          type="password"
          placeholder="Senha"
          required
          minLength={8}
          autoComplete={boot ? "new-password" : "current-password"}
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        {/* reCAPTCHA — só aparece se RECAPTCHA_SITE_KEY estiver no ambiente */}
        {siteKey ? (
          <div className="flex justify-center py-2" data-no-edit>
            <div ref={captchaRef} id="icnv-login-recaptcha" />
          </div>
        ) : null}
        <button type="submit" className={btnPrimary} disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {boot ? "Criar e entrar" : "Entrar"}
        </button>
      </form>
    </AuthCard>
  );
}
