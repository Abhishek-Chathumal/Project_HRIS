# ============================================
# Production Dockerfile — Multi-stage Build
# Project HRIS Web (Next.js)
# ============================================

# ── Stage 1: Dependencies ────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/ packages/

RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod=false

# ── Stage 2: Builder ────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY --from=deps /app/apps/web/node_modules apps/web/node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && npx next build

# ── Stage 3: Production Runner ──────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

WORKDIR /app

RUN addgroup --system --gid 1001 hris && \
    adduser --system --uid 1001 hris

# Copy standalone output
COPY --from=builder --chown=hris:hris /app/apps/web/.next/standalone ./
COPY --from=builder --chown=hris:hris /app/apps/web/.next/static .next/static
COPY --from=builder --chown=hris:hris /app/apps/web/public public

USER hris

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
