/**
 * Server functions do painel admin — MySQL local.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getUserFromToken, readSessionToken, audit, hashPassword, type SessionUser } from "@/server/auth";
import { execute, query, uuid } from "@/server/db";
import {
  listContent,
  saveContent,
  deleteContent,
  dashboardStats,
  type ContentTable,
} from "@/server/cms";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

// ---------- Dashboard ----------
export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  return dashboardStats();
});

// ---------- Conteúdo (eventos / sermões / páginas) ----------
export const listContentFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ table: z.enum(["events", "sermons", "pages"]) }).parse(d))
  .handler(async ({ data }) => {
    await requireStaff();
    return listContent(data.table as ContentTable);
  });

export const saveContentFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        table: z.enum(["events", "sermons", "pages"]),
        payload: z.record(z.unknown()),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const user = await requireStaff();
    const result = await saveContent(data.table as ContentTable, data.payload, user.id);
    if (result.ok) {
      await audit(
        user.id,
        data.payload.id ? "update" : "create",
        data.table,
        result.id,
      );
    }
    return result;
  });

export const deleteContentFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ table: z.enum(["events", "sermons", "pages"]), id: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const user = await requireStaff();
    await deleteContent(data.table as ContentTable, data.id);
    await audit(user.id, "delete", data.table, data.id);
    return { ok: true as const };
  });

// ---------- Upload de imagem (base64 → disco) ----------
export const uploadImageFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        filename: z.string().min(1).max(200),
        mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
        base64: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireStaff();
    const buf = Buffer.from(data.base64, "base64");
    const max = Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024);
    if (buf.length > max) return { ok: false as const, error: "A imagem precisa ter até 5 MB." };

    const ext =
      data.mime === "image/png" ? "png" : data.mime === "image/webp" ? "webp" : "jpg";
    const year = new Date().getFullYear();
    const name = `${crypto.randomUUID()}.${ext}`;
    const rel = `${year}/${name}`;
    const root = process.env.UPLOAD_DIR || "./uploads";
    const dir = join(root, String(year));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), buf);
    return { ok: true as const, path: rel };
  });

// ---------- Settings ----------
export const getSettingsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  const rows = await query<Record<string, unknown>[]>(
    "SELECT * FROM site_settings WHERE id = 1 LIMIT 1",
  );
  return rows[0] ?? null;
});

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((d) => z.record(z.unknown()).parse(d))
  .handler(async ({ data }) => {
    const user = await requireStaff();
    const allowed = [
      "church_name",
      "address",
      "phone",
      "email",
      "pix_key",
      "founded_at",
      "spotify_embed_url",
      "spotify_show_url",
      "logo_path",
      "primary_color",
      "accent_color",
      "show_back_to_top",
      "maintenance_mode",
      "maintenance_message",
    ] as const;
    const adminOnly = [
      "gtm_id",
      "smtp_host",
      "smtp_port",
      "smtp_user",
      "smtp_pass",
      "smtp_from",
      "smtp_secure",
    ] as const;

    const normalize = (k: string, v: unknown) => {
      if (typeof v === "boolean") return v ? 1 : 0;
      if (v === "" || v === undefined) {
        if (k === "founded_at" || k === "logo_path" || k === "gtm_id" || k.startsWith("smtp_")) return null;
        return "";
      }
      if (k === "founded_at") {
        const s = String(v).slice(0, 10);
        return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
      }
      if (k === "smtp_port") {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }
      if (k === "show_back_to_top" || k === "smtp_secure" || k === "maintenance_mode") {
        return v === true || v === 1 || v === "1" ? 1 : 0;
      }
      return v;
    };

    const fields: string[] = [];
    const params: Record<string, unknown> = {};
    for (const k of allowed) {
      if (!(k in data)) continue;
      fields.push(`\`${k}\` = :${k}`);
      params[k] = normalize(k, data[k]);
    }
    if (user.role === "admin") {
      for (const k of adminOnly) {
        if (!(k in data)) continue;
        fields.push(`\`${k}\` = :${k}`);
        params[k] = normalize(k, data[k]);
      }
    }
    if (!fields.length) return { ok: true as const };
    // Garante linha de settings
    await execute("INSERT IGNORE INTO site_settings (id) VALUES (1)");
    await execute(`UPDATE site_settings SET ${fields.join(", ")} WHERE id = 1`, params);
    await audit(user.id, "update_settings", "site_settings", "1");
    return { ok: true as const };
  });

// ---------- Users ----------
export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return query<
    { id: string; email: string; full_name: string; role: string | null; created_at: string }[]
  >(
    `SELECT u.id, u.email, u.full_name, ur.role, u.created_at
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     ORDER BY u.created_at ASC`,
  );
});

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
    z.object({ userId: z.string().min(1), role: z.enum(["admin", "editor", "none"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (data.userId === admin.id) {
      return { ok: false as const, error: "Você não pode alterar o próprio papel." };
    }
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

// ---------- Formulários ----------
export const listFormsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  return query<Record<string, unknown>[]>(
    "SELECT * FROM forms ORDER BY created_at DESC",
  );
});

export const saveFormFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        id: z.string().optional(),
        title: z.string().min(1).max(200),
        slug: z.string().min(1).max(120),
        description: z.string().nullable().optional(),
        fields_json: z.unknown(),
        active: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const user = await requireStaff();
    const id = data.id || uuid();
    const fieldsJson =
      typeof data.fields_json === "string"
        ? data.fields_json
        : JSON.stringify(data.fields_json ?? []);
    try {
      if (data.id) {
        await execute(
          `UPDATE forms SET title=:title, slug=:slug, description=:description,
           fields_json=:fields, active=:active WHERE id=:id`,
          {
            id,
            title: data.title,
            slug: data.slug,
            description: data.description ?? null,
            fields: fieldsJson,
            active: data.active === false ? 0 : 1,
          },
        );
      } else {
        await execute(
          `INSERT INTO forms (id, title, slug, description, fields_json, active, created_by)
           VALUES (:id, :title, :slug, :description, :fields, :active, :uid)`,
          {
            id,
            title: data.title,
            slug: data.slug,
            description: data.description ?? null,
            fields: fieldsJson,
            active: data.active === false ? 0 : 1,
            uid: user.id,
          },
        );
      }
      await audit(user.id, data.id ? "update" : "create", "forms", id);
      return { ok: true as const, id };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro";
      if (msg.includes("Duplicate")) return { ok: false as const, error: "Slug já existe." };
      return { ok: false as const, error: msg };
    }
  });

export const deleteFormFn = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const user = await requireStaff();
    await execute("DELETE FROM forms WHERE id = :id", { id: data.id });
    await audit(user.id, "delete", "forms", data.id);
    return { ok: true as const };
  });

export const listFormResponsesFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ formId: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    await requireStaff();
    return query<Record<string, unknown>[]>(
      "SELECT * FROM form_responses WHERE form_id = :fid ORDER BY created_at DESC LIMIT 500",
      { fid: data.formId },
    );
  });

// ---------- Inline edit (site público) ----------
export const saveInlineTextFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        entity: z.enum(["pages", "events", "sermons", "site_settings"]),
        id: z.string().min(1),
        field: z.string().min(1).max(40),
        value: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const user = await requireStaff();
    const allowed: Record<string, string[]> = {
      pages: ["title", "content"],
      events: ["title", "summary", "content", "location"],
      sermons: ["title", "summary", "content", "preacher"],
      site_settings: ["church_name", "address", "phone", "email"],
    };
    if (!allowed[data.entity]?.includes(data.field)) {
      return { ok: false as const, error: "Campo não editável." };
    }
    if (data.entity === "site_settings") {
      await execute(`UPDATE site_settings SET \`${data.field}\` = :v WHERE id = 1`, {
        v: data.value,
      });
    } else {
      await execute(
        `UPDATE \`${data.entity}\` SET \`${data.field}\` = :v WHERE id = :id`,
        { v: data.value, id: data.id },
      );
    }
    await audit(user.id, "inline_edit", data.entity, data.id, { field: data.field });
    return { ok: true as const };
  });
