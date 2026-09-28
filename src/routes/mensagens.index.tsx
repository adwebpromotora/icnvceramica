import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play } from "lucide-react";
import { Container, PageHero, Pagination } from "@/components/site/Blocks";
import { SpotifyEpisode } from "@/components/site/SpotifyEpisode";
import { fmtDate, sermons } from "@/lib/site-data";

const PER = 6;

export const Route = createFileRoute("/mensagens/")({
  head: () => ({
    meta: [
      { title: "Mensagens — ICNV Cerâmica" },
      { name: "description", content: "Sermões e mensagens recentes da Igreja Cristã Nova Vida em Cerâmica." },
      { property: "og:title", content: "Mensagens — ICNV Cerâmica" },
      { property: "og:description", content: "Assista e ouça os sermões mais recentes." },
    ],
  }),
  component: Mensagens,
});

function Mensagens() {
  const [page, setPage] = useState(1);
  const first = sermons[0]!;
  const rest = sermons.slice(1);
  return (
    <>
      <PageHero eyebrow="Mensagens" title="Palavras que alimentam a semana" text="Lorem ipsum dolor sit amet, assista ou ouça onde estiver." />
      <Container className="py-6">
        <div className="glass mb-10 rounded-[24px] p-3"><SpotifyEpisode /></div>
        <Link to="/mensagens/$slug" params={{ slug: first.slug }} className="glass lift group grid overflow-hidden rounded-[24px] lg:grid-cols-2">
          <div className="relative aspect-video lg:aspect-auto">
            <img src={first.image} alt="" className="size-full object-cover" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="glass-strong grid size-16 place-items-center rounded-full"><Play className="size-6 fill-current" /></span>
            </span>
          </div>
          <div className="p-8 lg:p-12">
            <div className="eyebrow">Mais recente · {first.series}</div>
            <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">{first.title}</h2>
            <p className="mt-4 text-muted-foreground">{first.excerpt}</p>
            <p className="mt-6 text-sm text-muted-foreground">{first.preacher} · {fmtDate(first.date, { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>
        </Link>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rest.slice((page - 1) * PER, page * PER).map((s) => (
            <Link key={s.slug} to="/mensagens/$slug" params={{ slug: s.slug }} className="glass lift block overflow-hidden rounded-[20px]">
              <img src={s.image} alt="" loading="lazy" className="aspect-video w-full object-cover" />
              <div className="p-5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-accent">{s.series}</div>
                <h3 className="mt-2 font-serif text-xl font-medium">{s.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{s.preacher} · {fmtDate(s.date)} · {s.duration}</p>
              </div>
            </Link>
          ))}
        </div>
        <Pagination page={page} total={Math.ceil(rest.length / PER)} onChange={setPage} />
      </Container>
    </>
  );
}
