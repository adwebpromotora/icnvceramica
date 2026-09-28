import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

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

  const side = backToTopConfig.side;
  const style: React.CSSProperties = {
    bottom: `max(${backToTopConfig.bottom}px, env(safe-area-inset-bottom))`,
    [side]: `max(24px, env(safe-area-inset-${side}))`,
  };

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={style}
      className={`glass-strong fixed z-40 grid size-12 min-h-12 min-w-12 place-items-center rounded-full text-foreground shadow-lg transition-all hover:-translate-y-1 ${show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
