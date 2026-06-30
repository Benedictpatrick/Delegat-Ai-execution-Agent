<![CDATA[# 16 — Recovery Engine

> The autonomous system that detects when commitments fall behind, activates recovery mode, re-plans tasks, and issues micro-commitment nudges.

---

## Table of Contents

- [Overview](#overview)
- [Detection Logic](#detection-logic)
- [Recovery Mode Activation](#recovery-mode-activation)
- [Re-planning Strategies](#re-planning-strategies)
- [Micro-Commitment Generation](#micro-commitment-generation)
- [Deactivation Criteria](#deactivation-criteria)
- [Analytics & Tracking](#analytics--tracking)

---

## Overview

The Recovery Engine (powered by Agent 4) is Delegat's safety net. When a user falls behind, traditional tools just show red text and overdue badges, which increases anxiety and paralysis. Delegat's Recovery Engine takes over, reduces the scope of work, and issues tiny, achievable "micro-commitments" to break the paralysis.

### The Recovery Loop

```mermaid
flowchart TD
    MONITOR[Monitor Health Score] --> DETECT{Health < 70%?}
    DETECT -->|Yes| ACTIVATE[Activate Recovery Mode]
    ACTIVATE --> REPLAN[Agent 4: Generate Recovery Plan]
    REPLAN --> DEFER[Defer Non-Essential Tasks]
    DEFER --> MICRO[Generate Micro-Commitment (≤15 min)]
    MICRO --> NUDGE[Send Actionable Nudge]
    NUDGE --> WAIT[Wait 30-60 mins for user action]
    WAIT --> MONITOR
    DETECT -->|No| NORMAL[Normal Execution]
```

---

## Detection Logic

The engine runs a cron job (via Inngest) every 15 minutes to calculate the Health Score for all active commitments.

### Trigger Conditions

Recovery Mode is activated when **Health Score falls below 70%**.

*See [04_FEATURE_SPECIFICATIONS.md#f-800-deadline-health-score](04_FEATURE_SPECIFICATIONS.md#f-800-deadline-health-score) for the calculation formula.*

---

## Recovery Mode Activation

When Recovery Mode activates:
1. Status changes to `recovery` (visual changes to UI: red accents, warning banners).
2. A NEXUS event is logged: `recovery_activated`.
3. A push notification is sent: "Recovery Mode activated for [Commitment Title]".
4. Agent 4 is triggered to generate a recovery plan.

---

## Re-planning Strategies

Agent 4 evaluates the remaining tasks and available time, and applies the following strategies:

### 1. Task Deferral

Identify tasks classified as `human_only` that are non-essential for the core deliverable.
*Example*: "Formatting the document" or "Adding secondary references".
*Action*: Status set to `deferred`.

### 2. Time Compression

Reduce estimated time for remaining tasks by up to 30%, prioritizing completion over perfection.
*Example*: "Draft section 2" (60 mins) → (45 mins).

### 3. Execution Offloading

Identify any pending `human_only` tasks that can be partially converted to `auto_executable` scaffolding.
*Example*: Instead of waiting for the user to write an email, Agent 4 triggers Agent 3 to draft it immediately.

---

## Micro-Commitment Generation

The core mechanism for breaking paralysis is the **micro-commitment nudge**.

### Rules

1. **Duration**: Maximum 15 minutes.
2. **Frequency**: Maximum 3 nudges per commitment per day.
3. **Cooldown**: Minimum 60 minutes between nudges.
4. **Tone**: Supportive, direct, anchored to progress.

### Nudge Types

| Type | Condition | Example Nudge |
|---|---|---|
| **Smallest Step** | User hasn't started any tasks | "Just open the document and write the title. That's it. (2 mins)" |
| **Progress Anchor** | User is close to a milestone | "You've done 3 of 5 sections. One more gets you past halfway! (15 mins)" |
| **Time-boxed Sprint** | Looming deadline | "We're 2 hours out. Spend exactly 10 minutes bullet-pointing the conclusion." |
| **Friction Removal** | Task requires switching context | "I created the slides draft. Just click here and add your name to the title slide." |

### Gemini Prompt for Nudges

```
You are Agent 4 (Recovery Engine). The user is falling behind on: "{{commitment_title}}".
Health Score: {{health_score}}%. Time remaining: {{time_remaining}}.
Pending tasks: {{pending_tasks}}.

Generate 1 micro-commitment nudge to send right now.
Rules:
1. Must take 15 minutes or less.
2. Must be highly actionable.
3. Tone must be encouraging, not guilt-inducing.
4. Reduce the scope of the next pending task if necessary.

Output format (JSON):
{
  "nudge_title": "Actionable subject line",
  "nudge_body": "Short, direct body text",
  "suggested_duration": 15,
  "target_task_id": "uuid"
}
```

---

## Deactivation Criteria

Recovery Mode is deactivated (returning to `active` status) when:
1. **Health Score rises ≥ 70%** for 2 consecutive checks (30 minutes).
2. Or, the commitment is marked `completed`.
3. Or, the user manually overrides via the UI ("Dismiss Recovery Mode").

When deactivated:
1. NEXUS event logged: `health_changed` ("Health improved: 72%").
2. UI returns to normal colors.

---

## Analytics & Tracking

Track the effectiveness of the Recovery Engine to improve Agent 4 prompts in V2.

| Metric | Description | Target |
|---|---|---|
| **Recovery Activation Rate** | % of commitments that enter recovery | < 30% |
| **Recovery Success Rate** | % of recovery commitments that finish on time | > 70% |
| **Nudge Conversion Rate** | % of nudges clicked/acted upon within 30 mins | > 40% |
| **Average Time in Recovery** | Duration spent in recovery mode | < 4 hours |

---

*Previous: [15 — Notification Engine](15_NOTIFICATION_ENGINE.md) · Next: [17 — Analytics & Telemetry](17_ANALYTICS_TELEMETRY.md)*
]]>
