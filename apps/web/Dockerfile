# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN --mount=type=cache,target=/root/.npm npm install --prefer-offline

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY apps ./apps
COPY packages ./packages
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npx", "next", "dev", "--hostname", "0.0.0.0", "--port", "3000"]
