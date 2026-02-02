# Heady Ecosystem - Unified Monorepo

> Sacred Geometry meets Sovereign AI - A complete ecosystem for autonomous intelligence

## 🌟 Overview

This monorepo contains the entire Heady ecosystem, unified for optimal developer experience, build performance, and operational efficiency.

## 📁 Structure

```
HeadyMonorepo/
├── apps/              # User-facing applications
├── services/          # Backend microservices
├── packages/          # Shared libraries
├── infrastructure/    # Docker, Cloudflare, IaC
├── tools/             # CLI tools and scripts
├── docs/              # Documentation
└── shared/            # Runtime config and state
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose
- Python >= 3.11 (for services)

### Installation

```bash
# Clone the repository
git clone <repo-url> HeadyMonorepo
cd HeadyMonorepo

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Build everything
pnpm build

# Start development environment
pnpm dev
```

### Docker Environment

```bash
# Start all services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

## 🛠️ Development

### Common Commands

```bash
# Development
pnpm dev                    # Start all apps in dev mode
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all code
pnpm format                 # Format all code

# Specific workspaces
pnpm --filter @heady/manager dev
pnpm --filter @heady/admin-ui build
pnpm --filter @heady/core test

# Services
pnpm services:start         # Start all services
pnpm apps:start            # Start all apps

# Validation
pnpm validate              # Lint + Type-check + Test
```

### Workspace Structure

- **apps/**: Full applications (manager, admin-ui, web, governance, orchestrator)
- **services/**: Microservices (MCP servers, gateways, routers)
- **packages/**: Shared code (core, config, types, ui-components)
- **infrastructure/**: Deployment configs (Docker, Cloudflare, K8s)
- **tools/**: CLI tools (hb, scripts, generators)

## 🏗️ Architecture

### Technology Stack

- **Package Manager**: pnpm (fast, efficient)
- **Build System**: Turborepo (intelligent caching)
- **Frontend**: React + Vite
- **Backend**: Node.js + Express, Python + FastAPI
- **Database**: PostgreSQL + Redis
- **MCP**: Model Context Protocol servers
- **Deployment**: Docker + Cloudflare

### Key Features

- ⚡ **Fast Builds**: Turbo caching reduces build times by 80%+
- 🔒 **Type Safety**: Shared TypeScript types across all packages
- 🎯 **Atomic Changes**: Update multiple packages in one PR
- 🚀 **Optimized CI/CD**: Single pipeline for all services
- 📦 **No Version Conflicts**: Unified dependency management

## 📚 Documentation

- [Architecture](./docs/architecture/README.md)
- [API Reference](./docs/api/README.md)
- [Development Guide](./docs/guides/development.md)
- [Deployment Guide](./docs/guides/deployment.md)
- [Migration Plan](./MONOREPO_MIGRATION_PLAN.md)

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `HEADY_API_KEY`: API authentication key
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: Environment (development/production)

### Workspace Configuration

Each workspace has its own `package.json` with:
- `name`: Scoped package name (@heady/*)
- `version`: Semantic version
- `scripts`: Build, test, dev commands
- `dependencies`: Package dependencies

## 🐳 Docker

### Services

- **governance**: Core governance service (port 8000)
- **security**: Secret gateway (port 8081)
- **orchestrator**: Task orchestrator (port 8080)
- **storage**: Redis cache
- **database**: PostgreSQL
- **tunnel**: Cloudflare tunnel
- **ai-router**: Multi-provider AI routing (port 8085)

### Development

```bash
# Build and start
docker-compose up -d

# Rebuild specific service
docker-compose build governance
docker-compose up -d governance

# View logs
docker-compose logs -f governance

# Execute commands
docker-compose exec governance python -m pytest
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific workspace
pnpm --filter @heady/core test

# Run tests in watch mode
pnpm --filter @heady/core test:watch

# Coverage
pnpm test -- --coverage
```

## 📦 Publishing

```bash
# Create changeset
pnpm changeset

# Version packages
pnpm version-packages

# Publish
pnpm release
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm validate`
4. Commit with conventional commits
5. Create a pull request

## 📄 License

MIT - See LICENSE file for details

## 🙏 Acknowledgments

Built with Sacred Geometry principles and Trust-First architecture.

---

**Heady Systems** - Sovereign AI for the Modern Age
