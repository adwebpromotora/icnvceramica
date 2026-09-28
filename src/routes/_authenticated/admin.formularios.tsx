import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/admin";
import {
  listFormsFn,
  saveFormFn,
  deleteFormFn,
  listFormResponsesFn,
} from "@/lib/admin.functions";
import { AdminShell, inputCls, btnPrimary, btnGhost } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/formularios")({
  head: () => ({
    meta: [{ title: "Formulários — Painel ICNV" }, { name: "robots", content: "noindex" }],
  }),
  component: FormsPage,
});

type FieldDef = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
};

type FormRow = {
  id?: string;
  title: string;
  slug: string;
  description?: string | null;
  fields: FieldDef[];
  active: boolean;
};

const TYPES: [string, string][] = [
  ["text", "Texto"],
  ["email", "E-mail"],
  ["tel", "Telefone"],
  ["textarea", "Área de texto"],
  ["select", "Lista"],
  ["checkbox", "Múltipla escolha"],
];

function FormsPage() {
  const [forms, setForms] = useState<FormRow[] | null>(null);
  const [edit, setEdit] = useState<FormRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [subs, setSubs] = useState<Record<string, unknown>[] | null>(null);
  const [subsTitle, setSubsTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const load = async () => {
    try {
      const data = await listFormsFn();
      setForms(
        (data as Record<string, unknown>[]).map((f) => ({
          id: String(f.id),
          title: String(f.title ?? ""),
          slug: String(f.slug ?? ""),
          description: (f.description as string) ?? null,
          fields:
            typeof f.fields_json === "string"
              ? JSON.parse(f.fields_json as string)
              : (f.fields_json as FieldDef[]) ?? [],
          active: Boolean(f.active),
        })),
      );
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível carregar formulários.");
      setForms([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!edit) return;
    if (!edit.title.trim()) {
      toast.error("Informe o título.");
      return;
    }
    setSaving(true);
    try {
      const r = await saveFormFn({
        data: {
          id: edit.id,
          title: edit.title,
          slug: edit.slug || slugify(edit.title),
          description: edit.description ?? null,
          fields_json: edit.fields,
          active: edit.active,
        },
      });
      if (!r.ok) {
        toast.error(r.error || "Erro ao salvar.");
        setSaving(false);
        return;
      }
      toast.success("Salvo!");
      setEdit(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const openSubs = async (f: FormRow) => {
    if (!f.id) return;
    setSubsTitle(f.title);
    try {
      const data = await listFormResponsesFn({ data: { formId: f.id } });
      setSubs(data as Record<string, unknown>[]);
    } catch {
      toast.error("Não foi possível carregar cadastros.");
      setSubs([]);
    }
  };

  const setField = (i: number, patch: Partial<FieldDef>) => {
    if (!edit) return;
    const fields = edit.fields.map((f, j) => (j === i ? { ...f, ...patch } : f));
    setEdit({ ...edit, fields });
  };

  if (subs) {
    return (
      <AdminShell
        title={`Cadastros — ${subsTitle}`}
        actions={
          <button className={btnGhost} onClick={() => setSubs(null)}>
            Voltar
          </button>
        }
      >
        {subs.length === 0 ? (
          <p className="text-muted-foreground">Nenhum cadastro ainda.</p>
        ) : (
          <div className="space-y-3">
            {subs.map((r) => (
              <pre
                key={String(r.id)}
                className="glass overflow-x-auto rounded-xl p-4 text-xs"
              >
                {typeof r.data_json === "string"
                  ? r.data_json
                  : JSON.stringify(r.data_json, null, 2)}
                {"\n"}
                <span className="text-muted-foreground">{String(r.created_at)}</span>
              </pre>
            ))}
          </div>
        )}
      </AdminShell>
    );
  }

  if (edit) {
    return (
      <AdminShell
        title={edit.id ? "Editar formulário" : "Novo formulário"}
        actions={
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => setEdit(null)} disabled={saving}>
              Cancelar
            </button>
            <button className={btnPrimary} onClick={save} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Salvar
            </button>
          </div>
        }
      >
        <div className="mx-auto grid max-w-3xl gap-4">
          <input
            className={inputCls}
            placeholder="Título"
            value={edit.title}
            onChange={(e) => setEdit({ ...edit, title: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Slug"
            value={edit.slug}
            onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={edit.active}
              onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
            />
            Ativo
          </label>
          <h2 className="pt-4 font-serif text-xl">Campos</h2>
          {edit.fields.map((f, i) => (
            <div
              key={i}
              className="glass grid gap-2 rounded-xl p-4 sm:grid-cols-[1fr_160px_auto_auto]"
            >
              <input
                className={inputCls}
                placeholder="Rótulo"
                value={f.label}
                onChange={(e) =>
                  setField(i, {
                    label: e.target.value,
                    id: slugify(e.target.value) || f.id,
                  })
                }
              />
              <select
                className={inputCls}
                value={f.type}
                onChange={(e) => setField(i, { type: e.target.value })}
              >
                {TYPES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => setField(i, { required: e.target.checked })}
                />
                Obrigatório
              </label>
              <button
                aria-label="Remover campo"
                className="p-2 text-muted-foreground hover:text-destructive"
                onClick={() =>
                  setEdit({ ...edit, fields: edit.fields.filter((_, j) => j !== i) })
                }
              >
                <Trash2 className="size-4" />
              </button>
              {(f.type === "select" || f.type === "checkbox") && (
                <input
                  className={`${inputCls} sm:col-span-4`}
                  placeholder="Opções separadas por vírgula"
                  value={(f.options ?? []).join(", ")}
                  onChange={(e) =>
                    setField(i, {
                      options: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              )}
            </div>
          ))}
          <button
            className={btnGhost}
            onClick={() =>
              setEdit({
                ...edit,
                fields: [
                  ...edit.fields,
                  {
                    id: `campo${edit.fields.length + 1}`,
                    label: "",
                    type: "text",
                    required: false,
                  },
                ],
              })
            }
          >
            <Plus className="size-4" /> Adicionar campo
          </button>
        </div>
      </AdminShell>
    );
  }

  const filteredForms = (forms ?? []).filter((f) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const tokens = q.split(/\s+/).filter(Boolean);
    const hay = `${f.title} ${f.slug}`.toLowerCase();
    return tokens.every((tok) => hay.includes(tok));
  });

  return (
    <AdminShell
      title="Formulários"
      actions={
        <button
          className={btnPrimary}
          onClick={() =>
            setEdit({ title: "", slug: "", fields: [], active: true })
          }
        >
          <Plus className="size-4" /> Novo
        </button>
      }
    >
      {forms === null ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : forms.length === 0 ? (
        <p className="text-muted-foreground">Nenhum formulário ainda.</p>
      ) : (
        <>
        <input
          className={inputCls + " mb-4 max-w-md"}
          placeholder="Buscar formulário…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {filteredForms.map((f) => (
            <div key={f.id} className="glass rounded-2xl p-5">
              <h3 className="font-serif text-xl">{f.title}</h3>
              <p className="text-sm text-muted-foreground">
                {f.fields.length} campos · /{f.slug} · {f.active ? "ativo" : "inativo"}
              </p>
              <div className="mt-4 flex gap-2">
                <button className={btnGhost} onClick={() => setEdit(f)}>
                  Editar
                </button>
                <button className={btnPrimary} onClick={() => openSubs(f)}>
                  Ver cadastros
                </button>
                <button
                  className={btnGhost}
                  onClick={async () => {
                    if (!f.id || !confirm("Excluir formulário?")) return;
                    await deleteFormFn({ data: { id: f.id } });
                    load();
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </AdminShell>
  );
}
