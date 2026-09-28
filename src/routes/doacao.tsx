import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero } from "@/components/site/Blocks";

export const Route = createFileRoute("/doacao")({
  head: () => ({
    meta: [
      { title: "Doação — ICNV Cerâmica" },
      { name: "description", content: "Contribua com dízimos e ofertas para a obra da Igreja Cristã Nova Vida em Cerâmica." },
      { property: "og:title", content: "Doação — ICNV Cerâmica" },
      { property: "og:description", content: "Dízimos e ofertas via Pix ou transferência." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Doação" title="Semeando juntos no bairro" text="Lorem ipsum dolor sit amet, sua generosidade sustenta a obra e alcança vidas." />
      <Container className="grid gap-5 py-6 md:grid-cols-3">
        <div className="glass-strong rounded-[24px] p-8 md:col-span-2">
          <div className="eyebrow">Pix</div>
          <p className="mt-3 font-serif text-3xl">00.000.000/0001-00</p>
          <p className="mt-2 text-sm text-muted-foreground">CNPJ · Igreja Cristã Nova Vida em Cerâmica (chave fictícia)</p>
        </div>
        <div className="glass rounded-[24px] p-8">
          <div className="eyebrow">Transferência</div>
          <p className="mt-3 text-sm text-muted-foreground">Banco Lorem (000)<br />Agência 0000 · Conta 00000-0</p>
        </div>
        {["Dízimos", "Ofertas", "Missões"].map((t) => (
          <div key={t} className="glass lift rounded-[20px] p-6">
            <div className="font-serif text-2xl">{t}</div>
            <p className="mt-2 text-sm text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        ))}
      </Container>
    </>
  ),
});
