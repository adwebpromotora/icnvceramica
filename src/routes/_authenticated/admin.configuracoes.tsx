import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, inputCls, btnPrimary } from "@/components/admin/AdminShell";
import { churchAgeFrom, useSession } from "@/lib/admin";
import { getSettingsAdmin, saveSettings } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({
    meta: [{ title: "Configurações — ICNV Cerâmica" }, { name: "robots", content: "noindex" }],
  }),
  component: Settings,
});

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Settings() {
  const { role } = useSession();
  const [s, setS] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettingsAdmin()
      .then((data) => setS(data ?? {}))
      .catch((e) => {
        console.error(e);
        toast.error("Não foi possível carregar as configurações.");
        setS({});
      });
  }, []);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      const payload = { ...s };
      delete payload.id;
      delete payload.updated_at;
      await saveSettings({ data: payload });
      toast.success("Configurações salvas!");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (!s) {
    return (
      <AdminShell title="Configurações">
        <p className="text-muted-foreground">Carregando…</p>
      </AdminShell>
    );
  }

  const age = churchAgeFrom(String(s.founded_at ?? "1997-03-15"));
  const set =
    (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setS({ ...s, [k]: e.target.value });

  return (
    <AdminShell
      title="Configurações"
      actions={
        <button className={btnPrimary} onClick={save} disabled={saving}>
          {saving ? "Salvando…" : "Salvar"}
        </button>
      }
    >
      <div className="mx-auto grid max-w-4xl gap-6">
        <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
          <h2 className="font-serif text-xl sm:col-span-2">Igreja</h2>
          <Row label="Data de fundação" hint={`Hoje: ${age.years} anos e ${age.months} meses.`}>
            <input
              type="date"
              className={inputCls}
              value={String(s.founded_at ?? "").slice(0, 10)}
              onChange={set("founded_at")}
            />
          </Row>
          <Row label="Nome">
            <input className={inputCls} value={String(s.church_name ?? "")} onChange={set("church_name")} />
          </Row>
          <Row label="Endereço">
            <input className={inputCls} value={String(s.address ?? "")} onChange={set("address")} />
          </Row>
          <Row label="Telefone">
            <input className={inputCls} value={String(s.phone ?? "")} onChange={set("phone")} />
          </Row>
          <Row label="E-mail">
            <input className={inputCls} value={String(s.email ?? "")} onChange={set("email")} />
          </Row>
          <Row label="Chave Pix">
            <input className={inputCls} value={String(s.pix_key ?? "")} onChange={set("pix_key")} />
          </Row>
        </section>

        <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
          <h2 className="font-serif text-xl sm:col-span-2">Aparência e Spotify</h2>
          <Row label="Cor primária">
            <input type="color" className={inputCls} value={String(s.primary_color ?? "#1e3a5f")} onChange={set("primary_color")} />
          </Row>
          <Row label="Cor de destaque">
            <input type="color" className={inputCls} value={String(s.accent_color ?? "#d4a574")} onChange={set("accent_color")} />
          </Row>
          <Row label="Spotify embed URL">
            <input className={inputCls} value={String(s.spotify_embed_url ?? "")} onChange={set("spotify_embed_url")} />
          </Row>
          <Row label="Spotify show URL">
            <input className={inputCls} value={String(s.spotify_show_url ?? "")} onChange={set("spotify_show_url")} />
          </Row>
          <Row label="Botão voltar ao topo">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(s.show_back_to_top)}
                onChange={(e) => setS({ ...s, show_back_to_top: e.target.checked })}
              />
              Exibir no site
            </label>
          </Row>
        </section>

        {role === "admin" && (
          <>
            <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
              <h2 className="font-serif text-xl sm:col-span-2">GTM (somente Admin)</h2>
              <Row label="Google Tag Manager ID">
                <input className={inputCls} value={String(s.gtm_id ?? "")} onChange={set("gtm_id")} placeholder="GTM-XXXX" />
              </Row>
            </section>
            <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
              <h2 className="font-serif text-xl sm:col-span-2">SMTP (somente Admin)</h2>
              <Row label="Host">
                <input className={inputCls} value={String(s.smtp_host ?? "")} onChange={set("smtp_host")} />
              </Row>
              <Row label="Porta">
                <input
                  type="number"
                  className={inputCls}
                  value={s.smtp_port != null ? String(s.smtp_port) : ""}
                  onChange={(e) => setS({ ...s, smtp_port: Number(e.target.value) || null })}
                />
              </Row>
              <Row label="Usuário">
                <input className={inputCls} value={String(s.smtp_user ?? "")} onChange={set("smtp_user")} />
              </Row>
              <Row label="Senha">
                <input
                  type="password"
                  className={inputCls}
                  value={String(s.smtp_pass ?? "")}
                  onChange={set("smtp_pass")}
                />
              </Row>
              <Row label="Remetente">
                <input className={inputCls} value={String(s.smtp_from ?? "")} onChange={set("smtp_from")} />
              </Row>
              <Row label="SSL/TLS">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(s.smtp_secure)}
                    onChange={(e) => setS({ ...s, smtp_secure: e.target.checked })}
                  />
                  Conexão segura
                </label>
              </Row>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
