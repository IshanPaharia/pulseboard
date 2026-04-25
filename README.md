# PulseBoard

PulseBoard is a lightweight realtime analytics app for tracking pageviews, sessions, custom events, and live dashboard updates.

## Architecture

PulseBoard uses a four-layer pipeline:

1. Browser collection: the embeddable `pb.js` snippet records pageviews, SPA navigation, and custom events without breaking the host site if requests fail.
2. API ingestion: Express validates site API keys, hashes IPs, writes durable records to Postgres, and updates session counters.
3. Realtime layer: Redis stores short-lived live counters and publishes site updates to the SSE broadcaster.
4. Dashboard: Next.js renders the initial dashboard server-side, then client components subscribe over SSE for live charts and ranked tables.

Nginx fronts the production stack, routing ingestion and API traffic to Express while serving the dashboard from Next.js.

## Quick Start

Run the development stack:

```bash
docker-compose up --build
```

Open:

- Dashboard setup: `http://localhost:3000`
- API health: `http://localhost:3001/health`

Run the production stack:

```bash
./deploy.sh
```

PulseBoard will be available at `http://localhost`.

## Embed Snippet

Create a site from the setup page or `POST /api/sites`, then add the generated snippet before `</body>`:

```html
<script
  defer
  data-api-key="YOUR_API_KEY"
  data-api-url="http://localhost"
  src="http://localhost/pb.js"
></script>
```

Track custom events from the host site:

```html
<script>
  window.PulseBoard.track("signup_clicked", { plan: "pro" });
</script>
```

## Environment Variables

| Variable | Used by | Description | Default |
| --- | --- | --- | --- |
| `DATABASE_URL` | API | Postgres connection string | `postgres://pulse:pulse@postgres:5432/pulseboard` |
| `REDIS_URL` | API | Redis connection string | `redis://redis:6379` |
| `PORT` | API | Express listen port | `3001` |
| `NEXT_PUBLIC_API_URL` | Web/browser | Public API base URL for browser requests and snippets | `http://localhost:3001` |
| `API_INTERNAL_URL` | Web SSR | Internal API URL used by Next.js server components in Docker | `NEXT_PUBLIC_API_URL` |
| `PUBLIC_URL` | Production compose | Public origin passed to production API/web builds | `http://localhost` |
| `POSTGRES_DB` | Production compose | Postgres database name | `pulseboard` |
| `POSTGRES_USER` | Production compose | Postgres username | `pulse` |
| `POSTGRES_PASSWORD` | Production compose | Postgres password | `pulse` |

## Resume Power Bullet

- Built PulseBoard, a Dockerized realtime analytics platform with an embeddable browser SDK, Express/Postgres ingestion, Redis-powered SSE streaming, nginx routing, and a strict TypeScript Next.js dashboard.
