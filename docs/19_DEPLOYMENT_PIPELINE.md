<![CDATA[# 19 — Deployment Pipeline

> CI/CD strategy, environment definitions, Vercel configuration, database migrations, and release process.

---

## Table of Contents

- [Environments](#environments)
- [CI/CD Pipeline (GitHub Actions)](#cicd-pipeline-github-actions)
- [Vercel Deployment](#vercel-deployment)
- [Database Migrations](#database-migrations)
- [Environment Variables](#environment-variables)
- [Release Process](#release-process)

---

## Environments

| Environment | Branch | URL | Database | Purpose |
|---|---|---|---|---|
| **Local** | `feature/*` | `localhost:3000` | Local Supabase CLI | Active development |
| **Preview** | Any PR | `*.vercel.app` | Staging Supabase | PR review & QA |
| **Production** | `main` | `delegat.app` | Prod Supabase | Live users |

---

## CI/CD Pipeline (GitHub Actions)

We use GitHub Actions for Continuous Integration to ensure code quality before it reaches Vercel.

### Pipeline: `pr-checks.yml`

Runs on every Pull Request to `main`.

1. **Install Dependencies**: `pnpm install`
2. **Lint**: `pnpm run lint` (ESLint + Prettier)
3. **Type Check**: `pnpm run typecheck` (tsc)
4. **Unit Tests**: `pnpm run test` (Vitest)
5. **DB Type Generation Check**: Ensures Supabase DB types are up-to-date with schema.

```yaml
name: PR Checks
on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm run test
```

---

## Vercel Deployment

Vercel handles Continuous Deployment (CD).

### Configuration (`vercel.json`)

```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm run build",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Deployment Flow

1. PR merged to `main`.
2. Vercel detects push.
3. Vercel builds the Next.js app.
4. If build succeeds, Vercel deploys to `delegat.app`.
5. Vercel deployment webhook pings Inngest to sync new worker functions.

---

## Database Migrations

Database schema changes are managed via the **Supabase CLI**.

### Local Workflow
1. Make changes via Supabase Studio (local) or write SQL manually.
2. Run `supabase db diff -f feature_name` to generate migration file.
3. Commit `supabase/migrations/xxxx_feature_name.sql` to Git.

### CI/CD Database Deployment

We use GitHub Actions to apply migrations to Staging and Production.

```yaml
# .github/workflows/db-migrate.yml
name: DB Migrations
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref $SUPABASE_PROJECT_ID
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## Environment Variables

Managed securely via Vercel Environment Variables.

### Required Variables (Production)

```env
# Next.js / Vercel
NEXT_PUBLIC_SITE_URL="https://delegat.app"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ey..."
SUPABASE_SERVICE_ROLE_KEY="ey..."

# Gemini
GEMINI_API_KEY="AIza..."

# Inngest
INNGEST_EVENT_KEY="env_..."
INNGEST_SIGNING_KEY="sign_..."

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# Security
TOKEN_ENCRYPTION_KEY="32_byte_hex_string_here"

# Services
RESEND_API_KEY="re_..."
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="AY..."
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

---

## Release Process

For the MVP / Hackathon, we use a continuous delivery model:

1. **Develop**: Branch off `main`. Use local Supabase + local Inngest dev server.
2. **Review**: Open PR. Vercel generates preview deployment. GitHub Actions run checks.
3. **Merge**: Approve and merge to `main`.
4. **Deploy**: Vercel auto-deploys to production. GitHub Actions push DB migrations.
5. **Verify**: Post-deploy automated smoke test runs against prod URL.

---

*Previous: [18 — Error Handling](18_ERROR_HANDLING.md) · Next: [20 — Monitoring & Alerting](20_MONITORING_ALERTING.md)*
]]>
