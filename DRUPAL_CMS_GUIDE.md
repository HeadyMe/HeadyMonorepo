<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: DRUPAL_CMS_GUIDE.md -->
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

# Drupal Hybrid CMS Integration Guide

## Overview

HeadyEcosystem integrates Drupal 11 as a headless CMS, providing powerful content management capabilities while maintaining full control over the frontend experience.

## Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  Next.js Apps   │ ───> │  Express API │ ───> │  Drupal 11 CMS  │
│  (Frontend)     │      │  (Backend)   │      │  (Headless)     │
└─────────────────┘      └──────────────┘      └─────────────────┘
         │                       │                       │
         │                       │                       │
         v                       v                       v
    Sacred Geometry          Prisma ORM            JSON:API
    UI Components            PostgreSQL            MariaDB
```

## Features

### Content Management
- **Articles** - Blog posts, news, updates
- **Pages** - Static content pages
- **Media** - Images, videos, documents
- **Taxonomy** - Categories and tags
- **SEO** - Meta titles, descriptions, featured images

### Sync Capabilities
- **Bidirectional Sync** - Push/pull content between Drupal and local DB
- **Webhook Support** - Real-time content updates
- **Polling Mode** - Scheduled sync for batch updates
- **Conflict Resolution** - Smart merge strategies

## Setup

### 1. Start Drupal Service

```bash
# Start Drupal with Docker Compose
docker-compose --profile drupal up -d

# Access Drupal admin
# URL: http://localhost:8080
# Follow installation wizard
```

### 2. Configure Drupal

1. Install Drupal 11
2. Enable JSON:API module (core module)
3. Configure content types (Article, Page, Media)
4. Set up taxonomy vocabularies (Tags, Categories)
5. Create API user with appropriate permissions

### 3. Configure Environment

```bash
# .env
DRUPAL_BASE_URL=http://localhost:8080
DRUPAL_API_KEY=your_api_key_here
```

### 4. Run Initial Sync

```bash
# Sync content from Drupal to local database
curl -X POST http://localhost:8000/api/content/drupal-sync \
  -H "Content-Type: application/json" \
  -d '{"contentTypes": ["article", "page"]}'
```

## API Endpoints

### Content Management

```bash
# List all content
GET /api/content?status=PUBLISHED&take=20

# Get single content by ID
GET /api/content/:id

# Get content by slug
GET /api/content/slug/:slug

# Create content
POST /api/content
{
  "title": "My Article",
  "body": "Content here...",
  "status": "PUBLISHED",
  "contentType": "ARTICLE",
  "tags": ["tech", "ai"],
  "authorId": "user_id",
  "organizationId": "org_id"
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
GET /api/content/categories/list?organizationId=org_id

# Create category
POST /api/content/categories
{
  "name": "Technology",
  "slug": "technology",
  "organizationId": "org_id"
}

# List tags
GET /api/content/tags/list
```

## Database Schema

### Content Model

```prisma
model Content {
  id              String        @id @default(cuid())
  title           String
  slug            String        @unique
  body            String?
  excerpt         String?
  status          ContentStatus @default(DRAFT)
  contentType     ContentType   @default(ARTICLE)
  
  // Drupal Integration
  drupalNid       String?       @unique
  drupalSyncAt    DateTime?
  drupalUrl       String?
  
  // Taxonomy
  tags            Tag[]
  categories      Category[]
  
  // Metadata
  author          User
  publishedAt     DateTime?
  metaTitle       String?
  metaDescription String?
  featuredImage   String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

## Sync Service

The `DrupalSyncService` handles all communication with Drupal:

```typescript
// Fetch content from Drupal
const nodes = await drupalSync.fetchDrupalNodes('article', since);

// Sync to local database
const stats = await drupalSync.syncFromDrupal({
  contentTypes: ['article', 'page'],
  since: new Date('2026-02-01'),
  organizationId: 'org_id'
});

// Push to Drupal
await drupalSync.syncToDrupal(contentId);

// Get sync status
const status = await drupalSync.getSyncStatus(10);
```

## Workflow

### Content Creation Flow

1. **Create in Drupal** → Content editor creates article
2. **Webhook/Sync** → System detects new content
3. **Import** → Content synced to PostgreSQL via API
4. **Cache** → Redis caches frequently accessed content
5. **Display** → Next.js apps fetch from API

### Content Update Flow

1. **Edit in Drupal** → Content updated
2. **Sync** → Changes detected and synced
3. **Cache Invalidation** → Redis cache cleared
4. **Revalidation** → Next.js ISR updates pages

## Best Practices

### Performance
- Use Redis caching for frequently accessed content
- Implement pagination for large content lists
- Enable Drupal's JSON:API caching
- Use Next.js ISR for static content

### Security
- Restrict Drupal API access with API keys
- Use HTTPS for all Drupal communication
- Implement rate limiting on sync endpoints
- Validate all content before import

### Content Strategy
- Define clear content types and taxonomies
- Use consistent slug patterns
- Implement content versioning
- Set up automated backups

## Troubleshooting

### Sync Issues

```bash
# Check sync logs
GET /api/content/drupal-sync/status

# Manual sync with dry run
POST /api/content/drupal-sync
{"dryRun": true}

# Check Drupal connectivity
curl http://localhost:8080/jsonapi
```

### Database Issues

```bash
# Reset Prisma schema
cd apps/api
npx prisma migrate reset
npx prisma generate
npx prisma db push
```

### Docker Issues

```bash
# Restart Drupal service
docker-compose restart drupal

# Check logs
docker-compose logs -f drupal

# Reset volumes
docker-compose down -v
docker-compose --profile drupal up -d
```

## Resources

- [Drupal JSON:API Documentation](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Next.js ISR Guide](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f api drupal`
2. Review sync status: `GET /api/content/drupal-sync/status`
3. Consult HeadyConductor delegation documentation
