import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Container, EventCard, SectionHead, ServiceTimes } from "@/components/site/Blocks";
import { SpotifyEpisode } from "@/components/site/SpotifyEpisode";
import { church, churchAge, events, images, ministries, spotify } from "@/lib/site-data";
import { InlineEdit } from "@/components/site/InlineEdit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICNV Cerâmica — Onde uma nova vida espera por você" },
      { name: "description", content: "Igreja Cristã Nova Vida em Cerâmica. Cultos, agenda, mensagens e uma comunidade acolhedora no bairro." },
      { property: "og:title", content: "ICNV Cerâmica — Onde uma nova vida espera por você" },
      { property: "og:description", content: "Cultos, agenda, mensagens e uma comunidade acolhedora no bairro Cerâmica." },
    ],
  }),
  component: Home,
});

function Home() {
  const age = churchAge();
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
              <InlineEdit
                as="h1"
                className="rise-2 mt-6 max-w-[18ch] font-serif text-4xl font-medium leading-tight text-balance sm:text-5xl lg:text-6xl"
                value="Onde uma nova vida espera por você"
                onSave={async () => { /* texto da home ainda estático — use páginas dinâmicas para persistir */ }}
              />
              <p className="rise-2 mt-5 max-w-[46ch] text-base text-pretty text-muted-foreground sm:text-lg">
                 Uma comunidade acolhedora no coração do bairro, onde cada pessoa é recebida pelo nome e cuidada com fé, Palavra e música.
              </p>
              <div className="rise-3 mt-8 flex flex-wrap items-center gap-3">
                <Link to="/sobre" className="inline-flex items-center gap-2 rounded-full bg-primary py-3 pl-5 pr-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
                  Conheça a igreja <ArrowRight className="size-4 opacity-70" />
                </Link>
                <Link to="/agenda" className="inline-flex items-center rounded-full bg-secondary px-5 py-3 text-sm font-semibold ring-1 ring-border transition-transform hover:-translate-y-0.5">
                  Ver agenda
                </Link>
              </div>
              <div className="rise-3 mt-12">
                <ServiceTimes />
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <img
                src={images.heroChurch}
                alt="Pessoas se cumprimentando no templo iluminado pela luz da manhã"
                width={1024}
                height={1280}
                className="aspect-[4/5] w-full rounded-[24px] object-cover ring-1 ring-border"
              />
              <div className="glass-strong absolute -bottom-5 left-4 max-w-[240px] rounded-[18px] p-4 shadow-lg sm:left-6">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">Próximo culto</div>
                <div className="mt-1 font-serif text-lg font-medium">Domingo, 08h</div>
                <div className="mt-1 text-xs text-muted-foreground">Culto de Celebração</div>
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
              <div className="font-serif text-7xl font-medium leading-none text-accent">{age.years}</div>
              <div>
                <div className="font-serif text-2xl font-medium">anos transformando vidas</div>
                <div className="mt-1 text-sm text-muted-foreground">Servindo a comunidade Cerâmica desde {age.sinceYear}</div>
              </div>
            </div>
            <div className="flex gap-10">
              {[["1.2k", "Vidas"], ["12", "Redes"], ["40+", "Voluntários"]].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="font-serif text-3xl font-medium">{n}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* EVENTOS */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionHead
            eyebrow="Agenda"
            title="Próximos eventos"
            action={<Link to="/agenda" className="hidden text-sm font-semibold text-muted-foreground hover:text-foreground sm:block">Ver todos →</Link>}
          />
          <div className="grid gap-5 md:grid-cols-3">
            {events.slice(0, 3).map((e) => <EventCard key={e.slug} e={e} />)}
          </div>
        </Container>
      </section>

      {/* SERMÕES */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Mensagens</div>
              <h2 className="mt-2 font-serif text-3xl font-medium sm:text-4xl">Mensagem da semana</h2>
              <p className="mt-4 max-w-[34ch] text-sm text-muted-foreground">A cada domingo, um novo sermão. Ouça aqui no site ou direto no Spotify, onde estiver.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/mensagens" className="inline-flex rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold ring-1 ring-border">
                  Todas as mensagens
                </Link>
                <a href={spotify.showUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
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
                <div className="font-serif text-2xl font-medium">{m.name}</div>
                <p className="mt-3 text-sm text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA / ONDE ESTAMOS */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="glass rounded-[24px] p-8 lg:p-10">
              <div className="eyebrow">Onde estamos</div>
              <h2 className="mt-2 font-serif text-3xl font-medium">Venha nos visitar</h2>
              <p className="mt-4 max-w-[40ch] text-sm text-muted-foreground">De portas abertas para receber você e sua família no coração do bairro Cerâmica.</p>
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p>{church.address}</p>
                <p>{church.phone}</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/onde-estamos" className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground">Como chegar</Link>
                <Link to="/doacao" className="rounded-full bg-secondary px-5 py-3 text-sm font-semibold ring-1 ring-border">Faça uma doação</Link>
              </div>
            </div>
            <img src={images.community} alt="Famílias da igreja reunidas e sorrindo" loading="lazy" width={1280} height={960} className="min-h-[320px] w-full rounded-[24px] object-cover ring-1 ring-border" />
          </div>
        </Container>
      </section>
    </>
  );
}
