import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Play } from "lucide-react";
import { fmtDate, fmtTime, serviceTimes, type EventPost, type Sermon } from "@/lib/site-data";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <section className="pt-36 pb-10 lg:pt-44">
      <Container>
        <div className="rise inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 ring-1 ring-border">
          <span className="size-1.5 rounded-full bg-accent" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
        </div>
        <h1 className="rise-2 mt-6 max-w-[20ch] font-serif text-4xl font-medium leading-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {text && <p className="rise-3 mt-5 max-w-[56ch] text-base text-pretty text-muted-foreground sm:text-lg">{text}</p>}
      </Container>
    </section>
  );
}

export function SectionHead({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="mt-2 font-serif text-3xl font-medium text-balance sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ServiceTimes() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {serviceTimes.map((s) => (
        <div key={s.day} className="rounded-[16px] bg-secondary p-4 shadow-sm ring-1 ring-border">
          <p className="font-serif text-2xl font-medium">{s.day}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {s.time} · {s.day === "Domingo" ? "Celebração" : s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function EventCard({ e }: { e: EventPost }) {
  return (
    <Link to="/agenda/$slug" params={{ slug: e.slug }} className="glass lift group block overflow-hidden rounded-[20px]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={e.image} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="glass-strong absolute left-4 top-4 rounded-2xl px-3 py-2 text-center">
          <div className="font-serif text-2xl font-medium leading-none">{fmtDate(e.start, { day: "2-digit" })}</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{fmtDate(e.start, { month: "short" })}</div>
        </div>
      </div>
      <div className="p-5">
        <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">{e.category}</span>
        <h3 className="mt-4 font-serif text-xl font-medium">{e.title}</h3>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">{e.excerpt}</p>
        <div className="mt-4 text-xs font-medium text-muted-foreground">
          {fmtDate(e.start, { weekday: "long" })} · {fmtTime(e.start)} · {e.location}
        </div>
      </div>
    </Link>
  );
}

export function SermonRow({ s, accent }: { s: Sermon; accent?: boolean }) {
  return (
    <Link
      to="/mensagens/$slug"
      params={{ slug: s.slug }}
      className="flex items-center gap-4 rounded-[14px] p-4 transition-colors hover:bg-secondary"
    >
      <span className={`grid size-11 shrink-0 place-items-center rounded-[12px] ${accent ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
        <Play className="size-4 fill-current" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-serif text-lg font-medium">{s.title}</div>
        <div className="text-xs text-muted-foreground">{s.preacher} · {s.duration}</div>
      </div>
      <span className="hidden text-xs text-muted-foreground sm:block">{fmtDate(s.date, { day: "2-digit", month: "short", year: "numeric" })}</span>
    </Link>
  );
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="mt-10 flex justify-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`size-10 rounded-full text-sm font-semibold transition-colors ${p === page ? "bg-primary text-primary-foreground" : "glass hover:bg-secondary"}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
