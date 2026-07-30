FROM node:22-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune backend --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
# Copy Prisma schema so postinstall hook can run
COPY --from=builder /app/out/full/packages/db/prisma ./packages/db/prisma
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build backend and its dependencies (like @repo/db which runs prisma generate)
RUN npx turbo run build --filter=backend...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy only the necessary files to run the backend
COPY --from=installer --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/packages/db/node_modules ./packages/db/node_modules

EXPOSE 3001
ENV PORT 3001
ENV NODE_ENV production

# Ensure we run from the correct directory since dependencies are hoisted
CMD ["node", "apps/backend/dist/main.js"]
