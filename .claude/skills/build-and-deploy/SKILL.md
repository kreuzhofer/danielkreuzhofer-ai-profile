---
name: build-and-deploy
description: Build and deploy the portfolio app using Docker Compose (production profile)
---

Build and deploy the portfolio app using Docker Compose (production profile).

Steps:
1. Run `docker compose --profile production up -d --build` from the repo root to rebuild and deploy.
2. Wait for the build to complete and verify the container is running with `docker compose --profile production ps`.
3. Verify the app responds with a quick health check: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8087/`
4. Report the result.

IMPORTANT:
- Always use Docker for builds and deployment. Never use `npm run build:local` for deployment.
- Always use `docker compose` (V2 syntax), never `docker-compose`.
- Use `--build` flag to ensure code changes are picked up.
- The app runs on port 8087.
