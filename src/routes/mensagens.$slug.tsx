import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Container } from "@/components/site/Blocks";
import { fmtDate, sermons } from "@/lib/site-data";

export const Route = createFileRoute("/mensagens/$slug")({
  loader: ({ params }) => {
    const s = sermons.find((x) => x.slug === params.slug);
    if (!s) throw notFound();
    return { s };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.s.title} — Mensagens ICNV Cerâmica` },
          { name: "description", content: loaderData.s.excerpt },
          { property: "og:title", content: loaderData.s.title },
          { property: "og:description", content: loaderData.s.excerpt },
        ]
      : [{ title: "Mensagem não encontrada" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <Container className="pt-44 pb-20 text-center">
      <h1 className="font-serif text-3xl">Mensagem não encontrada</h1>
      <Link to="/mensagens" className="mt-4 inline-block text-accent">Voltar às mensagens</Link>
    </Container>
  ),
  component: SermonPage,
});

function SermonPage() {
  const { s } = Route.useLoaderData();
  return (
    <article className="pt-36 lg:pt-44">
      <Container className="max-w-5xl">
        <Link to="/mensagens" className="text-sm text-muted-foreground hover:text-foreground">← Mensagens</Link>
        <div className="eyebrow mt-6">{s.series}</div>
        <h1 className="mt-3 font-serif text-4xl font-medium leading-tight sm:text-5xl">{s.title}</h1>
        <p className="mt-4 text-muted-foreground">{s.preacher} · {fmtDate(s.date, { day: "2-digit", month: "long", year: "numeric" })} · {s.duration}</p>
        <div className="mt-10 aspect-video overflow-hidden rounded-[24px] ring-1 ring-border">
          <iframe
            className="size-full"
            src={`https://www.youtube-nocookie.com/embed/${s.videoId}`}
            title={s.title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="prose-church mx-auto mt-10 max-w-3xl text-lg" dangerouslySetInnerHTML={{ __html: s.body }} />
      </Container>
    </article>
  );
}
