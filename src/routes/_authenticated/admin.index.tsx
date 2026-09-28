import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Mic, FileText, ClipboardList, Cake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { churchAgeFrom } from "@/lib/admin";
import { fmtDateTime, fmtDay } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Painel — ICNV Cerâmica" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [d, setD] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const c = (t: "events" | "sermons" | "pages" | "forms" | "form_submissions") => supabase.from(t).select("id", { count: "exact", head: true }).then((r) => r.count ?? 0);
      const [events, sermons, pages, forms, subs, up, last, s] = await Promise.all([
        c("events"), c("sermons"), c("pages"), c("forms"), c("form_submissions"),
        supabase.from("events").select("id,title,starts_at").gte("starts_at", new Date().toISOString()).order("starts_at").limit(5).then((r) => r.data ?? []),
        supabase.from("sermons").select("id,title,preached_at,preacher").order("preached_at", { ascending: false }).limit(5).then((r) => r.data ?? []),
        supabase.from("site_settings").select("founded_at").eq("id", 1).single().then((r) => r.data),
      ]);
      setD({ events, sermons, pages, forms, subs, up, last, age: churchAgeFrom(s?.founded_at ?? "1997-03-15") });
    })();
  }, []);

  const stats = d ? [
    { label: "Páginas", v: d.pages, icon: FileText }, { label: "Eventos", v: d.events, icon: CalendarDays },
    { label: "Mensagens", v: d.sermons, icon: Mic }, { label: "Cadastros recebidos", v: d.subs, icon: ClipboardList },
  ] : [];

  return (
    <AdminShell title="Painel">
      {!d ? <p className="text-muted-foreground">Carregando…</p> : (
        <div className="space-y-6">
          <div className="glass-strong flex flex-wrap items-center gap-4 rounded-2xl p-6">
            <Cake className="size-8 text-accent" />
            <div>
              <p className="font-serif text-2xl">Há {d.age.years} anos e {d.age.months} meses transformando vidas</p>
              {d.age.milestone && <p className="text-sm text-muted-foreground">Em breve: {d.age.milestone} anos de igreja! 🎉</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5">
                <s.icon className="size-5 text-muted-foreground" />
                <p className="mt-3 font-serif text-3xl">{s.v}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <div className="mb-3 flex justify-between"><h2 className="font-serif text-xl">Próximos eventos</h2><Link to="/admin/eventos" className="text-sm text-primary">Ver todos</Link></div>
              {d.up.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum evento futuro.</p> : d.up.map((e: any) => <div key={e.id} className="flex justify-between border-b border-border/60 py-2 text-sm last:border-0"><span>{e.title}</span><span className="text-muted-foreground">{fmtDateTime(e.starts_at)}</span></div>)}
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="mb-3 flex justify-between"><h2 className="font-serif text-xl">Últimas mensagens</h2><Link to="/admin/mensagens" className="text-sm text-primary">Ver todas</Link></div>
              {d.last.map((s: any) => <div key={s.id} className="flex justify-between border-b border-border/60 py-2 text-sm last:border-0"><span>{s.title}</span><span className="text-muted-foreground">{fmtDay(s.preached_at)}</span></div>)}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
