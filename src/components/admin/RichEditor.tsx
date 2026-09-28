import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, ImagePlus, Undo2, Redo2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/admin";

// Editor visual (sem HTML). O conteúdo aparece já formatado, como no site.
export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content: value,
    editorProps: { attributes: { class: "prose-church min-h-[220px] px-4 py-3 outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return <div className="h-[260px] rounded-xl border border-border bg-card" />;
  const B = ({ on, active, children, label }: { on: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
    <button type="button" aria-label={label} title={label} onClick={on} className={`grid size-8 place-items-center rounded-md transition-colors hover:bg-secondary ${active ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>{children}</button>
  );
  const addImage = async (f?: File) => {
    if (!f) return;
    try {
      const path = await uploadImage(f);
      const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (data) editor.chain().focus().setImage({ src: data.signedUrl }).run();
    } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap gap-0.5 border-b border-border p-1.5">
        <B label="Negrito" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="size-4" /></B>
        <B label="Itálico" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="size-4" /></B>
        <B label="Título" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="size-4" /></B>
        <B label="Subtítulo" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="size-4" /></B>
        <B label="Lista" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="size-4" /></B>
        <B label="Lista numerada" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="size-4" /></B>
        <B label="Citação" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="size-4" /></B>
        <B label="Link" on={() => { const u = window.prompt("Endereço do link"); if (u === null) return; u ? editor.chain().focus().setLink({ href: u }).run() : editor.chain().focus().unsetLink().run(); }} active={editor.isActive("link")}><Link2 className="size-4" /></B>
        <B label="Inserir imagem" on={() => fileRef.current?.click()}><ImagePlus className="size-4" /></B>
        <span className="mx-1 w-px bg-border" />
        <B label="Desfazer" on={() => editor.chain().focus().undo().run()}><Undo2 className="size-4" /></B>
        <B label="Refazer" on={() => editor.chain().focus().redo().run()}><Redo2 className="size-4" /></B>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { addImage(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
