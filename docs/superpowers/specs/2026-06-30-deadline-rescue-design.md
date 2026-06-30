# Delegat Deadline Rescue — Design Specification

## Objective

Turn the current task-decomposition demo into a reliable hackathon vertical slice that proves three claims: Gemini makes defensible prioritization decisions, Delegat produces useful work, and the plan adapts when the user loses time.

The primary demo scenario is: “My research presentation is tomorrow. I have meetings until 4 PM and nothing prepared.” The product must calculate feasibility, propose a minimum viable rescue plan, generate artifacts, schedule work, and re-plan after a simulated disruption.

## Product Experience

### Entry and analysis

The War Room begins with a structured rescue brief: commitment, deadline, available hours, and constraints. A single example-fill action loads the canonical demo scenario. Submitting the brief invokes Gemini and returns structured, validated JSON containing:

- normalized commitment and deadline;
- required minutes, available minutes, and deadline confidence;
- a concise risk explanation;
- tasks classified as `must_do`, `ai_execute`, `human_work`, or `drop`;
- realistic duration, priority, rationale, and dependencies for each task;
- artifact requests for briefs, outlines, or email drafts.

If Gemini fails or produces invalid data, the API returns a deterministic rescue plan marked as fallback-generated. The UI never claims AI execution occurred when it did not.

### Rescue workspace

After analysis, one responsive workspace replaces the generic operations dashboard:

- a top summary shows time required, time available, time recovered, and calculated confidence;
- a Rescue Board shows the four task classifications with clear reasons for every tradeoff;
- a compact timeline shows scheduled human work and AI execution in chronological order;
- an Artifact Studio displays generated briefs, outlines, and email drafts with edit, copy, and download actions;
- an Execution Ledger lists real analysis, generation, approval, calendar, fallback, and error events from persisted records.

The health/confidence value is derived from available time, required time, completed work, deadline proximity, and risk penalties. No display metric, chart, agent status, or activity item is hardcoded.

### Execution and approval

Gemini generates real artifact content inside Delegat. Safe generation can run immediately after plan approval. External calendar changes require an explicit user action.

Calendar execution has two adapters:

- Google Calendar when OAuth succeeds;
- downloadable `.ics` events when Google is unavailable.

The UI states which adapter was used. Gmail and Docs remain sandboxed: email drafts and document content are real and exportable, but the product does not claim they were created in Google Workspace.

### Recovery Mode

The canonical disruption action is “I lost 90 minutes.” It invokes a separate Gemini re-plan using the current plan and reduced availability. The response includes a plan diff: retained tasks, shortened tasks, newly dropped tasks, revised schedule, and revised confidence. The UI explains what changed and why before applying it.

## Architecture and Data Flow

Use a small orchestration layer with three logical agents, not four separate background services:

1. Planner validates input and produces the rescue plan.
2. Maker generates requested artifacts and calendar payloads.
3. Recovery produces a constrained plan diff.

Each stage writes an execution record with status, duration, input summary, output summary, and error details. The frontend reads these records for the Execution Ledger.

API boundaries:

- `POST /api/rescue` creates a plan from the rescue brief.
- `POST /api/rescue/[id]/execute` generates selected artifacts.
- `POST /api/rescue/[id]/recover` produces and applies a recovery diff.
- `POST /api/calendar/connect` begins Google OAuth.
- `GET /api/calendar/callback` stores encrypted tokens.
- `POST /api/calendar/events` creates approved events or returns an `.ics` fallback.
- `GET /api/rescue/[id]` returns the complete workspace state.

Gemini responses use structured output with runtime validation. Server routes own all secrets and service-role access. Routes scope records to the demo user until full authentication is implemented; no endpoint returns all users’ data.

## Persistence

Add the minimum schema needed for the vertical slice:

- rescue-plan metrics and constraint fields on commitments;
- task classification, rationale, dependencies, and schedule fields;
- an artifacts table containing type, title, content, source task, status, and timestamps;
- execution records for the three logical agents and calendar actions;
- encrypted Google token storage using the existing token encryption key.

Normalize task and commitment enums so every value emitted by Gemini is accepted. Soft deletion uses `deleted_at`; the UI must not invent a `deleted` status.

## Visual Design

The interface should feel like a serious editorial decision tool, not a generic AI dashboard.

- Use a neutral ink-and-paper palette with one controlled signal color plus semantic risk colors.
- Use strong typographic scale, thin rules, generous whitespace, and aligned numeric data.
- Avoid gradients, glows, glass effects, decorative charts, excessive rounded cards, emojis, and vague AI language.
- Prefer one continuous workspace with clearly separated regions over a grid of unrelated dashboard cards.
- Motion is limited to plan creation progress, board transitions, artifact reveal, and recovery diff changes.
- Desktop supports the live demo; tablet and mobile retain the complete workflow without horizontal overflow.

The landing page should state the concrete value: “When the deadline is impossible, Delegat decides what survives—and starts the work.” It should link directly to the canonical demo.

## Reliability and Scope Boundaries

- Calendar is the only live Google integration in this build.
- Gmail and Docs outputs are real artifacts but remain in-app/exportable.
- Inngest is not required for the critical demo path; direct server orchestration is preferred for observability and reduced failure surface.
- Existing unsupported navigation items are removed or disabled rather than linked to missing routes.
- The product never labels queued work as completed and never shows fabricated agent activity.

## Testing and Acceptance Criteria

- Valid rescue input produces a persisted plan with calculated metrics and classified tasks.
- Invalid or malformed Gemini output produces a visibly labelled deterministic fallback.
- The canonical presentation scenario completes from input through artifact generation without manual database changes.
- Artifact content is editable, copyable, and downloadable.
- Calendar approval creates a Google event when connected and an `.ics` fallback otherwise.
- Losing 90 minutes produces an explainable diff and updates metrics, tasks, and schedule.
- Every ledger row corresponds to a persisted execution event.
- Empty, loading, error, fallback, partial-success, and completed states are usable.
- The app has no dead navigation in the demo path and no hardcoded operational metrics.
- Type checking, linting, production build, API tests, and the canonical browser journey pass before handoff.

## Two-Day Delivery Order

1. Repair schema/type mismatches and establish validated rescue-plan contracts.
2. Implement Planner, Maker, and Recovery APIs with deterministic fallbacks and execution logging.
3. Replace the War Room with the rescue workspace and remove hardcoded telemetry.
4. Add artifact editing/export and `.ics` scheduling.
5. Add optional Google Calendar OAuth and event creation behind the same adapter.
6. Polish landing page, responsive behavior, loading/error states, and motion.
7. Run automated checks and rehearse the canonical demo with Google connected and disconnected.

