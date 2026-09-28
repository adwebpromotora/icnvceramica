# Deploy — ICNV Cerâmica (VPS / EasyPanel)

## 1. Banco MySQL

No EasyPanel (ou painel MySQL):

1. Crie um serviço **MySQL 8**.
2. Crie o database `icnv` e um usuário com senha forte.
3. Anote: host (ex. nome interno do serviço), porta `3306`, user, password, database.

Opcional: importe `schema.sql` manualmente. Caso contrário, o app cria as tabelas na primeira subida.

## 2. App (Node)

1. Repositório no GitHub → clone no EasyPanel como app **Node**.
2. Build: `npm install && npm run build`
3. Start: `npm start` (ou `node .output/server/index.mjs`)
4. Porta: a que o EasyPanel injetar em `PORT` (geralmente 3000).

### Variáveis de ambiente (obrigatórias)

```
APP_URL=https://seu-dominio.com.br
NODE_ENV=production
PORT=3000
SESSION_SECRET=<openssl rand -hex 32>
JWT_SECRET=<openssl rand -hex 32>
PASSWORD_HASH_ALGORITHM=argon2id
DB_HOST=<host-mysql>
DB_PORT=3306
DB_USER=icnv
DB_PASSWORD=<senha>
DB_NAME=icnv
UPLOAD_DIR=/app/uploads
```

### Opcionais

```
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@seu-dominio.com.br
SERVER_PRESET=node-server
```

**Não** coloque SMTP nem GTM no `.env` — configure no painel após o login.

## 3. Volume de uploads

Monte um volume persistente em `UPLOAD_DIR` (ex. `/app/uploads`) para não perder imagens em redeploy.

## 4. Primeiro acesso

1. Abra `https://seu-dominio.com.br/admin`
2. Se não houver admin, o formulário de **Criar administrador** aparece.
3. Após criar, esse é o único admin “público”; novos usuários só pelo painel.

## 5. Checklist pós-deploy

- [ ] Site abre em `/`
- [ ] `/admin` cria admin e faz login
- [ ] Dashboard carrega totais
- [ ] Configurações salvam nome/endereço/cores
- [ ] Upload de imagem funciona
- [ ] Páginas/eventos/sermões criados no painel aparecem no site (quando a leitura do banco estiver ligada na rota)

## 6. Segurança

- `SESSION_SECRET` e `JWT_SECRET` únicos e longos
- HTTPS obrigatório em produção (cookie `Secure`)
- Não exponha `VAPID_PRIVATE_KEY` no frontend
- Backup regular do MySQL
