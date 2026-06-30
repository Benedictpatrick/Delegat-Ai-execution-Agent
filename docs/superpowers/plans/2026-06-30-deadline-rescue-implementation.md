# Delegat Deadline Rescue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, end-to-end deadline rescue experience with real Gemini planning and artifact generation, explainable recovery, optional Google Calendar execution, and a truthful execution ledger.

**Architecture:** Keep the critical path synchronous and observable through Next.js 16 Route Handlers. Three focused services—Planner, Maker, and Recovery—share validated domain contracts and persist through a small repository layer; Calendar uses a Google REST adapter with an `.ics` fallback. A single client workspace owns interaction state while display components remain focused and presentational.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase PostgreSQL, `@google/genai`, Vitest, native Web APIs and Node crypto.

---

## File map

- `src/lib/rescue/contracts.ts`: domain types, runtime validators, API envelopes.
- `src/lib/rescue/scoring.ts`: deterministic feasibility and confidence calculations.
- `src/lib/rescue/fallback.ts`: deterministic plan and recovery fallbacks.
- `src/lib/rescue/planner.ts`: Gemini plan generation.
- `src/lib/rescue/maker.ts`: Gemini artifact generation.
- `src/lib/rescue/recovery.ts`: Gemini plan-diff generation.
- `src/lib/rescue/repository.ts`: scoped Supabase reads and writes.
- `src/lib/calendar/google.ts`: OAuth URLs, token exchange, refresh, and event creation.
- `src/lib/calendar/ics.ts`: standards-compliant calendar export.
- `src/app/api/rescue/**/route.ts`: thin Route Handlers for plan, execute, recover, and read.
- `src/app/api/calendar/**/route.ts`: OAuth callback and event execution.
- `src/components/rescue/*`: form, summary, board, timeline, artifacts, ledger, recovery dialog.
- `src/app/(dashboard)/war-room/page.tsx`: composition and request state only.
- `src/app/page.tsx`, `src/app/globals.css`, dashboard layout: final visual system and honest navigation.
- `supabase/migrations/20260630000000_deadline_rescue.sql`: additive schema repair.
- `src/lib/**/*.test.ts`: focused unit tests for contracts, scoring, fallback, ICS, and encryption.

## Task 1: Test foundation and domain contracts

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/rescue/contracts.ts`
- Create: `src/lib/rescue/contracts.test.ts`

- [ ] **Step 1: Add the test runner**

Run: `pnpm add -D vitest`

Add scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Configure Vitest**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

- [ ] **Step 3: Write failing contract tests**

Cover rejection of empty commitments, past deadlines, non-positive availability, unknown classifications, duplicate task IDs, and artifact requests without source tasks. Verify a complete canonical payload passes.

Run: `pnpm test -- src/lib/rescue/contracts.test.ts`

Expected: FAIL because contract functions do not exist.

- [ ] **Step 4: Implement contracts and runtime validation**

Define these stable interfaces:

```ts
export type TaskLane = 'must_do' | 'ai_execute' | 'human_work' | 'drop'
export type ArtifactType = 'brief' | 'outline' | 'email_draft'

export interface RescueBrief {
  commitment: string
  deadline: string
  availableMinutes: number
  constraints: string[]
}

export interface RescueTask {
  id: string
  title: string
  lane: TaskLane
  estimatedMinutes: number
  priority: number
  rationale: string
  dependsOn: string[]
}

export interface ArtifactRequest {
  id: string
  taskId: string
  type: ArtifactType
  title: string
  instructions: string
}

export interface RescuePlan {
  id: string
  title: string
  deadline: string
  summary: string
  requiredMinutes: number
  availableMinutes: number
  recoveredMinutes: number
  confidence: number
  riskExplanation: string
  tasks: RescueTask[]
  artifacts: ArtifactRequest[]
  source: 'gemini' | 'fallback'
}
```

Export `validateRescueBrief`, `validateRescuePlan`, `jsonSuccess`, and `jsonFailure`. Validators return discriminated results and never throw for expected user input.

- [ ] **Step 5: Verify contracts**

Run: `pnpm test -- src/lib/rescue/contracts.test.ts`

Expected: PASS.

## Task 2: Scoring, fallbacks, and database repair

**Files:**
- Create: `src/lib/rescue/scoring.ts`
- Create: `src/lib/rescue/scoring.test.ts`
- Create: `src/lib/rescue/fallback.ts`
- Create: `src/lib/rescue/fallback.test.ts`
- Create: `supabase/migrations/20260630000000_deadline_rescue.sql`
- Modify: `src/types/database.types.ts`

- [ ] **Step 1: Write failing scoring tests**

Test these invariants:

```ts
expect(calculateConfidence({ requiredMinutes: 360, availableMinutes: 180, completedMinutes: 0, riskPenalty: 10 })).toBe(40)
expect(calculateConfidence({ requiredMinutes: 180, availableMinutes: 240, completedMinutes: 0, riskPenalty: 0 })).toBe(100)
expect(calculateConfidence({ requiredMinutes: 0, availableMinutes: 60, completedMinutes: 0, riskPenalty: 0 })).toBe(100)
```

The formula is `clamp(round(((available + completed) / max(required, 1)) * 100) - riskPenalty, 5, 100)`, except zero required work returns 100.

- [ ] **Step 2: Implement and verify scoring**

Export `calculateConfidence`, `sumActiveMinutes`, and `sumRecoveredMinutes`. Dropped work contributes to recovered time and not required time.

Run: `pnpm test -- src/lib/rescue/scoring.test.ts`

Expected: PASS.

- [ ] **Step 3: Write and implement fallback tests**

`createFallbackPlan(brief)` must always return four to six uniquely identified tasks, at least one AI task, at least one human task, an artifact request, internally consistent totals, and `source: 'fallback'`. `createFallbackRecovery(plan, lostMinutes)` must never increase available time and must include a non-empty explanation for every changed task.

Run: `pnpm test -- src/lib/rescue/fallback.test.ts`

Expected: PASS after implementation.

- [ ] **Step 4: Add an additive migration**

The migration must:

- replace incompatible commitment/task type checks with the normalized set `writing`, `coding`, `research`, `admin`, `creative`, `meeting`, `health`, `learning`, `unknown`;
- add `available_minutes`, `required_minutes`, `recovered_minutes`, `confidence_score`, `risk_explanation`, and `constraints` to commitments;
- add `lane`, `rationale`, and `depends_on` to tasks;
- create `artifacts(id, user_id, commitment_id, task_id, type, title, content, status, created_at, updated_at)`;
- extend execution agents to `planner`, `maker`, `recovery`, `calendar` and action types to `plan`, `generate_artifact`, `recover`, `calendar_connect`, `calendar_create`, `calendar_fallback`;
- add RLS policies and user/commitment indexes for artifacts.

- [ ] **Step 5: Update generated TypeScript shapes manually**

Keep database types aligned with the migration until Supabase type generation is available.

Run: `pnpm exec tsc --noEmit`

Expected: PASS or only failures in not-yet-created rescue imports, which are resolved in following tasks.

## Task 3: Repository and Planner API

**Files:**
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/rescue/repository.ts`
- Create: `src/lib/rescue/planner.ts`
- Create: `src/lib/rescue/planner.test.ts`
- Create: `src/app/api/rescue/route.ts`
- Create: `src/app/api/rescue/[id]/route.ts`

- [ ] **Step 1: Extract server-only Supabase and demo-user resolution**

`getAdminClient()` validates required environment variables. `getDemoUserId()` returns the configured/first demo user and never exposes service-role credentials. All repository methods require `userId` explicitly.

- [ ] **Step 2: Write Planner tests around an injected model**

The Planner constructor accepts:

```ts
type GenerateJson = (prompt: string) => Promise<unknown>
export function createPlanner(generateJson: GenerateJson): {
  plan(brief: RescueBrief): Promise<RescuePlan>
}
```

Test valid Gemini data, malformed JSON, invalid fields, timeout/error fallback, and recalculated metrics overriding model arithmetic.

- [ ] **Step 3: Implement Gemini structured generation**

Use `gemini-2.5-flash`, temperature `0.2`, JSON response MIME type, and a schema mirroring `RescuePlan` without server-owned `id`, metrics, or `source`. The prompt requires explicit tradeoff rationales and forbids claiming external actions occurred.

- [ ] **Step 4: Implement persistence transaction order**

Create commitment → tasks → execution row. If child persistence fails, mark execution failed and return a 500 envelope with a stable code. Persist whether Gemini or fallback generated the plan.

- [ ] **Step 5: Implement Route Handlers using Next.js 16 conventions**

`POST /api/rescue` validates request JSON and returns 201. `GET /api/rescue/[id]` uses:

```ts
export async function GET(_request: Request, context: RouteContext<'/api/rescue/[id]'>) {
  const { id } = await context.params
}
```

Return 400 for validation, 404 for missing scoped records, and 500 for unexpected failures.

- [ ] **Step 6: Verify Planner slice**

Run: `pnpm test -- src/lib/rescue/planner.test.ts`

Run: `pnpm exec tsc --noEmit`

Expected: PASS.

## Task 4: Maker, artifacts, and `.ics` calendar fallback

**Files:**
- Create: `src/lib/rescue/maker.ts`
- Create: `src/lib/rescue/maker.test.ts`
- Create: `src/lib/calendar/ics.ts`
- Create: `src/lib/calendar/ics.test.ts`
- Create: `src/app/api/rescue/[id]/execute/route.ts`
- Create: `src/app/api/calendar/events/route.ts`

- [ ] **Step 1: Test artifact generation boundaries**

Verify Maker generates only requested artifact types, preserves source task IDs, sanitizes titles, stores Markdown content, and records partial success when one artifact fails.

- [ ] **Step 2: Implement Maker with bounded parallel generation**

Generate at most three artifacts concurrently. Prompts include plan context, artifact-specific instructions, and a rule against invented citations or claims. Return persisted successes plus per-artifact failures.

- [ ] **Step 3: Test ICS escaping and dates**

Verify commas, semicolons, backslashes, and newlines are escaped; UTC timestamps use `YYYYMMDDTHHmmssZ`; every event has stable UID, DTSTAMP, DTSTART, DTEND, SUMMARY, and DESCRIPTION; lines use CRLF.

- [ ] **Step 4: Implement ICS generation**

Export `createIcsCalendar(events)` returning `{ filename, content, mimeType: 'text/calendar; charset=utf-8' }`.

- [ ] **Step 5: Implement execution routes**

`POST /api/rescue/[id]/execute` accepts selected artifact request IDs and returns 200 for complete success or 207 for partial success. Calendar events route initially returns the ICS response whenever no valid Google token exists.

- [ ] **Step 6: Verify Maker slice**

Run: `pnpm test -- src/lib/rescue/maker.test.ts src/lib/calendar/ics.test.ts`

Expected: PASS.

## Task 5: Recovery Agent

**Files:**
- Create: `src/lib/rescue/recovery.ts`
- Create: `src/lib/rescue/recovery.test.ts`
- Create: `src/app/api/rescue/[id]/recover/route.ts`

- [ ] **Step 1: Define and test the recovery contract**

```ts
export interface RecoveryDiff {
  lostMinutes: number
  explanation: string
  revisedConfidence: number
  changes: Array<{
    taskId: string
    action: 'keep' | 'shorten' | 'drop' | 'move'
    previousMinutes: number
    revisedMinutes: number
    rationale: string
  }>
}
```

Reject unknown task IDs, negative minutes, increased total availability, missing rationales, and changes that violate dependencies.

- [ ] **Step 2: Implement Gemini recovery with deterministic fallback**

Recompute all arithmetic server-side. Gemini may choose tradeoffs but cannot set confidence or totals directly.

- [ ] **Step 3: Persist the diff atomically**

Update task lanes/durations, commitment metrics, and the recovery execution row. Return the revised complete plan so the UI can replace state without a second fetch.

- [ ] **Step 4: Verify recovery**

Run: `pnpm test -- src/lib/rescue/recovery.test.ts`

Expected: PASS.

## Task 6: Optional Google Calendar adapter

**Files:**
- Create: `src/lib/calendar/crypto.ts`
- Create: `src/lib/calendar/crypto.test.ts`
- Create: `src/lib/calendar/google.ts`
- Create: `src/app/api/calendar/connect/route.ts`
- Create: `src/app/api/calendar/callback/route.ts`
- Modify: `src/app/api/calendar/events/route.ts`

- [ ] **Step 1: Test token encryption round trips**

Use AES-256-GCM with a random 12-byte IV and authentication tag. Derive the 32-byte key from `TOKEN_ENCRYPTION_KEY` using SHA-256. Verify tampering fails closed.

- [ ] **Step 2: Implement OAuth state protection**

The connect route creates a random state, stores it in an HTTP-only, same-site lax, secure-in-production cookie via `await cookies()`, and redirects to Google with only `calendar.events`, `openid`, and email scopes.

- [ ] **Step 3: Implement callback and token exchange**

Validate state, exchange the code using Google’s token endpoint, encrypt access/refresh tokens, store expiry, clear the state cookie, and redirect to `/war-room?calendar=connected`. Expected OAuth failures redirect with a stable error query instead of throwing.

- [ ] **Step 4: Implement refresh and event creation through REST**

Refresh expired tokens, POST approved events to `https://www.googleapis.com/calendar/v3/calendars/primary/events`, persist returned IDs, and fall back to `.ics` with an explicit `adapter: 'ics'` response when Google is unavailable.

- [ ] **Step 5: Verify calendar security and fallback**

Run: `pnpm test -- src/lib/calendar/crypto.test.ts src/lib/calendar/ics.test.ts`

Expected: PASS.

## Task 7: Maximum-quality rescue workspace

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`
- Replace: `src/app/(dashboard)/war-room/page.tsx`
- Create: `src/components/rescue/RescueWorkspace.tsx`
- Create: `src/components/rescue/RescueBriefForm.tsx`
- Create: `src/components/rescue/PlanSummary.tsx`
- Create: `src/components/rescue/RescueBoard.tsx`
- Create: `src/components/rescue/Timeline.tsx`
- Create: `src/components/rescue/ArtifactStudio.tsx`
- Create: `src/components/rescue/ExecutionLedger.tsx`
- Create: `src/components/rescue/RecoveryControl.tsx`
- Create: `src/app/(dashboard)/error.tsx`
- Create: `src/app/(dashboard)/loading.tsx`

- [ ] **Step 1: Establish the visual tokens**

Use warm paper `#F3F1EB`, ink `#171714`, muted ink `#67655E`, white surface `#FBFAF7`, hairline `#D8D5CC`, cobalt action `#2446D8`, amber risk `#B86B13`, and red critical `#B43B32`. Use square-to-subtle 6–10px radii, no gradients/glows/glass, tabular figures for metrics, and a 12-column desktop grid.

- [ ] **Step 2: Rebuild the landing page**

Headline: “When the deadline is impossible, decide what survives.” Supporting copy explains analysis, execution, and recovery in concrete language. Primary action opens `/war-room?demo=1`; secondary action anchors to a three-step proof section.

- [ ] **Step 3: Build form and request-state shell**

The canonical example populates commitment, tomorrow at 9:00, 190 available minutes, and meeting constraints. Form errors are inline and announced with `aria-live`. Loading copy names the current stage without pretending multiple remote agents are concurrently active.

- [ ] **Step 4: Build plan summary and Rescue Board**

Summary shows required, available, recovered, and confidence values with an accessible meter. Board uses four clearly labelled lanes; every task displays duration and rationale. Drag-and-drop is out of scope; prioritization changes happen through recovery.

- [ ] **Step 5: Build timeline and Artifact Studio**

Timeline is CSS-based and chronological. Artifact Studio uses tabs for real persisted artifacts and supports edit, copy, Markdown download, and email `.eml` download without claiming Gmail/Docs creation.

- [ ] **Step 6: Build Ledger and Recovery interaction**

Ledger renders persisted execution status, adapter, duration, and failure detail. Recovery previews the 90-minute diff and requires Apply before replacing the plan.

- [ ] **Step 7: Add honest calendar state**

Show Connect Google Calendar when disconnected, Connected when verified, and Download calendar file when using ICS. Never show “event created” until the API returns a Google event ID.

- [ ] **Step 8: Remove dead navigation and fake telemetry**

Keep only War Room and the brand link. Remove hardcoded charts, activity rows, health, agent counts, task counts, and placeholder links.

- [ ] **Step 9: Add responsive and failure states**

At widths below 900px stack summary, board, timeline, artifacts, and ledger. At widths below 600px use full-width controls and prevent table overflow. Error boundary must use Next.js 16’s `unstable_retry` prop.

## Task 8: End-to-end verification and demo hardening

**Files:**
- Create: `src/lib/rescue/demo.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Add the canonical service-level journey test**

Use injected deterministic model responses to verify brief → plan → artifacts → lose 90 minutes → revised plan. Assert ledger stages, recalculated confidence, dropped work, and downloadable ICS.

- [ ] **Step 2: Run automated verification**

Run: `pnpm test`

Run: `pnpm lint`

Run: `pnpm exec tsc --noEmit`

Run: `pnpm build`

Expected: all exit 0.

- [ ] **Step 3: Run the browser journey**

Verify desktop and mobile landing page, canonical form submission, fallback labels, artifact editing/download, 90-minute recovery preview/apply, Google disconnected ICS flow, and browser console with zero errors.

- [ ] **Step 4: Test connected and disconnected calendar modes**

Connected mode must create one primary-calendar event and persist its ID. Disconnected or revoked-token mode must produce the ICS fallback without losing the rescue plan.

- [ ] **Step 5: Align project claims**

Update README architecture and demo instructions to match what actually ships. Remove claims of live Gmail, Docs, Slides, four production agents, and unsupported routes.

- [ ] **Step 6: Final evidence checkpoint**

Record the passing command outputs, canonical demo duration, fallback behavior, and any environment prerequisites. Because this workspace has no `.git` directory, commit steps are intentionally omitted; do not initialize or publish a repository without explicit user authorization.

