import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getMaintenanceFn } from "@/lib/public.functions";

/**
 * Bloqueia o site público quando maintenance_mode=1.
 * Rotas /admin* continuam liberadas.
 */
export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  const [state, setState] = useState<{ active: boolean; message: string } | null>(
    isAdmin ? { active: false, message: "" } : null,
  );

  useEffect(() => {
    if (isAdmin) {
      setState({ active: false, message: "" });
      return;
    }
    getMaintenanceFn()
      .then(setState)
      .catch(() => setState({ active: false, message: "" }));
  }, [isAdmin, pathname]);

  if (isAdmin) return <>{children}</>;
  if (state === null) {
    return (
      <div className="mesh flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }
  if (state.active) {
    return (
      <div className="mesh flex min-h-screen items-center justify-center px-6">
        <div className="glass-strong max-w-lg rounded-[28px] p-10 text-center shadow-lg">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            ICNV Cerâmica
          </p>
          <h1 className="mt-4 font-serif text-3xl font-medium">Site em manutenção</h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{state.message}</p>
          <p className="mt-8 text-xs text-muted-foreground/70">
            Equipe e administradores podem acessar o painel normalmente.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
