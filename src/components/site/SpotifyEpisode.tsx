import { useEffect, useState } from "react";
import { spotify } from "@/lib/site-data";
import { getPublicSettingsFn } from "@/lib/public.functions";

function toEmbed(raw?: string | null): string | null {
  if (!raw) return null;
  if (raw.includes("<iframe")) {
    const m = raw.match(/src=["']([^"']+)["']/i);
    return m?.[1] ?? null;
  }
  const ep = raw.match(/episode\/([A-Za-z0-9]+)/);
  if (ep) return `https://open.spotify.com/embed/episode/${ep[1]}?utm_source=generator&theme=0`;
  const tr = raw.match(/track\/([A-Za-z0-9]+)/);
  if (tr) return `https://open.spotify.com/embed/track/${tr[1]}?utm_source=generator&theme=0`;
  if (raw.startsWith("http")) return raw;
  return null;
}

export function SpotifyEpisode({ compact = false }: { compact?: boolean }) {
  const [src, setSrc] = useState(spotify.embedUrl);
  useEffect(() => {
    getPublicSettingsFn()
      .then((s) => {
        const e = toEmbed(s.spotify_embed_url);
        if (e) setSrc(e);
      })
      .catch(() => {});
  }, []);
  return (
    <div className="embed-frame w-full">
      <iframe
        title="Mensagem da semana no Spotify"
        src={src}
        className="w-full rounded-[14px]"
        style={{ height: compact ? 152 : 232, minHeight: compact ? 152 : 232 }}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}
