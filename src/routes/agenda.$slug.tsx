import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { Container } from "@/components/site/Blocks";
import { getPublicEventFn } from "@/lib/public.functions";
import { fmtDate, fmtTime } from "@/lib/site-data";

export const Route = createFileRoute("/agenda/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `Evento — ICNV Cerâmica` }, { name: "description", content: params.slug }],
  }),
  component: EventPage,
});

function EventPage() {
  const { slug } = Route.useParams();
  const [e, setE] = useState<Awaited<ReturnType<typeof getPublicEventFn>> | null | undefined>(undefined);

  useEffect(() => {
    getPublicEventFn({ data: { slug } })
      .then(setE)
      .catch(() => setE(null));
  }, [slug]);

  if (e === undefined) {
    return (
      <Container className="pt-44 pb-20">
        <p className="text-muted-foreground">Carregando…</p>
      </Container>
    );
  }
  if (!e) {
    return (
      <Container className="pt-44 pb-20 text-center">
        <h1 className="font-serif text-3xl">Evento não encontrado</h1>
        <Link to="/agenda" className="mt-4 inline-block text-accent">
          Voltar à agenda
        </Link>
      </Container>
    );
  }

  return (
    <article className="pt-36 lg:pt-44">
      <Container className="max-w-4xl">
        <Link to="/agenda" className="text-sm text-muted-foreground hover:text-foreground">
          ← Agenda
        </Link>
        <h1 className="mt-6 font-serif text-4xl font-medium leading-tight sm:text-5xl">{e.title}</h1>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2">
            <CalendarDays className="size-4" />
            {fmtDate(e.starts_at, { weekday: "long", day: "2-digit", month: "long" })} ·{" "}
            {fmtTime(e.starts_at)}
            {e.ends_at ? `–${fmtTime(e.ends_at)}` : ""}
          </span>
          {e.location && (
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2">
              <MapPin className="size-4" />
              {e.location}
            </span>
          )}
        </div>
        {e.summary && <p className="mt-8 text-lg text-muted-foreground">{e.summary}</p>}
        {e.content && (
          <div className="prose-church mt-8" dangerouslySetInnerHTML={{ __html: e.content }} />
        )}
      </Container>
    </article>
  );
}
