# HireXp Development Dockerfile
# This Dockerfile is optimized for local development with hot reload

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Development stage
FROM base AS dev
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy Prisma schema
COPY prisma ./prisma/

# Set environment to development
ENV NODE_ENV=development

# Expose Next.js development port
EXPOSE 3000

# Start development server with Turbo
CMD ["npm", "run", "dev"]
