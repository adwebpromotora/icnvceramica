/**
 * Edição inline no site público quando o admin/editor está logado.
 * Clique no texto → contentEditable → blur salva via onSave.
 */
import { useSession, saveInlineHelper } from "@/lib/admin";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  value: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Se informado, persiste no banco (entity/id/field). Senão só chama onSave. */
  persist?: { entity: "pages" | "events" | "sermons" | "site_settings"; id: string; field: string };
  onSave?: (next: string) => Promise<void> | void;
};

export function InlineEdit({ value, as: Tag = "p", className, persist, onSave }: Props) {
  const { role, loading } = useSession();
  const canEdit = !loading && (role === "admin" || role === "editor");
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const ref = useRef<HTMLElement>(null);

  const start = useCallback(() => {
    if (!canEdit) return;
    setEditing(true);
    requestAnimationFrame(() => ref.current?.focus());
  }, [canEdit]);

  const finish = useCallback(async () => {
    if (!editing || !ref.current) return;
    setEditing(false);
    const next = ref.current.innerText.trim();
    if (next === text) return;
    setText(next);
    try {
      if (persist) {
        const r = await saveInlineHelper(persist.entity, persist.id, persist.field, next);
        if (!r.ok) {
          toast.error(r.error || "Não foi possível salvar.");
          setText(value);
          return;
        }
        toast.success("Texto atualizado.");
      }
      await onSave?.(next);
    } catch {
      toast.error("Não foi possível salvar.");
      setText(value);
    }
  }, [editing, onSave, persist, text, value]);

  if (!canEdit) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag
      ref={ref as never}
      className={`${className ?? ""} ${editing ? "outline outline-2 outline-primary/40 rounded-sm" : "cursor-text hover:outline hover:outline-1 hover:outline-primary/30 rounded-sm"}`}
      contentEditable={editing}
      suppressContentEditableWarning
      onClick={start}
      onBlur={finish}
      onKeyDown={(e) => {
        if (e.key === "Enter" && Tag !== "p") {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
      title="Clique para editar"
    >
      {text}
    </Tag>
  );
}

/** Faixa discreta no topo do site quando staff está logado. */
export function AdminEditBanner() {
  const { role, loading } = useSession();
  if (loading || (role !== "admin" && role !== "editor")) return null;
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[60] max-w-[min(92vw,28rem)] -translate-x-1/2 rounded-full bg-primary px-4 py-2.5 text-center text-xs font-medium text-primary-foreground shadow-lg">
      Modo edição ativo — clique nos textos com contorno para editar
    </div>
  );
}
