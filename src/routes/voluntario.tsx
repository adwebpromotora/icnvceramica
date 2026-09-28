import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero } from "@/components/site/Blocks";
import { SimpleForm } from "@/components/site/SimpleForm";
import { ministries } from "@/lib/site-data";

export const Route = createFileRoute("/voluntario")({
  head: () => ({
    meta: [
      { title: "Seja Voluntário — ICNV Cerâmica" },
      { name: "description", content: "Use seus dons para servir: inscreva-se como voluntário na ICNV Cerâmica." },
      { property: "og:title", content: "Seja Voluntário — ICNV Cerâmica" },
      { property: "og:description", content: "Inscreva-se para servir em um ministério." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Seja voluntário" title="Seus dons fazem diferença" text="Lorem ipsum dolor sit amet, escolha onde deseja servir e nossa equipe entrará em contato." />
      <Container className="max-w-4xl py-6">
        <SimpleForm
          submitLabel="Quero servir"
          fields={[
            { name: "nome", label: "Nome completo", required: true },
            { name: "email", label: "E-mail", type: "email", required: true },
            { name: "telefone", label: "WhatsApp", type: "tel", required: true },
            { name: "ministerio", label: "Ministério de interesse", type: "select", options: ministries.map((m) => m.name), required: true },
            { name: "sobre", label: "Conte um pouco sobre você", type: "textarea" },
          ]}
        />
      </Container>
    </>
  ),
});
