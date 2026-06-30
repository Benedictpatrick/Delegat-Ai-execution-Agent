<![CDATA[# 23 — Monetization Strategy

> Business model, pricing tiers, cost analysis, and unit economics for the Delegat product.

---

## Table of Contents

- [Business Model](#business-model)
- [Pricing Tiers](#pricing-tiers)
- [Unit Economics](#unit-economics)
- [Cost Drivers](#cost-drivers)
- [Go-to-Market Expansion](#go-to-market-expansion)

---

## Business Model

Delegat operates on a **B2C SaaS subscription model** with a PLG (Product-Led Growth) motion, transitioning into B2B team sales in later stages.

The core value proposition is **time saved**. Knowledge workers spend ~2 hours a day on "work about work" (email triage, scheduling, document setup, task breakdown). Delegat reclaims this time.

---

## Pricing Tiers

| Tier | Price | Target Audience | Features | Limits |
|---|---|---|---|---|
| **Basic** (Free) | $0 / mo | Students, Casual Users | Agent 1 (Ingestion) & Agent 2 (Decomposition) | 10 active commitments<br>No auto-execution<br>No Google API sync |
| **Pro** | $15 / mo | Professionals, Founders | Full Agent Suite (Execution & Recovery), War Room, Google Workspace Integration | Unlimited commitments<br>1,000 executions/mo |
| **Team** (V2) | $25 / user/mo | Startups, Small Agencies | Shared War Rooms, Cross-team delegation, Priority Support | Centralized billing<br>Admin dashboard |

### The "Pro" Conversion Trigger
The Free tier solves the "cognitive overload" problem via Decomposition (Agent 2). However, when the user sees a task that says "Draft email" and realizes Delegat *could* do it for them but they are on the Free tier, the friction of manual execution drives the upgrade to Pro (Agent 3 Execution).

---

## Unit Economics

Analysis based on the **Pro Tier ($15/mo)**.

### Revenue
- **MRR / User**: $15.00

### Variable Costs (per active user / month)
Assuming a heavy user creating 100 commitments/month, decomposed into 500 tasks, triggering 200 executions and 400 monitor cycles.

| Service | Estimated Usage | Cost / Unit | Total Cost |
|---|---|---|---|
| **Gemini 3.5 Flash** | ~1M input tokens<br>~200K output tokens | $0.075 / 1M input<br>$0.30 / 1M output | ~$0.14 |
| **Vercel / Compute** | API requests | Pooled | ~$0.10 |
| **Supabase (DB/Auth)** | DB Reads/Writes | Pooled | ~$0.20 |
| **Inngest (Workers)** | ~1500 events/mo | Volume based | ~$0.15 |
| **Stripe Fees** | 1 transaction | 2.9% + $0.30 | $0.74 |

**Total COGS per Pro User**: ~$1.33 / month.

### Margins
- **Gross Margin**: ~91% ($13.67 / user).
- AI inference costs are extremely low due to using Gemini 3.5 Flash instead of heavier models for standard operations.

---

## Cost Drivers

1. **Gemini Token Usage**: Agent 3 (Execution) requires context (e.g., reading long email threads). Flash keeps this cheap, but context windows must be truncated (e.g., last 10 emails only) to prevent token bloat.
2. **Agent 4 Monitoring**: Running a cron job every 15 minutes per user adds compute overhead.
   - *Optimization*: Pause cron jobs for users who have no active commitments or haven't logged in for 3 days.

---

## Go-to-Market Expansion

1. **Phase 1: Prosumers & ADHD Community**
   - Delegat's Recovery Engine (Agent 4) is perfectly suited for neurodivergent professionals who struggle with executive dysfunction. This represents a highly motivated, high-retention early adopter cohort.
2. **Phase 2: Independent Consultants & Freelancers**
   - High volume of client context-switching. High willingness to pay for time-saving automation.
3. **Phase 3: B2B Teams**
   - Selling "Delegat for Teams" to streamline cross-functional project execution without needing full-time project managers.

---

*Previous: [22 — V2 Roadmap](22_V2_ROADMAP.md) · Next: [24 — Marketing Strategy](24_MARKETING_STRATEGY.md)*
]]>
