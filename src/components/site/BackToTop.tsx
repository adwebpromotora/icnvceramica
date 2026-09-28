import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

// Posição configurável (será controlada pelo admin): lado e distância vertical.
export const backToTopConfig = { enabled: true, side: "right" as "left" | "right", bottom: 24 };

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!backToTopConfig.enabled) return null;
  return (
    <button
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{ bottom: backToTopConfig.bottom, [backToTopConfig.side]: 24 }}
      className={`glass-strong fixed z-40 grid size-12 place-items-center rounded-full text-foreground shadow-lg transition-all hover:-translate-y-1 ${show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
