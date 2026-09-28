import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container } from "@/components/site/Blocks";
import { getPublicSermonFn } from "@/lib/public.functions";
import { fmtDate } from "@/lib/site-data";

export const Route = createFileRoute("/mensagens/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `Mensagem — ICNV Cerâmica` }, { name: "description", content: params.slug }],
  }),
  component: SermonPage,
});

function SermonPage() {
  const { slug } = Route.useParams();
  const [s, setS] = useState<Awaited<ReturnType<typeof getPublicSermonFn>> | null | undefined>(undefined);

  useEffect(() => {
    getPublicSermonFn({ data: { slug } })
      .then(setS)
      .catch(() => setS(null));
  }, [slug]);

  if (s === undefined) {
    return (
      <Container className="pt-44 pb-20">
        <p className="text-muted-foreground">Carregando…</p>
      </Container>
    );
  }
  if (!s) {
    return (
      <Container className="pt-44 pb-20 text-center">
        <h1 className="font-serif text-3xl">Mensagem não encontrada</h1>
        <Link to="/mensagens" className="mt-4 inline-block text-accent">
          Voltar às mensagens
        </Link>
      </Container>
    );
  }

  return (
    <article className="pt-36 lg:pt-44">
      <Container className="max-w-5xl">
        <Link to="/mensagens" className="text-sm text-muted-foreground hover:text-foreground">
          ← Mensagens
        </Link>
        <h1 className="mt-6 font-serif text-4xl font-medium leading-tight sm:text-5xl">{s.title}</h1>
        <p className="mt-4 text-muted-foreground">
          {[s.preacher, s.preached_at ? fmtDate(s.preached_at, { day: "2-digit", month: "long", year: "numeric" }) : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {s.summary && <p className="mt-6 text-lg text-muted-foreground">{s.summary}</p>}
        {s.content && (
          <div className="prose-church mt-10" dangerouslySetInnerHTML={{ __html: s.content }} />
        )}
      </Container>
    </article>
  );
}
