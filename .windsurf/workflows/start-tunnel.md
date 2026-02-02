---
description: Start Cloudflare Tunnel (HeadyEcosystem)
---

1. Ensure `HC_CLOUDFLARE_TUNNEL_TOKEN` is set in `.env.local`

2. Start the full stack with the tunnel profile enabled

- docker-compose --profile tunnel up -d

3. Tail tunnel logs

- docker-compose logs -f cloudflared
