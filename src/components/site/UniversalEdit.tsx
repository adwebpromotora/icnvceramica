/**
 * Modo edição universal: com admin/editor logado, qualquer texto (p, h*, span, a, button, label, li)
 * fica clicável para contentEditable. Persistência em text_overrides (pathname + chave).
 */
import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSession } from "@/lib/admin";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "BUTTON", "LABEL", "LI", "TD", "TH"]);

export const saveTextOverrideFn = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ path: z.string(), key: z.string(), value: z.string() }).parse(d),
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
      { p: data.path, k: data.key },
    );
    if (existing[0]) {
      await execute("UPDATE text_overrides SET value_text = :v WHERE id = :id", {
        v: data.value,
        id: existing[0].id,
      });
    } else {
      await execute(
        "INSERT INTO text_overrides (id, path_key, content_key, value_text) VALUES (:id, :p, :k, :v)",
        { id: uuid(), p: data.path, k: data.key, v: data.value },
      );
    }
    await audit(user.id, "inline_edit", "text_overrides", data.key);
    return { ok: true as const };
  });

export const loadTextOverridesFn = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ path: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { query } = await import("@/server/db");
      await query(`
        CREATE TABLE IF NOT EXISTS text_overrides (
          id CHAR(36) NOT NULL PRIMARY KEY,
          path_key VARCHAR(300) NOT NULL,
          content_key VARCHAR(300) NOT NULL,
          value_text MEDIUMTEXT NOT NULL,
          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          UNIQUE KEY uq_override (path_key, content_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      return query<{ content_key: string; value_text: string }[]>(
        "SELECT content_key, value_text FROM text_overrides WHERE path_key = :p",
        { p: data.path },
      );
    } catch {
      return [];
    }
  });

function keyFor(el: HTMLElement, path: string) {
  const existing = el.getAttribute("data-edit-key");
  if (existing) return existing;
  const text = (el.innerText || "").trim().slice(0, 40);
  const key = `${el.tagName}:${text}`.toLowerCase().replace(/\s+/g, "-");
  el.setAttribute("data-edit-key", key);
  return key;
}

export function UniversalEdit() {
  const { role, loading } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const canEdit = !loading && (role === "admin" || role === "editor");
  const active = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!canEdit) return;
    // aplica overrides salvos
    loadTextOverridesFn({ data: { path: pathname } })
      .then((rows) => {
        const map = new Map(rows.map((r) => [r.content_key, r.value_text]));
        document.querySelectorAll<HTMLElement>("[data-edit-key]").forEach((el) => {
          const k = el.getAttribute("data-edit-key");
          if (k && map.has(k)) el.innerText = map.get(k)!;
        });
      })
      .catch(() => {});

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // sobe até achar tag editável
      let el: HTMLElement | null = t;
      for (let i = 0; i < 5 && el; i++) {
        if (TAGS.has(el.tagName) && (el.innerText || "").trim().length > 0) break;
        el = el.parentElement;
      }
      if (!el || !TAGS.has(el.tagName)) return;
      if (el.closest("[data-no-edit]") || el.closest("nav input") || el.isContentEditable) return;
      // não editar dentro do painel admin
      if (pathname.startsWith("/admin")) return;

      e.preventDefault();
      e.stopPropagation();
      if (active.current && active.current !== el) {
        active.current.contentEditable = "false";
        active.current.classList.remove("outline", "outline-2", "outline-primary/40");
      }
      active.current = el;
      el.contentEditable = "true";
      el.classList.add("outline", "outline-2", "outline-primary/40", "rounded-sm");
      el.focus();
    };

    const onBlur = async (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (!el?.isContentEditable) return;
      el.contentEditable = "false";
      el.classList.remove("outline", "outline-2", "outline-primary/40");
      const key = keyFor(el, pathname);
      const value = (el.innerText || "").trim();
      try {
        const r = await saveTextOverrideFn({ data: { path: pathname, key, value } });
        if (r.ok) toast.success("Texto salvo");
        else toast.error(r.error || "Erro ao salvar");
      } catch {
        toast.error("Erro ao salvar texto");
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("focusout", onBlur, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusout", onBlur, true);
    };
  }, [canEdit, pathname]);

  return null;
}
