import { Link } from "@tanstack/react-router";

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="glass-strong w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-lg bg-primary font-serif text-xs font-semibold text-primary-foreground">ICNV</span>
          <span className="font-serif text-xl">Cerâmica</span>
        </div>
        <h1 className="mb-5 font-serif text-2xl">{title}</h1>
        {children}
        <Link to="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
      </div>
    </div>
  );
}

