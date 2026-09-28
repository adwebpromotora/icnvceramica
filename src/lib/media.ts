/** Normaliza caminho de mídia gravado no banco para URL pública. */
export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  const p = String(path).trim();
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("data:")) return p;
  if (p.startsWith("/uploads/")) return p;
  if (p.startsWith("uploads/")) return `/${p}`;
  if (p.startsWith("/")) return p;
  return `/uploads/${p}`;
}
