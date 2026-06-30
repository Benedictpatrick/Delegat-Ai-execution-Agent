<![CDATA[# 20 — Monitoring & Alerting

> System observability, log aggregation, performance metrics, and incident alerting for the production environment.

---

## Table of Contents

- [Observability Stack](#observability-stack)
- [Key Metrics to Monitor](#key-metrics-to-monitor)
- [Alerting Rules](#alerting-rules)
- [Log Aggregation](#log-aggregation)
- [Agent Specific Monitoring](#agent-specific-monitoring)
- [Dashboards](#dashboards)

---

## Observability Stack

We use a modern, lightweight observability stack suitable for a Next.js / Vercel application.

| Component | Tool | Purpose |
|---|---|---|
| **APM & Error Tracking** | **Sentry** | Catch unhandled exceptions (Frontend + Backend) |
| **Log Aggregation** | **Axiom** / **Datadog** | Centralize Vercel and Inngest logs |
| **Uptime Monitoring** | **BetterStack** (Uptime) | Ping `/api/health` every minute |
| **Agent Metrics** | **Inngest Dashboard** | Monitor background job success/failure |
| **Web Vitals** | **Vercel Analytics** | Track LCP, FID, CLS for real users |

---

## Key Metrics to Monitor

### 1. Infrastructure Metrics (Vercel + Supabase)

- **API Route Latency**: Target < 250ms p95.
- **Vercel 4xx/5xx Error Rates**: Target < 1% of total requests.
- **Supabase CPU/Memory Usage**: Alert if > 80% sustained.
- **Supabase Connection Pool**: Alert if > 80% utilized.

### 2. Application Metrics (Inngest + Sentry)

- **Inngest Event Backlog**: Measure queue depth. Target < 100 pending events.
- **Inngest Function Failures**: Alert on terminal failures (after max retries).
- **New Sentry Issues**: Alert on newly introduced exceptions after a deployment.

### 3. Agent Metrics (Gemini)

- **Gemini API Error Rate**: Alert if Gemini returns > 5% 5xx errors.
- **Agent 4 (Recovery) Trigger Rate**: High volume may indicate system-wide estimation issues.

---

## Alerting Rules

Alerts are routed to a dedicated Slack/Discord channel (`#alerts-prod`). Critical alerts also page the on-call engineer.

### P0 (Critical - Pager)

| Alert Name | Condition | Routing |
|---|---|---|
| **API Down** | `/api/health` fails for 2 consecutive minutes | PagerDuty |
| **High 5xx Rate** | > 5% of API requests return 5xx over 5 mins | PagerDuty |
| **Database Unreachable** | Connection timeouts > 10 in 1 minute | PagerDuty |

### P1 (High - Slack Notification)

| Alert Name | Condition | Routing |
|---|---|---|
| **Agent Queue Backup** | > 500 pending Inngest events | Slack |
| **High Agent Failure** | > 10% terminal failures in Inngest over 15 mins | Slack |
| **Gemini Rate Limiting** | > 50 `429` responses from Gemini in 5 mins | Slack |
| **Google API Auth Failures** | > 5% of users failing Google token refresh | Slack |

### P2 (Warning - Daily Digest)

| Alert Name | Condition | Routing |
|---|---|---|
| **Slow API Routes** | p95 latency > 1000ms for 1 hour | Slack (Daily) |
| **Elevated 4xx Rate** | > 5% 4xx (usually client errors/auth) | Slack (Daily) |

---

## Log Aggregation

Vercel log drains automatically forward all `console.log`, `console.warn`, and `console.error` output to the logging provider (Axiom/Datadog).

### Logging Standard

Always log structured JSON from the backend.

```typescript
// Good
console.info(JSON.stringify({
  event: 'commitment_decomposed',
  commitmentId: '123',
  taskCount: 8,
  durationMs: 450
}));

// Bad
console.log(`Decomposed commitment 123 into 8 tasks in 450ms`);
```

---

## Agent Specific Monitoring

Because Delegat relies heavily on asynchronous agents, we must monitor them distinctly from standard HTTP APIs.

### Inngest Dashboard

Use the Inngest cloud dashboard to monitor:
1. **Function Runs**: Total volume of Ingestion, Decomposition, Execution, and Monitor jobs.
2. **Retries**: A high retry rate indicates flakiness (usually Google/Gemini API timeouts).
3. **Step Durations**: Monitor which specific step inside a worker is slow (e.g., `extract-with-gemini` vs `update-db`).

---

## Dashboards

Create a central dashboard (in Datadog or Grafana) for the War Room during the hackathon/launch.

### "Launch Day" Dashboard Widgets

1. **Active Users**: Real-time count of connected Supabase Realtime clients.
2. **Commitments Created / Min**: Velocity of user adoption.
3. **Agent Success Rate**: Green/Red gauge showing % of agent runs completing without error.
4. **Error Log Stream**: Live feed of Sentry exceptions.
5. **API Latency**: Time-series graph of p50 and p95 latency.

---

*Previous: [19 — Deployment Pipeline](19_DEPLOYMENT_PIPELINE.md) · Next: [21 — Incident Response](21_INCIDENT_RESPONSE.md)*
]]>
