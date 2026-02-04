<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: DOCKER_ENTRY_POINTS.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# Docker Entry Points - Complete Reference

**All functional Docker entry points for Heady Systems**

---

## Quick Start

```bash
# Start all core services
docker-compose up -d

# Start with Drupal CMS
docker-compose --profile drupal up -d

# Start with Cloudflare Tunnel
docker-compose --profile tunnel up -d

# Start everything
docker-compose --profile drupal --profile tunnel up -d
```

---

## Service Entry Points

### 1. PostgreSQL Database
**Container:** `heady-ecosystem-postgres`  
**Port:** 5433:5432  
**Entry:** Automatic on container start  
**Health Check:** `pg_isready -U heady`  
**Access:** `postgresql://heady:heady123@localhost:5433/headysystems_dev`

### 2. Redis Cache
**Container:** `heady-ecosystem-redis`  
**Port:** 6380:6379  
**Entry:** Automatic on container start  
**Health Check:** `redis-cli ping`  
**Access:** `redis://localhost:6380`

### 3. API Service
**Container:** `heady-ecosystem-api`  
**Port:** 8001:8000  
**Entry:** `npm run dev` (development) or `npm start` (production)  
**Dockerfile:** `apps/api/Dockerfile`  
**Health Check:** `http://localhost:8001/health`  
**Depends On:** postgres, redis

### 4. HeadyConnection Web
**Container:** `heady-ecosystem-connection-web`  
**Port:** 3000:3000  
**Entry:** Next.js dev server  
**Dockerfile:** `apps/web-heady-connection/Dockerfile`  
**Access:** `http://localhost:3000`  
**Depends On:** api

### 5. HeadySystems Web
**Container:** `heady-ecosystem-systems-web`  
**Port:** 3001:3001  
**Entry:** Next.js dev server  
**Dockerfile:** `apps/web-heady-systems/Dockerfile`  
**Access:** `http://localhost:3001`  
**Depends On:** api

### 6. Browser Automation
**Container:** `heady-ecosystem-browser`  
**Port:** 9222:9222  
**Entry:** Playwright server  
**Dockerfile:** `services/browser-automation/Dockerfile`  
**Shared Memory:** 2GB  
**Depends On:** None

### 7. Drupal CMS (Profile: drupal)
**Container:** `heady-ecosystem-drupal`  
**Port:** 8080:80  
**Entry:** Apache + PHP-FPM  
**Image:** `drupal:11-php8.3-apache`  
**Access:** `http://localhost:8080`  
**Depends On:** drupal-db

### 8. Drupal Database (Profile: drupal)
**Container:** `heady-ecosystem-drupal-db`  
**Port:** Internal only  
**Entry:** MariaDB server  
**Image:** `mariadb:10.11`  
**Database:** drupal  
**User:** drupal/drupal

### 9. Cloudflare Tunnel (Profile: tunnel)
**Container:** `heady-ecosystem-tunnel`  
**Port:** None (tunnel)  
**Entry:** `cloudflared tunnel run --token $TOKEN`  
**Image:** `cloudflare/cloudflared:latest`  
**Depends On:** api

---

## Docker Compose Files

### Main: `docker-compose.yml`
**Services:** postgres, redis, api, web-heady-connection, web-heady-systems, browser-automation  
**Profiles:** drupal, tunnel  
**Networks:** heady-network  
**Volumes:** postgres_data, redis_data, drupal_*, drupal_db_data

### MCP: `docker-compose.mcp.yml`
**Services:** MCP-specific services  
**Purpose:** Model Context Protocol servers

---

## Dockerfiles

### API Dockerfile (`apps/api/Dockerfile`)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

### Web App Dockerfile (`apps/web-heady-connection/Dockerfile`)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### Browser Automation (`services/browser-automation/Dockerfile`)
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9222
CMD ["npm", "start"]
```

---

## Health Checks

### API Health
```bash
curl http://localhost:8001/health

# Response:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "websocket": "active"
  }
}
```

### Database Health
```bash
docker exec heady-ecosystem-postgres pg_isready -U heady
```

### Redis Health
```bash
docker exec heady-ecosystem-redis redis-cli ping
```

### Drupal Health
```bash
curl http://localhost:8080/core/install.php
```

---

## Network Configuration

### heady-network (Bridge)
**Driver:** bridge  
**Subnet:** Auto-assigned  
**Services:** All containers connected  
**DNS:** Docker internal DNS

**Service Discovery:**
- `postgres:5432` - Database
- `redis:6379` - Cache
- `api:8000` - API
- `drupal:80` - Drupal CMS
- `drupal-db:3306` - Drupal database

---

## Volume Management

### Persistent Volumes
```bash
# List volumes
docker volume ls | grep heady

# Inspect volume
docker volume inspect heady-ecosystem_postgres_data

# Backup volume
docker run --rm -v heady-ecosystem_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volume
docker run --rm -v heady-ecosystem_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /

# Remove all volumes (WARNING: DATA LOSS)
docker-compose down -v
```

---

## Environment Variables

### Required for Docker
```bash
# Database
DATABASE_USER=heady
DATABASE_PASSWORD=heady123
DATABASE_NAME=headysystems_dev
DATABASE_PORT=5433

# Redis
REDIS_PORT=6380

# API
HC_API_PORT=8001
HC_JWT_SECRET=your_secret

# Drupal (if using profile)
DRUPAL_PORT=8080

# Cloudflare (if using profile)
HC_CLOUDFLARE_TUNNEL_TOKEN=your_token
```

---

## Common Operations

### Start Specific Service
```bash
docker-compose up -d postgres redis
docker-compose up -d api
```

### Restart Service
```bash
docker-compose restart api
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Execute Commands in Container
```bash
# API container
docker exec -it heady-ecosystem-api sh

# Database container
docker exec -it heady-ecosystem-postgres psql -U heady -d headysystems_dev

# Redis container
docker exec -it heady-ecosystem-redis redis-cli
```

### Rebuild Service
```bash
# Rebuild specific service
docker-compose build api

# Rebuild and restart
docker-compose up -d --build api

# Rebuild all
docker-compose build
```

---

## Troubleshooting

### Services Won't Start
```bash
# Check status
docker-compose ps

# Check logs
docker-compose logs

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Port Conflicts
```bash
# Change ports in .env
DATABASE_PORT=5434
REDIS_PORT=6381
HC_API_PORT=8002
```

### Volume Issues
```bash
# Reset volumes (WARNING: DATA LOSS)
docker-compose down -v
docker-compose up -d
```

### Network Issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

---

## Production Deployment

### Build Production Images
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Tag images
docker tag heady-api:latest registry.example.com/heady-api:v14.3

# Push to registry
docker push registry.example.com/heady-api:v14.3
```

### Deploy to Server
```bash
# Pull images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
```

---

**All Docker entry points functional and documented! 🐳**
