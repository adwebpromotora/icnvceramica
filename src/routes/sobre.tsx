import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, SectionHead } from "@/components/site/Blocks";
import { church, churchAge, images, leaders } from "@/lib/site-data";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — ICNV Cerâmica" },
      { name: "description", content: "História, visão, missão e liderança da Igreja Cristã Nova Vida em Cerâmica." },
      { property: "og:title", content: "Sobre a ICNV Cerâmica" },
      { property: "og:description", content: "Conheça nossa história, visão, missão e liderança." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  const age = churchAge();
  return (
    <>
      <PageHero eyebrow="Sobre nós" title={`Há ${age.years} anos transformando vidas`} text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Uma igreja nascida no bairro, para o bairro." />
      <Container className="grid gap-10 py-10 lg:grid-cols-2">
        <img src={images.community} alt="Comunidade reunida" loading="lazy" className="aspect-[4/3] w-full rounded-[24px] object-cover ring-1 ring-border" />
        <div className="prose-church self-center">
          <h2>Nossa história</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Desde {age.sinceYear}, integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p>
          <p>Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Maecenas faucibus mollis interdum.</p>
        </div>
      </Container>
      <Container className="grid gap-5 py-10 md:grid-cols-2">
        {[["Visão", "Lorem ipsum dolor sit amet, ser uma igreja que acolhe e transforma o bairro."], ["Missão", "Consectetur adipiscing elit, fazer discípulos que amam a Deus e servem as pessoas."]].map(([t, d]) => (
          <div key={t} className="glass rounded-[24px] p-8">
            <div className="eyebrow">{t}</div>
            <p className="mt-3 font-serif text-2xl leading-snug">{d}</p>
          </div>
        ))}
      </Container>
      <Container className="py-10">
        <div className="glass-strong rounded-[28px] p-10 text-center lg:p-16">
          <p className="mx-auto max-w-[30ch] font-serif text-3xl italic leading-snug sm:text-4xl">“{church.verse.text}”</p>
          <p className="mt-4 text-sm font-medium text-accent">{church.verse.ref}</p>
        </div>
      </Container>
      <Container className="py-10">
        <SectionHead eyebrow="Liderança" title="Quem cuida de nós" />
        <div className="grid gap-5 sm:grid-cols-3">
          {leaders.map((l) => (
            <div key={l.name} className="glass rounded-[20px] p-6">
              <div className="grid size-16 place-items-center rounded-full bg-accent/20 font-serif text-xl text-accent">{l.name.split(" ")[1]?.[0]}</div>
              <div className="mt-4 font-serif text-xl">{l.name}</div>
              <div className="text-sm text-muted-foreground">{l.role}</div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
