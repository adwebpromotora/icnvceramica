import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHero } from "@/components/site/Blocks";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({ meta: [{ title: "ICNV Cerâmica" }, { name: "description", content: "Página da Igreja Cristã Nova Vida em Cerâmica." }, { property: "og:title", content: "ICNV Cerâmica" }, { property: "og:description", content: "Página da Igreja Cristã Nova Vida em Cerâmica." }] }),
  component: DynamicPage,
});

function DynamicPage() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState<{ title: string; content: string | null } | null | undefined>(undefined);
  useEffect(() => {
    supabase.from("pages").select("title,content").eq("slug", slug).maybeSingle().then(({ data }) => setPage(data));
  }, [slug]);
  if (page === undefined) return <div className="min-h-[60vh]" />;
  if (!page) return <Container><p className="py-40 text-center text-muted-foreground">Página não encontrada.</p></Container>;
  return (
    <>
      <PageHero eyebrow="ICNV Cerâmica" title={page.title} />
      <Container><div className="prose-church mx-auto max-w-3xl pb-24" dangerouslySetInnerHTML={{ __html: page.content ?? "" }} /></Container>
    </>
  );
}
