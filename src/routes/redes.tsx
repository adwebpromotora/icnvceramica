import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Container, PageHero } from "@/components/site/Blocks";
import { SimpleForm } from "@/components/site/SimpleForm";
import { networks, images } from "@/lib/site-data";

export const Route = createFileRoute("/redes")({
  head: () => ({
    meta: [
      { title: "Redes — ICNV Cerâmica" },
      { name: "description", content: "Encontre uma rede perto de você e viva a fé em pequenos grupos." },
      { property: "og:title", content: "Redes — ICNV Cerâmica" },
      { property: "og:description", content: "Redes nos lares do bairro." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Redes" title="Conectados em redes de relacionamento" text="Lorem ipsum dolor sit amet, encontre uma rede perto de você." />
      <Container className="py-6">
        <img src={images.smallGroup} alt="Grupo estudando a Bíblia em casa" loading="lazy" className="aspect-[21/9] w-full rounded-[24px] object-cover ring-1 ring-border" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {networks.map((c) => (
            <div key={c.name} className="glass lift rounded-[20px] p-6">
              <div className="font-serif text-xl">{c.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">Anfitriões: {c.host}</div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{c.day}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{c.area}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 max-w-3xl">
          <h2 className="mb-6 font-serif text-3xl">Quero fazer parte de uma rede</h2>
          <SimpleForm fields={[
            { name: "nome", label: "Nome", required: true },
            { name: "telefone", label: "WhatsApp", type: "tel", required: true },
            { name: "bairro", label: "Bairro", required: true },
            { name: "celula", label: "Rede de preferência", type: "select", options: networks.map((c) => c.name) },
          ]} />
        </div>
      </Container>
    </>
  ),
});
