<![CDATA[# 22 — V2 Roadmap

> Future vision, planned features, architectural upgrades, and strategic direction beyond the MVP.

---

## Table of Contents

- [Vision for V2](#vision-for-v2)
- [Feature Roadmap](#feature-roadmap)
- [Architectural Upgrades](#architectural-upgrades)
- [Agent Intelligence Enhancements](#agent-intelligence-enhancements)
- [Ecosystem Integration](#ecosystem-integration)

---

## Vision for V2

Delegat MVP establishes the core loop: Input → Decompose → Execute → Monitor. 

V2 expands Delegat from a "personal task executor" into a **proactive context engine**. Instead of waiting for the user to input a commitment, Delegat V2 will live alongside the user, passively absorbing context and suggesting executions before the user even realizes they are needed.

---

## Feature Roadmap

### Q1: The Proactive Layer
- **Voice Ingestion**: Native voice memos processed instantly into structured commitments via Whisper/Gemini.
- **Slack/Discord Integration**: Mention `@delegat` in a thread to instantly turn a conversation into an executed commitment.
- **Recurring Commitments**: Advanced templating for weekly/monthly tasks with automatic scaffolding generation.

### Q2: Advanced Execution
- **Multi-step Execution**: Agent 3 chains actions (e.g., Draft email AND attach a newly created Google Doc).
- **Google Sheets Integration**: Autonomous data formatting, formula generation, and template creation.
- **Notion Integration**: Two-way sync with Notion databases for teams already using it for project management.

### Q3: Contextual Memory
- **Long-term Memory Bank**: Delegat remembers user preferences ("always format my Docs in Arial 11", "never book focus time before 10 AM").
- **Style Matching V2**: Deeper analysis of user's writing style for indistinguishable email drafts.

### Q4: Team Collaboration
- **Delegat for Teams**: Shared War Rooms for small teams.
- **Agent-to-Agent Delegation**: If Alice's Delegat needs something from Bob, it negotiates directly with Bob's Delegat to find a meeting time or request a document.

---

## Architectural Upgrades

To support the V2 roadmap, the following technical upgrades are planned:

| Component | MVP | V2 Upgrade | Rationale |
|---|---|---|---|
| **Database** | PostgreSQL (Relational) | PostgreSQL + pgvector | Enable semantic search over past commitments and long-term memory retrieval. |
| **LLM Routing** | Static (Gemini 3.5 Flash) | Dynamic Routing | Use cheaper models (Flash) for simple tasks, and heavier models (Pro) for complex writing. |
| **State Sync** | React State + Polling | Local-First (ElectricSQL/PowerSync) | Offline capability and instant UI updates without waiting for network roundtrips. |
| **Mobile** | Responsive Web | React Native (Expo) | Native push notifications, home screen widgets, and native voice integration. |

---

## Agent Intelligence Enhancements

### Agent 1 (Ingestion) -> Proactive Context
Instead of requiring explicit input, Agent 1 will eventually integrate with browser extensions to "read" the user's active context and suggest commitments ("I see you're looking at a flight booking. Should I block out travel time on your calendar?").

### Agent 2 (Decomposition) -> Calibrated Learning
Agent 2 will track the delta between its `estimated_minutes` and the user's `actual_minutes`. Over time, it trains a personal calibration model. If a user always takes 3x longer to write code than Agent 2 predicts, Agent 2 will adjust its multiplier specifically for that user.

### Agent 4 (Recovery) -> Behavioral Psychology
Agent 4 will move beyond simple time-based nudges and incorporate behavioral psychology frameworks (e.g., Fogg Behavior Model). It will learn which types of nudges (urgency vs. encouragement vs. smallest-step) work best for the specific user at specific times of day.

---

## Ecosystem Integration

While MVP focuses strictly on Google Workspace, V2 will open Delegat to the broader productivity ecosystem.

1. **Issue Trackers**: Linear, Jira, GitHub Issues.
2. **Communication**: Slack, Microsoft Teams, Discord.
3. **Knowledge Bases**: Notion, Obsidian, Roam.
4. **Developer API**: A public REST API allowing users to trigger Delegat agents programmatically via Zapier/Make.

---

*Previous: [21 — Incident Response](21_INCIDENT_RESPONSE.md) · Next: [23 — Monetization Strategy](23_MONETIZATION_STRATEGY.md)*
]]>
