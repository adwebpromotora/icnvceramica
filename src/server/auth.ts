/**
 * Auth local: argon2id + sessão em cookie httpOnly + tabela sessions.
 * Primeiro cadastro em /admin cria o único admin; depois bloqueia novos registros públicos.
 */
import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import { execute, query, uuid } from "./db";

const SESSION_COOKIE = "icnv_session";
const SESSION_DAYS = 14;

export type Role = "admin" | "editor";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role | null;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/** Conta quantos admins existem (para bloquear segundo cadastro público). */
export async function countAdmins(): Promise<number> {
  const rows = await query<{ c: number }[]>(
    "SELECT COUNT(*) AS c FROM user_roles WHERE role = 'admin'",
  );
  return Number(rows[0]?.c ?? 0);
}

export async function createFirstAdmin(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if ((await countAdmins()) > 0) {
    return { ok: false, error: "Já existe um administrador." };
  }
  const id = uuid();
  const passwordHash = await hashPassword(input.password);
  await execute(
    "INSERT INTO users (id, email, password_hash, full_name) VALUES (:id, :email, :ph, :name)",
    { id, email: input.email.toLowerCase().trim(), ph: passwordHash, name: input.fullName.trim() },
  );
  await execute(
    "INSERT INTO user_roles (id, user_id, role) VALUES (:id, :uid, 'admin')",
    { id: uuid(), uid: id },
  );
  return { ok: true };
}

export async function login(
  email: string,
  password: string,
): Promise<{ ok: true; token: string; user: SessionUser } | { ok: false; error: string }> {
  const rows = await query<
    { id: string; email: string; password_hash: string; full_name: string }[]
  >("SELECT id, email, password_hash, full_name FROM users WHERE email = :email LIMIT 1", {
    email: email.toLowerCase().trim(),
  });
  const user = rows[0];
  if (!user || !(await verifyPassword(user.password_hash, password))) {
    return { ok: false, error: "E-mail ou senha incorretos." };
  }
  const roles = await query<{ role: Role }[]>(
    "SELECT role FROM user_roles WHERE user_id = :uid",
    { uid: user.id },
  );
  const roleList = roles.map((r) => r.role);
  const role: Role | null = roleList.includes("admin")
    ? "admin"
    : roleList.includes("editor")
      ? "editor"
      : null;
  if (!role) {
    return { ok: false, error: "Usuário sem permissão de acesso ao painel." };
  }

  const token = randomBytes(32).toString("hex");
  const sessionId = uuid();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await execute(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (:id, :uid, :th, :exp)",
    {
      id: sessionId,
      uid: user.id,
      th: hashToken(token),
      exp: expires.toISOString().slice(0, 23).replace("T", " "),
    },
  );

  return {
    ok: true,
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name, role },
  };
}

export async function logout(token: string | undefined): Promise<void> {
  if (!token) return;
  await execute("DELETE FROM sessions WHERE token_hash = :th", { th: hashToken(token) });
}

export async function getUserFromToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const rows = await query<
    { user_id: string; email: string; full_name: string; expires_at: Date }[]
  >(
    `SELECT s.user_id, u.email, u.full_name, s.expires_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = :th
     LIMIT 1`,
    { th: hashToken(token) },
  );
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    await execute("DELETE FROM sessions WHERE token_hash = :th", { th: hashToken(token) });
    return null;
  }
  const roles = await query<{ role: Role }[]>(
    "SELECT role FROM user_roles WHERE user_id = :uid",
    { uid: row.user_id },
  );
  const roleList = roles.map((r) => r.role);
  const role: Role | null = roleList.includes("admin")
    ? "admin"
    : roleList.includes("editor")
      ? "editor"
      : null;
  if (!role) return null;
  return { id: row.user_id, email: row.email, fullName: row.full_name, role };
}

export function sessionCookieHeader(token: string, maxAgeSec = SESSION_DAYS * 86400): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSessionToken(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((c) => c.trim());
  for (const p of parts) {
    if (p.startsWith(`${SESSION_COOKIE}=`)) {
      return p.slice(SESSION_COOKIE.length + 1);
    }
  }
  return undefined;
}

export async function audit(
  userId: string | null,
  action: string,
  entity?: string,
  entityId?: string,
  meta?: unknown,
  ip?: string,
): Promise<void> {
  await execute(
    `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, meta_json, ip)
     VALUES (:id, :uid, :action, :entity, :eid, :meta, :ip)`,
    {
      id: uuid(),
      uid: userId,
      action,
      entity: entity ?? null,
      eid: entityId ?? null,
      meta: meta ? JSON.stringify(meta) : null,
      ip: ip ?? null,
    },
  );
}

export { SESSION_COOKIE };
