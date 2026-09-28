# ICNV Cerâmica — Site + CMS

Site público e painel administrativo (`/admin`) da Igreja Cristã Nova Vida — Cerâmica.

## Stack

- **Frontend / SSR:** TanStack Start + React 19 + Tailwind CSS 4
- **Banco:** MySQL 8+ (credenciais via variáveis de ambiente)
- **Auth:** local (argon2id + cookie de sessão `icnv_session`)
- **Deploy:** VPS / EasyPanel (Node server via Nitro)

## Início rápido

1. Crie um banco MySQL e um usuário com permissão nele.
2. Copie `.env.example` → `.env` e preencha `DB_*`, `SESSION_SECRET`, `JWT_SECRET`, `APP_URL`.
3. `npm install` (ou `bun install`)
4. `npm run dev` — o schema é criado automaticamente na primeira conexão.
5. Acesse `/admin` — o primeiro cadastro cria o **único** administrador.
6. Demais usuários são criados pelo admin em **Usuários**.

## Docker

- `Dockerfile` multi-stage (Node 22 + Nitro node-server)
- `docker-compose.yml` — app + MySQL 8 + volumes (`icnv_uploads`, `icnv_mysql_data`)
- Local: `docker compose up -d --build`

## Produção (EasyPanel)

Veja **DEPLOY.md** para o passo a passo completo.

```bash
npm run build
npm start   # node .output/server/index.mjs
```

## Regras do projeto

- Tudo em **pt-BR**
- Upload de imagem **somente por arquivo** (nunca URL externa)
- Editor visual sem exigir HTML
- “Células” chama-se **Redes**
- Spotify: um episódio por vez, trocado no painel
- Papéis em tabela separada (`user_roles`)
- SMTP e GTM **não** vão no `.env` — ficam no banco via painel
- Leituras públicas nunca usam credenciais de admin

## Estrutura útil

| Caminho | Função |
|---------|--------|
| `schema.sql` | Schema MySQL de referência |
| `src/server/db.ts` | Pool MySQL + bootstrap de tabelas |
| `src/server/auth.ts` | Login, sessão, primeiro admin |
| `src/server/site.ts` | Leituras públicas com fallback |
| `src/lib/admin.ts` | Hooks e server fns de sessão |
| `src/lib/admin.functions.ts` | CRUD do painel |
| `src/lib/site-data.ts` | Dados fictícios (fallback) |
