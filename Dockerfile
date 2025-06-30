# Base image for installing dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
# First, copy prisma schema and generate client
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

# Builder image
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy the generated prisma client
COPY --from=builder /app/app/generated/prisma ./app/generated/prisma

EXPOSE 3000

CMD ["node", "server.js"] 