# Roadmap ICNV Cerâmica

## Concluído nesta entrega
- [x] Remoção de vestígios Lovable (pasta `.lovable`, `@lovable.dev/*`, error reporting, AGENTS/README)
- [x] Vite config padrão TanStack Start + Nitro (sem pacote Lovable)
- [x] Backend MySQL (mysql2) com credenciais só em env
- [x] schema.sql + bootstrap automático de tabelas
- [x] Auth local (argon2id + sessão cookie) e primeiro admin em `/admin`
- [x] Camada de leitura pública com fallback (`src/server/site.ts`)
- [x] `.env.example` comentado + `DEPLOY.md`

## Em andamento / próximo (manter UI, só trocar dados)
- [ ] Trocar cada rota pública para usar `src/server/site.ts` em vez de só `site-data.ts`
- [ ] CMS (agenda, mensagens, páginas, formulários) 100% nas server functions MySQL
- [ ] Menu dinâmico a partir de `pages`
- [ ] Formulários no site + respostas + CSV
- [ ] Cores/logo/GTM aplicados ao site; SMTP teste
- [ ] reCAPTCHA opcional
- [ ] Web Push (VAPID)
- [ ] Tela de audit_logs no painel
- [ ] Edição inline no site quando admin logado (contenteditable + save)

## Notas
O shim em `src/integrations/supabase/*` evita quebra de build enquanto as rotas do CMS são migradas uma a uma. Remova o shim quando nenhum import restar.
