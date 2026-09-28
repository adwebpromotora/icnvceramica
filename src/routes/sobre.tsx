import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container, PageHero, SectionHead } from "@/components/site/Blocks";
import { church, churchAge, images, leaders } from "@/lib/site-data";
import { getPublicSettingsFn } from "@/lib/public.functions";
import { EditableImage } from "@/components/site/EditableImage";
import { loadTextOverridesFn } from "@/components/site/UniversalEdit";
import { mediaUrl } from "@/lib/media";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — ICNV Cerâmica" },
      {
        name: "description",
        content: "História, visão, missão e liderança da Igreja Cristã Nova Vida em Cerâmica.",
      },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  const [foundedAt, setFoundedAt] = useState<string | undefined>(undefined);
  const [imgSrc, setImgSrc] = useState(images.community);

  useEffect(() => {
    getPublicSettingsFn()
      .then((s) => {
        if (s.founded_at) setFoundedAt(String(s.founded_at).slice(0, 10));
      })
      .catch(() => {});
    loadTextOverridesFn({ data: { path: "/sobre" } })
      .then((rows) => {
        const img = rows.find((r) => r.content_key === "sobre-image");
        if (img?.value_text) {
          const u = mediaUrl(img.value_text);
          if (u) setImgSrc(u);
        }
      })
      .catch(() => {});
  }, []);

  const age = churchAge(foundedAt);

  return (
    <>
      <PageHero
        eyebrow="Sobre nós"
        title={`Há ${age.years} anos transformando vidas`}
        text="Uma igreja nascida no bairro, para o bairro."
      />
      <Container className="grid gap-10 py-10 lg:grid-cols-2">
        <EditableImage
          src={imgSrc}
          alt="Comunidade reunida"
          storageKey="sobre-image"
          path="/sobre"
          className="aspect-[4/3] w-full rounded-[24px] object-cover ring-1 ring-border"
          onChange={setImgSrc}
        />
        <div className="prose-church self-center">
          <h2>Nossa história</h2>
          <p>
            Desde {age.sinceYear}, servimos a comunidade Cerâmica com fé, acolhimento e
            Palavra.
          </p>
          <p>
            Somos uma família de fé que busca transformar vidas no bairro, um encontro de
            cada vez.
          </p>
        </div>
      </Container>
      <Container className="grid gap-5 py-10 md:grid-cols-2">
        {[
          ["Visão", "Ser uma igreja que acolhe e transforma o bairro."],
          ["Missão", "Fazer discípulos que amam a Deus e servem as pessoas."],
        ].map(([t, d]) => (
          <div key={t} className="glass rounded-[24px] p-8">
            <div className="eyebrow">{t}</div>
            <p className="mt-3 font-serif text-2xl leading-snug">{d}</p>
          </div>
        ))}
      </Container>
      <Container className="py-10">
        <div className="glass-strong rounded-[28px] p-10 text-center lg:p-16">
          <p className="mx-auto max-w-[30ch] font-serif text-3xl italic leading-snug sm:text-4xl">
            “{church.verse.text}”
          </p>
          <p className="mt-4 text-sm font-medium text-accent">{church.verse.ref}</p>
        </div>
      </Container>
      <Container className="py-10">
        <SectionHead eyebrow="Liderança" title="Quem cuida desta casa" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((l) => (
            <div key={l.name} className="glass rounded-[20px] p-6 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 font-serif text-2xl text-accent">
                {l.name.split(" ")[1]?.[0] || l.name[0]}
              </div>
              <div className="mt-4 font-serif text-xl">{l.name}</div>
              <div className="text-sm text-muted-foreground">{l.role}</div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
