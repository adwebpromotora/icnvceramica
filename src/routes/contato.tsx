import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero } from "@/components/site/Blocks";
import { SimpleForm } from "@/components/site/SimpleForm";
import { church } from "@/lib/site-data";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — ICNV Cerâmica" },
      { name: "description", content: "Fale com a Igreja Cristã Nova Vida em Cerâmica: pedidos de oração, dúvidas e visitas." },
      { property: "og:title", content: "Contato — ICNV Cerâmica" },
      { property: "og:description", content: "Envie sua mensagem ou pedido de oração." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Contato" title="Queremos ouvir você" text="Lorem ipsum dolor sit amet, envie sua mensagem ou pedido de oração." />
      <Container className="grid gap-8 py-6 lg:grid-cols-3">
        <div className="glass space-y-4 rounded-[24px] p-8">
          <div className="eyebrow">Fale conosco</div>
          <p className="font-serif text-xl">{church.phone}</p>
          <p className="text-muted-foreground">{church.email}</p>
          <p className="text-muted-foreground">{church.address}</p>
        </div>
        <div className="lg:col-span-2">
          <SimpleForm
            fields={[
              { name: "nome", label: "Nome", required: true },
              { name: "email", label: "E-mail", type: "email", required: true },
              { name: "telefone", label: "Telefone", type: "tel" },
              { name: "assunto", label: "Assunto", type: "select", options: ["Dúvida", "Pedido de oração", "Visita", "Outro"] },
              { name: "mensagem", label: "Mensagem", type: "textarea", required: true },
            ]}
          />
        </div>
      </Container>
    </>
  ),
});
