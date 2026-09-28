import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  needsFirstAdminFn,
  registerFirstAdminFn,
  loginFn,
} from "@/lib/admin";
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

function Login() {
  const nav = useNavigate();
  const [boot, setBoot] = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    needsFirstAdminFn()
      .then((r) => setBoot(r.needsSetup))
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
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
      const result = await loginFn({ data: { email: f.email, password: f.password } });
      if (!result.ok) {
        toast.error("error" in result ? result.error : "E-mail ou senha incorretos.");
        setBusy(false);
        return;
      }
      // Grava cookie de sessão no browser (httpOnly idealmente via response header;
      // aqui usamos document.cookie como fallback compatível com o fluxo atual).
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
          Primeiro acesso: crie a conta do administrador principal. Depois deste
          cadastro, novos usuários só podem ser criados pelo admin no painel.
        </p>
      )}
      <form onSubmit={submit} className="space-y-3">
        {boot && (
          <input
            className={inputCls}
            placeholder="Nome"
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
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
        <input
          className={inputCls}
          type="password"
          placeholder="Senha"
          required
          minLength={boot ? 8 : 1}
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        <button className={`${btnPrimary} w-full justify-center py-2.5`} disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {boot ? "Criar e entrar" : "Entrar"}
        </button>
      </form>
      {!boot && (
        <Link
          to="/admin/esqueci-senha"
          className="mt-4 block text-center text-sm text-primary hover:underline"
        >
          Esqueci minha senha
        </Link>
      )}
    </AuthCard>
  );
}
