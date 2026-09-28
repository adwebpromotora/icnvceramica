import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, inputCls, btnPrimary } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { audit, churchAgeFrom, useSession } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Painel ICNV" }, { name: "robots", content: "noindex" }] }),
  component: Settings,
});

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium">{label}</label>{children}{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>;
}

function Settings() {
  const { role } = useSession();
  const [s, setS] = useState<any>(null);
  const [sec, setSec] = useState<any>(null);
  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).single().then((r) => setS(r.data));
  }, []);
  useEffect(() => { if (role === "admin") supabase.from("admin_secrets").select("*").eq("id", 1).single().then((r) => setSec(r.data)); }, [role]);

  const save = async () => {
    const { id, updated_at, ...p } = s;
    const { error } = await supabase.from("site_settings").update(p).eq("id", 1);
    if (role === "admin" && sec) { const { id: _i, updated_at: _u, ...q } = sec; await supabase.from("admin_secrets").update(q).eq("id", 1); }
    if (error) { toast.error("Não foi possível salvar."); return; }
    audit("update", "settings"); toast.success("Configurações salvas!");
  };
  if (!s) return <AdminShell title="Configurações"><p className="text-muted-foreground">Carregando…</p></AdminShell>;
  const age = churchAgeFrom(s.founded_at);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setS({ ...s, [k]: e.target.value });

  return (
    <AdminShell title="Configurações" actions={<button className={btnPrimary} onClick={save}>Salvar</button>}>
      <div className="mx-auto grid max-w-4xl gap-6">
        <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
          <h2 className="font-serif text-xl sm:col-span-2">Igreja</h2>
          <Row label="Data de fundação" hint={`Hoje: ${age.years} anos e ${age.months} meses.`}><input type="date" className={inputCls} value={s.founded_at} onChange={set("founded_at")} /></Row>
          <Row label="Nome"><input className={inputCls} value={s.church_name ?? ""} onChange={set("church_name")} /></Row>
          <Row label="Endereço"><input className={inputCls} value={s.address ?? ""} onChange={set("address")} /></Row>
          <Row label="Telefone"><input className={inputCls} value={s.phone ?? ""} onChange={set("phone")} /></Row>
          <Row label="E-mail"><input className={inputCls} value={s.email ?? ""} onChange={set("email")} /></Row>
          <Row label="Chave Pix"><input className={inputCls} value={s.pix_key ?? ""} onChange={set("pix_key")} /></Row>
        </section>
        <section className="glass grid gap-4 rounded-2xl p-6">
          <h2 className="font-serif text-xl">Mensagem da semana (Spotify)</h2>
          <Row label="Link do episódio atual" hint="No Spotify: Compartilhar → Copiar link do episódio. Troque a cada domingo."><input className={inputCls} value={s.spotify_episode_url ?? ""} onChange={set("spotify_episode_url")} /></Row>
          <Row label="Link do canal"><input className={inputCls} value={s.spotify_show_url ?? ""} onChange={set("spotify_show_url")} /></Row>
        </section>
        <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
          <h2 className="font-serif text-xl sm:col-span-2">Aparência</h2>
          <Row label="Logo"><ImageUpload value={s.logo_path} onChange={(v) => setS({ ...s, logo_path: v })} /></Row>
          <div className="grid gap-4">
            <Row label="Cor principal"><input type="color" className="h-10 w-20 rounded" value={s.color_primary ?? "#1f2a44"} onChange={set("color_primary")} /></Row>
            <Row label="Cor de destaque"><input type="color" className="h-10 w-20 rounded" value={s.color_accent ?? "#d99a3d"} onChange={set("color_accent")} /></Row>
          </div>
        </section>
        <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-3">
          <h2 className="font-serif text-xl sm:col-span-3">Botão voltar ao topo</h2>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.back_to_top_enabled} onChange={(e) => setS({ ...s, back_to_top_enabled: e.target.checked })} />Exibir</label>
          <Row label="Lado"><select className={inputCls} value={s.back_to_top_side} onChange={set("back_to_top_side")}><option value="right">Direita</option><option value="left">Esquerda</option></select></Row>
          <Row label="Distância do rodapé (px)"><input type="number" className={inputCls} value={s.back_to_top_bottom} onChange={(e) => setS({ ...s, back_to_top_bottom: Number(e.target.value) })} /></Row>
        </section>
        {role === "admin" && sec && (
          <section className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
            <h2 className="font-serif text-xl sm:col-span-2">Técnico (somente administrador)</h2>
            <Row label="Google Tag Manager ID"><input className={inputCls} placeholder="GTM-XXXXXXX" value={sec.gtm_id ?? ""} onChange={(e) => setSec({ ...sec, gtm_id: e.target.value })} /></Row>
            <div />
            <Row label="SMTP servidor"><input className={inputCls} value={sec.smtp_host ?? ""} onChange={(e) => setSec({ ...sec, smtp_host: e.target.value })} /></Row>
            <Row label="Porta"><input type="number" className={inputCls} value={sec.smtp_port ?? ""} onChange={(e) => setSec({ ...sec, smtp_port: Number(e.target.value) || null })} /></Row>
            <Row label="Usuário"><input className={inputCls} value={sec.smtp_user ?? ""} onChange={(e) => setSec({ ...sec, smtp_user: e.target.value })} /></Row>
            <Row label="Senha"><input type="password" className={inputCls} value={sec.smtp_password ?? ""} onChange={(e) => setSec({ ...sec, smtp_password: e.target.value })} /></Row>
            <Row label="Remetente"><input className={inputCls} value={sec.smtp_from ?? ""} onChange={(e) => setSec({ ...sec, smtp_from: e.target.value })} /></Row>
            <Row label="Criptografia"><select className={inputCls} value={sec.smtp_encryption ?? "tls"} onChange={(e) => setSec({ ...sec, smtp_encryption: e.target.value })}><option value="tls">TLS</option><option value="ssl">SSL</option><option value="none">Nenhuma</option></select></Row>
          </section>
        )}
      </div>
    </AdminShell>
  );
}
