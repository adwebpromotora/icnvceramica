import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/admin/AuthCard";
import { inputCls, btnPrimary } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/esqueci-senha")({
  head: () => ({ meta: [{ title: "Esqueci minha senha — Painel ICNV" }, { name: "description", content: "Recuperar acesso ao painel." }, { name: "robots", content: "noindex" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/redefinir-senha` });
    setSent(true);
  };
  return (
    <AuthCard title="Esqueci minha senha">
      {sent ? <p className="text-sm text-muted-foreground">Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.</p> : (
        <form onSubmit={submit} className="space-y-3">
          <input className={inputCls} type="email" placeholder="Seu e-mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className={`${btnPrimary} w-full justify-center py-2.5`}>Enviar link</button>
        </form>
      )}
      <Link to="/admin/login" className="mt-4 block text-center text-sm text-primary hover:underline">Voltar ao login</Link>
    </AuthCard>
  );
}
