import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/admin/AuthCard";
import { inputCls, btnPrimary } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/redefinir-senha")({
  head: () => ({ meta: [{ title: "Nova senha — Painel ICNV" }, { name: "description", content: "Definir nova senha." }, { name: "robots", content: "noindex" }] }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error("Link expirado ou senha inválida."); return; }
    toast.success("Senha alterada!"); nav({ to: "/admin" });
  };
  return (
    <AuthCard title="Criar nova senha">
      <form onSubmit={submit} className="space-y-3">
        <input className={inputCls} type="password" minLength={8} placeholder="Nova senha (8+ caracteres)" required value={pw} onChange={(e) => setPw(e.target.value)} />
        <button className={`${btnPrimary} w-full justify-center py-2.5`}>Salvar senha</button>
      </form>
    </AuthCard>
  );
}
