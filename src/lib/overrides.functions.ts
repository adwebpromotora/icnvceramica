/**
 * Server functions de text/image overrides (separado do componente cliente).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

export const saveTextOverrideFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ path: z.string(), key: z.string().min(1), value: z.string() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { getUserFromToken, readSessionToken, audit } = await import("@/server/auth");
    const { getRequest } = await import("@tanstack/react-start/server");
    const { execute, query, uuid } = await import("@/server/db");
    const req = getRequest();
    const user = await getUserFromToken(readSessionToken(req.headers.get("cookie")));
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return { ok: false as const, error: "Sem permissão" };
    }
    const path = normalizePath(data.path);
    await execute(`
      CREATE TABLE IF NOT EXISTS text_overrides (
        id CHAR(36) NOT NULL PRIMARY KEY,
        path_key VARCHAR(300) NOT NULL,
        content_key VARCHAR(300) NOT NULL,
        value_text MEDIUMTEXT NOT NULL,
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE KEY uq_override (path_key, content_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    const existing = await query<{ id: string }[]>(
      "SELECT id FROM text_overrides WHERE path_key = :p AND content_key = :k LIMIT 1",
      { p: path, k: data.key },
    );
    if (existing[0]) {
      await execute("UPDATE text_overrides SET value_text = :v WHERE id = :id", {
        v: data.value,
        id: existing[0].id,
      });
    } else {
      await execute(
        "INSERT INTO text_overrides (id, path_key, content_key, value_text) VALUES (:id, :p, :k, :v)",
        { id: uuid(), p: path, k: data.key, v: data.value },
      );
    }
    await audit(user.id, "inline_edit", "text_overrides", data.key);
    return { ok: true as const };
  });

export const loadTextOverridesFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ path: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { query, execute } = await import("@/server/db");
      await execute(`
        CREATE TABLE IF NOT EXISTS text_overrides (
          id CHAR(36) NOT NULL PRIMARY KEY,
          path_key VARCHAR(300) NOT NULL,
          content_key VARCHAR(300) NOT NULL,
          value_text MEDIUMTEXT NOT NULL,
          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          UNIQUE KEY uq_override (path_key, content_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      const path = normalizePath(data.path);
      return query<{ content_key: string; value_text: string }[]>(
        "SELECT content_key, value_text FROM text_overrides WHERE path_key = :p",
        { p: path },
      );
    } catch {
      return [];
    }
  });
