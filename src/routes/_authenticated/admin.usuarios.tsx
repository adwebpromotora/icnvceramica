import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, inputCls, btnPrimary, btnGhost } from "@/components/admin/AdminShell";
import { createTeamUser, listUsers, setUserRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({
    meta: [{ title: "Usuários — ICNV Cerâmica" }, { name: "robots", content: "noindex" }],
  }),
  component: UsersPage,
});

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role: string | null;
  created_at: string;
};

function UsersPage() {
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor" as "admin" | "editor",
  });

  const load = async () => {
    try {
      const data = await listUsers();
      setRows(data as UserRow[]);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível listar usuários.");
      setRows([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await createTeamUser({ data: f });
      if (!r.ok) {
        toast.error(r.error || "Erro ao criar.");
        setBusy(false);
        return;
      }
      toast.success("Usuário criado.");
      setOpen(false);
      setF({ name: "", email: "", password: "", role: "editor" });
      load();
    } catch {
      toast.error("Erro ao criar usuário.");
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (userId: string, role: "admin" | "editor" | "none") => {
    const r = await setUserRole({ data: { userId, role } });
    if (!r.ok) {
      toast.error(r.error || "Não foi possível alterar.");
      return;
    }
    toast.success("Papel atualizado.");
    load();
  };

  return (
    <AdminShell
      title="Usuários"
      actions={
        <button className={btnPrimary} onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Novo usuário
        </button>
      }
    >
      {open && (
        <form onSubmit={create} className="glass mb-6 grid max-w-lg gap-3 rounded-2xl p-5">
          <h2 className="font-serif text-lg">Criar usuário</h2>
          <input
            className={inputCls}
            placeholder="Nome"
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
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
            placeholder="Senha (8+)"
            required
            minLength={8}
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
          />
          <select
            className={inputCls}
            value={f.role}
            onChange={(e) => setF({ ...f, role: e.target.value as "admin" | "editor" })}
          >
            <option value="editor">Comunicação</option>
            <option value="admin">Administrador</option>
          </select>
          <div className="flex gap-2">
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className={btnPrimary} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Criar
            </button>
          </div>
        </form>
      )}

      {rows === null ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">Nenhum usuário.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role === "admin"
                      ? "Administrador"
                      : u.role === "editor"
                        ? "Comunicação"
                        : "Sem acesso"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={inputCls + " max-w-[160px]"}
                      value={u.role ?? "none"}
                      onChange={(e) =>
                        changeRole(u.id, e.target.value as "admin" | "editor" | "none")
                      }
                    >
                      <option value="admin">Administrador</option>
                      <option value="editor">Comunicação</option>
                      <option value="none">Sem acesso</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
