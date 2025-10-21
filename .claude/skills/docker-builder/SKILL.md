---
name: Docker Builder
description: Create and manage Docker configurations for HireXp with Next.js 15, PostgreSQL, Redis, and production-ready containerization
---

# Docker Builder

Build production-ready Docker containers for HireXp's Next.js 15 application.

## Context

HireXp uses:
- **Next.js 15** with App Router
- **PostgreSQL** with Prisma ORM
- **Redis** (Upstash) for caching
- **Node.js 20+** runtime
- **Cloudinary** for media storage

## Production Dockerfile

### Multi-Stage Build

```dockerfile
# Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

## Development Dockerfile

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy app source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

## Docker Compose - Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: hirexp-app
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/hirexp
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - db
      - redis
    networks:
      - hirexp-network

  # PostgreSQL Database
  db:
    image: postgres:16-alpine
    container_name: hirexp-db
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=hirexp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - hirexp-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: hirexp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - hirexp-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Prisma Studio (Database GUI)
  prisma-studio:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: hirexp-prisma-studio
    ports:
      - "5555:5555"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/hirexp
    command: npx prisma studio
    depends_on:
      - db
    networks:
      - hirexp-network

volumes:
  postgres-data:
  redis-data:

networks:
  hirexp-network:
    driver: bridge
```

## Docker Compose - Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
    container_name: hirexp-app-prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
    restart: unless-stopped
    networks:
      - hirexp-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:16-alpine
    container_name: hirexp-db-prod
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres-prod-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - hirexp-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-prod-data:

networks:
  hirexp-network:
    driver: bridge
```

## Docker Ignore File

```gitignore
# .dockerignore
node_modules
.next
.git
.gitignore
.env*.local
.vscode
.idea
README.md
CLAUDE.md
DASHBOARDS.md
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
coverage
.vercel
.claude
.docs
*.md
!package.json
!package-lock.json
```

## Next.js Configuration for Docker

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Disable telemetry in production
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
```

## Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

## Makefile for Common Commands

```makefile
# Makefile
.PHONY: help dev prod build up down logs clean migrate prisma-studio

help:
	@echo "HireXp Docker Commands"
	@echo "----------------------"
	@echo "make dev           - Start development environment"
	@echo "make prod          - Start production environment"
	@echo "make build         - Build Docker images"
	@echo "make up            - Start containers"
	@echo "make down          - Stop containers"
	@echo "make logs          - View logs"
	@echo "make clean         - Remove containers and volumes"
	@echo "make migrate       - Run database migrations"
	@echo "make prisma-studio - Open Prisma Studio"

dev:
	docker-compose up --build

prod:
	docker-compose -f docker-compose.prod.yml up --build -d

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f app

clean:
	docker-compose down -v
	docker system prune -f

migrate:
	docker-compose exec app npx prisma migrate deploy

migrate-dev:
	docker-compose exec app npx prisma migrate dev

prisma-studio:
	docker-compose up prisma-studio

seed:
	docker-compose exec app npx prisma db seed

shell:
	docker-compose exec app sh

db-shell:
	docker-compose exec db psql -U postgres -d hirexp
```

## Environment Variables Template

```bash
# .env.docker
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/hirexp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hirexp

# Redis
REDIS_URL=redis://redis:6379

# Upstash Redis (Production)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OpenAI
OPENAI_API_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

## GitHub Actions - Docker Build & Push

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Common Docker Commands

```bash
# Development
docker-compose up --build              # Start dev environment
docker-compose logs -f app             # View app logs
docker-compose exec app sh             # Shell into app container
docker-compose exec app npm run dev    # Restart dev server

# Database
docker-compose exec db psql -U postgres -d hirexp    # Access PostgreSQL CLI
docker-compose exec app npx prisma studio            # Open Prisma Studio
docker-compose exec app npx prisma migrate dev       # Run migrations
docker-compose exec app npx prisma db seed           # Seed database

# Production
docker-compose -f docker-compose.prod.yml up -d      # Start production
docker-compose -f docker-compose.prod.yml logs -f    # View logs
docker-compose -f docker-compose.prod.yml down       # Stop production

# Cleanup
docker-compose down -v                 # Stop and remove volumes
docker system prune -f                 # Clean up unused resources
docker volume ls                       # List volumes
docker volume rm hirexp_postgres-data  # Remove specific volume
```

## Debugging Tips

### 1. Check Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

### 2. Execute Commands in Container

```bash
# Shell access
docker-compose exec app sh

# Run commands
docker-compose exec app npm run build
docker-compose exec app npx prisma migrate dev
```

### 3. Inspect Container

```bash
# Container details
docker inspect hirexp-app

# Environment variables
docker exec hirexp-app env

# Network info
docker network inspect hirexp-network
```

### 4. Database Connection Issues

```bash
# Test database connection
docker-compose exec app npx prisma db pull

# Check database is ready
docker-compose exec db pg_isready -U postgres
```

## Production Deployment (AWS ECS Example)

```json
// ecs-task-definition.json
{
  "family": "hirexp-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "hirexp-app",
      "image": "ghcr.io/your-org/hirexp:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:hirexp/db-url"
        },
        {
          "name": "NEXTAUTH_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:hirexp/nextauth"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hirexp",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "app"
        }
      }
    }
  ]
}
```

## Best Practices

### 1. Security
- Use non-root user in production
- Don't include secrets in Dockerfile
- Use `.dockerignore` to exclude sensitive files
- Scan images for vulnerabilities
- Keep base images updated

### 2. Performance
- Multi-stage builds to reduce image size
- Layer caching for faster builds
- Minimize image layers
- Use Alpine-based images
- Enable Next.js standalone output

### 3. Reliability
- Implement health checks
- Use restart policies
- Monitor resource usage
- Set memory and CPU limits
- Implement graceful shutdown

### 4. Development
- Volume mounts for hot reload
- Separate dev and prod configs
- Use docker-compose for local dev
- Database persistence with volumes

## Checklist

- [ ] Dockerfile with multi-stage build
- [ ] docker-compose.yml configured
- [ ] .dockerignore file created
- [ ] next.config.js with standalone output
- [ ] Environment variables properly set
- [ ] Health check endpoint implemented
- [ ] Database migrations in container
- [ ] Prisma Client generation
- [ ] Volume persistence for database
- [ ] Non-root user in production
- [ ] Security best practices followed
- [ ] CI/CD pipeline configured

## Your Task

Ask:
1. Development or production setup?
2. Database configuration needed?
3. Redis cache included?
4. CI/CD pipeline required?
5. Cloud platform (AWS, GCP, Azure)?
6. Health checks needed?

Then implement the Docker configuration following these patterns.
