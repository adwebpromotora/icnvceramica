import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { audit, slugify } from "@/lib/admin";
import { AdminShell, inputCls, btnPrimary, btnGhost } from "./AdminShell";
import { RichEditor } from "./RichEditor";
import { ImageUpload } from "./ImageUpload";

export type Field = { key: string; label: string; type: "text" | "datetime" | "date" | "rich" | "image" | "bool" | "number" | "url"; required?: boolean; hint?: string };

type Row = any;

// Gerenciador genérico reutilizável: serve para agenda, mensagens, páginas e futuros tipos de post.
export function ContentManager({ table, title, singular, fields, listCols, orderBy, defaults }: {
  table: "events" | "sermons" | "pages"; title: string; singular: string; fields: Field[];
  listCols: { key: string; label: string; fmt?: (v: any) => string }[]; orderBy: string; defaults: Record<string, any>;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [edit, setEdit] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from(table).select("*").order(orderBy, { ascending: false });
    setRows((data as Row[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit) return;
    for (const f of fields) if (f.required && !edit[f.key]) { toast.error(`Preencha: ${f.label}`); return; }
    setSaving(true);
    const payload: any = { ...edit, slug: edit.slug || slugify(edit.title) };
    for (const f of fields) if ((f.type === "datetime") && payload[f.key]) payload[f.key] = new Date(payload[f.key]).toISOString();
    delete payload.created_at; delete payload.updated_at;
    const q = payload.id ? supabase.from(table).update(payload as never).eq("id", payload.id) : supabase.from(table).insert(payload as never);
    const { error } = await q;
    setSaving(false);
    if (error) { toast.error(error.message.includes("duplicate") ? "Já existe um item com esse endereço (slug)." : "Não foi possível salvar."); return; }
    audit(payload.id ? "update" : "create", table, payload.id);
    toast.success("Salvo!");
    setEdit(null); load();
  };
  const remove = async (r: Row) => {
    if (!confirm(`Excluir "${r.title}"?`)) return;
    await supabase.from(table).delete().eq("id", r.id);
    audit("delete", table, r.id); load();
  };
  const toLocal = (v?: string) => v ? new Date(new Date(v).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

  if (edit) {
    return (
      <AdminShell title={edit.id ? `Editar ${singular}` : `Novo(a) ${singular}`} actions={<>
        <button className={btnGhost} onClick={() => setEdit(null)}>Cancelar</button>
        <button className={btnPrimary} onClick={save} disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />}Salvar</button>
      </>}>
        <div className="mx-auto grid max-w-4xl gap-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-sm font-medium">{f.label}{f.required && " *"}</label>
              {f.type === "rich" ? <RichEditor value={edit[f.key] ?? ""} onChange={(v) => setEdit((e: any) => ({ ...e, [f.key]: v }))} />
              : f.type === "image" ? <div className="max-w-md"><ImageUpload value={edit[f.key] ?? null} onChange={(v) => setEdit((e: any) => ({ ...e, [f.key]: v }))} /></div>
              : f.type === "bool" ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit[f.key]} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.checked })} />Sim</label>
              : <input className={inputCls} type={f.type === "datetime" ? "datetime-local" : f.type === "date" ? "date" : f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                  value={f.type === "datetime" ? toLocal(edit[f.key]) : edit[f.key] ?? ""}
                  onChange={(e) => setEdit({ ...edit, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value || null })} />}
              {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Endereço (slug)</label>
            <input className={inputCls} value={edit.slug ?? ""} placeholder={slugify(edit.title ?? "")} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} />
            <p className="mt-1 text-xs text-muted-foreground">Deixe vazio para gerar a partir do título.</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={title} actions={<button className={btnPrimary} onClick={() => setEdit({ ...defaults })}><Plus className="size-4" />Novo</button>}>
      {!rows ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : rows.length === 0 ? <p className="text-muted-foreground">Nada por aqui ainda.</p> : (
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-muted-foreground">{listCols.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}<th /></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                {listCols.map((c) => <td key={c.key} className="px-4 py-3">{c.fmt ? c.fmt(r[c.key]) : String(r[c.key] ?? "—")}</td>)}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button aria-label="Editar" className="p-2 text-muted-foreground hover:text-foreground" onClick={() => setEdit(r)}><Pencil className="size-4" /></button>
                  <button aria-label="Excluir" className="p-2 text-muted-foreground hover:text-destructive" onClick={() => remove(r)}><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

export const fmtDateTime = (v?: string) => v ? new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";
export const fmtDay = (v?: string) => v ? new Date(v + "T00:00:00").toLocaleDateString("pt-BR") : "—";
export const fmtBool = (v: boolean) => v ? "Sim" : "Não";
