/**
 * Imagem trocável quando admin/editor está logado.
 * data-no-edit evita conflito com UniversalEdit.
 */
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/admin";
import { uploadImageFn } from "@/lib/admin.functions";
import { saveTextOverrideFn } from "@/lib/overrides.functions";
import { mediaUrl } from "@/lib/media";

type Props = {
  src: string;
  alt: string;
  storageKey: string;
  path?: string;
  className?: string;
  width?: number;
  height?: number;
  onChange?: (url: string) => void;
};

export function EditableImage({
  src,
  alt,
  storageKey,
  path = "/",
  className = "",
  width,
  height,
  onChange,
}: Props) {
  const { role, loading } = useSession();
  const canEdit = !loading && (role === "admin" || role === "editor");
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(src);

  const onFile = async (file?: File) => {
    if (!file || !canEdit) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
      const base64 = btoa(binary);
      const mime = (["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ? file.type
        : "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";
      const result = await uploadImageFn({
        data: { filename: file.name, mime, base64 },
      });
      if (!result.ok) {
        toast.error(result.error || "Falha no envio");
        return;
      }
      const url = mediaUrl(result.path)!;
      await saveTextOverrideFn({
        data: { path, key: storageKey, value: result.path },
      });
      setCurrent(url);
      onChange?.(url);
      toast.success("Imagem atualizada");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível trocar a imagem");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" data-no-edit>
      <img
        src={current}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-no-edit
      />
      {canEdit && (
        <button
          type="button"
          data-no-edit
          className="absolute right-3 top-3 z-10 rounded-full bg-background px-3 py-1.5 text-xs font-semibold shadow-md ring-1 ring-border hover:bg-secondary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            inputRef.current?.click();
          }}
          disabled={busy}
        >
          {busy ? "Enviando…" : "Trocar imagem"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        data-no-edit
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
