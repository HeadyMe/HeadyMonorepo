<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: .windsurf/workflows/setup-local.md -->
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

---
description: Setup Local Dev (HeadyEcosystem)
---

1. Prerequisites

- Node.js 20+
- pnpm 8+
- Docker Desktop (optional)

2. Install dependencies (repo root)

- pnpm install

3. Create or refresh .env.local (interactive)

- pnpm run setup:env

4. Start services

- Docker: pnpm run docker:up
- Dev: pnpm run dev

5. Verify

- node scripts/verify-deployment.js
