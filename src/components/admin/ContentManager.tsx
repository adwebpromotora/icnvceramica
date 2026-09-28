import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/admin";
import { listContentFn, saveContentFn, deleteContentFn } from "@/lib/admin.functions";
import { AdminShell, inputCls, btnPrimary, btnGhost } from "./AdminShell";
import { RichEditor } from "./RichEditor";
import { ImageUpload } from "./ImageUpload";

export type Field = {
  key: string;
  label: string;
  type: "text" | "datetime" | "date" | "rich" | "image" | "bool" | "number" | "url";
  required?: boolean;
  hint?: string;
};

type Row = Record<string, unknown>;

function matchesSearch(r: Row, searchQuery: string) {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  const hay = Object.values(r)
    .filter((v) => v != null && typeof v !== "object")
    .map((v) => String(v).toLowerCase())
    .join(" ");
  return tokens.every((tok) => hay.includes(tok));
}

export function ContentManager({
  table,
  title,
  singular,
  fields,
  listCols,
  orderBy,
  defaults,
}: {
  table: "events" | "sermons" | "pages";
  title: string;
  singular: string;
  fields: Field[];
  listCols: { key: string; label: string; fmt?: (v: unknown) => string }[];
  orderBy: string;
  defaults: Record<string, unknown>;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [edit, setEdit] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const load = async () => {
    try {
      const data = await listContentFn({ data: { table } });
      setRows((data as Row[]) ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível carregar a lista.");
      setRows([]);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const filtered = useMemo(
    () => (rows ? rows.filter((r) => matchesSearch(r, searchQuery)) : null),
    [rows, searchQuery],
  );

  const save = async () => {
    if (!edit) return;
    for (const f of fields) {
      if (f.required && !edit[f.key]) {
        toast.error(`Preencha: ${f.label}`);
        return;
      }
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      ...edit,
      slug: (edit.slug as string) || slugify(String(edit.title ?? "")),
    };
    for (const f of fields) {
      if (f.type === "datetime" && payload[f.key]) {
        payload[f.key] = new Date(String(payload[f.key])).toISOString();
      }
    }
    delete payload.created_at;
    delete payload.updated_at;
    try {
      const result = await saveContentFn({ data: { table, payload } });
      setSaving(false);
      if (!result.ok) {
        toast.error(result.error || "Não foi possível salvar.");
        return;
      }
      toast.success("Salvo!");
      setEdit(null);
      load();
    } catch (e) {
      setSaving(false);
      console.error(e);
      toast.error("Não foi possível salvar.");
    }
  };

  const remove = async (r: Row) => {
    if (!confirm(`Excluir "${r.title}"?`)) return;
    try {
      await deleteContentFn({ data: { table, id: String(r.id) } });
      load();
    } catch {
      toast.error("Não foi possível excluir.");
    }
  };

  const toLocal = (iso: unknown) => {
    if (!iso) return "";
    const d = new Date(String(iso));
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <AdminShell
      title={title}
      actions={
        !edit ? (
          <button className={btnPrimary} onClick={() => setEdit({ ...defaults })}>
            <Plus className="size-4" /> Novo {singular}
          </button>
        ) : (
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => setEdit(null)} disabled={saving}>
              Cancelar
            </button>
            <button className={btnPrimary} onClick={save} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Salvar
            </button>
          </div>
        )
      }
    >
      {edit ? (
        <div className="mx-auto grid max-w-3xl gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-sm font-medium">
                {f.label}
                {f.required ? " *" : ""}
              </label>
              {f.type === "rich" ? (
                <RichEditor
                  value={String(edit[f.key] ?? "")}
                  onChange={(v) => setEdit({ ...edit, [f.key]: v })}
                />
              ) : f.type === "image" ? (
                <ImageUpload
                  value={(edit[f.key] as string) ?? null}
                  onChange={(v) => setEdit({ ...edit, [f.key]: v })}
                />
              ) : f.type === "bool" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(edit[f.key])}
                    onChange={(e) => setEdit({ ...edit, [f.key]: e.target.checked })}
                  />
                  {f.hint || "Ativo"}
                </label>
              ) : f.type === "datetime" ? (
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={toLocal(edit[f.key])}
                  onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}
                />
              ) : f.type === "date" ? (
                <input
                  type="date"
                  className={inputCls}
                  value={String(edit[f.key] ?? "").slice(0, 10)}
                  onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}
                />
              ) : (
                <input
                  className={inputCls}
                  type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                  value={String(edit[f.key] ?? "")}
                  placeholder={f.key === "slug" ? slugify(String(edit.title ?? "")) : undefined}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      [f.key]:
                        f.key === "slug"
                          ? slugify(e.target.value)
                          : f.type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                    })
                  }
                />
              )}
              {f.hint && f.type !== "bool" && (
                <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>
              )}
            </div>
          ))}
        </div>
      ) : rows === null ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <input
            className={`${inputCls} mb-4 max-w-md`}
            placeholder="Buscar (qualquer ordem de palavras)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {rows.length === 0 ? (
            <p className="text-muted-foreground">Nada por aqui ainda.</p>
          ) : filtered && filtered.length === 0 ? (
            <p className="text-muted-foreground">Nenhum resultado para a busca.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-left">
                  <tr>
                    {listCols.map((c) => (
                      <th key={c.key} className="px-4 py-3 font-medium">
                        {c.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtered ?? rows).map((r) => (
                    <tr key={String(r.id)} className="border-t border-border">
                      {listCols.map((c) => (
                        <td key={c.key} className="px-4 py-3">
                          {c.fmt ? c.fmt(r[c.key]) : String(r[c.key] ?? "—")}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className={btnGhost + " !min-h-11 !min-w-11 !px-3"} onClick={() => setEdit({ ...r })} aria-label="Editar">
                            <Pencil className="size-4" />
                          </button>
                          <button className={btnGhost + " !min-h-11 !min-w-11 !px-3"} onClick={() => remove(r)} aria-label="Excluir">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}

export function fmtDateTime(v: unknown) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(String(v)));
}

export function fmtDay(v: unknown) {
  if (!v) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(String(v)));
}

export function fmtBool(v: unknown) {
  return v === true || v === 1 || v === "1" ? "Sim" : "Não";
}
