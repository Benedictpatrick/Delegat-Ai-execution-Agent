<![CDATA[# 25 — Developer Onboarding

> Local setup instructions, environment requirements, project structure overview, and contribution guidelines for new engineers.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Database Setup (Supabase)](#database-setup-supabase)
- [Inngest Setup (Local Worker)](#inngest-setup-local-worker)
- [Google Cloud Console Setup](#google-cloud-console-setup)
- [Project Structure](#project-structure)
- [Common Development Workflows](#common-development-workflows)
- [Code Style & Linting](#code-style--linting)

---

## Prerequisites

Ensure you have the following installed before starting:
- **Node.js**: v20.x or higher
- **pnpm**: v9.x or higher (`npm install -g pnpm`)
- **Docker**: Required for local Supabase instance
- **Supabase CLI**: `npm install -g supabase`
- **Git**

---

## Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vibe2ship/delegat.git
   cd delegat
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**:
   Copy the example environment file and fill in your keys.
   ```bash
   cp .env.example .env.local
   ```
   *Note: Ask the team lead for the development `GEMINI_API_KEY` and `GOOGLE_CLIENT_SECRET`.*

---

## Database Setup (Supabase)

We run Supabase locally using Docker for development.

1. **Start Supabase**:
   ```bash
   supabase start
   ```
   *This downloads the docker images and starts the local DB, Auth, and Studio services. It takes a few minutes on the first run.*

2. **Apply Migrations**:
   The `supabase start` command should automatically apply migrations in `supabase/migrations/`. If you need to reset the database:
   ```bash
   supabase db reset
   ```

3. **Access Local Studio**:
   Open `http://127.0.0.1:54323` to view your local Supabase dashboard.

4. **Update `.env.local`**:
   The `supabase start` command will output your local API keys. Copy the `API URL`, `anon key`, and `service_role key` into your `.env.local`.

---

## Inngest Setup (Local Worker)

Inngest requires a local dev server to route events to your Next.js application.

1. **Start the Next.js development server**:
   ```bash
   pnpm run dev
   ```
   *Runs on `localhost:3000`.*

2. **Start the Inngest Dev Server**:
   In a new terminal window, run:
   ```bash
   npx inngest-cli@latest dev
   ```
   *This automatically detects the Next.js app and provides a local UI at `http://localhost:8288`.*

---

## Google Cloud Console Setup

To test Google Workspace integrations (OAuth, Gmail, Docs), you need local credentials.

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable APIs: **Gmail API**, **Google Docs API**, **Google Calendar API**, **Google Slides API**.
3. Configure OAuth Consent Screen (add yourself as a test user).
4. Create OAuth 2.0 Client IDs (Web application).
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/auth/callback` (or your Supabase local auth callback).
5. Add the Client ID and Secret to `.env.local`.

---

## Project Structure

```text
delegat/
├── .github/                  # CI/CD workflows
├── docs/                     # Engineering documentation (You are here)
├── supabase/
│   ├── migrations/           # SQL schema definitions
│   └── seed.sql              # Dummy data for local dev
├── src/
│   ├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (auth)/           # Authentication routes
│   │   ├── (dashboard)/      # Main app (War Room, Commitments)
│   │   └── api/
│   │       ├── inngest/      # Inngest API endpoint
│   │       └── ...           # Other REST endpoints
│   ├── components/           # React components
│   │   ├── ui/               # Radix/Shadcn primitives
│   │   └── war-room/         # Domain-specific components
│   ├── lib/                  # Core business logic
│   │   ├── agents/           # Gemini prompt logic
│   │   ├── inngest/          # Inngest client and functions
│   │   ├── supabase/         # Supabase client helpers
│   │   └── utils/            # Shared utilities
│   ├── store/                # Zustand state management
│   └── types/                # TypeScript definitions (Zod schemas, DB types)
```

---

## Common Development Workflows

### Generating Database Types

Whenever you change the database schema via migrations, you must regenerate the TypeScript types.

```bash
pnpm run update-types
```
*(This runs `supabase gen types typescript --local > src/types/database.types.ts`)*

### Adding a New API Route

1. Create `src/app/api/your-route/route.ts`.
2. Wrap your handler in `withErrorHandler` and `withRateLimit` (see `18_ERROR_HANDLING.md`).

### Adding a New UI Component

1. We use Tailwind CSS v4 and Radix UI.
2. If adding a generic primitive, place it in `src/components/ui/`.
3. Ensure it supports dark mode by default.

---

## Code Style & Linting

We enforce strict formatting and type checking in CI.

- **Prettier**: Configured in `.prettierrc`. Run `pnpm run format` before committing.
- **ESLint**: Run `pnpm run lint`. No `any` types allowed without explicit `eslint-disable-next-line` and a justification comment.
- **Naming Conventions**:
  - Components: `PascalCase.tsx`
  - Utilities/Hooks: `camelCase.ts`
  - Directories: `kebab-case/`
  - Database tables: `snake_case`

---

*Previous: [24 — Marketing Strategy](24_MARKETING_STRATEGY.md) · Next: [26 — Agent Debugging Guide](26_AGENT_DEBUGGING_GUIDE.md)*
]]>
