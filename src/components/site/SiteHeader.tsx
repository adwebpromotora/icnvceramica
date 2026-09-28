import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { nav as staticNav, type NavItem } from "@/lib/site-data";
import { listPublicMenuPagesFn } from "@/lib/public.functions";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [nav, setNav] = useState<NavItem[]>(staticNav);

  useEffect(() => {
    listPublicMenuPagesFn()
      .then((pages) => {
        if (!pages.length) return;
        const byParent = new Map<string | null, typeof pages>();
        for (const p of pages) {
          const key = p.parent_id ?? null;
          if (!byParent.has(key)) byParent.set(key, []);
          byParent.get(key)!.push(p);
        }
        const roots = byParent.get(null) ?? pages.filter((p) => !p.parent_id);
        const dynamic: NavItem[] = roots.map((p) => {
          const children = (byParent.get(p.id) ?? []).map((c) => ({
            label: c.title,
            to: `/p/${c.slug}`,
          }));
          return {
            label: p.title,
            to: `/p/${p.slug}`,
            children: children.length ? children : undefined,
          };
        });
        // merge: static base + dynamic pages (avoid duplicating paths)
        const staticPaths = new Set(staticNav.flatMap((n) => [n.to, ...(n.children?.map((c) => c.to) ?? [])]));
        const extra = dynamic.filter((d) => !staticPaths.has(d.to));
        setNav([...staticNav, ...extra]);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-7xl px-5 pt-3 sm:px-8 sm:pt-4">
        <div className="glass-strong flex items-center gap-4 rounded-[22px] px-4 py-3 shadow-sm sm:px-5">
          <Logo small />
          <nav className="ml-auto hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
            {nav.map((item) =>
              item.children?.length ? (
                <div key={item.label} className="group relative">
                  <Link to={item.to} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-[180px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
                    <div className="glass-strong rounded-xl p-2 shadow-lg">
                      {item.children.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to}
                          className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
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
              className="hidden min-h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Visite-nos
            </Link>
            <button
              className="grid size-11 min-h-11 min-w-11 place-items-center rounded-full ring-1 ring-border lg:hidden"
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
