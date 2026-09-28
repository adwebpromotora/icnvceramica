import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container, PageHero } from "@/components/site/Blocks";
import { SimpleForm } from "@/components/site/SimpleForm";
import { getPublicSettingsFn } from "@/lib/public.functions";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — ICNV Cerâmica" },
      {
        name: "description",
        content:
          "Fale com a Igreja Cristã Nova Vida em Cerâmica: pedidos de oração, dúvidas e visitas.",
      },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [info, setInfo] = useState({ phone: "", email: "", address: "" });

  useEffect(() => {
    getPublicSettingsFn()
      .then((s) =>
        setInfo({
          phone: s.phone || "",
          email: s.email || "",
          address: s.address || "",
        }),
      )
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Contato"
        title="Queremos ouvir você"
        text="Envie sua mensagem ou pedido de oração."
      />
      <Container className="grid gap-8 py-6 lg:grid-cols-3">
        <div className="glass space-y-4 rounded-[24px] p-8">
          <div className="eyebrow">Fale conosco</div>
          <p className="font-serif text-xl">{info.phone || "—"}</p>
          <p className="text-muted-foreground">{info.email || "—"}</p>
          <p className="text-muted-foreground">{info.address || "—"}</p>
        </div>
        <div className="lg:col-span-2">
          <SimpleForm
            fields={[
              { name: "nome", label: "Nome", required: true },
              { name: "email", label: "E-mail", type: "email", required: true },
              { name: "telefone", label: "Telefone", type: "tel" },
              {
                name: "assunto",
                label: "Assunto",
                type: "select",
                options: ["Dúvida", "Pedido de oração", "Visita", "Outro"],
              },
              { name: "mensagem", label: "Mensagem", type: "textarea", required: true },
            ]}
          />
        </div>
      </Container>
    </>
  );
}
