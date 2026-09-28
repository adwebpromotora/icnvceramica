import { createFileRoute } from "@tanstack/react-router";
import { ContentManager, fmtDay, fmtBool } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/mensagens")({
  head: () => ({ meta: [{ title: "Mensagens — Painel ICNV" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ContentManager table="sermons" title="Mensagens" singular="mensagem" orderBy="preached_at"
      defaults={{ title: "", published: true, preached_at: new Date().toISOString().slice(0, 10) }}
      fields={[
        { key: "title", label: "Título", type: "text", required: true },
        { key: "preached_at", label: "Data", type: "date", required: true },
        { key: "preacher", label: "Pregador(a)", type: "text" },
        { key: "video_url", label: "Link do vídeo (YouTube)", type: "url" },
        { key: "audio_url", label: "Link do áudio (Spotify, opcional)", type: "url" },
        { key: "image_path", label: "Imagem de capa", type: "image" },
        { key: "description", label: "Descrição", type: "rich" },
        { key: "published", label: "Publicado no site", type: "bool" },
      ]}
      listCols={[{ key: "title", label: "Título" }, { key: "preached_at", label: "Data", fmt: fmtDay }, { key: "preacher", label: "Pregador" }, { key: "published", label: "Publicado", fmt: fmtBool }]}
    />
  ),
});
