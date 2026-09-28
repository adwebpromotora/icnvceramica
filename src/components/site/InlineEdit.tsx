/**
 * Edição inline no site público quando o admin está logado.
 * Clique no texto → contentEditable → blur salva via callback.
 */
import { useSession } from "@/lib/admin";
import { useCallback, useRef, useState } from "react";

type Props = {
  value: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  onSave: (next: string) => Promise<void> | void;
};

export function InlineEdit({ value, as: Tag = "p", className, onSave }: Props) {
  const { role, loading } = useSession();
  const canEdit = !loading && (role === "admin" || role === "editor");
  const [editing, setEditing] = useState(false);
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
    if (next !== value) await onSave(next);
  }, [editing, onSave, value]);

  if (!canEdit) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref as never}
      className={`${className ?? ""} ${editing ? "outline outline-2 outline-primary/40 rounded-sm" : "cursor-text hover:outline hover:outline-1 hover:outline-primary/20 rounded-sm"}`}
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
    >
      {value}
    </Tag>
  );
}
