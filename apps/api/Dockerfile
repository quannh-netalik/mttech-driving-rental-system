# ==============================================================================
# STAGE 1: Dependencies
# ==============================================================================
FROM node:25.1.0-alpine AS deps

RUN apk add --no-cache libc6-compat python3 make g++ bash

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod && pnpm store prune

# ==============================================================================
# STAGE 2: Build
# ==============================================================================
FROM node:25.1.0-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++ bash

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install && pnpm store prune

COPY . .
COPY .swcrc ./

RUN pnpm run build

RUN pnpm prune --prod && pnpm store prune

# ==============================================================================
# STAGE 3: Runner (Production)
# ==============================================================================
FROM node:25.1.0-alpine AS runner

RUN apk add --no-cache dumb-init bash

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=2048"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const port=process.env.API_PORT||3000;require('http').get(`http://localhost:${port}/health`,r=>process.exit(r.statusCode===200?0:1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main"]
