<![CDATA[# 12 — API Specification

> Complete REST API with endpoints, request/response schemas, authentication, validation, rate limiting, examples, and error codes.

---

## Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Format](#error-format)
- [Endpoints](#endpoints)
- [Commitments API](#commitments-api)
- [Tasks API](#tasks-api)
- [Activity API](#activity-api)
- [Notifications API](#notifications-api)
- [Agent API](#agent-api)
- [Settings API](#settings-api)
- [Health API](#health-api)

---

## API Overview

| Property | Value |
|---|---|
| **Base URL** | `https://delegat.app/api` (production), `http://localhost:3000/api` (local) |
| **Format** | JSON |
| **Auth** | Bearer token (Supabase JWT) via `Authorization` header or cookie |
| **Versioning** | No versioning in MVP (path-based `/api/v2/` if needed later) |
| **Rate Limiting** | Per-user, per-endpoint |

---

## Authentication

All endpoints except `/api/health` require authentication.

```
Authorization: Bearer <supabase_jwt_token>
```

Or via Supabase's `sb-access-token` cookie (automatic for browser clients).

### Error Response (401)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authentication token"
  }
}
```

---

## Rate Limiting

| Endpoint Category | Limit | Window |
|---|---|---|
| Read endpoints (GET) | 100 requests | 1 minute |
| Write endpoints (POST, PATCH) | 20 requests | 1 minute |
| Agent triggers | 10 requests | 1 minute |
| Delete endpoints | 10 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1719648000
```

### Error Response (429)

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 45 seconds.",
    "retryAfter": 45
  }
}
```

---

## Error Format

All errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": []
  }
}
```

| HTTP Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid request body |
| 401 | `UNAUTHORIZED` | Missing/invalid auth |
| 403 | `FORBIDDEN` | Accessing another user's data |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Duplicate resource |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 502 | `GOOGLE_API_ERROR` | Google API failure |
| 502 | `GEMINI_ERROR` | Gemini API failure |

---

## Commitments API

### POST /api/commitments

Create a new commitment.

**Request:**

```json
{
  "text": "Research paper on ML in healthcare due Wednesday",
  "source_type": "text"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `text` | string | Yes | 1–5000 characters |
| `source_type` | enum | No | `text` (default), `email`, `image` |
| `importance` | integer | No | 1–5 (default: 3) |
| `tags` | string[] | No | Max 10 tags, each max 50 chars |

**Response (201):**

```json
{
  "id": "c0000001-0000-0000-0000-000000000001",
  "title": null,
  "raw_input": "Research paper on ML in healthcare due Wednesday",
  "source_type": "text",
  "type": null,
  "deadline": null,
  "status": "processing",
  "health_score": null,
  "importance": 3,
  "stakeholders": [],
  "tags": [],
  "created_at": "2026-06-29T12:00:00Z",
  "updated_at": "2026-06-29T12:00:00Z"
}
```

> Note: `title`, `type`, and `deadline` are null initially. They are populated asynchronously by Agent 1 (Ingestion). Subscribe to Supabase Realtime for updates.

---

### GET /api/commitments

List user's commitments.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | enum | all | Filter by status |
| `deadline_before` | ISO date | — | Commitments due before date |
| `deadline_after` | ISO date | — | Commitments due after date |
| `sort` | string | `deadline` | `deadline`, `created_at`, `health_score` |
| `order` | string | `asc` | `asc` or `desc` |
| `limit` | integer | 50 | Max 100 |
| `offset` | integer | 0 | Pagination offset |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Research paper on ML in healthcare",
      "deadline": "2026-07-02T23:59:00Z",
      "status": "active",
      "health_score": 85,
      "type": "writing",
      "importance": 4,
      "tasks_total": 8,
      "tasks_completed": 3,
      "created_at": "2026-06-29T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

---

### GET /api/commitments/:id

Get commitment details with tasks.

**Response (200):**

```json
{
  "id": "uuid",
  "title": "Research paper on ML in healthcare",
  "raw_input": "Research paper on ML in healthcare due Wednesday",
  "source_type": "text",
  "type": "writing",
  "deadline": "2026-07-02T23:59:00Z",
  "status": "active",
  "health_score": 85,
  "importance": 4,
  "confidence_score": 82,
  "stakeholders": [],
  "tags": [],
  "tasks": [
    {
      "id": "uuid",
      "title": "Literature search on ML healthcare",
      "description": "Find 5-10 recent papers on ML applications in healthcare",
      "estimated_minutes": 45,
      "actual_minutes": null,
      "type": "research",
      "execution_type": "human_only",
      "status": "completed",
      "sort_order": 1,
      "scheduled_start": "2026-06-30T09:00:00Z",
      "scheduled_end": "2026-06-30T09:45:00Z",
      "completed_at": "2026-06-30T09:40:00Z"
    }
  ],
  "executions": [
    {
      "id": "uuid",
      "action_type": "doc_create",
      "status": "success",
      "created_at": "2026-06-29T12:05:00Z"
    }
  ],
  "created_at": "2026-06-29T12:00:00Z",
  "updated_at": "2026-06-30T09:40:00Z"
}
```

---

### PATCH /api/commitments/:id

Update a commitment.

**Request:**

```json
{
  "title": "Updated title",
  "deadline": "2026-07-05T23:59:00Z",
  "importance": 5,
  "status": "completed"
}
```

**Response (200):** Updated commitment object.

---

### DELETE /api/commitments/:id

Soft-delete a commitment.

**Response (204):** No content.

---

## Tasks API

### GET /api/tasks

List tasks (optionally filtered by commitment).

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `commitment_id` | UUID | Filter by commitment |
| `status` | enum | Filter by status |
| `execution_type` | enum | `human_only` or `auto_executable` |
| `scheduled_date` | ISO date | Tasks scheduled for this date |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "commitment_id": "uuid",
      "title": "Write introduction paragraph",
      "estimated_minutes": 30,
      "type": "writing",
      "execution_type": "human_only",
      "status": "pending",
      "sort_order": 3,
      "scheduled_start": "2026-07-01T10:00:00Z",
      "scheduled_end": "2026-07-01T10:30:00Z"
    }
  ]
}
```

---

### PATCH /api/tasks/:id

Update a task (toggle completion, edit, reschedule).

**Request:**

```json
{
  "status": "completed",
  "actual_minutes": 25
}
```

**Response (200):** Updated task object.

---

## Activity API

### GET /api/activity

Get NEXUS activity feed.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | Max 100 |
| `offset` | integer | 0 | Pagination |
| `commitment_id` | UUID | — | Filter by commitment |
| `type` | enum | — | Filter by action type |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "gmail_draft",
      "title": "Drafted reply to john@acme.com",
      "details": "Context-aware reply addressing project scope question",
      "link": "https://mail.google.com/mail/u/0/#drafts/abc123",
      "status": "success",
      "commitment_id": "uuid",
      "created_at": "2026-06-29T12:05:00Z"
    }
  ]
}
```

---

## Notifications API

### GET /api/notifications

Get user notifications.

**Query Parameters:**

| Param | Type | Default |
|---|---|---|
| `read` | boolean | — (all) |
| `limit` | integer | 20 |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "recovery_nudge",
      "title": "Recovery Mode Activated",
      "body": "You're 40 mins behind on Research Paper. Can you do just the intro paragraph right now?",
      "read": false,
      "commitment_id": "uuid",
      "created_at": "2026-06-29T14:30:00Z"
    }
  ],
  "unread_count": 3
}
```

### PATCH /api/notifications/:id

Mark notification as read.

**Request:**

```json
{ "read": true }
```

### POST /api/notifications/mark-all-read

Mark all as read. **Response (204).**

---

## Agent API

### POST /api/agents/execute

Manually trigger an agent execution (primarily for development/testing).

**Request:**

```json
{
  "agent": "execution",
  "commitment_id": "uuid",
  "action": "gmail_draft"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `agent` | enum | Yes | `ingestion`, `decomposition`, `execution`, `monitor` |
| `commitment_id` | UUID | Yes | — |
| `action` | enum | For execution agent | `gmail_draft`, `doc_create`, `calendar_book`, `slides_create` |

**Response (202):**

```json
{
  "message": "Agent execution queued",
  "execution_id": "uuid"
}
```

---

## Settings API

### GET /api/settings

Get user settings.

**Response (200):**

```json
{
  "working_hours_start": "09:00",
  "working_hours_end": "18:00",
  "working_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "buffer_percentage": 40,
  "theme": "dark",
  "notifications_push": true,
  "notifications_email": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "07:00",
  "google_integrations": {
    "gmail": { "status": "connected", "scopes": ["gmail.modify"] },
    "calendar": { "status": "connected", "scopes": ["calendar.events"] },
    "docs": { "status": "connected", "scopes": ["documents"] },
    "slides": { "status": "disconnected", "scopes": [] },
    "drive": { "status": "connected", "scopes": ["drive.file"] }
  }
}
```

### PATCH /api/settings

Update user settings.

**Request:**

```json
{
  "working_hours_start": "08:00",
  "working_hours_end": "17:00",
  "buffer_percentage": 30,
  "theme": "light"
}
```

---

## Health API

### GET /api/health

Public health check endpoint.

**Response (200):**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-06-29T12:00:00Z",
  "services": {
    "database": "healthy",
    "gemini": "healthy",
    "inngest": "healthy"
  }
}
```

---

*Previous: [11 — Database Schema](11_DATABASE_SCHEMA.md) · Next: [13 — Google Workspace Integration](13_GOOGLE_WORKSPACE_INTEGRATION.md)*
]]>
