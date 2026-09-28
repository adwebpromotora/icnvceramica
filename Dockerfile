# =============================================================================
# ICNV Cerâmica — Dockerfile (multi-stage)
# Compatível com EasyPanel (App Docker) e docker-compose local.
# Build: npm run build (Nitro node-server) → start: node .output/server/index.mjs
# =============================================================================

# ----- Stage 1: dependências (dev + prod, necessárias para o build) -----
FROM node:22-bookworm-slim AS deps

WORKDIR /app

# argon2 e alguns nativos precisam de toolchain
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* yarn.lock* bun.lock* ./

RUN npm install

# ----- Stage 2: build -----
FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV SERVER_PRESET=node-server
ENV NODE_ENV=production

RUN npm run build \
    && npm prune --omit=dev

# ----- Stage 3: runtime enxuto -----
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV UPLOAD_DIR=/app/uploads
ENV SERVER_PRESET=node-server

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs appuser \
    && mkdir -p /app/uploads \
    && chown -R appuser:nodejs /app

COPY --from=build --chown=appuser:nodejs /app/.output ./.output
COPY --from=build --chown=appuser:nodejs /app/package.json ./package.json
COPY --from=build --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /app/schema.sql ./schema.sql

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
