import { createFileRoute } from "@tanstack/react-router";
import { ContentManager, fmtBool } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/paginas")({
  head: () => ({
    meta: [{ title: "Páginas — Painel ICNV" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <ContentManager
      table="pages"
      title="Páginas"
      singular="página"
      orderBy="menu_order"
      defaults={{
        title: "",
        content: "",
        visible: true,
        show_in_menu: true,
        menu_order: 0,
      }}
      fields={[
        { key: "title", label: "Título", type: "text", required: true },
        { key: "slug", label: "Endereço (slug)", type: "text" },
        { key: "menu_order", label: "Ordem no menu", type: "number" },
        { key: "parent_id", label: "ID da página pai (submenu, opcional)", type: "text", hint: "Deixe vazio para item no menu principal. Cole o ID de outra página para submenu." },
        { key: "content", label: "Conteúdo", type: "rich" },
        { key: "show_in_menu", label: "Exibir no menu", type: "bool" },
        { key: "visible", label: "Publicada", type: "bool" },
      ]}
      listCols={[
        { key: "title", label: "Título" },
        { key: "slug", label: "Slug" },
        { key: "menu_order", label: "Ordem" },
        { key: "visible", label: "Publicada", fmt: fmtBool },
      ]}
    />
  ),
});
