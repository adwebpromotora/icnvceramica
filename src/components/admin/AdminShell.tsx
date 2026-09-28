import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Mic, FileText, ClipboardList, Settings, Users, LogOut, ArrowLeft, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { logoutFn } from "@/lib/admin";
import { useSession } from "@/lib/admin";

const items = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard, admin: false },
  { to: "/admin/eventos", label: "Agenda", icon: CalendarDays, admin: false },
  { to: "/admin/mensagens", label: "Mensagens", icon: Mic, admin: false },
  { to: "/admin/paginas", label: "Páginas", icon: FileText, admin: false },
  { to: "/admin/formularios", label: "Formulários", icon: ClipboardList, admin: false },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings, admin: false },
  { to: "/admin/usuarios", label: "Usuários", icon: Users, admin: true },
] as const;

export function AdminShell({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const { role, email, loading } = useSession();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const logout = async () => {
    try {
      await logoutFn();
    } catch {}
    document.cookie = "icnv_session=; Path=/; Max-Age=0; SameSite=Lax";
    window.location.href = "/admin/login";
  }); };

  if (!loading && !role) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="glass-strong max-w-md rounded-2xl p-8 text-center">
          <h1 className="font-serif text-2xl">Sem acesso ao painel</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sua conta ainda não tem permissão. Peça a um administrador.</p>
          <button onClick={logout} className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Sair</button>
        </div>
      </div>
    );
  }

  const Side = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="grid size-9 place-items-center rounded-lg bg-primary font-serif text-xs font-semibold text-primary-foreground">ICNV</span>
        <span className="font-serif text-lg">Cerâmica</span>
      </div>
      {items.filter((i) => !i.admin || role === "admin").map((i) => (
        <Link key={i.to} to={i.to} onClick={() => setOpen(false)} activeOptions={{ exact: i.to === "/admin" }}
          activeProps={{ className: "bg-primary text-primary-foreground" }}
          inactiveProps={{ className: "text-muted-foreground hover:bg-secondary hover:text-foreground" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
          <i.icon className="size-4" />{i.label}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-border pt-4">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><ArrowLeft className="size-4" />Voltar ao site</Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><LogOut className="size-4" />Sair</button>
        <p className="truncate px-3 pt-2 text-xs text-muted-foreground">{email} · {role === "admin" ? "Administrador" : "Comunicação"}</p>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="glass-strong sticky top-0 hidden h-screen border-r border-border lg:block">{Side}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-background">{Side}</aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4 lg:px-10">
          <button className="lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>{open ? <X /> : <Menu />}</button>
          <h1 className="font-serif text-2xl">{title}</h1>
          <div className="ml-auto flex gap-2">{actions}</div>
        </header>
        <div className="p-5 lg:p-10">{children}</div>
      </div>
    </div>
  );
}

export const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
export const btnPrimary = "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60";
export const btnGhost = "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary";
