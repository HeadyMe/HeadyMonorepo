<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: .windsurf/workflows/start-tunnel.md -->
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

---
description: Start Cloudflare Tunnel (HeadyEcosystem)
---

1. Ensure `HC_CLOUDFLARE_TUNNEL_TOKEN` is set in `.env.local`

2. Start the full stack with the tunnel profile enabled

- docker-compose --profile tunnel up -d

3. Tail tunnel logs

- docker-compose logs -f cloudflared
