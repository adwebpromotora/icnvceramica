import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import { Container } from "@/components/site/Blocks";
import { events, fmtDate, fmtTime } from "@/lib/site-data";

export const Route = createFileRoute("/agenda/$slug")({
  loader: ({ params }) => {
    const e = events.find((x) => x.slug === params.slug);
    if (!e) throw notFound();
    return { e };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.e.title} — Agenda ICNV Cerâmica` },
          { name: "description", content: loaderData.e.excerpt },
          { property: "og:title", content: loaderData.e.title },
          { property: "og:description", content: loaderData.e.excerpt },
        ]
      : [{ title: "Evento não encontrado" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <Container className="pt-44 pb-20 text-center">
      <h1 className="font-serif text-3xl">Evento não encontrado</h1>
      <Link to="/agenda" className="mt-4 inline-block text-accent">Voltar à agenda</Link>
    </Container>
  ),
  component: EventPage,
});

function EventPage() {
  const { e } = Route.useLoaderData();
  return (
    <article className="pt-36 lg:pt-44">
      <Container className="max-w-4xl">
        <Link to="/agenda" className="text-sm text-muted-foreground hover:text-foreground">← Agenda</Link>
        <span className="ml-3 rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">{e.category}</span>
        <h1 className="mt-6 font-serif text-4xl font-medium leading-tight sm:text-5xl">{e.title}</h1>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2"><CalendarDays className="size-4" />{fmtDate(e.start, { weekday: "long", day: "2-digit", month: "long" })} · {fmtTime(e.start)}–{fmtTime(e.end)}</span>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2"><MapPin className="size-4" />{e.location}</span>
        </div>
        <img src={e.image} alt="" className="mt-10 aspect-[16/9] w-full rounded-[24px] object-cover ring-1 ring-border" />
        {/* Conteúdo vindo do editor visual — será sanitizado no servidor antes de salvar (fase CMS). */}
        <div className="prose-church mt-10 text-lg" dangerouslySetInnerHTML={{ __html: e.body }} />
      </Container>
    </article>
  );
}
