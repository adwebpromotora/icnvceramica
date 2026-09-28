import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, ServiceTimes } from "@/components/site/Blocks";
import { church } from "@/lib/site-data";

export const Route = createFileRoute("/onde-estamos")({
  head: () => ({
    meta: [
      { title: "Onde Estamos — ICNV Cerâmica" },
      { name: "description", content: "Endereço, mapa e horários de culto da Igreja Cristã Nova Vida em Cerâmica." },
      { property: "og:title", content: "Onde Estamos — ICNV Cerâmica" },
      { property: "og:description", content: "Endereço, mapa e horários de culto." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Onde estamos" title="Venha nos visitar" text="De portas abertas no coração do bairro Cerâmica." />
      <Container className="grid gap-8 py-6 lg:grid-cols-5">
        <div className="glass space-y-6 rounded-[24px] p-8 lg:col-span-2">
          <div><div className="eyebrow">Endereço</div><p className="mt-2 font-serif text-xl">{church.address}</p><p className="text-muted-foreground">{church.city}</p></div>
          <div><div className="eyebrow">Contato</div><p className="mt-2">{church.phone}</p><p className="text-muted-foreground">{church.email}</p></div>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(church.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground">
            Abrir no Google Maps
          </a>
        </div>
        <div className="min-h-[380px] overflow-hidden rounded-[24px] ring-1 ring-border lg:col-span-3">
          <iframe title="Mapa" className="size-full min-h-[380px]" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(church.mapQuery)}&output=embed`} />
        </div>
      </Container>
      <Container className="py-10"><ServiceTimes /></Container>
    </>
  ),
});
