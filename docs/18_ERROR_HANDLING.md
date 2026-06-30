<![CDATA[# 18 — Error Handling

> Standardized error hierarchy, UI error states, retry logic, degradation strategies, and observability integration.

---

## Table of Contents

- [Error Hierarchy](#error-hierarchy)
- [Client-Side Error Handling](#client-side-error-handling)
- [Server-Side Error Handling](#server-side-error-handling)
- [Agent & API Error Recovery](#agent--api-error-recovery)
- [Graceful Degradation](#graceful-degradation)
- [Observability (Sentry)](#observability-sentry)

---

## Error Hierarchy

All custom errors extend a base `AppError`.

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Not authenticated') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(public retryAfterSeconds: number) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}
```

---

## Client-Side Error Handling

### UI Error States

1. **Global/Route Errors**: Caught by Next.js `error.tsx` boundary. Shows a full-page error with a "Try again" button.
2. **Component Errors**: Caught by local React Error Boundaries (e.g., inside a specific War Room widget). Shows an inline error card, preventing the whole page from crashing.
3. **Form Errors**: Handled by `react-hook-form` + `zod`. Shows red borders and inline helper text below inputs.
4. **Action Errors**: Toast notifications (bottom right) for failed background mutations (e.g., "Failed to update task status").

### Toast Notification Standard

| Error Type | Toast Message |
|---|---|
| Network failure | "You're offline. Changes will save when you reconnect." |
| Validation | "Please fix the highlighted fields." |
| Permission | "You don't have permission to do that." |
| Rate Limit | "Whoa there! Please wait a moment before trying again." |
| Agent/Gemini | "Delegat hit a snag. Retrying..." |

---

## Server-Side Error Handling

### API Route Wrapper

All API routes are wrapped in a generic error handler to ensure consistent JSON responses.

```typescript
// src/lib/api-handler.ts
export function withErrorHandler(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error(error); // Logs to console/Datadog

      if (error instanceof AppError) {
        return NextResponse.json(
          { error: { code: error.code, message: error.message, details: (error as any).details } },
          { status: error.statusCode }
        );
      }

      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
          { status: 400 }
        );
      }

      // Unhandled/unknown error
      Sentry.captureException(error);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  };
}
```

---

## Agent & API Error Recovery

### Inngest Retry Policies

Delegat uses Inngest's built-in retry mechanisms for background agent tasks.

| Agent / Task | Max Retries | Backoff Strategy | Failure Action |
|---|---|---|---|
| **Agent 1 (Ingestion)** | 3 | Exponential (1s, 2s, 4s) | Save as `draft`, notify user to review manually. |
| **Agent 2 (Decomp)** | 3 | Exponential (2s, 4s, 8s) | Save 1 generic task, log error to NEXUS. |
| **Agent 3 (Execute)** | 5 | Exponential (1s → 16s) | Mark execution `failed`, log to NEXUS, skip. |
| **Agent 4 (Monitor)** | 1 | None (runs often anyway) | Skip cycle, will retry next cron tick. |

### Google API Quota Exceeded

If `429 Too Many Requests` is received from Google (e.g., Calendar or Docs API):
1. **Inngest function throws** a specific `RateLimitError`.
2. **Inngest automatically retries** using exponential backoff.
3. If max retries are hit, a **NEXUS item is created**: `⚠️ Failed to create Google Doc (Rate limit). Try again later.`

---

## Graceful Degradation

Delegat must remain usable even if third-party services fail.

| Failure | User Experience |
|---|---|
| **Gemini API Down** | App remains open. Manual task creation works. AI ingestion/decomposition shows a friendly "AI is taking a nap" message and falls back to manual entry. |
| **Google APIs Down** | Delegat functionality works. Agent 3 executions (Docs/Drafts) are queued and will process when Google recovers. |
| **Supabase Realtime Down** | UI falls back to polling via TanStack Query (every 30s) or manual refresh. |
| **Push Notifications Blocked** | Rely solely on in-app bell and daily email digest. |

---

## Observability (Sentry)

Sentry is integrated on both client and server to catch unhandled exceptions.

### Important Tags

When capturing exceptions, always include context:
- `user.id` (if authenticated)
- `transaction` (API route or Inngest function name)
- `agent` (if failure occurred inside Agent 1-4)
- `external_service` (Google, Gemini, Supabase, Resend)

### Ignore List

Do *not* alert on the following expected errors (they should be filtered out in Sentry config):
- `401 Unauthorized` (User session expired)
- `404 Not Found` (User typed bad URL)
- Validation errors (Zod)
- Client network disconnects (`TypeError: Failed to fetch`)

---

*Previous: [17 — Analytics & Telemetry](17_ANALYTICS_TELEMETRY.md) · Next: [19 — Deployment Pipeline](19_DEPLOYMENT_PIPELINE.md)*
]]>
