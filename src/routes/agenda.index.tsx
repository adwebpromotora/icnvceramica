import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container, PageHero } from "@/components/site/Blocks";
import { listPublicEventsFn } from "@/lib/public.functions";
import { fmtDate, fmtTime } from "@/lib/site-data";

export const Route = createFileRoute("/agenda/")({
  head: () => ({
    meta: [
      { title: "Agenda — ICNV Cerâmica" },
      { name: "description", content: "Próximos eventos e cultos da Igreja Cristã Nova Vida em Cerâmica." },
    ],
  }),
  component: AgendaPage,
});

type Ev = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  starts_at: string;
  location: string | null;
};

function AgendaPage() {
  const [items, setItems] = useState<Ev[] | null>(null);
  useEffect(() => {
    listPublicEventsFn()
      .then((rows) => setItems(rows as Ev[]))
      .catch(() => setItems([]));
  }, []);

  return (
    <>
      <PageHero eyebrow="Agenda" title="Próximos encontros" text="Cultos, encontros e ações no bairro." />
      <Container className="pb-20">
        {items === null && <p className="text-muted-foreground">Carregando…</p>}
        {items && items.length === 0 && (
          <p className="text-muted-foreground">Nenhum evento publicado no momento.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((e) => (
            <Link
              key={e.id}
              to="/agenda/$slug"
              params={{ slug: e.slug }}
              className="glass group rounded-2xl p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {fmtDate(e.starts_at)} · {fmtTime(e.starts_at)}
              </p>
              <h2 className="mt-2 font-serif text-xl group-hover:text-primary">{e.title}</h2>
              {e.location && <p className="mt-1 text-sm text-muted-foreground">{e.location}</p>}
              {e.summary && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{e.summary}</p>}
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
