---
layout: post
title: "Docker Compose Patterns I Use on Every Project"
date: 2025-04-02
tags: [docker, devops, patterns, tools]
categories: [technology]
---

## Why Compose Still Matters

Kubernetes gets all the attention, but for local development and small deployments, Docker Compose remains king. Here are patterns I've settled on after years of iteration.

## Pattern 1: Override Files

Keep your base config clean and add environment-specific overrides:

```yaml
# docker-compose.yml (base)
services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    depends_on:
      - db

  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
```

```yaml
# docker-compose.override.yml (dev — auto-loaded)
services:
  api:
    volumes:
      - ./api/src:/app/src
    environment:
      - DEBUG=true
      - DB_HOST=db
```

## Pattern 2: Health Checks with `depends_on`

Don't just depend on a service starting — wait until it's *ready*:

```yaml
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    depends_on:
      db:
        condition: service_healthy
```

## Pattern 3: Named Profiles

Group services by purpose so you don't run everything at once:

```yaml
services:
  api:
    # always runs
    
  worker:
    profiles: ["full"]
    
  monitoring:
    profiles: ["debug"]
    image: grafana/grafana
```

Then: `docker compose --profile full up` or just `docker compose up` for the essentials.

## Pattern 4: Init Containers via `depends_on`

Run migrations or seed data before your app starts:

```yaml
services:
  migrate:
    build: ./api
    command: npx prisma migrate deploy
    depends_on:
      db:
        condition: service_healthy

  api:
    build: ./api
    depends_on:
      migrate:
        condition: service_completed_successfully
```

## The Principle

All these patterns share a theme: **make the default experience zero-config**. A new developer should be able to `git clone` and `docker compose up` with no further setup.
