# Deployment Guide

## Portal-OS Deploy Layer

This is the Cloudflare Workers deployment layer for Portal-OS v1, v2, and v3.

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI installed

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts local Cloudflare Worker on `http://localhost:8787`

### Deployment

```bash
npm run deploy
```

Deploys to Cloudflare Workers edge network.

### API Endpoints

#### Portal-OS V1 (Runtime)
- `GET /runtime/ping` — Runtime health check
- `GET /sim/tick` — Simulation mode tick
- `POST /tec/run` — Execute TEC pipeline
- `POST /umbrella/check` — Validate Umbrella rules

#### Portal-OS V2 (Unified Kernel)
- `POST /v2/kernel/sync` — Kernel state synchronization
- `POST /v2/consensus/vote` — Participate in consensus
- `GET /v2/orchestration/status` — Orchestration status

#### Portal-OS V3 (World OS)
- `POST /v3/world/state` — World state query
- `GET /v3/simulation/predict` — Run world simulation
- `POST /v3/governance/vote` — Global voting

### CI/CD

GitHub Actions workflow (`deploy.yml`) automatically deploys on push to `main` branch.

### Configuration

Edit `wrangler.toml` for:
- Worker name and route
- Environment variables
- KV store bindings
- Durable Objects

### Monitoring

View logs and analytics in Cloudflare Dashboard:
```
https://dash.cloudflare.com → Workers → portal-os-v1
```

### Troubleshooting

**Deploy fails:**
```bash
wrangler login
wrangler deploy --force
```

**Local dev issues:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Architecture

This deployment layer serves as the edge entry point for all Portal-OS tiers:

```
Client Request
    ↓
Cloudflare Edge (this layer)
    ↓
Hono Router
    ↓
Portal-OS Endpoint (v1/v2/v3)
    ↓
Response
```

The deployment layer routes requests to appropriate Portal-OS version based on API path.
