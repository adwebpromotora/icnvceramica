import { createFileRoute } from "@tanstack/react-router";
import { ContentManager, fmtDateTime, fmtBool } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/eventos")({
  head: () => ({ meta: [{ title: "Agenda — Painel ICNV" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ContentManager table="events" title="Agenda" singular="evento" orderBy="starts_at"
      defaults={{ title: "", published: true, starts_at: new Date().toISOString() }}
      fields={[
        { key: "title", label: "Título", type: "text", required: true },
        { key: "starts_at", label: "Início", type: "datetime", required: true },
        { key: "ends_at", label: "Término", type: "datetime" },
        { key: "location", label: "Local", type: "text" },
        { key: "image_path", label: "Imagem", type: "image" },
        { key: "description", label: "Descrição", type: "rich" },
        { key: "published", label: "Publicado no site", type: "bool" },
      ]}
      listCols={[{ key: "title", label: "Título" }, { key: "starts_at", label: "Início", fmt: fmtDateTime }, { key: "location", label: "Local" }, { key: "published", label: "Publicado", fmt: fmtBool }]}
    />
  ),
});
