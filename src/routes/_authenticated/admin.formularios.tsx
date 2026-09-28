import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, inputCls, btnPrimary, btnGhost } from "@/components/admin/AdminShell";
import { audit, slugify } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/formularios")({
  head: () => ({ meta: [{ title: "Formulários — Painel ICNV" }, { name: "robots", content: "noindex" }] }),
  component: Forms,
});

type FieldDef = { id: string; label: string; type: string; required: boolean; options?: string[] };
const TYPES = [["text", "Texto"], ["email", "E-mail"], ["tel", "Telefone"], ["textarea", "Texto longo"], ["select", "Seleção"], ["checkbox", "Múltipla escolha"], ["date", "Data"]];

function Forms() {
  const [forms, setForms] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [subs, setSubs] = useState<{ form: any; rows: any[] } | null>(null);
  const load = () => supabase.from("forms").select("*").order("created_at").then((r) => setForms(r.data ?? []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const p = { name: edit.name, slug: edit.slug || slugify(edit.name), page_slug: edit.page_slug || null, fields: edit.fields, active: edit.active };
    const { error } = edit.id ? await supabase.from("forms").update(p).eq("id", edit.id) : await supabase.from("forms").insert(p);
    if (error) { toast.error("Não foi possível salvar."); return; }
    audit("save", "forms", edit.id); toast.success("Salvo!"); setEdit(null); load();
  };
  const openSubs = async (form: any) => {
    const { data } = await supabase.from("form_submissions").select("*").eq("form_id", form.id).order("created_at", { ascending: false });
    setSubs({ form, rows: data ?? [] });
  };
  const csv = () => {
    if (!subs) return;
    const cols: FieldDef[] = subs.form.fields;
    const esc = (v: unknown) => `"${String(Array.isArray(v) ? v.join("; ") : v ?? "").replace(/"/g, '""')}"`;
    const lines = [["Data", ...cols.map((c) => c.label)].map(esc).join(","), ...subs.rows.map((r) => [new Date(r.created_at).toLocaleString("pt-BR"), ...cols.map((c) => r.data[c.id])].map(esc).join(","))];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" }));
    a.download = `${subs.form.slug}.csv`; a.click();
  };

  if (subs) return (
    <AdminShell title={`Cadastros · ${subs.form.name}`} actions={<><button className={btnGhost} onClick={() => setSubs(null)}>Voltar</button><button className={btnPrimary} onClick={csv}><Download className="size-4" />Exportar CSV</button></>}>
      {subs.rows.length === 0 ? <p className="text-muted-foreground">Nenhum cadastro ainda.</p> : (
        <div className="glass overflow-x-auto rounded-2xl"><table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="px-4 py-3">Data</th>{subs.form.fields.map((c: FieldDef) => <th key={c.id} className="px-4 py-3">{c.label}</th>)}</tr></thead>
          <tbody>{subs.rows.map((r) => <tr key={r.id} className="border-b border-border/60"><td className="px-4 py-3">{new Date(r.created_at).toLocaleString("pt-BR")}</td>{subs.form.fields.map((c: FieldDef) => <td key={c.id} className="px-4 py-3">{String(r.data[c.id] ?? "—")}</td>)}</tr>)}</tbody>
        </table></div>
      )}
    </AdminShell>
  );

  if (edit) {
    const setField = (i: number, patch: Partial<FieldDef>) => setEdit({ ...edit, fields: edit.fields.map((f: FieldDef, j: number) => j === i ? { ...f, ...patch } : f) });
    return (
      <AdminShell title={edit.id ? "Editar formulário" : "Novo formulário"} actions={<><button className={btnGhost} onClick={() => setEdit(null)}>Cancelar</button><button className={btnPrimary} onClick={save}>Salvar</button></>}>
        <div className="mx-auto max-w-3xl space-y-4">
          <input className={inputCls} placeholder="Nome do formulário" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          <input className={inputCls} placeholder="Vincular à página (ex.: voluntario)" value={edit.page_slug ?? ""} onChange={(e) => setEdit({ ...edit, page_slug: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} />Ativo (recebendo respostas)</label>
          <h2 className="pt-4 font-serif text-xl">Campos</h2>
          {edit.fields.map((f: FieldDef, i: number) => (
            <div key={i} className="glass grid gap-2 rounded-xl p-4 sm:grid-cols-[1fr_160px_auto_auto]">
              <input className={inputCls} placeholder="Rótulo" value={f.label} onChange={(e) => setField(i, { label: e.target.value, id: slugify(e.target.value) || f.id })} />
              <select className={inputCls} value={f.type} onChange={(e) => setField(i, { type: e.target.value })}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.required} onChange={(e) => setField(i, { required: e.target.checked })} />Obrigatório</label>
              <button aria-label="Remover campo" className="p-2 text-muted-foreground hover:text-destructive" onClick={() => setEdit({ ...edit, fields: edit.fields.filter((_: unknown, j: number) => j !== i) })}><Trash2 className="size-4" /></button>
              {(f.type === "select" || f.type === "checkbox") && <input className={`${inputCls} sm:col-span-4`} placeholder="Opções separadas por vírgula" value={(f.options ?? []).join(", ")} onChange={(e) => setField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />}
            </div>
          ))}
          <button className={btnGhost} onClick={() => setEdit({ ...edit, fields: [...edit.fields, { id: `campo${edit.fields.length + 1}`, label: "", type: "text", required: false }] })}><Plus className="size-4" />Adicionar campo</button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Formulários" actions={<button className={btnPrimary} onClick={() => setEdit({ name: "", fields: [], active: true })}><Plus className="size-4" />Novo</button>}>
      <div className="grid gap-4 md:grid-cols-2">
        {forms.map((f) => (
          <div key={f.id} className="glass rounded-2xl p-5">
            <h3 className="font-serif text-xl">{f.name}</h3>
            <p className="text-sm text-muted-foreground">{f.fields.length} campos · {f.page_slug ? `página /${f.page_slug}` : "sem página"} · {f.active ? "ativo" : "inativo"}</p>
            <div className="mt-4 flex gap-2"><button className={btnGhost} onClick={() => setEdit(f)}>Editar</button><button className={btnPrimary} onClick={() => openSubs(f)}>Ver cadastros</button></div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
