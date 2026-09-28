import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, EventCard, PageHero, Pagination } from "@/components/site/Blocks";
import { events } from "@/lib/site-data";

const PER = 6;

export const Route = createFileRoute("/agenda/")({
  head: () => ({
    meta: [
      { title: "Agenda — ICNV Cerâmica" },
      { name: "description", content: "Programação e próximos eventos da Igreja Cristã Nova Vida em Cerâmica." },
      { property: "og:title", content: "Agenda — ICNV Cerâmica" },
      { property: "og:description", content: "Confira os próximos eventos e encontros." },
    ],
  }),
  component: Agenda,
});

function Agenda() {
  const [page, setPage] = useState(1);
  const [cat, setCat] = useState("Todos");
  const cats = ["Todos", ...Array.from(new Set(events.map((e) => e.category)))];
  const list = cat === "Todos" ? events : events.filter((e) => e.category === cat);
  const total = Math.ceil(list.length / PER);
  return (
    <>
      <PageHero eyebrow="Agenda" title="Próximos encontros" text="Lorem ipsum dolor sit amet, participe da vida da igreja durante a semana." />
      <Container className="py-6">
        <div className="mb-8 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => { setCat(c); setPage(1); }} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${c === cat ? "bg-primary text-primary-foreground" : "glass hover:bg-secondary"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {list.slice((page - 1) * PER, page * PER).map((e) => <EventCard key={e.slug} e={e} />)}
        </div>
        <Pagination page={page} total={total} onChange={setPage} />
      </Container>
    </>
  );
}
