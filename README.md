<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: README.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _  __   __ -->
<!--        | | | || ____|  / \ \  / / -->
<!--        | |_| ||  _|   / _ \ \ V /  -->
<!--        |  _  || |___ / ___ \ | |   -->
<!--        |_| |_||_____/_/   \_\|_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# HeadyEcosystem - Unified Development Platform

A comprehensive monorepo for HeadyConnection (nonprofit) and HeadySystems (C-Corp) with **Drupal Hybrid CMS integration**, Sacred Geometry UI, and full-stack automation capabilities.

## ✨ Latest Updates (2026-02-03)

- ✅ **Drupal 11 Hybrid CMS Integration** - Headless CMS with JSON:API sync
- ✅ **Content Management API** - Full CRUD operations for articles, pages, media
- ✅ **Sacred Geometry UI** - Organic, rounded design system with breathing animations
- ✅ **Docker Compose Setup** - Drupal + PostgreSQL + Redis + API stack
- ✅ **Consolidated with HeadyMonorepo** - Unified codebase on GitHub

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/HeadySystems/HeadyEcosystem.git
cd HeadyEcosystem

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials (especially DRUPAL_BASE_URL)

# Start all services (including Drupal CMS)
docker-compose --profile drupal up -d

# Start development
pnpm run dev

# Access services
# - HeadyConnection: http://localhost:3000
# - HeadySystems: http://localhost:3001
# - API: http://localhost:8000
# - Drupal CMS: http://localhost:8080
```

## 📁 Project Structure

```
HeadyEcosystem/
├── apps/
│   ├── web-heady-connection/    # Nonprofit public app
│   ├── web-heady-systems/       # Commercial product app
│   └── api/                     # Shared backend services
├── packages/
│   ├── ui/                      # Shared React components
│   ├── core-domain/            # Business logic
│   └── infra/                  # External API SDKs
├── services/
│   ├── browser-automation/     # Playwright automation
│   └── mcp-servers/           # MCP service integrations
├── scripts/                    # Build and deployment scripts
└── docs/                       # Documentation

```

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Next.js
- **Backend**: Node.js, Express, TypeScript
- **CMS**: Drupal 11 (Headless mode with JSON:API)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Container**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Render (backend), Cloudflare (edge)
- **Browser Automation**: Playwright
- **IDE Integration**: Windsurf, VS Code
- **Design System**: Sacred Geometry (organic, rounded aesthetics)

## 🔐 Security & Access

### Multiple Access Methods
1. **Docker Desktop**: `docker-compose up` → localhost:3000
2. **Cloudflare Tunnel**: Secure public access
3. **OAuth**: GitHub authentication
4. **API Keys**: For headless automation

### Environment Tiers
- **local**: Development on your machine
- **dev**: Shared sandbox environment
- **staging**: Pre-production testing
- **prod**: Production deployment

## 🎯 Key Features

- **Monorepo Architecture**: Unified codebase with clear separation
- **Multi-tenant Support**: Nonprofit and commercial isolation
- **Browser Automation**: Headless and interactive modes
- **MCP Integration**: AI-powered development assistance
- **Sacred Geometry Design**: Unified visual identity
- **One-Command Setup**: Minimal friction for new developers

## 📝 Development Workflow

```bash
# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Build all packages
pnpm build

# Deploy to staging
pnpm run deploy:staging

# Deploy to production (requires approval)
pnpm run deploy:prod
```

## 🐳 Docker Operations

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset database
docker-compose down -v
docker-compose up -d
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for automated testing and deployment:

1. **On PR**: Run tests, linting, type checking
2. **On merge to develop**: Deploy to dev environment
3. **On merge to main**: Build and await approval for production

## 📊 Monitoring

- **Logs**: Centralized logging to cloud service
- **Uptime**: Monitoring for staging and production
- **Errors**: Sentry integration for error tracking
- **Analytics**: Usage segmented by organization type

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with conventional commits
4. Push to your fork
5. Open a Pull Request

## 📄 License

- HeadyConnection components: Apache 2.0 (Open Source)
- HeadySystems components: Proprietary
- See LICENSE file for details

## 🆘 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Discord: [Join our community](https://discord.gg/heady)

## 🎯 Mission

Maximizing global happiness through fractal innovation and social impact technology.
