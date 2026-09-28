// Dados fictícios do site público. Usados como fallback quando o banco estiver vazio.
import heroChurch from "@/assets/hero-church.jpg";
import community from "@/assets/community.jpg";
import sermon from "@/assets/sermon.jpg";
import smallGroup from "@/assets/small-group.jpg";

export const images = { heroChurch, community, sermon, smallGroup };

export const church = {
  name: "Igreja Cristã Nova Vida",
  short: "Cerâmica",
  foundedAt: "1997-03-15",
  address: "Rua Lorem Ipsum, 240 — Cerâmica",
  city: "São Caetano do Sul — SP",
  phone: "(11) 4000-0000",
  email: "contato@icnvceramica.org.br",
  mapQuery: "Cerâmica, São Caetano do Sul, SP",
  verse: { text: "Assim que, se alguém está em Cristo, nova criatura é.", ref: "2 Coríntios 5.17" },
};

export const serviceTimes = [
  { day: "Segunda", time: "19h00", label: "Culto de Oração" },
  { day: "Quinta", time: "19h00", label: "Escola Bíblica" },
  { day: "Sábado", time: "07h00", label: "Consagração" },
  { day: "Domingo", time: "08h00 · 18h00", label: "Culto de Celebração" },
];

export type NavItem = { label: string; to: string; children?: NavItem[] };
export const nav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Sobre", to: "/sobre" },
  {
    label: "Ministérios",
    to: "/ministerios",
    children: [
      { label: "Ministérios", to: "/ministerios" },
      { label: "Redes", to: "/redes" },
      { label: "Seja Voluntário", to: "/voluntario" },
    ],
  },
  { label: "Agenda", to: "/agenda" },
  { label: "Mensagens", to: "/mensagens" },
  { label: "Onde Estamos", to: "/onde-estamos" },
  { label: "Contato", to: "/contato" },
];

export function churchAge(foundedAt = church.foundedAt, now = new Date()) {
  const f = new Date(foundedAt);
  let years = now.getFullYear() - f.getFullYear();
  let months = now.getMonth() - f.getMonth();
  if (now.getDate() < f.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  return { years, months, sinceYear: f.getFullYear() };
}

export type EventPost = {
  slug: string; title: string; start: string; end: string; location: string;
  category: string; excerpt: string; body: string; image: string;
};

const lorem =
  "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla.</p><h3>Programação</h3><ul><li>Lorem ipsum dolor sit amet</li><li>Consectetur adipiscing elit</li><li>Sed do eiusmod tempor</li></ul><p>Vestibulum id ligula porta felis euismod semper. Maecenas faucibus mollis interdum. Cras mattis consectetur purus sit amet fermentum.</p><blockquote>“Lorem ipsum dolor sit amet, consectetur adipiscing elit.”</blockquote><p>Aenean lacinia bibendum nulla sed consectetur. Nullam quis risus eget urna mollis ornare vel eu leo.</p>";

function addDays(d: number, h: number) {
  const x = new Date();
  x.setDate(x.getDate() + d);
  x.setHours(h, 0, 0, 0);
  return x.toISOString();
}

export const events: EventPost[] = [
  { slug: "culto-de-celebracao", title: "Culto de Celebração", start: addDays(3, 8), end: addDays(3, 10), location: "Templo principal", category: "Culto", excerpt: "Lorem ipsum dolor sit amet, adoração e Palavra com toda a família.", body: lorem, image: heroChurch },
  { slug: "encontro-de-casais", title: "Encontro de Casais", start: addDays(9, 19), end: addDays(9, 22), location: "Salão social", category: "Encontro", excerpt: "Consectetur adipiscing elit, uma noite para fortalecer os casamentos.", body: lorem, image: community },
  { slug: "dia-de-servico", title: "Dia de Serviço no Bairro", start: addDays(14, 9), end: addDays(14, 13), location: "Praça central", category: "Ação social", excerpt: "Sed do eiusmod tempor, doações e cuidado com a vizinhança.", body: lorem, image: community },
  { slug: "retiro-de-jovens", title: "Retiro de Jovens", start: addDays(21, 18), end: addDays(23, 12), location: "Chácara Lorem", category: "Jovens", excerpt: "Ut enim ad minim veniam, um fim de semana de fé e amizade.", body: lorem, image: smallGroup },
  { slug: "escola-biblica-especial", title: "Escola Bíblica Especial", start: addDays(28, 19), end: addDays(28, 21), location: "Sala 2", category: "Ensino", excerpt: "Quis nostrud exercitation, estudo especial sobre as parábolas.", body: lorem, image: sermon },
  { slug: "cafe-com-a-comunidade", title: "Café com a Comunidade", start: addDays(35, 9), end: addDays(35, 11), location: "Pátio", category: "Encontro", excerpt: "Duis aute irure dolor, manhã de acolhida e conversa com os pastores.", body: lorem, image: community },
];

export type Sermon = {
  slug: string; title: string; date: string; preacher: string; series: string;
  duration: string; excerpt: string; body: string; videoId: string; image: string;
};

function daysAgo(d: number) {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x.toISOString();
}

export const sermons: Sermon[] = [
  { slug: "onde-uma-nova-vida-comeca", title: "Onde uma nova vida começa", date: daysAgo(3), preacher: "Pr. Lorem Ipsum", series: "Nova Criatura", duration: "34 min", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", body: lorem, videoId: "dQw4w9WgXcQ", image: sermon },
  { slug: "o-coracao-do-pai", title: "O coração do Pai", date: daysAgo(10), preacher: "Pra. Dolor Amet", series: "Parábolas", duration: "29 min", excerpt: "Integer posuere erat a ante venenatis dapibus.", body: lorem, videoId: "dQw4w9WgXcQ", image: heroChurch },
  { slug: "esperanca-que-nao-decepciona", title: "Esperança que não decepciona", date: daysAgo(17), preacher: "Pr. Lorem Ipsum", series: "Romanos", duration: "41 min", excerpt: "Donec ullamcorper nulla non metus auctor fringilla.", body: lorem, videoId: "dQw4w9WgXcQ", image: sermon },
  { slug: "vida-em-comunidade", title: "Vida em comunidade", date: daysAgo(24), preacher: "Pr. Consectetur", series: "Atos", duration: "37 min", excerpt: "Vestibulum id ligula porta felis euismod semper.", body: lorem, videoId: "dQw4w9WgXcQ", image: smallGroup },
  { slug: "a-fe-que-move", title: "A fé que move", date: daysAgo(31), preacher: "Pra. Dolor Amet", series: "Hebreus", duration: "32 min", excerpt: "Maecenas faucibus mollis interdum.", body: lorem, videoId: "dQw4w9WgXcQ", image: heroChurch },
  { slug: "descanso-para-a-alma", title: "Descanso para a alma", date: daysAgo(38), preacher: "Pr. Lorem Ipsum", series: "Salmos", duration: "28 min", excerpt: "Cras mattis consectetur purus sit amet fermentum.", body: lorem, videoId: "dQw4w9WgXcQ", image: sermon },
];

export const ministries = [
  { name: "Louvor", text: "Lorem ipsum dolor sit amet, adoração que prepara o coração." },
  { name: "Infantil", text: "Consectetur adipiscing elit, crianças aprendendo a Palavra com alegria." },
  { name: "Jovens", text: "Sed do eiusmod tempor, uma geração conectada e com propósito." },
  { name: "Casais", text: "Ut enim ad minim veniam, famílias fortalecidas em Cristo." },
  { name: "Ação Social", text: "Quis nostrud exercitation, cuidando do bairro com mãos abertas." },
  { name: "Intercessão", text: "Duis aute irure dolor, sustentando a igreja em oração." },
  { name: "Mídia", text: "Excepteur sint occaecat, comunicando o evangelho com criatividade." },
  { name: "Recepção", text: "Sunt in culpa qui officia, recebendo cada pessoa pelo nome." },
];

export const networks = [
  { name: "Rede Lorem", host: "Família Ipsum", day: "Terça · 20h", area: "Cerâmica" },
  { name: "Rede Dolor", host: "Família Amet", day: "Quarta · 20h", area: "Santa Paula" },
  { name: "Rede Jovem", host: "Lorem e Ipsum", day: "Sexta · 20h", area: "Centro" },
  { name: "Rede Sit", host: "Família Consectetur", day: "Terça · 19h30", area: "Barcelona" },
  { name: "Rede Adipiscing", host: "Família Elit", day: "Quarta · 19h30", area: "Olímpico" },
  { name: "Rede Casais", host: "Lorem e Dolor", day: "Sábado · 19h", area: "Cerâmica" },
];

export const leaders = [
  { name: "Pr. Lorem Ipsum", role: "Pastor presidente" },
  { name: "Pra. Dolor Amet", role: "Pastora" },
  { name: "Pr. Consectetur", role: "Pastor de jovens" },
];

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) {
  return new Intl.DateTimeFormat("pt-BR", opts).format(new Date(iso)).replace(".", "");
}
export function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

// Episódio atual no Spotify (substituir pelo link real do sermão de domingo).
// Formato: https://open.spotify.com/embed/episode/<ID>?utm_source=generator&theme=0
export const spotify = {
  embedUrl: "https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5?utm_source=generator&theme=0",
  showUrl: "https://open.spotify.com/",
};
