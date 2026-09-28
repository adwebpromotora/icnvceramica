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

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function normalizeLoaded(row: Record<string, unknown> | null): Record<string, unknown> {
  const s = { ...(row ?? {}) };
  if (s.founded_at) {
    const d = s.founded_at;
    if (d instanceof Date) s.founded_at = d.toISOString().slice(0, 10);
    else s.founded_at = String(d).slice(0, 10);
  } else {
    s.founded_at = "";
  }
  s.show_back_to_top = Boolean(s.show_back_to_top);
  s.smtp_secure = Boolean(s.smtp_secure);
  return s;
}

function Settings() {
  const { role } = useSession();
  const [s, setS] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettingsAdmin()
      .then((data) => setS(normalizeLoaded(data as Record<string, unknown> | null)))
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
      const payload: Record<string, unknown> = {
        church_name: s.church_name ?? "",
        address: s.address ?? "",
        phone: s.phone ?? "",
        email: s.email ?? "",
        pix_key: s.pix_key ?? "",
        founded_at: s.founded_at ? String(s.founded_at).slice(0, 10) : null,
        spotify_embed_url: s.spotify_embed_url ?? "",
        spotify_show_url: s.spotify_show_url ?? "",
        logo_path: s.logo_path ?? null,
        primary_color: s.primary_color ?? "#1e3a5f",
        accent_color: s.accent_color ?? "#d4a574",
        show_back_to_top: Boolean(s.show_back_to_top),
      };
      if (role === "admin") {
        payload.gtm_id = s.gtm_id || null;
        payload.smtp_host = s.smtp_host || null;
        payload.smtp_port = s.smtp_port != null && s.smtp_port !== "" ? Number(s.smtp_port) : null;
        payload.smtp_user = s.smtp_user || null;
        payload.smtp_pass = s.smtp_pass || null;
        payload.smtp_from = s.smtp_from || null;
        payload.smtp_secure = Boolean(s.smtp_secure);
      }
      const r = await saveSettings({ data: payload });
      if (r && (r as { ok?: boolean }).ok === false) {
        toast.error("Não foi possível salvar.");
      } else {
        toast.success("Configurações salvas!");
        const fresh = await getSettingsAdmin();
        setS(normalizeLoaded(fresh as Record<string, unknown> | null));
      }
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

  const age = churchAgeFrom(String(s.founded_at || "1997-03-15"));
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
            <input type="date" className={inputCls} value={String(s.founded_at ?? "")} onChange={set("founded_at")} />
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

        <section className="glass grid gap-4 rounded-2xl p-6">
          <h2 className="font-serif text-xl">Spotify / Embed</h2>
          <Row
            label="Código embed ou URL do episódio/faixa"
            hint="Cole o iframe completo do Spotify ou só a URL (episode/track)."
          >
            <textarea
              className={inputCls + " min-h-[100px] font-mono text-xs"}
              value={String(s.spotify_embed_url ?? "")}
              onChange={set("spotify_embed_url")}
              placeholder='<iframe ... src="https://open.spotify.com/embed/..."></iframe>'
            />
          </Row>
          <Row label="Link da página do show (opcional)">
            <input className={inputCls} value={String(s.spotify_show_url ?? "")} onChange={set("spotify_show_url")} />
          </Row>
        </section>

        <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
          <h2 className="font-serif text-xl sm:col-span-2">Aparência</h2>
          <Row label="Cor primária">
            <input type="color" className={inputCls} value={String(s.primary_color ?? "#1e3a5f")} onChange={set("primary_color")} />
          </Row>
          <Row label="Cor de destaque">
            <input type="color" className={inputCls} value={String(s.accent_color ?? "#d4a574")} onChange={set("accent_color")} />
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
                  value={s.smtp_port != null && s.smtp_port !== "" ? String(s.smtp_port) : ""}
                  onChange={(e) => setS({ ...s, smtp_port: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </Row>
              <Row label="Usuário">
                <input className={inputCls} value={String(s.smtp_user ?? "")} onChange={set("smtp_user")} />
              </Row>
              <Row label="Senha">
                <input type="password" className={inputCls} value={String(s.smtp_pass ?? "")} onChange={set("smtp_pass")} />
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
