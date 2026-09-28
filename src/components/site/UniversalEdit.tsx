/**
 * Edição inline no site público (admin/editor).
 * Overrides são carregados para TODOS os visitantes.
 */
import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSession } from "@/lib/admin";
import { loadTextOverridesFn, saveTextOverrideFn } from "@/lib/overrides.functions";

const TAGS = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "BUTTON", "LABEL", "LI", "TD", "TH", "STRONG", "EM", "TIME",
]);

export function makeTextKey(tag: string, text: string) {
  const t = text.trim().slice(0, 80).toLowerCase().replace(/\s+/g, " ");
  return `${tag.toUpperCase()}:${t}`;
}

function applyOverrides(map: Map<string, string>) {
  if (!map.size) return;
  const all = document.querySelectorAll<HTMLElement>("body *");
  for (const el of all) {
    if (!TAGS.has(el.tagName)) continue;
    if (el.closest("[data-no-edit], .admin-shell, input, textarea, select")) continue;
    const text = (el.innerText || "").trim();
    if (!text || text.length > 500) continue;
    const key = makeTextKey(el.tagName, text);
    if (map.has(key)) {
      const next = map.get(key)!;
      if (el.innerText !== next) el.innerText = next;
      el.setAttribute("data-edit-key", key);
    }
  }
}

export function UniversalEdit() {
  const { role, loading } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const canEdit = !loading && (role === "admin" || role === "editor");
  const active = useRef<HTMLElement | null>(null);
  const originals = useRef(new WeakMap<HTMLElement, string>());

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let cancelled = false;
    loadTextOverridesFn({ data: { path: pathname } })
      .then((rows) => {
        if (cancelled) return;
        const map = new Map(rows.map((r) => [r.content_key, r.value_text]));
        requestAnimationFrame(() => applyOverrides(map));
        setTimeout(() => applyOverrides(map), 400);
        setTimeout(() => applyOverrides(map), 1200);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!canEdit || pathname.startsWith("/admin")) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
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

      if (!el.getAttribute("data-edit-key")) {
        el.setAttribute("data-edit-key", makeTextKey(el.tagName, el.innerText || ""));
      }
      originals.current.set(el, el.getAttribute("data-edit-key")!);

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

// re-export para quem ainda importa daqui
export { loadTextOverridesFn, saveTextOverrideFn } from "@/lib/overrides.functions";
