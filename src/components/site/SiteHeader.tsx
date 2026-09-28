import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { nav } from "@/lib/site-data";
import { Logo } from "./Logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="glass-strong flex items-center justify-between rounded-[22px] px-4 py-3 shadow-sm">
          <Logo />
          <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground lg:flex xl:gap-7">
            {nav.map((item) =>
              item.children ? (
                <div key={item.label} className="group relative">
                  <Link
                    to={item.to}
                    className="flex items-center gap-1 transition-colors hover:text-foreground"
                    activeProps={{ className: "text-foreground" }}
                  >
                    {item.label}
                    <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    <div className="glass-strong min-w-48 rounded-2xl p-2 shadow-lg">
                      {item.children.map((c) => (
                        <Link
                          key={c.to + c.label}
                          to={c.to}
                          className="block rounded-xl px-3 py-2 transition-colors hover:bg-surface hover:text-foreground"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="transition-colors hover:text-foreground"
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-foreground" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/onde-estamos"
              className="hidden h-9 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Visite-nos
            </Link>
            <button
              className="grid size-10 place-items-center rounded-full ring-1 ring-border lg:hidden"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="glass-strong rise mt-2 rounded-[22px] p-3 shadow-lg lg:hidden">
            {nav.map((item) => (
              <div key={item.label}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 font-serif text-lg text-foreground hover:bg-surface"
                >
                  {item.label}
                </Link>
                {item.children?.filter((c) => c.to !== item.to).map((c) => (
                  <Link
                    key={c.to}
                    to={c.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl py-2 pl-8 pr-4 text-sm text-muted-foreground hover:bg-surface"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              <Link to="/doacao" onClick={() => setOpen(false)} className="rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
                Doação
              </Link>
              <Link to="/onde-estamos" onClick={() => setOpen(false)} className="rounded-full bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground">
                Visite-nos
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
