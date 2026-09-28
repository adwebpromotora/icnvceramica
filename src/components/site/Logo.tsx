import { Link } from "@tanstack/react-router";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3.5" aria-label="ICNV Cerâmica — página inicial">
      <span
        className={`grid shrink-0 place-items-center bg-primary text-primary-foreground ring-1 ring-black/10 ${small ? "size-10 rounded-[12px]" : "size-11 rounded-[14px]"}`}
      >
        <span className="font-serif text-xs font-semibold tracking-tight">ICNV</span>
      </span>
      <span className={`font-serif font-semibold tracking-tight text-foreground ${small ? "text-lg" : "text-xl"}`}>
        Cerâmica
      </span>
    </Link>
  );
}
