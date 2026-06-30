<![CDATA[# 21 — Incident Response

> Playbooks for handling critical failures: database outages, LLM API downtime, Google API rate limits, and security breaches.

---

## Table of Contents

- [Incident Severity Levels](#incident-severity-levels)
- [Incident Command Structure](#incident-command-structure)
- [Playbook 1: Gemini API Outage](#playbook-1-gemini-api-outage)
- [Playbook 2: Google Workspace API Rate Limits](#playbook-2-google-workspace-api-rate-limits)
- [Playbook 3: Supabase Database Outage](#playbook-3-supabase-database-outage)
- [Playbook 4: Security Breach (Token Leak)](#playbook-4-security-breach-token-leak)
- [Post-Mortem Process](#post-mortem-process)

---

## Incident Severity Levels

| Level | Definition | Target Response Time | Example |
|---|---|---|---|
| **SEV-0** | Critical system failure affecting >50% of users. Total loss of core functionality or data breach. | 15 mins | Database down, Google tokens leaked. |
| **SEV-1** | Major failure affecting a core flow for many users. No immediate workaround. | 30 mins | Gemini API down (agents failing). |
| **SEV-2** | Partial degradation. Workaround exists or non-core feature affected. | 2 hours | Email digests delayed, specific Google API (e.g., Slides) failing. |
| **SEV-3** | Minor bug or internal tool issue. Minimal user impact. | Next business day | Analytics not tracking, typo in UI. |

---

## Incident Command Structure

For SEV-0 and SEV-1 incidents:

1. **Incident Commander (IC)**: Coordinates the response, communicates with stakeholders, manages the timeline.
2. **Lead Responder**: Investigates the root cause and implements the fix.
3. **Communications**: Updates statuspage and drafts user-facing emails (can be handled by IC in a small team).

---

## Playbook 1: Gemini API Outage

**Symptoms**: Inngest workers for Agents 1-4 failing with 500/502 errors from `generativelanguage.googleapis.com`. `agent.success_rate` drops sharply.

**Impact**: Users cannot ingest new commitments via natural language, decompose tasks, or auto-execute.

### Response Steps

1. **Verify**: Check the [Google Cloud Status Page](https://status.cloud.google.com/) for Gemini API outages.
2. **Mitigate**: 
   - Pause the affected Inngest functions via the Inngest Dashboard to prevent massive retry loops and queue buildup.
   - Enable "Manual Mode" feature flag in PostHog. This updates the UI to inform users that AI features are temporarily degraded and allows manual task creation.
3. **Monitor**: Wait for Google to resolve the outage.
4. **Recover**: 
   - Once resolved, unpause Inngest functions.
   - Monitor the queue drain to ensure rate limits aren't hit during the backlog processing.
   - Disable "Manual Mode" feature flag.

---

## Playbook 2: Google Workspace API Rate Limits

**Symptoms**: Widespread `429 Too Many Requests` errors from `googleapis.com` in Agent 3 (Execution) logs.

**Impact**: Auto-execution of Gmail drafts, Google Docs, and Calendar events is delayed or failing.

### Response Steps

1. **Verify**: Check Google Cloud Console > APIs & Services > Quotas. Identify which specific API (Gmail, Docs, Calendar) is hitting limits.
2. **Investigate**: Are we hitting per-user limits or project-wide limits? 
   - *Per-user*: Usually indicates a bug in our agent loop (e.g., trying to draft 100 emails at once).
   - *Project-wide*: Indicates massive scale. We need to request a quota increase from Google.
3. **Mitigate**:
   - If a bug: Pause the `execution.worker` in Inngest, patch the code, and redeploy.
   - If project quota: Reduce the concurrency limit on the `execution.worker` in Inngest to artificially throttle our request rate until a quota increase is granted.
4. **Communicate**: Update status page if delays are expected to exceed 1 hour.

---

## Playbook 3: Supabase Database Outage

**Symptoms**: Vercel API routes timing out or returning 500s. App fails to load. Supabase Realtime disconnects.

**Impact**: Total system failure.

### Response Steps

1. **Verify**: Check [Supabase Status](https://status.supabase.com/). Check Supabase project dashboard for CPU/Memory spikes (OOM).
2. **Investigate**:
   - If Supabase is down globally: Wait for their resolution. Update status page.
   - If our specific project is OOM (Out of Memory): We may be running inefficient queries (e.g., missing indexes) or facing a traffic spike.
3. **Mitigate (Project specific)**:
   - Temporarily scale up compute on the Supabase project settings if available.
   - Identify and kill long-running queries via `pg_stat_activity`.
   - Implement rate limiting or block abusive IPs via Vercel Edge rules.
4. **Recover**: Restart database from Supabase dashboard if necessary (last resort).

---

## Playbook 4: Security Breach (Token Leak)

**Symptoms**: Unauthorized access detected, suspicious API usage, or exposure of environment variables (e.g., accidentally committed to public GitHub).

**Impact**: Critical compromise of user data or access to user's Google accounts.

### Response Steps (SEV-0)

1. **Contain (Immediate)**:
   - Revoke the compromised keys immediately at the source (e.g., rotate Google OAuth client secret, rotate Supabase JWT secret).
   - If Google tokens are compromised, revoke them via Google Cloud Console.
2. **Lockdown**: Put the application into maintenance mode to prevent further damage.
3. **Investigate**: Determine the scope of the leak. Which users were affected? What data was accessed?
4. **Remediate**: 
   - Deploy fixes to close the vulnerability.
   - Force all users to re-authenticate (due to JWT secret rotation).
5. **Notify**: Legal and compliance teams must be notified. Draft email to affected users within 72 hours (GDPR requirement).

---

## Post-Mortem Process

For every SEV-0 and SEV-1, a post-mortem document must be written within 48 hours of resolution.

### Required Sections:

1. **Summary**: High-level overview of what happened.
2. **Impact**: How many users affected? How long was the downtime?
3. **Timeline**: Minute-by-minute log of detection, actions, and resolution.
4. **Root Cause Analysis (5 Whys)**: Deep dive into the technical or process failure.
5. **Action Items**: Concrete steps to prevent recurrence, assigned to specific owners with deadlines.

---

*Previous: [20 — Monitoring & Alerting](20_MONITORING_ALERTING.md) · Next: [22 — V2 Roadmap](22_V2_ROADMAP.md)*
]]>
