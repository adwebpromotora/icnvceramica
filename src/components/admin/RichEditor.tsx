import { useEditor, EditorContent, Node, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, ImagePlus, Undo2, Redo2, Code2,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { uploadImageFn } from "@/lib/admin.functions";

const IframeEmbed = Node.create({
  name: "iframeEmbed",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return { src: { default: null }, html: { default: null } };
  },
  parseHTML() {
    return [{ tag: "iframe" }, { tag: "div[data-embed]" }];
  },
  renderHTML({ node }) {
    if (node.attrs.html) {
      return ["div", { "data-embed": "1", class: "embed-frame", "data-html": node.attrs.html }];
    }
    return [
      "iframe",
      mergeAttributes({
        src: node.attrs.src,
        class: "w-full rounded-xl min-h-[152px]",
        style: "border-radius:12px;border:0;width:100%;min-height:152px",
        allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
        loading: "lazy",
        frameborder: "0",
        allowfullscreen: "true",
      }),
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.className = "embed-frame my-3";
      dom.setAttribute("data-embed", "1");
      if (node.attrs.html) dom.innerHTML = node.attrs.html;
      else if (node.attrs.src) {
        dom.innerHTML = `<iframe src="${node.attrs.src}" style="border-radius:12px;width:100%;min-height:152px;border:0" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      }
      return { dom };
    };
  },
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = String(reader.result || "");
      resolve(r.includes(",") ? r.split(",")[1]! : r);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image, IframeEmbed],
    content: value || "",
    editorProps: { attributes: { class: "prose-church min-h-[220px] px-4 py-3 outline-none" } },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return <div className="h-[260px] rounded-xl border border-border bg-card" />;

  const B = ({ on, active, children, label }: { on: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
    <button type="button" aria-label={label} title={label} onClick={on}
      className={`grid size-8 place-items-center rounded-md transition-colors hover:bg-secondary ${active ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
      {children}
    </button>
  );

  const addImage = async (f?: File) => {
    if (!f) return;
    try {
      const base64 = await fileToBase64(f);
      const mime = (["image/jpeg", "image/png", "image/webp"].includes(f.type) ? f.type : "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";
      const result = await uploadImageFn({ data: { filename: f.name, mime, base64 } });
      if (!result.ok) { toast.error(result.error || "Falha no envio"); return; }
      editor.chain().focus().setImage({ src: `/uploads/${result.path}` }).run();
    } catch (e) { toast.error((e as Error).message); }
  };

  const addEmbed = () => {
    const raw = window.prompt("Cole o código embed (iframe) ou a URL do Spotify/YouTube:");
    if (!raw?.trim()) return;
    let html = raw.trim();
    if (!html.includes("<iframe") && !html.includes("<IFRAME")) {
      let src = html;
      const ep = html.match(/episode\/([A-Za-z0-9]+)/);
      const tr = html.match(/track\/([A-Za-z0-9]+)/);
      const yt = html.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
      if (ep) src = `https://open.spotify.com/embed/episode/${ep[1]}?utm_source=generator`;
      else if (tr) src = `https://open.spotify.com/embed/track/${tr[1]}?utm_source=generator`;
      else if (yt) src = `https://www.youtube.com/embed/${yt[1]}`;
      html = `<iframe style="border-radius:12px" src="${src}" width="100%" height="352" frameBorder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    }
    const wrapped = `<div class="embed-frame" data-embed="1">${html}</div>`;
    const next = (editor.getHTML() || "") + wrapped;
    editor.commands.setContent(next);
    onChange(next);
    toast.success("Embed inserido.");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap gap-0.5 border-b border-border p-1.5">
        <B label="Negrito" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="size-4" /></B>
        <B label="Itálico" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="size-4" /></B>
        <B label="Título 2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="size-4" /></B>
        <B label="Título 3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="size-4" /></B>
        <B label="Lista" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="size-4" /></B>
        <B label="Lista numerada" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="size-4" /></B>
        <B label="Citação" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="size-4" /></B>
        <B label="Link" on={() => { const url = window.prompt("URL do link"); if (url) editor.chain().focus().setLink({ href: url }).run(); }} active={editor.isActive("link")}><Link2 className="size-4" /></B>
        <B label="Imagem" on={() => fileRef.current?.click()}><ImagePlus className="size-4" /></B>
        <B label="Incorporar (Spotify, YouTube…)" on={addEmbed}><Code2 className="size-4" /></B>
        <B label="Desfazer" on={() => editor.chain().focus().undo().run()}><Undo2 className="size-4" /></B>
        <B label="Refazer" on={() => editor.chain().focus().redo().run()}><Redo2 className="size-4" /></B>
      </div>
      <EditorContent editor={editor} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => addImage(e.target.files?.[0])} />
      <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        Botão de código: cole iframe do Spotify/YouTube ou a URL.
      </p>
    </div>
  );
}
