import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Mic, FileText, ClipboardList, Cake } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { churchAgeFrom } from "@/lib/admin";
import { getDashboardStats } from "@/lib/admin.functions";
import { fmtDateTime, fmtDay } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [{ title: "Painel — ICNV Cerâmica" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [d, setD] = useState<{
    pages: number;
    events: number;
    sermons: number;
    forms: number;
    responses: number;
    upcoming: { id: string; title: string; starts_at: string; location: string | null }[];
    recentSermons: {
      id: string;
      title: string;
      preached_at: string | null;
      preacher: string | null;
    }[];
    age: { years: number; months: number; sinceYear: number };
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then((s) => {
        setD({
          pages: s.pages,
          events: s.events,
          sermons: s.sermons,
          forms: s.forms,
          responses: s.responses,
          upcoming: s.upcoming,
          recentSermons: s.recentSermons,
          age: churchAgeFrom(s.founded_at ?? "1997-03-15"),
        });
      })
      .catch((e) => {
        console.error(e);
        setErr("Não foi possível carregar o painel. Verifique a conexão com o banco.");
      });
  }, []);

  const stats = d
    ? [
        { label: "Páginas", v: d.pages, icon: FileText, to: "/admin/paginas" },
        { label: "Eventos", v: d.events, icon: CalendarDays, to: "/admin/eventos" },
        { label: "Mensagens", v: d.sermons, icon: Mic, to: "/admin/mensagens" },
        { label: "Cadastros recebidos", v: d.responses, icon: ClipboardList, to: "/admin/formularios" },
      ]
    : [];

  return (
    <AdminShell title="Painel">
      {err && <p className="text-destructive">{err}</p>}
      {!d && !err ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : d ? (
        <div className="space-y-6">
          <div className="glass-strong flex flex-wrap items-center gap-4 rounded-2xl p-6">
            <Cake className="size-8 text-accent" />
            <div>
              <p className="font-serif text-2xl">
                Há {d.age.years} anos e {d.age.months} meses transformando vidas
              </p>
              <p className="text-sm text-muted-foreground">Desde {d.age.sinceYear}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Link
                key={s.label}
                to={s.to}
                className="glass rounded-2xl p-5 transition hover:-translate-y-0.5"
              >
                <s.icon className="size-5 text-primary" />
                <p className="mt-3 font-serif text-3xl">{s.v}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </Link>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="glass rounded-2xl p-5">
              <h2 className="font-serif text-xl">Próximos eventos</h2>
              <ul className="mt-4 space-y-3">
                {d.upcoming.length === 0 && (
                  <li className="text-sm text-muted-foreground">Nenhum evento futuro.</li>
                )}
                {d.upcoming.map((e) => (
                  <li key={e.id} className="text-sm">
                    <span className="font-medium">{e.title}</span>
                    <span className="text-muted-foreground"> · {fmtDateTime(e.starts_at)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="glass rounded-2xl p-5">
              <h2 className="font-serif text-xl">Últimas mensagens</h2>
              <ul className="mt-4 space-y-3">
                {d.recentSermons.length === 0 && (
                  <li className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</li>
                )}
                {d.recentSermons.map((s) => (
                  <li key={s.id} className="text-sm">
                    <span className="font-medium">{s.title}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {fmtDay(s.preached_at)}
                      {s.preacher ? ` · ${s.preacher}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
