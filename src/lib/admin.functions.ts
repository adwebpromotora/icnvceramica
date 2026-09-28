/**
 * Server functions do painel admin — MySQL local.
 * Mantém as mesmas responsabilidades do backend anterior (usuários, conteúdo, settings).
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getUserFromToken, readSessionToken, audit, type SessionUser } from "@/server/auth";
import { execute, query, uuid } from "@/server/db";

async function requireUser(): Promise<SessionUser> {
  const req = getRequest();
  const token = readSessionToken(req.headers.get("cookie"));
  const user = await getUserFromToken(token);
  if (!user) throw new Error("Não autenticado");
  return user;
}

async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Acesso negado");
  return user;
}

async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "editor") throw new Error("Acesso negado");
  return user;
}

export const createTeamUser = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(2).max(80),
        email: z.string().email(),
        password: z.string().min(8).max(72),
        role: z.enum(["admin", "editor"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const { hashPassword } = await import("@/server/auth");
    const id = uuid();
    const ph = await hashPassword(data.password);
    try {
      await execute(
        "INSERT INTO users (id, email, password_hash, full_name) VALUES (:id, :email, :ph, :name)",
        { id, email: data.email.toLowerCase().trim(), ph, name: data.name.trim() },
      );
      await execute("INSERT INTO user_roles (id, user_id, role) VALUES (:id, :uid, :role)", {
        id: uuid(),
        uid: id,
        role: data.role,
      });
      await audit(admin.id, "create_user", "user", id, { role: data.role });
      return { ok: true as const };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro";
      if (msg.includes("Duplicate") || msg.includes("uq_users_email")) {
        return { ok: false as const, error: "E-mail já cadastrado." };
      }
      return { ok: false as const, error: msg };
    }
  });

export const setUserRole = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["admin", "editor", "none"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (data.userId === admin.id) return { ok: false as const, error: "Você não pode alterar o próprio papel." };
    await execute("DELETE FROM user_roles WHERE user_id = :uid", { uid: data.userId });
    if (data.role !== "none") {
      await execute("INSERT INTO user_roles (id, user_id, role) VALUES (:id, :uid, :role)", {
        id: uuid(),
        uid: data.userId,
        role: data.role,
      });
    }
    await audit(admin.id, "set_role", "user", data.userId, { role: data.role });
    return { ok: true as const };
  });

export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const rows = await query<
    { id: string; email: string; full_name: string; role: string | null; created_at: string }[]
  >(
    `SELECT u.id, u.email, u.full_name, ur.role, u.created_at
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     ORDER BY u.created_at ASC`,
  );
  return rows;
});

export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  const [pages] = await query<{ c: number }[]>("SELECT COUNT(*) AS c FROM pages");
  const [events] = await query<{ c: number }[]>("SELECT COUNT(*) AS c FROM events");
  const [sermons] = await query<{ c: number }[]>("SELECT COUNT(*) AS c FROM sermons");
  const [forms] = await query<{ c: number }[]>("SELECT COUNT(*) AS c FROM forms");
  const [responses] = await query<{ c: number }[]>("SELECT COUNT(*) AS c FROM form_responses");
  const upcoming = await query<
    { id: string; title: string; starts_at: string; location: string | null }[]
  >(
    `SELECT id, title, starts_at, location FROM events
     WHERE published = 1 AND starts_at >= NOW() ORDER BY starts_at ASC LIMIT 5`,
  );
  const recentSermons = await query<{ id: string; title: string; preached_at: string | null }[]>(
    `SELECT id, title, preached_at FROM sermons WHERE published = 1 ORDER BY preached_at DESC LIMIT 5`,
  );
  return {
    pages: Number(pages?.c ?? 0),
    events: Number(events?.c ?? 0),
    sermons: Number(sermons?.c ?? 0),
    forms: Number(forms?.c ?? 0),
    responses: Number(responses?.c ?? 0),
    upcoming,
    recentSermons,
  };
});

export const getSettingsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  const rows = await query<Record<string, unknown>[]>("SELECT * FROM site_settings WHERE id = 1 LIMIT 1");
  return rows[0] ?? null;
});

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        church_name: z.string().max(200).optional(),
        address: z.string().max(500).optional(),
        phone: z.string().max(40).optional(),
        email: z.string().max(255).optional(),
        pix_key: z.string().max(255).optional(),
        founded_at: z.string().nullable().optional(),
        spotify_embed_url: z.string().max(500).optional(),
        spotify_show_url: z.string().max(500).optional(),
        logo_path: z.string().max(500).nullable().optional(),
        primary_color: z.string().max(20).optional(),
        accent_color: z.string().max(20).optional(),
        show_back_to_top: z.boolean().optional(),
        gtm_id: z.string().max(40).nullable().optional(),
        smtp_host: z.string().max(255).nullable().optional(),
        smtp_port: z.number().nullable().optional(),
        smtp_user: z.string().max(255).nullable().optional(),
        smtp_pass: z.string().max(255).nullable().optional(),
        smtp_from: z.string().max(255).nullable().optional(),
        smtp_secure: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const user = await requireStaff();
    // GTM e SMTP só admin
    if (
      user.role !== "admin" &&
      (data.gtm_id !== undefined ||
        data.smtp_host !== undefined ||
        data.smtp_port !== undefined ||
        data.smtp_user !== undefined ||
        data.smtp_pass !== undefined ||
        data.smtp_from !== undefined ||
        data.smtp_secure !== undefined)
    ) {
      throw new Error("Acesso negado às configurações sensíveis");
    }
    const fields: string[] = [];
    const params: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      fields.push(`${k} = :${k}`);
      if (typeof v === "boolean") params[k] = v ? 1 : 0;
      else params[k] = v;
    }
    if (!fields.length) return { ok: true };
    await execute(`UPDATE site_settings SET ${fields.join(", ")} WHERE id = 1`, params);
    await audit(user.id, "update_settings", "site_settings", "1");
    return { ok: true };
  });

export const listAuditLogs = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return query<
    { id: string; user_id: string | null; action: string; entity: string | null; entity_id: string | null; created_at: string }[]
  >(`SELECT id, user_id, action, entity, entity_id, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 200`);
});
