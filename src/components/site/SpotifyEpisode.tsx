import { useEffect, useState } from "react";
import { spotify } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";

function toEmbed(url?: string | null) {
  const m = url?.match(/episode\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/episode/${m[1]}?utm_source=generator&theme=0` : null;
}

// Player oficial do Spotify com o episódio atual, definido em Configurações no painel.
export function SpotifyEpisode({ compact = false }: { compact?: boolean }) {
  const [src, setSrc] = useState(spotify.embedUrl);
  useEffect(() => {
    supabase.from("site_settings").select("spotify_episode_url").eq("id", 1).single().then(({ data }) => {
      const e = toEmbed(data?.spotify_episode_url);
      if (e) setSrc(e);
    });
  }, []);
  return (
    <iframe
      title="Mensagem da semana no Spotify"
      src={src}
      className="w-full rounded-[14px]"
      height={compact ? 152 : 232}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    />
  );
}
