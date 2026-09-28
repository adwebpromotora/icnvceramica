/**
 * Camada de acesso ao MySQL via mysql2 (pool).
 * Credenciais exclusivamente de variáveis de ambiente — sem API externa.
 * Na primeira conexão, garante que o schema exista (CREATE TABLE IF NOT EXISTS).
 */
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
import { join } from "node:path";

let pool: mysql.Pool | null = null;
let schemaReady = false;

function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return v;
}

export function getPool(): mysql.Pool {
  if (pool) return pool;
  const config: mysql.PoolOptions = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
    database: env("DB_NAME"),
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    charset: "utf8mb4",
    timezone: "Z",
  };
  if (process.env.DB_SOCKET) {
    config.socketPath = process.env.DB_SOCKET;
    delete (config as { host?: string }).host;
  }
  pool = mysql.createPool(config);
  return pool;
}

/** Executa o schema.sql (CREATE IF NOT EXISTS) uma vez por processo. */
export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const p = getPool();
  // Schema embutido mínimo para bootstrap; o arquivo schema.sql na raiz é a fonte de verdade completa.
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) NOT NULL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(120) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS user_roles (
      id CHAR(36) NOT NULL PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      role ENUM('admin','editor') NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_user_role (user_id, role),
      CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id CHAR(36) NOT NULL PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      token_hash VARCHAR(64) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_sessions_token (token_hash),
      KEY idx_sessions_user (user_id),
      KEY idx_sessions_expires (expires_at),
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id CHAR(36) NOT NULL PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      token_hash VARCHAR(64) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      used_at DATETIME(3) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_prt_token (token_hash),
      CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS site_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
      church_name VARCHAR(200) NOT NULL DEFAULT 'ICNV Cerâmica',
      address VARCHAR(500) NOT NULL DEFAULT '',
      phone VARCHAR(40) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL DEFAULT '',
      pix_key VARCHAR(255) NOT NULL DEFAULT '',
      founded_at DATE NULL,
      spotify_embed_url VARCHAR(500) NOT NULL DEFAULT '',
      spotify_show_url VARCHAR(500) NOT NULL DEFAULT '',
      logo_path VARCHAR(500) NULL,
      primary_color VARCHAR(20) NOT NULL DEFAULT '#1e3a5f',
      accent_color VARCHAR(20) NOT NULL DEFAULT '#d4a574',
      show_back_to_top TINYINT(1) NOT NULL DEFAULT 1,
      gtm_id VARCHAR(40) NULL,
      smtp_host VARCHAR(255) NULL,
      smtp_port INT NULL,
      smtp_user VARCHAR(255) NULL,
      smtp_pass VARCHAR(255) NULL,
      smtp_from VARCHAR(255) NULL,
      smtp_secure TINYINT(1) NOT NULL DEFAULT 1,
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `INSERT IGNORE INTO site_settings (id) VALUES (1)`,
    `CREATE TABLE IF NOT EXISTS pages (
      id CHAR(36) NOT NULL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(120) NOT NULL,
      content LONGTEXT NULL,
      visible TINYINT(1) NOT NULL DEFAULT 1,
      menu_order INT NOT NULL DEFAULT 0,
      parent_id CHAR(36) NULL,
      show_in_menu TINYINT(1) NOT NULL DEFAULT 1,
      created_by CHAR(36) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_pages_slug (slug),
      KEY idx_pages_menu (show_in_menu, visible, menu_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS events (
      id CHAR(36) NOT NULL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(120) NOT NULL,
      summary TEXT NULL,
      content LONGTEXT NULL,
      cover_path VARCHAR(500) NULL,
      starts_at DATETIME(3) NOT NULL,
      ends_at DATETIME(3) NULL,
      location VARCHAR(300) NULL,
      published TINYINT(1) NOT NULL DEFAULT 0,
      created_by CHAR(36) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_events_slug (slug),
      KEY idx_events_starts (starts_at, published)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS sermons (
      id CHAR(36) NOT NULL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(120) NOT NULL,
      summary TEXT NULL,
      content LONGTEXT NULL,
      cover_path VARCHAR(500) NULL,
      preached_at DATE NULL,
      preacher VARCHAR(120) NULL,
      published TINYINT(1) NOT NULL DEFAULT 0,
      created_by CHAR(36) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_sermons_slug (slug),
      KEY idx_sermons_date (preached_at, published)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS forms (
      id CHAR(36) NOT NULL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(120) NOT NULL,
      description TEXT NULL,
      fields_json JSON NOT NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_by CHAR(36) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_forms_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS form_responses (
      id CHAR(36) NOT NULL PRIMARY KEY,
      form_id CHAR(36) NOT NULL,
      data_json JSON NOT NULL,
      ip VARCHAR(45) NULL,
      user_agent VARCHAR(500) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      KEY idx_fr_form (form_id, created_at),
      CONSTRAINT fk_fr_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id CHAR(36) NOT NULL PRIMARY KEY,
      user_id CHAR(36) NULL,
      action VARCHAR(80) NOT NULL,
      entity VARCHAR(80) NULL,
      entity_id VARCHAR(80) NULL,
      meta_json JSON NULL,
      ip VARCHAR(45) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      KEY idx_audit_created (created_at),
      KEY idx_audit_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS push_subscriptions (
      id CHAR(36) NOT NULL PRIMARY KEY,
      endpoint TEXT NOT NULL,
      p256dh VARCHAR(255) NOT NULL,
      auth VARCHAR(255) NOT NULL,
      user_agent VARCHAR(500) NULL,
      topics_json JSON NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      KEY idx_push_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS push_messages (
      id CHAR(36) NOT NULL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      body TEXT NOT NULL,
      link VARCHAR(500) NULL,
      image_path VARCHAR(500) NULL,
      scheduled_at DATETIME(3) NULL,
      sent_at DATETIME(3) NULL,
      reached INT NOT NULL DEFAULT 0,
      created_by CHAR(36) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      KEY idx_push_msg_sent (sent_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  const conn = await p.getConnection();
  try {
    for (const sql of statements) {
      await conn.query(sql);
    }
    // migrações leves (idempotentes)
    for (const sql of [
      "ALTER TABLE site_settings ADD COLUMN maintenance_mode TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE site_settings ADD COLUMN maintenance_message TEXT NULL",
    ]) {
      try {
        await conn.query(sql);
      } catch {
        /* coluna já existe */
      }
    }
    schemaReady = true;
  } finally {
    conn.release();
  }
}

export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params?: Record<string, unknown> | unknown[],
): Promise<T> {
  await ensureSchema();
  const [rows] = await getPool().query(sql, params);
  return rows as T;
}

export async function execute(
  sql: string,
  params?: Record<string, unknown> | unknown[],
): Promise<mysql.ResultSetHeader> {
  await ensureSchema();
  const [result] = await getPool().execute(sql, params);
  return result as mysql.ResultSetHeader;
}

export function uuid(): string {
  return crypto.randomUUID();
}
