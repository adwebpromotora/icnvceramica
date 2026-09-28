import { Link } from "@tanstack/react-router";
import { church } from "@/lib/site-data";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="relative pb-12 pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="glass rounded-[28px] px-8 py-10">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[36ch]">
              <Logo small />
              <p className="mt-5 text-sm text-pretty text-muted-foreground">
                Igreja Cristã Nova Vida · Cerâmica. Uma família de fé no bairro, construída sobre o amor e a Palavra.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-16 gap-y-8 text-sm">
              <FooterCol title="Explorar" links={[["Home", "/"], ["Sobre nós", "/sobre"], ["Ministérios", "/ministerios"], ["Agenda", "/agenda"], ["Redes", "/redes"]]} />
              <FooterCol title="Conectar" links={[["Mensagens", "/mensagens"], ["Onde Estamos", "/onde-estamos"], ["Seja Voluntário", "/voluntario"], ["Contato", "/contato"], ["Doação", "/doacao"]]} />
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">Contato</div>
                <div className="mt-4 space-y-3 text-muted-foreground">
                  <p>{church.address}</p>
                  <p>{church.phone}</p>
                  <p>{church.email}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-6 text-[11px] text-muted-foreground/70">
            © {new Date().getFullYear()} Igreja Cristã Nova Vida · Cerâmica. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">{title}</div>
      <div className="mt-4 space-y-3 text-muted-foreground">
        {links.map(([l, to]) => (
          <Link key={to} to={to} className="block transition-colors hover:text-foreground">
            {l}
          </Link>
        ))}
      </div>
    </div>
  );
}
