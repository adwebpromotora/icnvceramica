import { createFileRoute } from "@tanstack/react-router";
import { ContentManager, fmtBool } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/paginas")({
  head: () => ({ meta: [{ title: "Páginas — Painel ICNV" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ContentManager table="pages" title="Páginas" singular="página" orderBy="menu_order"
      defaults={{ title: "", visible: true, menu_order: 50 }}
      fields={[
        { key: "title", label: "Título (aparece no menu)", type: "text", required: true },
        { key: "menu_order", label: "Ordem no menu", type: "number", hint: "Números menores aparecem primeiro." },
        { key: "visible", label: "Visível no site e no menu", type: "bool" },
        { key: "content", label: "Conteúdo", type: "rich" },
      ]}
      listCols={[{ key: "title", label: "Título" }, { key: "slug", label: "Endereço", fmt: (v) => `/p/${v}` }, { key: "menu_order", label: "Ordem" }, { key: "visible", label: "Visível", fmt: fmtBool }]}
    />
  ),
});
