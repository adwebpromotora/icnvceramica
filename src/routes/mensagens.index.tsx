import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container, PageHero } from "@/components/site/Blocks";
import { listPublicSermonsFn } from "@/lib/public.functions";
import { fmtDate } from "@/lib/site-data";

export const Route = createFileRoute("/mensagens/")({
  head: () => ({
    meta: [
      { title: "Mensagens — ICNV Cerâmica" },
      { name: "description", content: "Sermões e mensagens da Igreja Cristã Nova Vida em Cerâmica." },
    ],
  }),
  component: MensagensPage,
});

type Sm = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  preached_at: string | null;
  preacher: string | null;
};

function MensagensPage() {
  const [items, setItems] = useState<Sm[] | null>(null);
  useEffect(() => {
    listPublicSermonsFn()
      .then((rows) => setItems(rows as Sm[]))
      .catch(() => setItems([]));
  }, []);

  return (
    <>
      <PageHero eyebrow="Mensagens" title="Palavra e ensino" text="Sermões recentes para ouvir e refletir." />
      <Container className="pb-20">
        {items === null && <p className="text-muted-foreground">Carregando…</p>}
        {items && items.length === 0 && (
          <p className="text-muted-foreground">Nenhuma mensagem publicada no momento.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {items?.map((s) => (
            <Link
              key={s.id}
              to="/mensagens/$slug"
              params={{ slug: s.slug }}
              className="glass group rounded-2xl p-5 transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.preached_at ? fmtDate(s.preached_at) : ""}
                {s.preacher ? ` · ${s.preacher}` : ""}
              </p>
              <h2 className="mt-2 font-serif text-xl group-hover:text-primary">{s.title}</h2>
              {s.summary && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{s.summary}</p>}
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
