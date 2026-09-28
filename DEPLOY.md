# Deploy — ICNV Cerâmica (Docker / EasyPanel / VPS)

## Opção A — EasyPanel com Dockerfile (recomendado)

### 1. MySQL
1. Crie um serviço **MySQL 8** no EasyPanel.
2. Database: `icnv` · usuário e senha fortes.
3. Anote o **hostname interno** do serviço (ex.: `icnv-mysql`).

Opcional: rode o `schema.sql` manualmente. O app também cria as tabelas na primeira conexão.

### 2. App (Docker)
1. App → **Docker** (ou “Dockerfile”).
2. Build context: raiz do repositório · Dockerfile: `Dockerfile`.
3. Porta interna: **3000**.
4. Monte um volume em `/app/uploads` (persistente).

### 3. Variáveis de ambiente do app

```env
APP_URL=https://seu-dominio.com.br
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SESSION_SECRET=<openssl rand -hex 32>
JWT_SECRET=<openssl rand -hex 32>
PASSWORD_HASH_ALGORITHM=argon2id
DB_HOST=<hostname-interno-do-mysql>
DB_PORT=3306
DB_USER=icnv
DB_PASSWORD=<senha>
DB_NAME=icnv
UPLOAD_DIR=/app/uploads
SERVER_PRESET=node-server
```

Opcionais: `RECAPTCHA_*`, `VAPID_*` (ver `.env.example`).

**Não** coloque SMTP nem GTM no env — configure no painel após o login.

### 4. Domínio e HTTPS
Aponte o domínio no EasyPanel para a porta 3000 do app. Ative HTTPS (Let’s Encrypt).

### 5. Primeiro acesso
Abra `https://seu-dominio.com.br/admin` → formulário **Criar administrador** (só na primeira vez).

---

## Opção B — docker-compose local / VPS

1. Copie `.env.example` → `.env` e preencha pelo menos:
   - `SESSION_SECRET`, `JWT_SECRET`
   - `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`
   - `APP_URL`

2. Suba:

```bash
docker compose up -d --build
```

3. App: http://localhost:3000 · Admin: http://localhost:3000/admin

Volumes:
- `icnv_mysql_data` — dados do MySQL
- `icnv_uploads` — imagens enviadas no CMS

Parar:

```bash
docker compose down
```

(Dados nos volumes permanecem. Use `docker compose down -v` só se quiser apagar tudo.)

---

## Checklist pós-deploy

- [ ] Site abre em `/`
- [ ] `/admin` cria o primeiro admin e faz login
- [ ] Volume `/app/uploads` persiste após redeploy
- [ ] MySQL saudável e app conecta (`DB_HOST` correto na rede interna)
- [ ] HTTPS ativo em produção

## Segurança

- Segredos longos e únicos (`SESSION_SECRET`, `JWT_SECRET`)
- Não exponha a porta do MySQL para a internet no EasyPanel
- Backup regular do volume MySQL
- `VAPID_PRIVATE_KEY` nunca no frontend
