<![CDATA[# 17 — Analytics & Telemetry

> Product analytics, performance telemetry, user behavior tracking, and agent success metrics.

---

## Table of Contents

- [Analytics Strategy](#analytics-strategy)
- [Event Taxonomy](#event-taxonomy)
- [Agent Telemetry](#agent-telemetry)
- [Performance Metrics](#performance-metrics)
- [Implementation](#implementation)
- [Privacy & Compliance](#privacy--compliance)

---

## Analytics Strategy

Analytics in Delegat serve three purposes:
1. **Product Health**: Are users successfully creating and completing commitments?
2. **Agent Efficacy**: Are the autonomous agents actually saving time?
3. **Recovery Success**: Does the Recovery Engine prevent missed deadlines?

**Tooling**: Use **PostHog** for product analytics, session recording, and feature flags.

---

## Event Taxonomy

All events follow the `[noun]_[action]` format.

### Core User Events

| Event Name | Properties | Triggered When |
|---|---|---|
| `user_signed_up` | `provider` (google) | First login |
| `onboarding_completed` | `duration_seconds` | User finishes onboarding wizard |
| `commitment_created` | `source_type` (text/email), `has_deadline`, `type` | User creates a commitment |
| `commitment_completed` | `health_score_final`, `tasks_total`, `days_active` | User completes a commitment |
| `task_completed` | `execution_type` (human/auto), `duration_mins` | User checks off a task |
| `war_room_viewed` | `active_commitments`, `health_score` | User navigates to War Room |
| `settings_updated` | `setting_changed` | User updates preferences |

### Feature Usage

| Event Name | Properties | Triggered When |
|---|---|---|
| `nexus_action_clicked` | `action_type`, `link_destination` | User clicks a link in the NEXUS feed |
| `command_palette_used` | `command_type` | User executes action via Cmd+K |
| `recovery_nudge_clicked` | `nudge_type` | User clicks a micro-commitment notification |
| `google_integration_connected` | `service` (gmail/docs/cal) | User grants OAuth scope |

---

## Agent Telemetry

Track the autonomous actions to prove value and optimize prompts.

| Event Name | Properties | Purpose |
|---|---|---|
| `agent_ingestion_success` | `input_length`, `confidence`, `duration_ms` | Track Agent 1 accuracy |
| `agent_decomposition_success` | `task_count`, `confidence`, `duration_ms` | Track Agent 2 accuracy |
| `agent_execution_success` | `action_type` (gmail/docs/cal), `duration_ms` | Track Agent 3 scaffolding |
| `agent_recovery_activated` | `health_score_at_trigger`, `commitment_id` | Track Agent 4 triggers |
| `agent_error` | `agent_name`, `error_type`, `retry_count` | Track AI failures |

**Value Metric**: Calculate "Time Saved" by summing the estimated duration of all `auto_executable` tasks completed by Agent 3. Display this to the user in the Analytics tab.

---

## Performance Metrics

Tracked via Next.js Web Vitals and custom APM (e.g., Sentry or Datadog).

| Metric | Target | Warning |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | > 4.0s |
| **FID** (First Input Delay) | < 100ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | > 0.25 |
| **API Latency** (Read) | < 200ms | > 500ms |
| **Agent Latency** (Gemini) | < 3000ms | > 8000ms |
| **Inngest Queue Delay** | < 100ms | > 1000ms |

---

## Implementation

### PostHog Setup

```typescript
// src/lib/analytics.ts
import posthog from 'posthog-js';

export function initAnalytics() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing();
      },
    });
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits);
  }
}
```

---

## Privacy & Compliance

1. **No PII in events**: Never send email addresses, names, or raw commitment content (titles, descriptions) to PostHog.
2. **Anonymization**: Hash IDs if sending to third-party dashboards.
3. **Opt-out**: Provide a toggle in Settings for users to opt-out of telemetry (respect DNT header).
4. **GDPR**: Event data must be deleted when a user requests account deletion.

---

*Previous: [16 — Recovery Engine](16_RECOVERY_ENGINE.md) · Next: [18 — Error Handling](18_ERROR_HANDLING.md)*
]]>
