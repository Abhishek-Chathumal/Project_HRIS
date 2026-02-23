# ============================================
# Production Dockerfile — Multi-stage Build
# Project HRIS API (NestJS)
# ============================================

# ── Stage 1: Dependencies ────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/

RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod=false

# ── Stage 2: Builder ────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY --from=deps /app/apps/api/node_modules apps/api/node_modules
COPY . .

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build NestJS app
RUN cd apps/api && npx nest build

# ── Stage 3: Production Runner ──────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl dumb-init

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 hris && \
    adduser --system --uid 1001 hris

# Copy only required files
COPY --from=builder --chown=hris:hris /app/apps/api/dist dist
COPY --from=builder --chown=hris:hris /app/apps/api/prisma prisma
COPY --from=builder --chown=hris:hris /app/node_modules node_modules
COPY --from=builder --chown=hris:hris /app/apps/api/package.json .

USER hris

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Graceful shutdown
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
