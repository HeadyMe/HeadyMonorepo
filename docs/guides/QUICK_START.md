<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: docs/guides/QUICK_START.md -->
<!-- LAYER: docs -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# Heady Monorepo - Quick Start Guide

## Prerequisites

Ensure you have the following installed:

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** & Docker Compose
- **Python** >= 3.11 (for services)
- **Git**

## Installation

### 1. Clone and Setup

```bash
cd c:\Users\erich\CascadeProjects\HeadyMonorepo
pnpm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - HEADY_API_KEY
# - DATABASE_URL
# - REDIS_URL
# - AI provider keys (PERPLEXITY_API_KEY, GEMINI_API_KEY, etc.)
```

### 3. Build Everything

```bash
pnpm build
```

## Development

### Start All Services

```bash
# Start in development mode
pnpm dev

# Or start specific workspace
pnpm --filter @heady/manager dev
pnpm --filter @heady/admin-ui dev
```

### Docker Environment

```bash
# Start all Docker services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

### Access Points

- **Manager API**: http://localhost:3300
- **Admin UI**: http://localhost:3300/admin
- **Orchestrator**: http://localhost:8080
- **Governance**: http://localhost:8000
- **AI Router**: http://localhost:8085

## Common Tasks

### Run Tests

```bash
# All tests
pnpm test

# Specific workspace
pnpm --filter @heady/core test

# Watch mode
pnpm --filter @heady/core test:watch
```

### Lint and Format

```bash
# Lint everything
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

### Build Specific Packages

```bash
# Build single package
pnpm --filter @heady/core build

# Build with dependencies
pnpm --filter @heady/manager... build
```

## Workspace Structure

```
HeadyMonorepo/
├── apps/              # Applications
│   ├── manager/       # Main Node.js manager
│   ├── admin-ui/      # Admin dashboard
│   ├── orchestrator/  # Task orchestrator
│   └── governance/    # Governance service
├── services/          # Microservices
│   ├── ai-router/     # AI provider routing
│   ├── secret-gateway/# 1Password integration
│   └── ...
├── packages/          # Shared libraries
│   ├── core/          # Core utilities
│   ├── config/        # Configuration
│   └── types/         # TypeScript types
└── infrastructure/    # Deployment configs
```

## Troubleshooting

### Clear Cache

```bash
pnpm clean
rm -rf node_modules
pnpm install
```

### Reset Docker

```bash
pnpm docker:down
docker system prune -a
pnpm docker:up
```

### Check Service Health

```bash
# Check all services
docker-compose ps

# View specific service logs
docker-compose logs -f governance
```

## Next Steps

- Read [Architecture Guide](../architecture/README.md)
- Explore [API Documentation](../api/README.md)
- Review [Development Workflow](./development.md)
- Setup [CI/CD Pipeline](./deployment.md)

## Getting Help

- Check [Documentation](../README.md)
- Review [Migration Plan](../../MONOREPO_MIGRATION_PLAN.md)
- Open an issue on GitHub
