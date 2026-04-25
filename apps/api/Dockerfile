# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN --mount=type=cache,target=/root/.npm npm install --prefer-offline

FROM deps AS builder
COPY package.json ./
COPY apps/api ./apps/api
COPY packages ./packages
WORKDIR /app/apps/api
RUN npm run build

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY apps ./apps
COPY packages ./packages
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]

FROM base AS prod
ENV NODE_ENV=production
COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN --mount=type=cache,target=/root/.npm npm install --omit=dev --prefer-offline
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/db/migrations ./apps/api/db/migrations
COPY --from=builder /app/apps/api/public ./apps/api/public
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/server.js"]
