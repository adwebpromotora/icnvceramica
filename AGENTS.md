# ICNV Cerâmica — notas para agentes / desenvolvedores

Site + CMS da Igreja Comunidade Nova Vida (Cerâmica).

- Stack: TanStack Start + React + Tailwind + MySQL (mysql2).
- Auth local (argon2id + cookie de sessão). Sem Supabase / Lovable.
- Painel em `/admin`. Primeiro cadastro cria o único admin.
- Upload de imagem somente por arquivo (nunca URL externa).
- Tudo em pt-BR. "Células" chama-se "Redes".
- SMTP e GTM ficam no banco (painel), não no `.env`.
- Schema: `schema.sql` + bootstrap automático em `src/server/db.ts`.
