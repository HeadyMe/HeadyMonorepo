<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: HEADYCONDUCTOR_DELEGATION.md -->
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

# HeadyConductor Project Delegation

**Project:** HeadyEcosystem Drupal Integration  
**Source:** `/apps/heady-conductor/delegations/2026-02-03-heady-ecosystem-drupal.md`  
**Status:** PENDING  
**Priority:** HIGH  

## Objective
Finish beneficial project tasks and ensure Drupal is involved in the hybrid content management optimally.

## Current State
- **API Service:** Express.js with task management, WebSocket support, Prisma ORM
- **Web Apps:** Placeholder pages only (web-heady-connection, web-heady-systems)
- **Database:** PostgreSQL with Redis cache
- **Infrastructure:** Docker Compose, Cloudflare Tunnel ready
- **Missing:** Drupal integration for hybrid CMS

## Beneficial Tasks to Complete

### 1. Web Application Enhancement
- **web-heady-connection:** Create proper Next.js app structure with Sacred Geometry UI
- **web-heady-systems:** Create proper Next.js app structure with Sacred Geometry UI
- **Shared Components:** Extract common UI into packages/ui

### 2. Drupal Hybrid CMS Integration
- **Database Layer:** Add Content/Drupal models to Prisma schema
- **API Layer:** Create `/api/content` and `/api/drupal-sync` routes
- **Service Layer:** Build Drupal content sync service
- **Infrastructure:** Add Drupal service to docker-compose.yml
- **Configuration:** Environment variables for Drupal connection

### 3. Content Management Features
- Content types: Articles, Pages, Media
- Taxonomy: Categories, Tags
- Sync strategy: Webhook-based or polling
- Cache invalidation on content updates

## Technical Stack
- **Frontend:** React + TypeScript + Next.js + TailwindCSS
- **Backend:** Node.js + Express + Prisma
- **CMS:** Drupal 11 (headless mode)
- **Cache:** Redis
- **Database:** PostgreSQL
- **Design:** Sacred Geometry (rounded, organic, breathing)

## Deliverables
1. Functioning web apps with Sacred Geometry design system
2. Drupal headless CMS integration
3. Content sync between Drupal and application database
4. Docker Compose setup for local development
5. Documentation for hybrid CMS architecture

## Success Criteria
- Web apps load with proper UI and navigation
- API can fetch content from Drupal
- Content changes sync within 30 seconds
- Local development works with `docker-compose up`

---
**HeadyConductor Assignment:** Route to appropriate agent pools for Q&A, risk assessment, and execution.
