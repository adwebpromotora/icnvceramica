import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container, PageHero } from "@/components/site/Blocks";
import { getPublicPageFn } from "@/lib/public.functions";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — ICNV Cerâmica` }, { name: "robots", content: "index" }],
  }),
  component: DynamicPage,
});

function DynamicPage() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState<{ title: string; content: string | null } | null | undefined>(undefined);

  useEffect(() => {
    getPublicPageFn({ data: { slug } })
      .then((p) => setPage(p ? { title: p.title, content: p.content } : null))
      .catch(() => setPage(null));
  }, [slug]);

  if (page === undefined) {
    return (
      <Container className="py-32">
        <p className="text-muted-foreground">Carregando…</p>
      </Container>
    );
  }
  if (!page) {
    return (
      <Container className="py-32 text-center">
        <h1 className="font-serif text-3xl">Página não encontrada</h1>
      </Container>
    );
  }

  return (
    <>
      <PageHero eyebrow="Página" title={page.title} />
      <Container className="pb-20">
        <div
          className="prose-church max-w-3xl"
          dangerouslySetInnerHTML={{ __html: page.content || "" }}
        />
      </Container>
    </>
  );
}
