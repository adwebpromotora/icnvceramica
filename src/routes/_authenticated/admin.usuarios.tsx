import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, inputCls, btnPrimary } from "@/components/admin/AdminShell";
import { createTeamUser, setUserRole } from "@/lib/admin.functions";
import { useSession } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Painel ICNV" }, { name: "robots", content: "noindex" }] }),
  component: Users,
});

function Users() {
  const { role, userId } = useSession();
  const [list, setList] = useState<any[]>([]);
  const [f, setF] = useState({ name: "", email: "", password: "", role: "editor" as "admin" | "editor" });
  const create = useServerFn(createTeamUser);
  const changeRole = useServerFn(setUserRole);
  const load = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([supabase.from("profiles").select("*").order("created_at"), supabase.from("user_roles").select("*")]);
    setList((p ?? []).map((x) => ({ ...x, role: r?.find((y) => y.user_id === x.id)?.role ?? "none" })));
  };
  useEffect(() => { if (role === "admin") load(); }, [role]);
  if (role && role !== "admin") return <AdminShell title="Usuários"><p className="text-muted-foreground">Somente administradores.</p></AdminShell>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await create({ data: f }).catch(() => ({ ok: false, error: "Dados inválidos (senha 8+)." }));
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Usuário criado!"); setF({ name: "", email: "", password: "", role: "editor" }); load();
  };

  return (
    <AdminShell title="Usuários e permissões">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="glass overflow-x-auto rounded-2xl"><table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="px-4 py-3">Nome</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Papel</th></tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u.id} className="border-b border-border/60">
              <td className="px-4 py-3">{u.full_name}</td><td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">
                <select className={inputCls} disabled={u.id === userId} value={u.role} onChange={async (e) => { const r = await changeRole({ data: { userId: u.id, role: e.target.value as any } }); r.ok ? load() : toast.error(r.error); }}>
                  <option value="admin">Administrador</option><option value="editor">Comunicação</option><option value="none">Sem acesso</option>
                </select>
              </td>
            </tr>
          ))}</tbody>
        </table></div>
        <form onSubmit={submit} className="glass space-y-3 rounded-2xl p-6">
          <h2 className="font-serif text-xl">Novo usuário</h2>
          <input className={inputCls} placeholder="Nome" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={inputCls} type="email" placeholder="E-mail" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className={inputCls} type="password" minLength={8} placeholder="Senha inicial" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <select className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as any })}><option value="editor">Comunicação</option><option value="admin">Administrador</option></select>
          <button className={`${btnPrimary} w-full justify-center`}>Criar</button>
        </form>
      </div>
    </AdminShell>
  );
}
