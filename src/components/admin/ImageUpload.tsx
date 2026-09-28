import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, useMediaUrl } from "@/lib/admin";

// Upload só por arquivo (arrastar e soltar ou selecionar). Sem campo de URL.
export function ImageUpload({ value, onChange }: { value: string | null; onChange: (path: string | null) => void }) {
  const url = useMediaUrl(value);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const handle = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try { onChange(await uploadImage(f)); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files?.[0]); }}
      className={`relative flex aspect-[16/9] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${over ? "border-accent bg-accent/10" : "border-border bg-card hover:bg-secondary/50"}`}
    >
      {url ? <img src={url} alt="" className="absolute inset-0 size-full object-cover" /> : (
        <div className="text-center text-sm text-muted-foreground">
          {busy ? <Loader2 className="mx-auto size-6 animate-spin" /> : <ImagePlus className="mx-auto size-6" />}
          <p className="mt-2">Arraste uma imagem ou clique para escolher</p>
          <p className="text-xs">JPG, PNG ou WEBP · até 5 MB</p>
        </div>
      )}
      {value && (
        <button type="button" aria-label="Remover imagem" onClick={(e) => { e.preventDefault(); onChange(null); }} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/90 text-foreground shadow">
          <X className="size-4" />
        </button>
      )}
      <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ""; }} />
    </label>
  );
}
