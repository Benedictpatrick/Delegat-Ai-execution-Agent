<![CDATA[# 26 — Agent Debugging Guide

> Advanced troubleshooting guide for debugging AI prompts, inspecting Inngest worker state, tracing Gemini latency, and fixing multi-agent orchestration failures.

---

## Table of Contents

- [The Agent Debugging Mindset](#the-agent-debugging-mindset)
- [Debugging Tools](#debugging-tools)
- [Common Agent Failures & Fixes](#common-agent-failures--fixes)
- [Tracing Gemini Prompts](#tracing-gemini-prompts)
- [Inspecting Inngest State](#inspecting-inngest-state)
- [Local Agent Testing](#local-agent-testing)

---

## The Agent Debugging Mindset

Traditional software debugging asks: *"Why did this function throw an error?"*
Agent debugging asks: *"Why did the LLM output this unexpected JSON?"* or *"Why did Agent 3 try to execute a task before Agent 2 finished?"*

When debugging Delegat's agents, always separate the **Orchestration Layer** (Inngest) from the **Intelligence Layer** (Gemini).
1. If the job didn't run, ran twice, or timed out → **Orchestration Issue**.
2. If the output is hallucinated, formatted incorrectly, or lacks context → **Intelligence Issue**.

---

## Debugging Tools

1. **Inngest Dev Server (`http://localhost:8288`)**: The source of truth for orchestration. View payload inputs, step-by-step execution times, and error stack traces.
2. **Google AI Studio**: Use for rapidly iterating on prompts outside the codebase.
3. **Supabase Studio (`http://127.0.0.1:54323`)**: Check the `nexus_feed` table. Delegat logs agent state changes here.

---

## Common Agent Failures & Fixes

### 1. Agent 2 (Decomposition) returns fewer tasks than expected.
- **Cause**: Gemini 3.5 Flash may aggressively summarize to save output tokens.
- **Fix**: Check the `system_instruction`. Ensure it explicitly states: `Always break down the commitment into at least 3 executable steps. Do not group distinct actions.`

### 2. Agent 3 (Execution) creates a draft with hallucinated context.
- **Cause**: Context window truncation. The email thread passed to the prompt was cut off, so Gemini invented the missing details.
- **Fix**: Inspect the prompt payload. If the token count exceeds the safe limit, implement a sliding window summarizing older emails before passing to Agent 3.

### 3. "JSON parse error" on Gemini output.
- **Cause**: The model returned conversational text wrapping the JSON (e.g., "Here is your JSON: {...}").
- **Fix**: We use `responseMimeType: "application/json"`. If it still fails, ensure the prompt explicitly forbids conversational wrappers. Check the fallback regex parser in `src/lib/agents/utils.ts`.

### 4. Agent 1 (Ingestion) triggers multiple times for one input.
- **Cause**: The client sent multiple POST requests (e.g., user mashed the submit button).
- **Fix**: Inngest automatically deduplicates events if an `id` is provided in the event payload. Ensure the client generates a unique idempotency key for the request.

---

## Tracing Gemini Prompts

When an agent behaves weirdly, you need to see *exactly* what was sent to the model.

In development mode, Delegat logs all raw prompts and responses to the console.

```typescript
// Enable verbose AI logging in .env.local
DEBUG_AI=true
```

Look for this output in your terminal:
```text
[AGENT 2: DECOMPOSITION] 
>>> RAW PROMPT:
{
  "contents": [{ "role": "user", "parts": [{ "text": "Plan my flight to NYC..." }] }],
  "systemInstruction": "You are a decomposition agent..."
}
<<< RAW RESPONSE (850ms):
{
  "tasks": [...]
}
```

Copy the RAW PROMPT directly into Google AI Studio to test variations of the instruction.

---

## Inspecting Inngest State

If an agent process is hanging or failing silently, open the Inngest Dev Server (`http://localhost:8288`).

1. Navigate to the **Runs** tab.
2. Find the stalled run (e.g., `delegat/agent.execute`).
3. Look at the **Timeline**. Inngest breaks functions down by `step.run()`.
4. If a step is marked `Failed`, click it to see the exact Exception. 
5. If a step is retrying, Inngest will show the exponential backoff timer.

### Forcing a Replay

If you fix a bug in your agent code locally, you can **Replay** a failed event directly from the Inngest UI. You do not need to recreate the commitment in the app.

---

## Local Agent Testing

To test agents without clicking through the UI, use the provided CLI test script.

```bash
# Test Agent 1 (Ingestion) isolation
pnpm run test:agent1 "I need to renew my passport by next Friday"

# Test Agent 2 (Decomposition) isolation
pnpm run test:agent2 "uuid-of-existing-commitment"
```

These scripts bypass the API routes and invoke the agent logic directly, outputting the raw JSON result. See `scripts/test-agents.ts` for implementation details.

---

*Previous: [25 — Developer Onboarding](25_DEVELOPER_ONBOARDING.md) · **End of Documentation***
]]>
