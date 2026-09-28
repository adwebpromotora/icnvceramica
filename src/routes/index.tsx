import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Container, SectionHead, ServiceTimes } from "@/components/site/Blocks";
import { SpotifyEpisode } from "@/components/site/SpotifyEpisode";
import { churchAge, images, ministries, fmtDate, fmtTime } from "@/lib/site-data";
import {
  getPublicSettingsFn,
  listPublicEventsFn,
} from "@/lib/public.functions";
import { loadTextOverridesFn } from "@/lib/overrides.functions";
import { EditableImage } from "@/components/site/EditableImage";
import { mediaUrl } from "@/lib/media";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICNV Cerâmica — Onde uma nova vida espera por você" },
      {
        name: "description",
        content:
          "Igreja Cristã Nova Vida em Cerâmica. Cultos, agenda, mensagens e uma comunidade acolhedora no bairro.",
      },
    ],
  }),
  component: Home,
});

type Ev = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  cover_path: string | null;
};

type Settings = {
  church_name: string;
  address: string;
  phone: string;
  founded_at: string | null;
  spotify_show_url: string;
};

function Home() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [heroSrc, setHeroSrc] = useState<string>(images.heroChurch);
  const [communitySrc, setCommunitySrc] = useState<string>(images.community);

  useEffect(() => {
    getPublicSettingsFn()
      .then((s) =>
        setSettings({
          church_name: s.church_name,
          address: s.address,
          phone: s.phone,
          founded_at: s.founded_at,
          spotify_show_url: s.spotify_show_url,
        }),
      )
      .catch(() => {});
    listPublicEventsFn()
      .then((rows) => setEvents(rows as Ev[]))
      .catch(() => setEvents([]));
    loadTextOverridesFn({ data: { path: "/" } })
      .then((rows) => {
        const hero = rows.find((r) => r.content_key === "hero-image");
        if (hero?.value_text) {
          const u = mediaUrl(hero.value_text);
          if (u) setHeroSrc(u);
        }
        const community = rows.find((r) => r.content_key === "home-onde-estamos-image");
        if (community?.value_text) {
          const u = mediaUrl(community.value_text);
          if (u) setCommunitySrc(u);
        }
      })
      .catch(() => {});
  }, []);

  const age = churchAge(settings?.founded_at || undefined);

  const nextEvent = useMemo(() => {
    if (!events?.length) return null;
    const now = Date.now();
    const upcoming = events
      .filter((e) => new Date(e.starts_at).getTime() >= now - 60 * 60 * 1000)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    return upcoming[0] ?? events[0] ?? null;
  }, [events]);

  const upcomingCards = useMemo(() => {
    if (!events?.length) return [];
    const now = Date.now();
    return events
      .filter((e) => new Date(e.starts_at).getTime() >= now - 60 * 60 * 1000)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 3);
  }, [events]);

  return (
    <>
      {/* HERO */}
      <section className="relative pt-32">
        <Container className="py-14 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="rise inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 ring-1 ring-border">
                <span className="size-1.5 rounded-full bg-accent" />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Igreja Cristã Nova Vida · Cerâmica
                </span>
              </div>
              <h1 className="rise-2 mt-6 max-w-[18ch] font-serif text-4xl font-medium leading-tight text-balance sm:text-5xl lg:text-6xl">
                Onde uma nova vida espera por você
              </h1>
              <p className="rise-2 mt-5 max-w-[46ch] text-base text-pretty text-muted-foreground sm:text-lg">
                Uma comunidade acolhedora no coração do bairro, onde cada pessoa é
                recebida pelo nome e cuidada com fé, Palavra e música.
              </p>
              <div className="rise-3 mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/sobre"
                  className="inline-flex items-center gap-2 rounded-full bg-primary py-3 pl-5 pr-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Conheça a igreja <ArrowRight className="size-4 opacity-70" />
                </Link>
                <Link
                  to="/agenda"
                  className="inline-flex items-center gap-2 rounded-full bg-secondary py-3 px-5 text-sm font-semibold ring-1 ring-border"
                >
                  Ver agenda
                </Link>
              </div>
              <div className="rise-3 mt-12">
                <ServiceTimes />
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <EditableImage
                src={heroSrc}
                alt="Templo e comunidade"
                storageKey="hero-image"
                path="/"
                width={1024}
                height={1280}
                className="aspect-[4/5] w-full rounded-[24px] object-cover ring-1 ring-border"
                onChange={setHeroSrc}
              />
              {/* Próximo culto / próxima agenda — fundo opaco */}
              <div className="absolute -bottom-5 left-4 max-w-[260px] rounded-[18px] border border-border bg-background/95 p-4 shadow-xl backdrop-blur-md sm:left-6">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
                  Próximo culto
                </div>
                {nextEvent ? (
                  <Link to="/agenda/$slug" params={{ slug: nextEvent.slug }} className="block">
                    <div className="mt-1 font-serif text-lg font-medium leading-snug">
                      {fmtDate(nextEvent.starts_at, {
                        weekday: "long",
                        day: "2-digit",
                        month: "short",
                      })}
                      {" · "}
                      {fmtTime(nextEvent.starts_at)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {nextEvent.title}
                    </div>
                  </Link>
                ) : (
                  <>
                    <div className="mt-1 font-serif text-lg font-medium">Em breve</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Novos eventos serão publicados na agenda
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* IMPACTO */}
      <section className="py-12">
        <Container>
          <div className="glass-strong flex flex-col items-center gap-8 rounded-[28px] px-8 py-12 text-center sm:flex-row sm:justify-between sm:px-16 sm:text-left">
            <div className="flex items-center gap-6">
              <span className="font-serif text-7xl font-medium leading-none text-accent">
                {age.years}
              </span>
              <div>
                <p className="font-serif text-2xl font-medium">anos transformando vidas</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Servindo a comunidade Cerâmica desde {age.sinceYear}
                </p>
              </div>
            </div>
            <div className="flex gap-10">
              {[
                ["1.2k", "Vidas"],
                ["12", "Redes"],
                ["40+", "Voluntários"],
              ].map(([n, l]) => (
                <div key={l} className="text-center">
                  <p className="font-serif text-3xl font-medium">{n}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* EVENTOS reais — só se houver */}
      {upcomingCards.length > 0 && (
        <section className="py-16 lg:py-20">
          <Container>
            <SectionHead
              eyebrow="Agenda"
              title="Próximos eventos"
              action={
                <Link
                  to="/agenda"
                  className="hidden text-sm font-semibold text-muted-foreground hover:text-foreground sm:block"
                >
                  Ver todos →
                </Link>
              }
            />
            <div className="grid gap-5 md:grid-cols-3">
              {upcomingCards.map((e) => (
                <Link
                  key={e.id}
                  to="/agenda/$slug"
                  params={{ slug: e.slug }}
                  className="glass group overflow-hidden rounded-[20px] transition hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[16/10] bg-secondary">
                    {mediaUrl(e.cover_path) ? (
                      <img
                        src={mediaUrl(e.cover_path)!}
                        alt=""
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(ev) => {
                          (ev.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground">
                        <CalendarDays className="size-10 opacity-40" />
                      </div>
                    )}
                    <div className="absolute left-4 top-4 rounded-2xl bg-background/95 px-3 py-2 text-center shadow-md">
                      <div className="font-serif text-2xl font-medium leading-none">
                        {fmtDate(e.starts_at, { day: "2-digit" })}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {fmtDate(e.starts_at, { month: "short" })}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-xl font-medium">{e.title}</h3>
                    {e.summary && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.summary}</p>
                    )}
                    <div className="mt-4 text-xs font-medium text-muted-foreground">
                      {fmtDate(e.starts_at, { weekday: "long" })} · {fmtTime(e.starts_at)}
                      {e.location ? ` · ${e.location}` : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* SERMÕES */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Mensagens</div>
              <h2 className="mt-2 font-serif text-3xl font-medium sm:text-4xl">Mensagem da semana</h2>
              <p className="mt-4 max-w-[34ch] text-sm text-muted-foreground">
                A cada domingo, um novo sermão. Ouça aqui no site ou direto no Spotify, onde estiver.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/mensagens"
                  className="inline-flex rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold ring-1 ring-border"
                >
                  Todas as mensagens
                </Link>
                <a
                  href={settings?.spotify_show_url || "https://open.spotify.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Abrir no Spotify
                </a>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="glass rounded-[20px] p-3">
                <SpotifyEpisode />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* MINISTÉRIOS */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionHead eyebrow="Ministérios" title="Lugares para servir e crescer" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ministries.slice(0, 4).map((m) => (
              <div key={m.name} className="glass lift rounded-[20px] p-6">
                <p className="font-serif text-2xl font-medium">{m.name}</p>
                <p className="mt-3 text-sm text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ONDE ESTAMOS — dados do admin */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="glass rounded-[24px] p-8 lg:p-10">
              <div className="eyebrow">Onde estamos</div>
              <h2 className="mt-2 font-serif text-3xl font-medium">Venha nos visitar</h2>
              <p className="mt-4 max-w-[40ch] text-sm text-muted-foreground">
                De portas abertas para receber você e sua família no coração do bairro Cerâmica.
              </p>
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p>{settings?.address || "Endereço em configuração"}</p>
                <p>{settings?.phone || ""}</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/onde-estamos"
                  className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
                >
                  Como chegar
                </Link>
                <Link
                  to="/doacao"
                  className="rounded-full bg-secondary px-5 py-3 text-sm font-semibold ring-1 ring-border"
                >
                  Faça uma doação
                </Link>
              </div>
            </div>
            <EditableImage
              src={communitySrc}
              alt="Famílias da igreja reunidas e sorrindo"
              storageKey="home-onde-estamos-image"
              path="/"
              width={1280}
              height={960}
              className="min-h-[320px] w-full rounded-[24px] object-cover ring-1 ring-border"
              onChange={setCommunitySrc}
            />
          </div>
        </Container>
      </section>
    </>
  );
}

