import { useState, type FormEvent } from "react";
import { z } from "zod";

// Formulário provisório (fase 1). Na fase do CMS será gerado pelo Form Builder e salvo no banco.
export type Field = { name: string; label: string; type?: "text" | "email" | "tel" | "textarea" | "select"; options?: string[]; required?: boolean };

export function SimpleForm({ fields, submitLabel = "Enviar" }: { fields: Field[]; submitLabel?: string }) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = z.object(
    Object.fromEntries(
      fields.map((f) => {
        let s = z.string().trim().max(f.type === "textarea" ? 2000 : 200);
        if (f.type === "email") s = s.email("E-mail inválido");
        return [f.name, f.required ? s.min(1, "Campo obrigatório") : s];
      }),
    ),
  );

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = schema.safeParse(data);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setSent(true);
  }

  if (sent)
    return (
      <div className="glass rounded-[24px] p-10 text-center">
        <p className="font-serif text-2xl">Obrigado! Recebemos sua mensagem.</p>
        <p className="mt-2 text-sm text-muted-foreground">Em breve entraremos em contato.</p>
      </div>
    );

  const input = "w-full rounded-xl bg-secondary px-4 py-3 text-sm ring-1 ring-input outline-none focus:ring-2 focus:ring-ring";
  return (
    <form onSubmit={onSubmit} noValidate className="glass grid gap-4 rounded-[24px] p-6 sm:grid-cols-2 sm:p-8">
      {fields.map((f) => (
        <label key={f.name} className={`block text-sm ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
          <span className="mb-1.5 block font-medium">{f.label}{f.required && " *"}</span>
          {f.type === "textarea" ? (
            <textarea name={f.name} rows={5} className={input} />
          ) : f.type === "select" ? (
            <select name={f.name} className={input} defaultValue="">
              <option value="">Selecione…</option>
              {f.options?.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input name={f.name} type={f.type ?? "text"} className={input} />
          )}
          {errors[f.name] && <span className="mt-1 block text-xs text-destructive">{errors[f.name]}</span>}
        </label>
      ))}
      <div className="sm:col-span-2">
        <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">{submitLabel}</button>
      </div>
    </form>
  );
}
