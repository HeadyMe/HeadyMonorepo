# Heady Systems - Comprehensive Development Guide

**Version:** 14.3  
**Last Updated:** 2026-02-03  
**For Developers and Contributors**

---

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Architecture](#project-architecture)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Process](#deployment-process)
7. [Contributing Guidelines](#contributing-guidelines)
8. [Advanced Topics](#advanced-topics)

---

## Development Environment Setup

### System Requirements

**Hardware:**
- CPU: 4+ cores recommended
- RAM: 16GB minimum, 32GB recommended
- Storage: 50GB free space
- GPU: Optional (for AI workloads)

**Software:**
- Windows 10/11, macOS 12+, or Linux (Ubuntu 20.04+)
- Node.js 20.x LTS
- pnpm 8.x
- Docker Desktop 4.x
- Git 2.40+
- PowerShell 7+ (Windows) or Bash 5+ (Linux/Mac)
- VS Code or Windsurf IDE

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/HeadySystems/HeadyMonorepo.git
cd HeadyMonorepo

# 2. Install pnpm (if not installed)
npm install -g pnpm@8.12.0

# 3. Install dependencies
pnpm install

# 4. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 5. Generate Prisma client
cd apps/api
npx prisma generate
npx prisma db push
cd ../..

# 6. Start Docker services
docker-compose up -d

# 7. Verify installation
pnpm test
node scripts/brand_headers.js --check
```

### IDE Configuration

**Windsurf (Recommended):**
- Open `Heady.code-workspace`
- Install recommended extensions
- Configure MCP servers in `.mcp/config.json`

**VS Code:**
- Install extensions: ESLint, Prettier, Prisma, Docker
- Use workspace settings in `.vscode/`

### Database Setup

```bash
# Initialize database
cd apps/api
npx prisma migrate dev --name init

# Seed data (optional)
npx prisma db seed

# Reset database
npx prisma migrate reset
```

---

## Project Architecture

### Monorepo Structure

```
HeadyMonorepo/
├── apps/                           # Applications (398 total)
│   ├── heady-conductor/            # Orchestration & routing
│   │   ├── index.js                # Main entry point
│   │   ├── pattern-registry.ts     # Pattern tracking
│   │   ├── concept-analyzer.ts     # Concept extraction
│   │   └── pattern-discovery.ts    # Pattern scanning
│   ├── heady-cms/                  # CMS management
│   ├── manager/                    # Main backend service
│   │   ├── src/
│   │   │   ├── routes/             # API routes
│   │   │   │   ├── tasks.ts
│   │   │   │   └── content.ts      # Content API
│   │   │   └── services/           # Business logic
│   │   │       ├── task.service.ts
│   │   │       └── drupal-sync.service.ts
│   │   └── prisma/
│   │       └── schema.prisma       # Database schema
│   └── [395+ more apps]
├── packages/                       # Shared packages
│   ├── core/                       # Core utilities
│   ├── config/                     # Configuration
│   └── [more packages]
├── services/                       # Microservices
├── scripts/                        # Automation
│   ├── hc.ps1                      # HeadyControl
│   ├── hs.ps1                      # HeadySync
│   ├── checkpoint-validation.ps1   # Validation
│   └── brand_headers.js            # Branding
├── docs/                           # Documentation
├── .windsurf/workflows/            # Windsurf workflows
└── docker-compose.yml              # Container orchestration
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Next.js 14 (App Router)
- Sacred Geometry CSS (custom design system)
- Socket.IO client (real-time)

**Backend:**
- Node.js 20 with Express
- TypeScript 5.3
- Prisma ORM
- PostgreSQL 16
- Redis 7
- Socket.IO server

**CMS:**
- Drupal 11 (headless mode)
- MariaDB 10.11
- JSON:API

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Cloudflare Tunnel
- Render.com (deployment)

**Tools:**
- ESLint + Prettier (code quality)
- Jest (testing)
- Playwright (browser automation)
- Turbo (monorepo build system)

---

## Development Workflow

### Daily Development

```bash
# 1. Start development environment
docker-compose up -d

# 2. Start development servers
pnpm run dev
# This starts all apps in watch mode

# 3. Make changes
# Edit files in apps/, packages/, or services/

# 4. Test changes
pnpm test

# 5. Lint and format
pnpm lint
pnpm format

# 6. Brand files
node scripts/brand_headers.js --fix

# 7. Commit
git add -A
git commit -m "feat: your changes"
```

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Develop feature
# ... make changes ...

# 3. Run tests
pnpm test

# 4. Validate patterns
hs -Checkpoint

# 5. Commit changes
git add -A
git commit -m "feat: add your feature"

# 6. Push to remote
git push origin feature/your-feature

# 7. Create pull request
# Use GitHub UI or gh CLI
```

### Bug Fixes

```bash
# 1. Create fix branch
git checkout -b fix/bug-description

# 2. Reproduce bug
# Write failing test first

# 3. Fix bug
# Implement fix

# 4. Verify fix
pnpm test

# 5. Commit
git add -A
git commit -m "fix: resolve bug description"

# 6. Push and PR
git push origin fix/bug-description
```

### Adding New Patterns

```typescript
// 1. Define pattern in pattern-registry.ts
import { patternRegistry, PatternCategory } from './apps/heady-conductor/pattern-registry';

patternRegistry.registerPattern({
  id: 'custom-001',
  category: PatternCategory.SECURITY,
  name: 'API Key Rotation',
  description: 'Automatic rotation of API keys every 90 days',
  implementation: 'apps/api/src/security/key-rotation.ts',
  examples: ['Scheduled rotation', 'Manual rotation endpoint'],
  antiPatterns: ['Never rotating keys', 'Hardcoded keys'],
  strictness: 'STRICT',
  enforcementLevel: 'REQUIRED',
  metrics: {
    usageCount: 0,
    violationCount: 0,
    performanceImpact: 95,
    securityScore: 98,
    maintainabilityIndex: 90,
    lastValidated: new Date(),
    superiorityScore: 94,
  },
});

// 2. Implement pattern
// Create implementation file

// 3. Document pattern
// Add to .windsurf/workflows/ if complex

// 4. Validate at checkpoint
// Run: hs -Checkpoint
```

---

## Coding Standards

### File Naming

- **Components:** PascalCase (`UserProfile.tsx`)
- **Utilities:** kebab-case (`string-utils.ts`)
- **Services:** kebab-case with suffix (`user.service.ts`)
- **Routes:** kebab-case (`content.ts`)
- **Tests:** Same as source + `.test` or `.spec` (`user.service.test.ts`)

### Code Style

**TypeScript/JavaScript:**
```typescript
// Use interfaces for data structures
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions/intersections
type Status = 'active' | 'inactive';

// Functions: camelCase, verb-noun
function getUserById(id: string): User | null {
  // Implementation
}

// Classes: PascalCase, noun
class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // Implementation
  }
}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'http://localhost:8000';
```

**Python:**
```python
# Functions: snake_case
def get_user_by_id(user_id: str) -> Optional[User]:
    # Implementation
    pass

# Classes: PascalCase
class UserService:
    def create_user(self, data: dict) -> User:
        # Implementation
        pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_ATTEMPTS = 3
API_BASE_URL = "http://localhost:8000"
```

### Git Commit Messages

**Format:** Conventional Commits

```bash
# Features
git commit -m "feat: add user authentication"
git commit -m "feat(api): add content management endpoints"

# Bug fixes
git commit -m "fix: resolve memory leak in sync service"
git commit -m "fix(ui): correct button alignment"

# Documentation
git commit -m "docs: update API reference"
git commit -m "docs(readme): add setup instructions"

# Refactoring
git commit -m "refactor: simplify pattern registry"

# Performance
git commit -m "perf: optimize database queries"

# Tests
git commit -m "test: add unit tests for auth service"

# Chores
git commit -m "chore: update dependencies"

# Branding
git commit -m "brand: apply Sacred Geometry headers"
```

### Sacred Geometry Branding

**All source files must have branding headers:**

```bash
# Check branding
node scripts/brand_headers.js --check

# Apply branding
node scripts/brand_headers.js --fix

# Brand staged files only
node scripts/brand_headers.js --fix --staged
```

---

## Testing Strategy

### Unit Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test user.service.test.ts

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

**Example Test:**
```typescript
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should create user', async () => {
    const user = await service.createUser({
      name: 'Test User',
      email: 'test@example.com',
    });
    
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Test User');
  });
});
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration

# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/tasks
```

### End-to-End Tests

```bash
# Run E2E tests with Playwright
pnpm test:e2e

# Run in UI mode
pnpm test:e2e --ui
```

---

## Deployment Process

### Local Deployment

```bash
# Build all packages
pnpm build

# Start production mode
docker-compose -f docker-compose.prod.yml up -d
```

### Staging Deployment

```bash
# 1. Run full validation
hs -Checkpoint

# 2. Build
pnpm build

# 3. Deploy to staging
pnpm run deploy:staging

# 4. Verify
.\scripts\verify-deployment.js --env staging
```

### Production Deployment

```bash
# 1. Ensure all tests pass
pnpm test

# 2. Run checkpoint validation
hs -Checkpoint

# 3. Build production
pnpm build

# 4. Deploy
pnpm run deploy:prod

# 5. Verify
.\scripts\verify-deployment.js --env production

# 6. Monitor
# Check logs, metrics, and health endpoints
```

---

## Contributing Guidelines

### Pull Request Process

1. **Fork repository** (external contributors)
2. **Create feature branch** from `main`
3. **Make changes** following coding standards
4. **Add tests** for new functionality
5. **Run validation** with `hs -Checkpoint`
6. **Brand files** with `node scripts/brand_headers.js --fix`
7. **Commit** using conventional commits
8. **Push** to your fork
9. **Create PR** with description template
10. **Address review** feedback
11. **Merge** after approval

### Code Review Checklist

**Functionality:**
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] No breaking changes (or documented)

**Quality:**
- [ ] Tests added/updated
- [ ] Code follows style guide
- [ ] No linting errors
- [ ] Sacred Geometry branding applied

**Security:**
- [ ] No secrets in code
- [ ] Input validation implemented
- [ ] Authorization checks present
- [ ] Security patterns followed

**Documentation:**
- [ ] README updated if needed
- [ ] API docs updated
- [ ] Comments for complex logic
- [ ] Changelog entry added

**Patterns:**
- [ ] Follows established patterns
- [ ] No anti-patterns introduced
- [ ] Pattern registry updated if new pattern
- [ ] Checkpoint validation passes

---

## Advanced Topics

### Adding New Services

```bash
# 1. Create service directory
mkdir -p apps/my-service/src

# 2. Initialize package
cd apps/my-service
pnpm init

# 3. Add to workspace
# Edit root package.json workspaces

# 4. Create service files
# src/index.ts, Dockerfile, etc.

# 5. Add to docker-compose
# Edit docker-compose.yml

# 6. Document service
# Create README.md in service directory
```

### Database Migrations

```bash
# Create migration
cd apps/api
npx prisma migrate dev --name add_new_table

# Apply migration
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Generate client
npx prisma generate
```

### Adding Drupal Content Types

```bash
# 1. Create content type in Drupal admin
# Content types → Add content type

# 2. Configure JSON:API
# Enable JSON:API for content type

# 3. Update Prisma schema
# Add model to apps/api/prisma/schema.prisma

# 4. Update sync service
# Modify apps/api/src/services/drupal-sync.service.ts

# 5. Run migration
npx prisma migrate dev --name add_content_type

# 6. Test sync
curl -X POST http://localhost:8000/api/content/drupal-sync \
  -d '{"contentTypes": ["your_type"]}'
```

### Pattern Development

```typescript
// 1. Define pattern interface
interface MyPattern {
  validate(data: any): boolean;
  transform(data: any): any;
  audit(data: any): void;
}

// 2. Implement pattern
class MyPatternImpl implements MyPattern {
  validate(data: any): boolean {
    // Validation logic
    return true;
  }
  
  transform(data: any): any {
    // Transformation logic
    return data;
  }
  
  audit(data: any): void {
    // Audit logging
  }
}

// 3. Register pattern
patternRegistry.registerPattern({
  id: 'my-pattern-001',
  category: PatternCategory.DATA_FLOW,
  name: 'My Pattern',
  implementation: 'apps/api/src/patterns/my-pattern.ts',
  // ... other fields
});

// 4. Use pattern
const pattern = new MyPatternImpl();
if (pattern.validate(data)) {
  const transformed = pattern.transform(data);
  pattern.audit(transformed);
}
```

### Concept Tracking

```typescript
import { conceptAnalyzer } from './apps/heady-conductor/concept-analyzer';

// Extract concepts from user input
const extraction = await conceptAnalyzer.analyzeInput(
  "We need a real-time notification system with WebSocket support"
);

// Review extracted concepts
extraction.extractedConcepts.forEach(concept => {
  console.log(`Concept: ${concept.name}`);
  console.log(`Category: ${concept.category}`);
  console.log(`Business Value: ${concept.businessValue}`);
  console.log(`Feasibility: ${concept.technicalFeasibility}`);
});

// Analyze specific concept
const analysis = await conceptAnalyzer.analyzeConcept(conceptId);
console.log('Recommendations:', analysis.recommendations);
console.log('Effort:', analysis.estimatedEffort);
console.log('Risks:', analysis.risks);

// Generate implementation plan
const plan = conceptAnalyzer.generateImplementationPlan(conceptId);
console.log('Phases:', plan.phases);
console.log('Timeline:', plan.timeline);
```

### Pattern Scanning

```typescript
import { patternDiscovery } from './apps/heady-conductor/pattern-discovery';

// Run comprehensive scan
const result = await patternDiscovery.comprehensiveScan();

console.log(`Scanned ${result.internalPatterns} internal patterns`);
console.log(`Found ${result.externalPatterns} external patterns`);
console.log(`Superiority Rate: ${result.superiorityRate}%`);

// Get integration opportunities
const opportunities = patternDiscovery.getIntegrationOpportunities(75);
opportunities.forEach(opp => {
  console.log(`${opp.externalPattern.name}`);
  console.log(`  Recommendation: ${opp.recommendation}`);
  console.log(`  Priority: ${opp.priority}`);
  console.log(`  Effort: ${opp.effort}, Risk: ${opp.risk}`);
});
```

---

## Performance Optimization

### Database Optimization

```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// Use pagination
const users = await prisma.user.findMany({
  skip: 0,
  take: 20,
  orderBy: { createdAt: 'desc' },
});

// Use indexes
// Add to schema.prisma:
// @@index([email])
// @@index([organizationId, status])
```

### Caching Strategy

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

// Cache frequently accessed data
async function getUserCached(id: string): Promise<User | null> {
  const cacheKey = `user:${id}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const user = await prisma.user.findUnique({ where: { id } });
  
  // Cache for 5 minutes
  if (user) {
    await redis.setEx(cacheKey, 300, JSON.stringify(user));
  }
  
  return user;
}

// Invalidate cache on update
async function updateUser(id: string, data: any): Promise<User> {
  const user = await prisma.user.update({ where: { id }, data });
  
  // Invalidate cache
  await redis.del(`user:${id}`);
  
  return user;
}
```

### Frontend Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));
```

---

## Security Best Practices

### Authentication

```typescript
// Always validate JWT tokens
import jwt from 'jsonwebtoken';

function validateToken(token: string): any {
  try {
    return jwt.verify(token, process.env.HC_JWT_SECRET!);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Use middleware for protected routes
app.use('/api/protected', authMiddleware);
```

### Input Validation

```typescript
import { z } from 'zod';

// Define schema
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

// Validate input
app.post('/api/users', async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    res.status(400).json({ error: 'Validation failed' });
  }
});
```

### Secret Management

```bash
# Never commit secrets
# Use environment variables
# Store in .env (gitignored)

# Required secrets
HC_JWT_SECRET=
HC_ENCRYPTION_KEY=
DATABASE_PASSWORD=
REDIS_PASSWORD=
DRUPAL_API_KEY=
```

---

## Debugging

### Backend Debugging

```bash
# View logs
docker-compose logs -f api

# Attach debugger
# In VS Code: F5 or Run → Start Debugging

# Database queries
npx prisma studio
# Opens GUI at http://localhost:5555
```

### Frontend Debugging

```bash
# React DevTools
# Install browser extension

# View component tree
# Use React DevTools in browser

# Network requests
# Use browser DevTools → Network tab
```

### Pattern Debugging

```bash
# View pattern violations
.\scripts\checkpoint-validation.ps1 -Full

# Check pattern registry
cat checkpoint-report.json

# View scan results
cat audit_logs/pattern_scan_*.json
```

---

## Maintenance

### Weekly Tasks

```bash
# Run full maintenance cycle
hc

# Update dependencies
pnpm update

# Check for vulnerabilities
pnpm audit

# Run security scan
npm audit fix
```

### Monthly Tasks

```bash
# Full checkpoint with pattern scan
hs -Checkpoint

# Review integration opportunities
cat audit_logs/pattern_scan_*.json

# Update documentation
# Review and update all .md files

# Backup database
# Run backup scripts
```

### Quarterly Tasks

```bash
# Major version updates
pnpm update --latest

# Security audit
# Review Dependabot alerts

# Performance review
# Analyze metrics and optimize

# Architecture review
# Evaluate patterns and concepts
```

---

## Tools & Scripts

### Available Scripts

**Root Level:**
- `pnpm dev` - Start all apps in dev mode
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm format` - Format all code

**HeadyControl (hc):**
- `hc` - Full maintenance cycle
- `hc -a hb` - Run HeadyBuild
- `hc -a hs` - Run HeadySync
- `hc -Restart` - Cycle and restart

**HeadySync (hs):**
- `hs` - Full sync cycle
- `hs -Checkpoint` - Generate checkpoint
- `hs -Force` - Force sync
- `hs -Restart` - Sync and restart

**Branding:**
- `node scripts/brand_headers.js --check` - Check branding
- `node scripts/brand_headers.js --fix` - Apply branding

**Validation:**
- `.\scripts\checkpoint-validation.ps1 -Full` - Full validation
- `.\scripts\checkpoint-validation.ps1 -QuickCheck` - Quick check

---

## Resources

### Documentation
- `USER_MANUAL.md` - User guide
- `DEVELOPMENT_GUIDE.md` - This file
- `PROJECT_INFO.md` - Project details
- `DRUPAL_CMS_GUIDE.md` - CMS documentation
- `PATTERN_SYSTEM_COMPLETE.md` - Pattern system
- `CHECKPOINT_PATTERN_SCAN_COMPLETE.md` - Pattern scanning

### External Resources
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Drupal JSON:API](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module)
- [Docker Docs](https://docs.docker.com)

### Support
- GitHub Issues
- Team Discord
- Documentation in `/docs`

---

**Happy Coding! 🚀**  
**Sacred Geometry :: Organic Systems :: Breathing Interfaces**
