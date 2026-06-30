<![CDATA[# 03 — User Journeys

> Complete workflow documentation for every user interaction in Delegat, including sequence diagrams, edge cases, and error handling.

---

## Table of Contents

- [Journey Map Overview](#journey-map-overview)
- [J1: Landing Page Discovery](#j1-landing-page-discovery)
- [J2: Authentication — Google OAuth](#j2-authentication--google-oauth)
- [J3: Onboarding](#j3-onboarding)
- [J4: Connecting Google Workspace](#j4-connecting-google-workspace)
- [J5: Creating a Commitment](#j5-creating-a-commitment)
- [J6: Viewing the Dashboard](#j6-viewing-the-dashboard)
- [J7: Using the War Room](#j7-using-the-war-room)
- [J8: Monitoring Progress](#j8-monitoring-progress)
- [J9: Recovery Mode](#j9-recovery-mode)
- [J10: Completing Work](#j10-completing-work)
- [J11: Reviewing Autonomous Actions](#j11-reviewing-autonomous-actions)
- [J12: Using Command Palette](#j12-using-command-palette)
- [J13: Managing Settings](#j13-managing-settings)
- [Error Scenarios](#error-scenarios)

---

## Journey Map Overview

```mermaid
graph LR
    LAND[Landing Page] --> AUTH[Google OAuth]
    AUTH --> ONBOARD[Onboarding]
    ONBOARD --> CONNECT[Connect Google APIs]
    CONNECT --> DASH[Dashboard]
    DASH --> CREATE[Create Commitment]
    CREATE --> DECOMP[Auto-Decomposition]
    DECOMP --> EXEC[Auto-Execution]
    EXEC --> WARROOM[War Room]
    WARROOM --> MONITOR[Monitoring]
    MONITOR -->|Health ≥ 70%| COMPLETE[Complete]
    MONITOR -->|Health < 70%| RECOVER[Recovery Mode]
    RECOVER --> MONITOR
```

---

## J1: Landing Page Discovery

### Overview

| Attribute | Value |
|---|---|
| **Entry Points** | Direct URL, search, social share, hackathon page |
| **Goal** | Understand what Delegat does and sign up |
| **Success Metric** | Visitor → Google OAuth click (conversion rate) |
| **Target Time** | < 60 seconds from landing to clicking "Sign in" |

### User Flow

```mermaid
sequenceDiagram
    actor User
    participant LP as Landing Page
    participant CTA as Sign Up CTA

    User->>LP: Arrives at delegat.app
    LP->>User: Shows hero: "The AI Execution Agent"
    LP->>User: Shows problem statement (3 failure modes)
    LP->>User: Shows live demo animation of War Room
    LP->>User: Shows "How it works" (4 agents)
    LP->>User: Shows comparison table (vs Todoist, Motion, etc.)
    LP->>User: Shows social proof / hackathon badge
    User->>CTA: Clicks "Start Executing — Sign in with Google"
    CTA->>User: Redirects to Google OAuth
```

### Page Sections (Scroll Order)

| Section | Content | Purpose |
|---|---|---|
| **Hero** | "The AI Execution Agent" + tagline + CTA | Immediate hook |
| **Problem** | 3 failure modes with visual icons | Emotional resonance |
| **Solution** | 4-agent architecture with animations | Understanding |
| **Demo** | War Room screenshot/animation showing live data | Credibility |
| **How It Works** | Step-by-step: Input → Decompose → Execute → Monitor | Clarity |
| **Comparison** | Feature matrix vs. Todoist, Notion, Motion, Reclaim | Differentiation |
| **Testimonials** | Early user quotes or hackathon judge feedback | Social proof |
| **CTA** | "Start Executing — Sign in with Google" (repeated) | Conversion |
| **Footer** | Links to docs, GitHub, privacy policy, about | Trust |

### Edge Cases

| Scenario | Behavior |
|---|---|
| User visits on mobile | Responsive layout. CTA always visible. |
| User visits without JavaScript | Server-rendered content is readable. CTA works as standard link. |
| User visits from non-supported browser | Show browser requirement banner with specific versions. |
| User bookmarks the landing page | Opens to landing page. If already logged in, redirect to dashboard. |

---

## J2: Authentication — Google OAuth

### Overview

| Attribute | Value |
|---|---|
| **Flow** | Google OAuth 2.0 with PKCE via Supabase Auth |
| **Goal** | Authenticate user and obtain Google Workspace tokens |
| **Scopes Requested** | `email`, `profile`, `gmail.modify`, `calendar.events`, `documents`, `presentations`, `drive.file` |
| **Success Metric** | OAuth completion rate ≥ 80% |

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant App as Delegat App
    participant Supa as Supabase Auth
    participant Google as Google OAuth

    User->>App: Clicks "Sign in with Google"
    App->>Supa: supabase.auth.signInWithOAuth({ provider: 'google', scopes })
    Supa->>Google: Redirect to accounts.google.com/o/oauth2/v2/auth
    Google->>User: Shows consent screen with requested scopes
    
    alt User grants all scopes
        User->>Google: Clicks "Allow"
        Google->>Supa: Redirect with authorization code
        Supa->>Google: Exchange code for tokens (access + refresh)
        Supa->>Supa: Create/update user record
        Supa->>Supa: Store encrypted tokens
        Supa->>App: Redirect to /dashboard with session
        App->>User: Shows dashboard (or onboarding for new users)
    end

    alt User denies some scopes
        User->>Google: Unchecks Gmail, grants Calendar + Docs
        Google->>Supa: Redirect with partial scopes
        Supa->>App: Redirect to /dashboard
        App->>User: Shows dashboard with scope warning banner
        App->>User: "Gmail not connected — email features unavailable"
    end

    alt User cancels OAuth
        User->>Google: Clicks "Cancel"
        Google->>App: Redirect with error=access_denied
        App->>User: Shows landing page with "Sign in cancelled" message
    end
```

### Token Management

```mermaid
sequenceDiagram
    participant Agent as Agent 3 (Execution)
    participant TokenSvc as Token Service
    participant DB as Supabase DB
    participant Google as Google API

    Agent->>TokenSvc: getValidToken(userId)
    TokenSvc->>DB: Read encrypted token
    TokenSvc->>TokenSvc: Decrypt token
    
    alt Token is valid (not expired)
        TokenSvc->>Agent: Return access token
    end
    
    alt Token is expired
        TokenSvc->>Google: POST /token (refresh_token)
        Google->>TokenSvc: New access token + expiry
        TokenSvc->>DB: Store new encrypted token
        TokenSvc->>Agent: Return new access token
    end

    alt Refresh token revoked
        Google->>TokenSvc: 401 invalid_grant
        TokenSvc->>DB: Mark connection as "disconnected"
        TokenSvc->>Agent: Throw ReauthRequiredError
        Agent->>Agent: Queue execution for retry after reauth
    end
```

### Edge Cases

| Scenario | Behavior |
|---|---|
| User already has a Supabase account (repeat login) | Merge tokens, redirect to dashboard |
| User revokes access in Google Account settings | Next API call fails → mark as disconnected → show re-auth prompt |
| Access token expires mid-execution | Auto-refresh before each Google API call (5-minute buffer) |
| User signs in from a new device | New session created; existing sessions remain valid |
| Google OAuth is temporarily unavailable | Show error: "Google login unavailable. Please try again in a few minutes." |
| User's Google account is suspended | OAuth returns error → show: "Unable to sign in. Contact Google support." |

---

## J3: Onboarding

### Overview

| Attribute | Value |
|---|---|
| **Trigger** | First-time user completes OAuth |
| **Steps** | 4-step wizard |
| **Goal** | User creates their first commitment within 2 minutes |
| **Success Metric** | Onboarding completion rate ≥ 70% |
| **Skip Option** | Available at every step |

### Onboarding Flow

```mermaid
sequenceDiagram
    actor User
    participant Onboard as Onboarding Wizard

    Note over User,Onboard: Step 1 — Welcome
    Onboard->>User: "Welcome to Delegat! You focus on thinking. We handle execution."
    Onboard->>User: Shows 15-second animation of the 4-agent pipeline
    User->>Onboard: Clicks "Next"

    Note over User,Onboard: Step 2 — Working Hours
    Onboard->>User: "When do you work?"
    Onboard->>User: Time picker: start=9:00am, end=6:00pm (pre-filled)
    Onboard->>User: Timezone auto-detected from browser
    User->>Onboard: Adjusts hours, clicks "Next"

    Note over User,Onboard: Step 3 — Scope Confirmation
    Onboard->>User: "Delegat can access:"
    Onboard->>User: ✅ Gmail — Draft replies, ✅ Calendar — Book focus time
    Onboard->>User: ✅ Docs — Create skeletons, ✅ Slides — Create outlines
    Onboard->>User: Shows what each scope does with examples
    User->>Onboard: Reviews, clicks "Looks Good"

    Note over User,Onboard: Step 4 — First Commitment
    Onboard->>User: "What's one thing you need to get done?"
    Onboard->>User: Text input with placeholder: "e.g., Research paper due Friday"
    User->>Onboard: Types commitment
    Onboard->>User: Shows live decomposition happening
    Onboard->>User: "🎉 Your first commitment is set up!"
    User->>Onboard: Clicks "Go to Dashboard"
```

### Step Details

| Step | Required | Default | Skip Behavior |
|---|---|---|---|
| Welcome | No | — | Skip to Step 2 |
| Working Hours | Yes | 9am–6pm, browser timezone | Uses defaults |
| Scope Confirmation | No | All scopes granted during OAuth | Skip to Step 4 |
| First Commitment | No | — | Dashboard opens empty |

### Edge Cases

| Scenario | Behavior |
|---|---|
| User refreshes during onboarding | Resume at current step (state stored in localStorage) |
| User closes browser during onboarding | Next login resumes onboarding |
| User already completed onboarding (repeat login) | Skip onboarding, go directly to dashboard |
| User skips all steps | Dashboard opens with empty state + helpful prompt |

---

## J4: Connecting Google Workspace

### Overview

Google Workspace connections are established during the initial OAuth flow. This journey covers the management and re-authorization scenarios.

### Connection Status

```mermaid
stateDiagram-v2
    [*] --> Connected: OAuth grants scope
    Connected --> Active: Token valid
    Active --> Expired: Access token expires
    Expired --> Active: Auto-refresh succeeds
    Expired --> Disconnected: Refresh fails (revoked)
    Disconnected --> Connected: User re-authorizes
    Connected --> Disconnected: User revokes in Settings
```

### Settings → Integrations Page

| API | Status Display | Actions |
|---|---|---|
| Gmail | `✅ Connected` or `❌ Not connected` | Disconnect / Reconnect |
| Calendar | `✅ Connected` or `❌ Not connected` | Disconnect / Reconnect |
| Google Docs | `✅ Connected` or `❌ Not connected` | Disconnect / Reconnect |
| Google Slides | `✅ Connected` or `❌ Not connected` | Disconnect / Reconnect |
| Google Drive | `✅ Connected` or `❌ Not connected` | Disconnect / Reconnect |

### Edge Cases

| Scenario | Behavior |
|---|---|
| User disconnects Gmail | Email-related features show "Gmail required" prompts. Existing drafts remain in Gmail. |
| User reconnects after disconnecting | Triggers re-auth flow for that specific scope. Resumes queued executions. |
| User's Google Workspace admin blocks the app | All Google APIs fail → show: "Your organization's admin has blocked Delegat. Contact your IT admin." |
| Token refresh rate-limited by Google | Queue refresh requests, use last valid token until limit resets |

---

## J5: Creating a Commitment

### Overview

| Attribute | Value |
|---|---|
| **Input Methods** | Text input, email paste, screenshot upload, command palette |
| **Processing** | Agent 1 (Ingestion) → Agent 2 (Decomposition) → Agent 3 (Execution) |
| **Success Metric** | Commitment created with ≥ 3 sub-tasks within 10 seconds |

### Primary Flow — Text Input

```mermaid
sequenceDiagram
    actor User
    participant UI as Dashboard
    participant API as API Route
    participant A1 as Agent 1 (Ingestion)
    participant Gemini as Gemini 3.5 Flash
    participant A2 as Agent 2 (Decomposition)
    participant A3 as Agent 3 (Execution)
    participant DB as Supabase
    participant Inngest as Inngest

    User->>UI: Types "Research paper on ML due Friday"
    UI->>API: POST /api/commitments { text: "..." }
    API->>DB: Create commitment (status: "processing")
    API->>Inngest: Send event "commitment.created"
    API->>UI: 201 { id, status: "processing" }
    UI->>User: Shows commitment card with spinner

    Inngest->>A1: Process "commitment.created" event
    A1->>Gemini: Extract: title, deadline, type, dependencies
    Gemini->>A1: { title: "Research paper on ML", deadline: "Friday 11:59pm", type: "academic_writing", dependencies: [] }
    A1->>DB: Update commitment with structured data
    DB-->>UI: Realtime update → commitment card shows title + deadline

    A1->>Inngest: Send event "commitment.ingested"
    Inngest->>A2: Process "commitment.ingested" event
    A2->>Gemini: Decompose into sub-tasks with time estimates
    Gemini->>A2: [ { title: "Literature search", duration: 45, type: "research" }, { title: "Create outline", duration: 30, type: "writing" }, ... ]
    A2->>DB: Create sub-tasks linked to commitment
    DB-->>UI: Realtime update → sub-tasks appear

    A2->>Inngest: Send event "commitment.decomposed"
    Inngest->>A3: Process "commitment.decomposed" event
    A3->>A3: Execute auto-executable tasks (see J11)

    UI->>User: Full commitment card with sub-tasks, timeline, executions
```

### Alternative Flow — Email Paste

```mermaid
sequenceDiagram
    actor User
    participant UI as Dashboard
    participant A1 as Agent 1 (Ingestion)
    participant Gemini as Gemini 3.5 Flash

    User->>UI: Pastes email text into commitment input
    UI->>UI: Detects email format (headers, greeting, signature)
    UI->>A1: Process as email input
    A1->>Gemini: Extract commitment from email context
    Gemini->>A1: { title, deadline, sender, subject, required_actions, urgency }
    A1->>A1: Flag for Gmail draft execution (original email context available)
    Note over A1: Continue to decomposition + execution as above
```

### Alternative Flow — Screenshot Upload

```mermaid
sequenceDiagram
    actor User
    participant UI as Dashboard
    participant A1 as Agent 1 (Ingestion)
    participant Gemini as Gemini Vision

    User->>UI: Clicks upload icon or drags image
    UI->>UI: Validates image (size < 10MB, format: PNG/JPG/WebP)
    UI->>A1: Process as multimodal input
    A1->>Gemini: Send image + prompt: "Extract commitments from this image"
    Gemini->>A1: { commitments: [{ title, deadline, context }] }
    A1->>A1: If multiple commitments found, create each separately
    Note over A1: Continue to decomposition + execution per commitment
```

### Edge Cases

| Scenario | Behavior |
|---|---|
| **Ambiguous deadline** ("soon", "ASAP") | Gemini assigns `deadline: null`. User prompted: "When is this due?" |
| **No deadline mentioned** | Commitment created with no deadline. Shown in dashboard but not in timeline/risk. User prompted to add deadline. |
| **Past deadline** | Warning: "This deadline has passed. Would you like to set a new deadline?" |
| **Duplicate commitment** | Gemini compares against existing commitments. If >80% similar: "This looks similar to [existing]. Create anyway?" |
| **Very large commitment** | If decomposition yields >30 sub-tasks, suggest splitting: "This is a large commitment. Split into [X] and [Y]?" |
| **Gemini timeout** | After 10s, show: "AI is taking longer than usual. Commitment saved — we'll process it shortly." Queue for retry. |
| **Gemini rate limit hit** | Queue the request. Show: "Processing queued. You'll see sub-tasks shortly." |
| **Empty input** | Validation prevents submission. Input border turns red. |
| **Input > 5000 characters** | Truncate with warning: "Input shortened to 5000 characters." |

---

## J6: Viewing the Dashboard

### Overview

The dashboard is the primary view after login. It shows all active commitments, the health score summary, and quick-access actions.

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Sidebar (240px)  │           Main Content             │
│                   │                                    │
│  🏠 Dashboard     │  ┌──────────────────────────────┐  │
│  ⚔️ War Room      │  │   Deadline Health Score: 84%  │  │
│  🎯 Risk Radar    │  │   ████████████░░░░  Overall   │  │
│  📅 Calendar      │  └──────────────────────────────┘  │
│  📊 Analytics     │                                    │
│  ⚙️ Settings      │  ┌──────────────────────────────┐  │
│                   │  │   Today's Commitments (3)     │  │
│                   │  │   ├── Research paper   🟢 92% │  │
│                   │  │   ├── Client email     🟢 85% │  │
│                   │  │   └── Slide deck       🟡 65% │  │
│                   │  └──────────────────────────────┘  │
│                   │                                    │
│                   │  ┌──────────────────────────────┐  │
│                   │  │   NEXUS Activity Feed         │  │
│                   │  │   ✅ Drafted reply to John     │  │
│                   │  │   ✅ Booked 3 focus blocks     │  │
│                   │  │   ✅ Created Research Doc       │  │
│                   │  └──────────────────────────────┘  │
│                   │                                    │
│  + New Commitment │  ┌──────────────────────────────┐  │
│                   │  │   Upcoming Deadlines           │  │
│    Cmd+K          │  │   Tomorrow: Client email      │  │
│                   │  │   Wednesday: Research paper    │  │
│                   │  │   Friday: Slide deck           │  │
│                   │  └──────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### States

| State | Condition | Display |
|---|---|---|
| **Loading** | Data fetching | Skeleton cards with pulse animation |
| **Empty** | No commitments | "No commitments yet. What do you need to get done?" + large input |
| **Active** | 1+ commitments | Full dashboard with health score, commitments, NEXUS |
| **All Complete** | 0 active, 1+ completed | "🎉 All caught up!" + completed commitments list |
| **Error** | API failure | "Something went wrong. Retrying..." + retry button |

---

## J7: Using the War Room

### Overview

The War Room is the real-time command center — designed to be dramatic and immediately legible.

### War Room Flow

```mermaid
sequenceDiagram
    actor User
    participant WR as War Room
    participant RT as Supabase Realtime
    participant DB as Supabase DB

    User->>WR: Navigates to /war-room
    WR->>DB: Fetch today's tasks, health score, risk data
    DB->>WR: Returns current state
    WR->>User: Renders War Room with all components
    WR->>RT: Subscribe to changes (tasks, health, risk)

    loop Every realtime update
        RT->>WR: Task status changed
        WR->>WR: Animate health score transition
        WR->>WR: Update timeline blocks
        WR->>WR: Recalculate risk positions
        WR->>User: Smooth animated updates
    end

    User->>WR: Clicks on at-risk commitment in Risk Radar
    WR->>User: Opens commitment detail with sub-tasks and recovery options
    User->>WR: Marks sub-task as complete
    WR->>DB: Update task status
    DB-->>RT: Broadcast change
    RT->>WR: Health score recalculated and animated
```

### War Room Components

| Component | Update Frequency | Data Source |
|---|---|---|
| **Deadline Health Score** | Real-time (on every task change) | Calculated from velocity + time remaining |
| **Today's Timeline** | Real-time | Tasks with today's schedule slots |
| **Risk Radar** | Real-time | All commitments with risk scores |
| **NEXUS Feed** | Real-time (append-only) | Execution logs from Agent 3 |

---

## J8: Monitoring Progress

### Progress Tracking Flow

```mermaid
sequenceDiagram
    participant Cron as Scheduled Check (every 15 min)
    participant A4 as Agent 4 (Monitor)
    participant DB as Supabase
    participant Gemini as Gemini 3.5 Flash
    participant Notif as Notification Engine

    Cron->>A4: Trigger velocity check
    A4->>DB: Fetch all active commitments + task completion data
    DB->>A4: Returns commitment/task state

    A4->>A4: Calculate per-commitment velocity
    A4->>A4: Calculate Deadline Health Score
    A4->>DB: Update health scores

    alt Health Score ≥ 70%
        A4->>A4: Status: On Track. No action needed.
    end

    alt Health Score 40-69%
        A4->>Notif: Send amber warning notification
        Notif->>Notif: "⚠️ [Commitment] is falling behind. Consider re-planning."
    end

    alt Health Score < 40%
        A4->>Gemini: Generate recovery plan
        A4->>DB: Activate recovery mode
        A4->>Notif: Send critical notification
        Note over A4: See J9: Recovery Mode
    end
```

### Health Score Calculation

```
Health Score = weighted_average(
    time_factor     × 0.4,   // time_remaining / time_needed
    velocity_factor × 0.3,   // actual_velocity / planned_velocity
    completion_factor × 0.2, // tasks_completed / total_tasks
    dependency_factor × 0.1  // blocked_tasks / total_tasks (inverse)
)

Where:
  time_factor = max(0, min(100, (hours_remaining / hours_needed) × 100))
  velocity_factor = max(0, min(100, (tasks_completed_last_24h / tasks_planned_last_24h) × 100))
  completion_factor = (tasks_completed / total_tasks) × 100
  dependency_factor = max(0, 100 - (blocked_tasks / total_tasks) × 100)
```

---

## J9: Recovery Mode

### Overview

| Attribute | Value |
|---|---|
| **Trigger** | Deadline Health Score drops below 70% |
| **Goal** | Get the user back on track through re-planning and micro-commitments |
| **Exit** | Health Score rises above 70% for 2 consecutive checks |

### Recovery Flow

```mermaid
sequenceDiagram
    actor User
    participant A4 as Agent 4 (Monitor)
    participant Gemini as Gemini 3.5 Flash
    participant DB as Supabase
    participant Notif as Notification Engine
    participant Cal as Google Calendar

    A4->>A4: Health Score = 65% (below 70%)
    A4->>DB: Set commitment status = "recovery"
    A4->>Gemini: Generate recovery plan
    
    Gemini->>A4: Recovery plan: {
    Note over Gemini,A4: defer: ["Final formatting", "References cleanup"],
    Note over Gemini,A4: compress: ["Draft intro" → 20min instead of 30min],
    Note over Gemini,A4: micro_tasks: ["Write just the thesis statement (10 min)"]
    Note over Gemini,A4: }

    A4->>DB: Update task list (defer non-essential, compress timelines)
    A4->>Cal: Re-book calendar with compressed schedule
    A4->>Notif: Push micro-commitment nudge

    Notif->>User: "You're 40 mins behind on [Research Paper]. Can you just write the thesis statement right now? (10 min)"

    alt User completes micro-task
        User->>DB: Marks task complete
        A4->>A4: Recalculate Health Score = 73%
        A4->>DB: Exit recovery mode (score > 70% for 2 checks)
        A4->>Notif: "🟢 Back on track! Health Score: 73%"
    end

    alt User ignores nudge
        A4->>A4: Wait 30 minutes
        A4->>Notif: Second nudge: "Hey, even 5 minutes on [commitment] helps. Start with opening the doc."
        Note over A4: Max 3 nudges per commitment per day
    end
```

### Micro-Commitment Rules

| Rule | Value | Rationale |
|---|---|---|
| Maximum task duration | 15 minutes | Must feel achievable |
| Maximum nudges per commitment per day | 3 | Don't become annoying |
| Minimum interval between nudges | 30 minutes | Respect user's flow |
| Nudge during quiet hours | Never | Respect user's boundaries |
| Nudge tone | Supportive, not guilt-inducing | Behavioral science: positive framing works better |

---

## J10: Completing Work

### Completion Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Dashboard
    participant DB as Supabase
    participant A4 as Agent 4 (Monitor)
    participant Notif as Notification Engine

    User->>UI: Marks final sub-task as complete
    UI->>DB: Update task status = "completed"
    DB->>A4: Trigger commitment evaluation

    A4->>A4: All sub-tasks completed?
    
    alt All tasks complete
        A4->>DB: Set commitment status = "completed"
        A4->>DB: Record completion_time, total_time_spent, health_score_at_completion
        A4->>Notif: "🎉 [Research Paper] completed! 2 hours ahead of deadline."
        DB-->>UI: Realtime update → Commitment card shows celebration animation
        UI->>User: Confetti animation + completion stats
    end

    alt Some tasks remaining
        A4->>DB: Update health score (improved)
        DB-->>UI: Realtime update → health score animation
    end
```

### Completion Stats Displayed

| Stat | Description |
|---|---|
| **Completed** | Date and time |
| **Total time spent** | Actual hours vs. estimated hours |
| **Ahead/behind schedule** | Hours ahead or behind the original deadline |
| **Tasks completed** | X of Y sub-tasks |
| **Autonomous executions** | N actions taken by Delegat |
| **Recovery episodes** | Number of times recovery mode activated |
| **Accuracy** | How close the AI time estimates were |

---

## J11: Reviewing Autonomous Actions

### Overview

Every action taken by Agent 3 (Execution) appears in the NEXUS Activity Feed and is reviewable.

### Review Flow

```mermaid
sequenceDiagram
    actor User
    participant NEXUS as NEXUS Feed
    participant Detail as Action Detail
    participant Gmail as Gmail

    NEXUS->>User: "✅ Drafted reply to john@acme.com"
    User->>NEXUS: Clicks on the action
    NEXUS->>Detail: Opens action detail panel

    Detail->>User: Shows:
    Note over Detail,User: • Original email (from John)
    Note over Detail,User: • AI-drafted reply (preview)
    Note over Detail,User: • "Open in Gmail" button
    Note over Detail,User: • "Edit Draft" button
    Note over Detail,User: • "Discard Draft" button
    Note over Detail,User: • AI reasoning: "Replied to scope question with project timeline"

    alt User approves
        User->>Detail: Clicks "Open in Gmail"
        Detail->>Gmail: Opens Gmail with draft ready to send
        User->>Gmail: Reviews and clicks Send
    end

    alt User edits
        User->>Detail: Clicks "Edit Draft"
        Detail->>Gmail: Opens Gmail compose with draft pre-filled
        User->>Gmail: Edits and sends
    end

    alt User discards
        User->>Detail: Clicks "Discard Draft"
        Detail->>Gmail: Delete draft via Gmail API
        Detail->>NEXUS: Update action: "❌ Draft discarded"
    end
```

---

## J12: Using Command Palette

### Overview

| Attribute | Value |
|---|---|
| **Trigger** | `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux) |
| **Purpose** | Quick commitment creation, navigation, and actions |
| **Interaction** | Type-ahead fuzzy search |

### Commands

| Input Pattern | Action | Example |
|---|---|---|
| Free text | Create new commitment | "Prepare board deck by Monday" |
| `/war-room` | Navigate to War Room | — |
| `/dashboard` | Navigate to Dashboard | — |
| `/settings` | Navigate to Settings | — |
| `@commitment` | Search commitments by name | `@Research paper` |
| `/risk` | Show at-risk commitments | — |
| `/health` | Show current health score | — |

### Flow

```mermaid
sequenceDiagram
    actor User
    participant CMD as Command Palette

    User->>CMD: Cmd+K
    CMD->>User: Modal opens with input focused
    User->>CMD: Types "prepare board deck by Monday"
    CMD->>CMD: Detect: not a slash command → treat as new commitment
    CMD->>User: Shows: "Create commitment: 'Prepare board deck by Monday'?"
    User->>CMD: Presses Enter
    CMD->>CMD: POST /api/commitments
    CMD->>User: "✅ Commitment created" → closes palette
```

---

## J13: Managing Settings

### Settings Flow

```mermaid
graph TD
    SETTINGS[Settings Page] --> PROFILE[Profile]
    SETTINGS --> INTEGRATIONS[Integrations]
    SETTINGS --> NOTIFICATIONS[Notifications]
    SETTINGS --> WORK[Working Hours]
    SETTINGS --> THEME[Appearance]
    SETTINGS --> DATA[Data & Privacy]

    PROFILE --> P1[Name]
    PROFILE --> P2[Avatar from Google]
    PROFILE --> P3[Timezone]

    INTEGRATIONS --> I1[Gmail Status + Reconnect]
    INTEGRATIONS --> I2[Calendar Status + Reconnect]
    INTEGRATIONS --> I3[Docs Status + Reconnect]
    INTEGRATIONS --> I4[Slides Status + Reconnect]
    INTEGRATIONS --> I5[Drive Status + Reconnect]

    NOTIFICATIONS --> N1[In-app toggles]
    NOTIFICATIONS --> N2[Push notification toggles]
    NOTIFICATIONS --> N3[Email digest toggles]
    NOTIFICATIONS --> N4[Quiet hours]

    WORK --> W1[Start time]
    WORK --> W2[End time]
    WORK --> W3[Working days]
    WORK --> W4[Buffer percentage]

    THEME --> T1[Dark mode]
    THEME --> T2[Light mode]

    DATA --> D1[Export data as JSON]
    DATA --> D2[Delete account]
```

---

## Error Scenarios

### Comprehensive Error Handling

| Error | Trigger | User Message | System Action |
|---|---|---|---|
| **Gemini API timeout** | Agent response > 15 seconds | "AI is taking longer than usual. We'll process this shortly." | Queue for retry, show commitment as "processing" |
| **Gemini rate limit** | Exceeded RPM quota | "High demand — your request is queued." | Inngest queues with backoff |
| **Google API 401** | Token expired/revoked | "Google connection lost. Reconnect in Settings." | Mark connection as disconnected |
| **Google API 403** | Scope not granted | "[Feature] requires Gmail access. Connect in Settings." | Disable feature, show CTA |
| **Google API 429** | Quota exceeded | "Google API limit reached. We'll retry shortly." | Exponential backoff (max 5 retries) |
| **Google API 500** | Google service error | "Google services are temporarily unavailable." | Retry with backoff |
| **Supabase connection lost** | WebSocket disconnect | "Reconnecting..." (auto-retry) | Auto-reconnect with exponential backoff |
| **Network offline** | No internet | "You're offline. Changes will sync when you reconnect." | Queue mutations locally |
| **Database write failure** | Postgres constraint violation | "Unable to save. Please try again." | Log error to Sentry |
| **Invalid input** | Empty or malformed commitment text | "Please enter a description of your commitment." | Inline form validation |
| **File too large** | Screenshot > 10MB | "Image too large (max 10MB). Try a smaller file." | Client-side validation |
| **Unsupported format** | Non-image file uploaded | "Only PNG, JPG, and WebP images are supported." | Client-side validation |

---

*Previous: [02 — User Personas](02_USER_PERSONAS.md) · Next: [04 — Feature Specifications](04_FEATURE_SPECIFICATIONS.md)*
]]>
