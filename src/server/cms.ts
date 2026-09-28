/**
 * CRUD do CMS (events, sermons, pages, forms) via MySQL.
 */
import { execute, query, uuid } from "./db";

export type ContentTable = "events" | "sermons" | "pages";

const ORDER_COL: Record<ContentTable, string> = {
  events: "starts_at",
  sermons: "preached_at",
  pages: "menu_order",
};

export async function listContent(table: ContentTable) {
  const order = ORDER_COL[table];
  const dir = table === "pages" ? "ASC" : "DESC";
  return query<Record<string, unknown>[]>(
    `SELECT * FROM \`${table}\` ORDER BY \`${order}\` ${dir}, created_at DESC`,
  );
}

export async function saveContent(
  table: ContentTable,
  payload: Record<string, unknown>,
  userId: string | null,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const id = (payload.id as string) || uuid();
  const isUpdate = Boolean(payload.id);

  try {
    if (table === "events") {
      const title = String(payload.title ?? "").trim();
      const slug = String(payload.slug ?? "").trim();
      if (!title || !slug) return { ok: false, error: "Título e slug são obrigatórios." };
      const starts = toMysqlDatetime(payload.starts_at);
      if (!starts) return { ok: false, error: "Data de início inválida." };
      if (isUpdate) {
        await execute(
          `UPDATE events SET title=:title, slug=:slug, summary=:summary, content=:content,
           cover_path=:cover, starts_at=:starts, ends_at=:ends, location=:location,
           published=:published WHERE id=:id`,
          {
            id,
            title,
            slug,
            summary: (payload.summary as string) ?? null,
            content: (payload.content as string) ?? null,
            cover: (payload.cover_path as string) ?? null,
            starts,
            ends: toMysqlDatetime(payload.ends_at),
            location: (payload.location as string) ?? null,
            published: payload.published ? 1 : 0,
          },
        );
      } else {
        await execute(
          `INSERT INTO events (id, title, slug, summary, content, cover_path, starts_at, ends_at, location, published, created_by)
           VALUES (:id, :title, :slug, :summary, :content, :cover, :starts, :ends, :location, :published, :uid)`,
          {
            id,
            title,
            slug,
            summary: (payload.summary as string) ?? null,
            content: (payload.content as string) ?? null,
            cover: (payload.cover_path as string) ?? null,
            starts,
            ends: toMysqlDatetime(payload.ends_at),
            location: (payload.location as string) ?? null,
            published: payload.published ? 1 : 0,
            uid: userId,
          },
        );
      }
    } else if (table === "sermons") {
      const title = String(payload.title ?? "").trim();
      const slug = String(payload.slug ?? "").trim();
      if (!title || !slug) return { ok: false, error: "Título e slug são obrigatórios." };
      if (isUpdate) {
        await execute(
          `UPDATE sermons SET title=:title, slug=:slug, summary=:summary, content=:content,
           cover_path=:cover, preached_at=:preached, preacher=:preacher, published=:published WHERE id=:id`,
          {
            id,
            title,
            slug,
            summary: (payload.summary as string) ?? null,
            content: (payload.content as string) ?? null,
            cover: (payload.cover_path as string) ?? null,
            preached: toMysqlDate(payload.preached_at),
            preacher: (payload.preacher as string) ?? null,
            published: payload.published ? 1 : 0,
          },
        );
      } else {
        await execute(
          `INSERT INTO sermons (id, title, slug, summary, content, cover_path, preached_at, preacher, published, created_by)
           VALUES (:id, :title, :slug, :summary, :content, :cover, :preached, :preacher, :published, :uid)`,
          {
            id,
            title,
            slug,
            summary: (payload.summary as string) ?? null,
            content: (payload.content as string) ?? null,
            cover: (payload.cover_path as string) ?? null,
            preached: toMysqlDate(payload.preached_at),
            preacher: (payload.preacher as string) ?? null,
            published: payload.published ? 1 : 0,
            uid: userId,
          },
        );
      }
    } else {
      const title = String(payload.title ?? "").trim();
      const slug = String(payload.slug ?? "").trim();
      if (!title || !slug) return { ok: false, error: "Título e slug são obrigatórios." };
      if (isUpdate) {
        await execute(
          `UPDATE pages SET title=:title, slug=:slug, content=:content, visible=:visible,
           menu_order=:menu_order, show_in_menu=:show_in_menu, parent_id=:parent_id WHERE id=:id`,
          {
            id,
            title,
            slug,
            content: (payload.content as string) ?? null,
            visible: payload.visible !== false && payload.visible !== 0 ? 1 : 0,
            menu_order: Number(payload.menu_order ?? 0),
            show_in_menu: payload.show_in_menu !== false && payload.show_in_menu !== 0 ? 1 : 0,
            parent_id: (payload.parent_id as string) || null,
          },
        );
      } else {
        await execute(
          `INSERT INTO pages (id, title, slug, content, visible, menu_order, show_in_menu, parent_id, created_by)
           VALUES (:id, :title, :slug, :content, :visible, :menu_order, :show_in_menu, :parent_id, :uid)`,
          {
            id,
            title,
            slug,
            content: (payload.content as string) ?? null,
            visible: payload.visible !== false && payload.visible !== 0 ? 1 : 0,
            menu_order: Number(payload.menu_order ?? 0),
            show_in_menu: payload.show_in_menu !== false && payload.show_in_menu !== 0 ? 1 : 0,
            parent_id: (payload.parent_id as string) || null,
            uid: userId,
          },
        );
      }
    }
    return { ok: true, id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar";
    if (msg.includes("Duplicate") || msg.includes("uq_")) {
      return { ok: false, error: "Já existe um item com esse endereço (slug)." };
    }
    return { ok: false, error: msg };
  }
}

export async function deleteContent(table: ContentTable, id: string) {
  await execute(`DELETE FROM \`${table}\` WHERE id = :id`, { id });
}

export async function dashboardStats() {
  const one = async (sql: string) => {
    const rows = await query<{ c: number }[]>(sql);
    return Number(rows[0]?.c ?? 0);
  };
  const [pages, events, sermons, forms, responses] = await Promise.all([
    one("SELECT COUNT(*) AS c FROM pages"),
    one("SELECT COUNT(*) AS c FROM events"),
    one("SELECT COUNT(*) AS c FROM sermons"),
    one("SELECT COUNT(*) AS c FROM forms"),
    one("SELECT COUNT(*) AS c FROM form_responses"),
  ]);
  const upcoming = await query<
    { id: string; title: string; starts_at: string; location: string | null }[]
  >(
    `SELECT id, title, starts_at, location FROM events
     WHERE starts_at >= NOW() ORDER BY starts_at ASC LIMIT 5`,
  );
  const recentSermons = await query<
    { id: string; title: string; preached_at: string | null; preacher: string | null }[]
  >(
    `SELECT id, title, preached_at, preacher FROM sermons
     ORDER BY preached_at DESC LIMIT 5`,
  );
  const settings = await query<{ founded_at: string | null }[]>(
    "SELECT founded_at FROM site_settings WHERE id = 1 LIMIT 1",
  );
  return {
    pages,
    events,
    sermons,
    forms,
    responses,
    upcoming,
    recentSermons,
    founded_at: settings[0]?.founded_at ?? "1997-03-15",
  };
}

function toMysqlDatetime(v: unknown): string | null {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function toMysqlDate(v: unknown): string | null {
  if (v == null || v === "") return null;
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
