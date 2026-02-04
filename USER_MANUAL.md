# Heady Systems - Comprehensive User Manual

**Version:** 14.3  
**Last Updated:** 2026-02-03  
**Sacred Geometry Ecosystem**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Commands](#core-commands)
4. [Desktop Applications](#desktop-applications)
5. [Web Applications](#web-applications)
6. [API Reference](#api-reference)
7. [Drupal CMS](#drupal-cms)
8. [Pattern System](#pattern-system)
9. [Workflows](#workflows)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is Heady?

Heady is a **Sacred Geometry ecosystem** that provides:
- **Intelligent Data Management** - Squash, merge, and structure data
- **Hybrid CMS** - Drupal 11 headless integration
- **Pattern Validation** - Binary-level observability
- **Concept Extraction** - AI-powered idea tracking
- **Automated Workflows** - Checkpoint validation and sync

### Mission

**HeadyConnection** (Non-Profit) - Defines "The Why"  
**HeadySystems** (C-Corp) - Implements "The How"

Create a sovereign AI ecosystem with complete observability, intelligent routing, and harmonious data flow.

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **Docker Desktop** (for local development)
- **Git** with SSH keys configured
- **PowerShell** 7+ (Windows) or Bash (Linux/Mac)

### Quick Start

```bash
# Clone repository
git clone https://github.com/HeadySystems/HeadyMonorepo.git
cd HeadyMonorepo

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker-compose up -d

# Access applications
# - HeadyConnection: http://localhost:3000
# - HeadySystems: http://localhost:3001
# - API: http://localhost:8000
# - Drupal CMS: http://localhost:8080
```

### Desktop Shortcuts

Six shortcuts are available on your desktop:

1. **HeadyConnection.url** → http://localhost:3000
2. **HeadySystems.url** → http://localhost:3001
3. **Drupal CMS.url** → http://localhost:8080
4. **Heady API.url** → http://localhost:8000
5. **HeadyControl.bat** → Run `hc` commands
6. **HeadySync.bat** → Run `hs` commands

---

## Core Commands

### HeadyControl (hc)

**Purpose:** Master orchestration command for maintenance cycles

```bash
# Full maintenance cycle
hc

# Run specific action
hc -a <action>

# Run HeadyBuild
hc -a hb

# Run HeadySync
hc -a hs

# Restart services after cycle
hc -Restart

# Force operations
hc -Force
```

**What `hc` Does:**
1. Pause (stop services)
2. Catch (fetch remotes, prune worktrees)
3. Fix (ESLint auto-fix)
4. Improve (run optimizations)
5. Sync (push to remotes)
6. Optional restart

### HeadySync (hs)

**Purpose:** Synchronize all repositories with validation

```bash
# Full sync cycle
hs

# Generate checkpoint report
hs -Checkpoint

# Force sync despite validation failures
hs -Force

# Sync and restart services
hs -Restart

# Run specific action
hs -a <action>
```

**What `hs` Does:**
1. Pause services
2. Fetch all remotes
3. Fix linting errors
4. Run optimizations
5. **Checkpoint validation** (file sync, patterns, binary integrity)
6. **Comprehensive pattern scan** (internal + public domain)
7. Push to all configured remotes
8. Optional restart

### HeadyBuild (hb)

**Purpose:** Build and verify all packages

```bash
# Build all packages
hb

# Via HeadyControl
hc -a hb
```

**What `hb` Does:**
1. Verify intelligence (validation checks)
2. Auto-build all packages
3. Run tests
4. Generate build reports

---

## Desktop Applications

### HeadyConnection (Nonprofit)

**URL:** http://localhost:3000  
**Purpose:** Community engagement and social impact

**Features:**
- Sacred Geometry UI (light theme)
- Organic, rounded design
- Breathing animations
- Connection management

**Tech Stack:**
- Next.js 14
- React 18
- TypeScript
- Sacred Geometry CSS

### HeadySystems (Commercial)

**URL:** http://localhost:3001  
**Purpose:** Enterprise systems management

**Features:**
- Sacred Geometry UI (dark theme)
- Advanced analytics
- System orchestration
- Commercial features

**Tech Stack:**
- Next.js 14
- React 18
- TypeScript
- Sacred Geometry CSS

---

## Web Applications

### API Service

**URL:** http://localhost:8000  
**Purpose:** Backend services and data management

**Endpoints:**
- `/health` - Health check
- `/api` - API information
- `/api/tasks` - Task management
- `/api/content` - Content management
- `/api/content/drupal-sync` - Drupal synchronization

**Tech Stack:**
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Redis
- Socket.IO

### Drupal CMS

**URL:** http://localhost:8080  
**Purpose:** Headless content management system

**Features:**
- Drupal 11
- JSON:API
- Content types (Article, Page, Media)
- Taxonomy (Categories, Tags)
- Headless mode

**Database:** MariaDB 10.11

---

## API Reference

### Task Management

```bash
# List tasks
GET /api/tasks?status=PENDING&priority=HIGH

# Get task by ID
GET /api/tasks/:id

# Create task
POST /api/tasks
{
  "title": "Task name",
  "description": "Task description",
  "priority": "HIGH",
  "status": "PENDING"
}

# Update task
PATCH /api/tasks/:id

# Delete task
DELETE /api/tasks/:id
```

### Content Management

```bash
# List content
GET /api/content?status=PUBLISHED&take=20

# Get content by ID
GET /api/content/:id

# Get content by slug
GET /api/content/slug/:slug

# Create content
POST /api/content
{
  "title": "Article Title",
  "body": "Content here...",
  "status": "PUBLISHED",
  "contentType": "ARTICLE",
  "tags": ["tech", "ai"]
}

# Update content
PATCH /api/content/:id

# Delete content
DELETE /api/content/:id

# Publish content
POST /api/content/:id/publish
```

### Drupal Sync

```bash
# Trigger sync from Drupal
POST /api/content/drupal-sync
{
  "contentTypes": ["article", "page"],
  "since": "2026-02-01T00:00:00Z",
  "dryRun": false
}

# Get sync status
GET /api/content/drupal-sync/status?limit=10

# Push content to Drupal
POST /api/content/:id/drupal-push
```

### Categories & Tags

```bash
# List categories
GET /api/content/categories/list

# Create category
POST /api/content/categories
{
  "name": "Technology",
  "organizationId": "org_id"
}

# List tags
GET /api/content/tags/list
```

---

## Drupal CMS

### Setup

```bash
# Start Drupal service
docker-compose --profile drupal up -d

# Access Drupal
# URL: http://localhost:8080
# Follow installation wizard
```

### Configuration

1. Install Drupal 11
2. Enable JSON:API module (core)
3. Configure content types
4. Set up taxonomy
5. Create API user

### Environment Variables

```bash
DRUPAL_BASE_URL=http://localhost:8080
DRUPAL_API_KEY=your_api_key
DRUPAL_PORT=8080
```

### Sync Content

```bash
# Manual sync
curl -X POST http://localhost:8000/api/content/drupal-sync \
  -H "Content-Type: application/json" \
  -d '{"contentTypes": ["article"]}'

# Check sync status
curl http://localhost:8000/api/content/drupal-sync/status
```

---

## Pattern System

### Pattern Categories

1. **Data Flow** - Input validation, transformations, cache
2. **Logic** - Business rules, state machines, error handling
3. **Security** - Authentication, authorization, encryption
4. **Trust** - Zero trust, certificate pinning, attestation
5. **Governance** - Policy enforcement, compliance, audits
6. **Communication** - Request-response, pub-sub, messaging
7. **Traceroute** - Distributed tracing, correlation IDs
8. **Prompt** - AI prompt templates, effectiveness tracking
9. **Response** - Structured outputs, error handling
10. **Naming** - Convention enforcement
11. **Binary** - File integrity, pattern detection

### Checkpoint Validation

```bash
# Quick check
hs -QuickCheck

# Full validation with pattern scan
hs -Checkpoint

# Standalone validation
.\scripts\checkpoint-validation.ps1 -Full
```

### Pattern Scanning

At each checkpoint, the system scans:
- **Internal patterns** in codebase
- **GitHub** repositories
- **npm** packages
- **Documentation** sites (MDN, AWS, Azure)
- **Stack Overflow** highly-voted answers
- **Research papers** (arXiv, IEEE, ACM)

**Validates:**
- Superiority (are we better than competitors?)
- Integration opportunities
- Quality metrics
- Security concerns

---

## Workflows

### Development Workflow

```bash
# 1. Start development environment
docker-compose up -d

# 2. Make changes to code
# ... edit files ...

# 3. Test locally
pnpm test

# 4. Brand files
node scripts/brand_headers.js --fix

# 5. Run checkpoint validation
hs -Checkpoint

# 6. Commit changes
git add -A
git commit -m "feat: your changes"

# 7. Sync to GitHub
hs
```

### Deployment Workflow

```bash
# 1. Build all packages
hc -a hb

# 2. Run tests
pnpm test

# 3. Validate patterns
hs -Checkpoint

# 4. Deploy to staging
pnpm run deploy:staging

# 5. Verify deployment
.\scripts\verify-deployment.js

# 6. Deploy to production
pnpm run deploy:prod
```

### Maintenance Workflow

```bash
# Weekly maintenance
hc

# Monthly deep scan
hs -Checkpoint -Full

# Security audit
.\scripts\checkpoint-validation.ps1 -Full
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker
docker ps -a

# Restart services
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Database Issues

```bash
# Reset database
cd apps/api
npx prisma migrate reset
npx prisma generate
npx prisma db push
```

### Sync Failures

```bash
# Check remote configuration
git remote -v

# Force sync
hs -Force

# Check validation report
cat checkpoint-report.json
```

### Branding Issues

```bash
# Check branding
node scripts/brand_headers.js --check

# Fix branding
node scripts/brand_headers.js --fix
```

### Pattern Validation Failures

```bash
# View validation report
.\scripts\checkpoint-validation.ps1 -Full -ReportPath .\report.json
cat report.json

# Fix issues and retry
hs -Force
```

---

## Environment Variables

### Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Redis
REDIS_URL=redis://localhost:6379

# Security
HC_JWT_SECRET=your_secret_here
HC_ENCRYPTION_KEY=your_key_here
```

### Optional

```bash
# Drupal
DRUPAL_BASE_URL=http://localhost:8080
DRUPAL_API_KEY=your_api_key

# Cloudflare
HC_CLOUDFLARE_TUNNEL_TOKEN=your_token

# API Keys
HC_OPENAI_API_KEY=
HC_ANTHROPIC_API_KEY=
HC_GITHUB_TOKEN=
```

---

## Best Practices

### Code Quality

1. Always run `node scripts/brand_headers.js --fix` before committing
2. Use conventional commits (feat:, fix:, docs:, etc.)
3. Run `hs -Checkpoint` before major changes
4. Keep superiority rate >= 85%

### Security

1. Never commit secrets to Git
2. Use environment variables for credentials
3. Run security audits regularly
4. Keep dependencies updated

### Performance

1. Use Redis caching for frequently accessed data
2. Implement pagination for large datasets
3. Monitor checkpoint validation reports
4. Optimize based on pattern scan recommendations

### Documentation

1. Update README when adding features
2. Document new patterns in pattern registry
3. Create workflow files for complex processes
4. Keep user manual current

---

## Support

### Documentation
- `USER_MANUAL.md` - This file
- `DEVELOPMENT_GUIDE.md` - Development instructions
- `PROJECT_INFO.md` - Detailed project information
- `DRUPAL_CMS_GUIDE.md` - CMS setup and usage

### Commands
```bash
# System status
hs -Checkpoint

# View logs
docker-compose logs -f

# Health check
curl http://localhost:8000/health
```

### Resources
- GitHub: https://github.com/HeadySystems
- Issues: GitHub Issues
- Documentation: `/docs` directory

---

## Appendix

### File Structure

```
HeadyMonorepo/
├── apps/                      # Applications
│   ├── heady-conductor/       # Orchestration service
│   ├── heady-cms/             # CMS management
│   ├── manager/               # Main backend
│   └── [395+ more apps]
├── packages/                  # Shared packages
├── services/                  # Microservices
├── scripts/                   # Automation scripts
│   ├── hc.ps1                 # HeadyControl
│   ├── hs.ps1                 # HeadySync
│   ├── brand_headers.js       # Branding tool
│   └── checkpoint-validation.ps1
├── docs/                      # Documentation
├── .windsurf/workflows/       # Windsurf workflows
└── docker-compose.yml         # Container orchestration
```

### Keyboard Shortcuts

**Desktop:**
- Double-click shortcuts to access apps
- Right-click → Properties to edit URLs

**Terminal:**
- `hc` → HeadyControl
- `hs` → HeadySync
- `hb` → HeadyBuild

### Glossary

- **Sacred Geometry** - Design philosophy (organic, rounded, breathing)
- **Checkpoint** - Validation point for patterns and files
- **Pattern** - Reusable solution to common problem
- **Concept** - Extracted idea from user input
- **Superiority** - Quality score vs competitors (target: >= 85%)
- **Traceroute** - Communication path analysis
- **Hybrid CMS** - Drupal headless + local database

---

**Made with ❤️ by HeadyConnection & HeadySystems**  
**Sacred Geometry :: Organic Systems :: Breathing Interfaces**
