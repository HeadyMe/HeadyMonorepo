# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: apps/api/Dockerfile
# LAYER: root
# 
#         _   _  _____    _  __   __
#        | | | || ____|  / \ \  / /
#        | |_| ||  _|   / _ \ \ V / 
#        |  _  || |___ / ___ \ | |  
#        |_| |_||_____/_/   \_\|_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

# HeadySystems API Service
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root config to root for relative reference (../../tsconfig.base.json)
COPY tsconfig.base.json /tsconfig.base.json

WORKDIR /app

# Copy package configs
COPY apps/api/package.json ./
COPY apps/api/tsconfig.json ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY apps/api/src ./src
COPY apps/api/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "dist/index.js"]
