import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHero } from "@/components/site/Blocks";
import { ministries } from "@/lib/site-data";

export const Route = createFileRoute("/ministerios")({
  head: () => ({
    meta: [
      { title: "Ministérios — ICNV Cerâmica" },
      { name: "description", content: "Conheça os ministérios da ICNV Cerâmica e encontre seu lugar para servir." },
      { property: "og:title", content: "Ministérios — ICNV Cerâmica" },
      { property: "og:description", content: "Encontre seu lugar para servir e crescer." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Ministérios" title="Lugares para servir e crescer" text="Lorem ipsum dolor sit amet, cada dom tem um lugar na nossa família." />
      <Container className="py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ministries.map((m, i) => (
            <div key={m.name} className="glass lift rounded-[20px] p-6">
              <div className="text-xs font-medium text-accent">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-3 font-serif text-2xl font-medium">{m.name}</div>
              <p className="mt-3 text-sm text-muted-foreground">{m.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/voluntario" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Quero servir</Link>
        </div>
      </Container>
    </>
  ),
});
