import { useState } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { uploadImageFn } from "@/lib/admin.functions";
import { useMediaUrl } from "@/lib/admin";
import { btnGhost } from "./AdminShell";

const ALLOWED = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
} as const;

export function ImageUpload({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (path: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const url = useMediaUrl(value);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem precisa ter até 5 MB.");
      return;
    }
    if (!(file.type in ALLOWED)) {
      toast.error("Use imagens JPG, PNG ou WEBP.");
      return;
    }
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
      const base64 = btoa(binary);
      const result = await uploadImageFn({
        data: {
          filename: file.name,
          mime: file.type as "image/jpeg" | "image/png" | "image/webp",
          base64,
        },
      });
      if (!result.ok) {
        toast.error(result.error || "Falha no envio da imagem.");
        return;
      }
      onChange(result.path);
      toast.success("Imagem enviada.");
    } catch (e) {
      console.error(e);
      toast.error("Falha no envio da imagem.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {url && (
        <img
          src={url}
          alt=""
          className="max-h-48 rounded-xl border border-border object-cover"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <label className={`${btnGhost} cursor-pointer`}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {busy ? "Enviando…" : "Escolher arquivo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
        {value && (
          <button type="button" className={btnGhost} onClick={() => onChange(null)} disabled={busy}>
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
