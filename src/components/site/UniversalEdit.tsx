/**
 * Edição inline no site público (admin/editor).
 * Overrides são carregados para TODOS os visitantes e aplicados aos textos originais.
 */
import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSession } from "@/lib/admin";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TAGS = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "BUTTON", "LABEL", "LI", "TD", "TH", "STRONG", "EM", "TIME",
]);

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

/** Chave estável baseada no texto ORIGINAL do elemento (antes da edição). */
export function makeTextKey(tag: string, text: string) {
  const t = text.trim().slice(0, 80).toLowerCase().replace(/\s+/g, " ");
  return `${tag.toUpperCase()}:${t}`;
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

function applyOverrides(map: Map<string, string>) {
  if (!map.size) return;
  const all = document.querySelectorAll<HTMLElement>("body *");
  for (const el of all) {
    if (!TAGS.has(el.tagName)) continue;
    if (el.closest("[data-no-edit], .admin-shell, input, textarea, select")) continue;
    // só nós "folha de texto" (sem filhos com tags de texto aninhadas profundas demais)
    const text = (el.innerText || "").trim();
    if (!text || text.length > 500) continue;
    const key = makeTextKey(el.tagName, text);
    if (map.has(key)) {
      const next = map.get(key)!;
      if (el.innerText !== next) el.innerText = next;
      el.setAttribute("data-edit-key", key);
      el.setAttribute("data-override-applied", "1");
    }
  }
}

export function UniversalEdit() {
  const { role, loading } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const canEdit = !loading && (role === "admin" || role === "editor");
  const active = useRef<HTMLElement | null>(null);
  const originals = useRef(new WeakMap<HTMLElement, string>());

  // Aplica overrides para TODOS (visitantes e admin)
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let cancelled = false;
    loadTextOverridesFn({ data: { path: pathname } })
      .then((rows) => {
        if (cancelled) return;
        const map = new Map(rows.map((r) => [r.content_key, r.value_text]));
        // aguarda paint do React
        requestAnimationFrame(() => applyOverrides(map));
        // segunda passagem (conteúdo async da página)
        setTimeout(() => applyOverrides(map), 400);
        setTimeout(() => applyOverrides(map), 1200);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Handlers de edição só para staff
  useEffect(() => {
    if (!canEdit || pathname.startsWith("/admin")) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // botões de mídia / no-edit nunca entram em contentEditable
      if (t.closest("[data-no-edit]")) return;
      if (t.tagName === "IMG" || t.closest("img")) return;
      if (t.closest("input, textarea, select")) return;

      let el: HTMLElement | null = t;
      for (let i = 0; i < 6 && el; i++) {
        if (TAGS.has(el.tagName) && (el.innerText || "").trim().length > 0) break;
        el = el.parentElement;
      }
      if (!el || !TAGS.has(el.tagName)) return;
      if (el.closest("[data-no-edit]")) return;

      e.preventDefault();
      e.stopPropagation();

      // chave = texto ORIGINAL (antes de qualquer edição nesta sessão)
      if (!originals.current.has(el)) {
        const original =
          el.getAttribute("data-edit-key")?.replace(/^[A-Z0-9]+:/, "") ||
          (el.innerText || "").trim();
        // se já tem data-edit-key salvo, reutiliza; senão grava a partir do texto atual (ainda original)
        if (!el.getAttribute("data-edit-key")) {
          el.setAttribute("data-edit-key", makeTextKey(el.tagName, el.innerText || ""));
        }
        originals.current.set(el, el.getAttribute("data-edit-key")!);
      }

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
      const key =
        originals.current.get(el) ||
        el.getAttribute("data-edit-key") ||
        makeTextKey(el.tagName, el.innerText || "");
      const value = (el.innerText || "").trim();
      try {
        const r = await saveTextOverrideFn({
          data: { path: pathname, key, value },
        });
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
