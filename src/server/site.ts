/**
 * Leituras públicas do site (nunca usa cliente admin).
 * Fallback para dados fictícios de site-data.ts quando a tabela estiver vazia.
 */
import { query } from "./db";
import {
  church as fallbackChurch,
  events as fallbackEvents,
  sermons as fallbackSermons,
  spotify as fallbackSpotify,
} from "@/lib/site-data";

export type SiteSettings = {
  church_name: string;
  address: string;
  phone: string;
  email: string;
  pix_key: string;
  founded_at: string | null;
  spotify_embed_url: string;
  spotify_show_url: string;
  logo_path: string | null;
  primary_color: string;
  accent_color: string;
  show_back_to_top: number;
  gtm_id: string | null;
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await query<SiteSettings[]>("SELECT * FROM site_settings WHERE id = 1 LIMIT 1");
    if (rows[0]) return rows[0];
  } catch {
    /* banco ainda não disponível — fallback */
  }
  return {
    church_name: fallbackChurch.name,
    address: `${fallbackChurch.address} — ${fallbackChurch.city}`,
    phone: fallbackChurch.phone,
    email: fallbackChurch.email,
    pix_key: "",
    founded_at: fallbackChurch.foundedAt,
    spotify_embed_url: fallbackSpotify.embedUrl,
    spotify_show_url: fallbackSpotify.showUrl,
    logo_path: null,
    primary_color: "#1e3a5f",
    accent_color: "#d4a574",
    show_back_to_top: 1,
    gtm_id: null,
  };
}

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  cover_path: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
};

export async function listPublishedEvents(limit = 20): Promise<EventRow[]> {
  try {
    const rows = await query<EventRow[]>(
      `SELECT id, title, slug, summary, content, cover_path, starts_at, ends_at, location
       FROM events WHERE published = 1 AND starts_at >= NOW() - INTERVAL 1 DAY
       ORDER BY starts_at ASC LIMIT :lim`,
      { lim: limit },
    );
    if (rows.length) return rows;
  } catch {
    /* fallback */
  }
  return fallbackEvents.slice(0, limit).map((e, i) => ({
    id: `fb-${i}`,
    title: e.title,
    slug: e.slug,
    summary: e.excerpt ?? null,
    content: e.body ?? null,
    cover_path: null,
    starts_at: e.start,
    ends_at: e.end ?? null,
    location: e.location ?? null,
  }));
}

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  try {
    const rows = await query<EventRow[]>(
      `SELECT id, title, slug, summary, content, cover_path, starts_at, ends_at, location
       FROM events WHERE slug = :slug AND published = 1 LIMIT 1`,
      { slug },
    );
    if (rows[0]) return rows[0];
  } catch {
    /* fallback */
  }
  const fb = fallbackEvents.find((e) => e.slug === slug);
  if (!fb) return null;
  return {
    id: "fb",
    title: fb.title,
    slug: fb.slug,
    summary: fb.excerpt ?? null,
    content: fb.body ?? null,
    cover_path: null,
    starts_at: fb.start,
    ends_at: fb.end ?? null,
    location: fb.location ?? null,
  };
}

export type SermonRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  cover_path: string | null;
  preached_at: string | null;
  preacher: string | null;
};

export async function listPublishedSermons(limit = 20): Promise<SermonRow[]> {
  try {
    const rows = await query<SermonRow[]>(
      `SELECT id, title, slug, summary, content, cover_path, preached_at, preacher
       FROM sermons WHERE published = 1 ORDER BY preached_at DESC LIMIT :lim`,
      { lim: limit },
    );
    if (rows.length) return rows;
  } catch {
    /* fallback */
  }
  return fallbackSermons.slice(0, limit).map((s, i) => ({
    id: `fb-${i}`,
    title: s.title,
    slug: s.slug,
    summary: (s as { excerpt?: string }).excerpt ?? null,
    content: (s as { body?: string }).body ?? null,
    cover_path: null,
    preached_at: (s as { date?: string }).date ?? null,
    preacher: (s as { preacher?: string }).preacher ?? null,
  }));
}

export async function getSermonBySlug(slug: string): Promise<SermonRow | null> {
  try {
    const rows = await query<SermonRow[]>(
      `SELECT id, title, slug, summary, content, cover_path, preached_at, preacher
       FROM sermons WHERE slug = :slug AND published = 1 LIMIT 1`,
      { slug },
    );
    if (rows[0]) return rows[0];
  } catch {
    /* fallback */
  }
  const fb = fallbackSermons.find((s) => s.slug === slug);
  if (!fb) return null;
  return {
    id: "fb",
    title: fb.title,
    slug: fb.slug,
    summary: (fb as { excerpt?: string }).excerpt ?? null,
    content: (fb as { body?: string }).body ?? null,
    cover_path: null,
    preached_at: (fb as { date?: string }).date ?? null,
    preacher: (fb as { preacher?: string }).preacher ?? null,
  };
}

export type PageRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  parent_id: string | null;
  menu_order: number;
  show_in_menu: number;
};

export async function listMenuPages(): Promise<PageRow[]> {
  try {
    const rows = await query<PageRow[]>(
      `SELECT id, title, slug, content, parent_id, menu_order, show_in_menu
       FROM pages WHERE visible = 1 AND show_in_menu = 1
       ORDER BY menu_order ASC, title ASC`,
    );
    return rows;
  } catch {
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<PageRow | null> {
  try {
    const rows = await query<PageRow[]>(
      `SELECT id, title, slug, content, parent_id, menu_order, show_in_menu
       FROM pages WHERE slug = :slug AND visible = 1 LIMIT 1`,
      { slug },
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
