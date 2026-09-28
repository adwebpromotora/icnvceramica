import { createFileRoute } from "@tanstack/react-router";
import { ContentManager, fmtDay, fmtBool } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/mensagens")({
  head: () => ({
    meta: [{ title: "Mensagens — Painel ICNV" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <ContentManager
      table="sermons"
      title="Mensagens"
      singular="mensagem"
      orderBy="preached_at"
      defaults={{
        title: "",
        published: true,
        preached_at: new Date().toISOString().slice(0, 10),
        preacher: "",
        summary: "",
        content: "",
        cover_path: null,
      }}
      fields={[
        { key: "title", label: "Título", type: "text", required: true },
        { key: "slug", label: "Endereço (slug)", type: "text" },
        { key: "preached_at", label: "Data", type: "date", required: true },
        { key: "preacher", label: "Pregador(a)", type: "text" },
        { key: "cover_path", label: "Imagem de capa", type: "image" },
        { key: "summary", label: "Resumo", type: "text" },
        { key: "content", label: "Descrição", type: "rich" },
        { key: "published", label: "Publicado no site", type: "bool" },
      ]}
      listCols={[
        { key: "title", label: "Título" },
        { key: "preached_at", label: "Data", fmt: fmtDay },
        { key: "preacher", label: "Pregador(a)" },
        { key: "published", label: "Publicado", fmt: fmtBool },
      ]}
    />
  ),
});
