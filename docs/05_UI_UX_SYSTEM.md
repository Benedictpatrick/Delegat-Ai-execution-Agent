<![CDATA[# 05 — UI/UX System

> Complete page-by-page specification for every screen in Delegat, including layout, components, responsive behavior, loading/empty/error states, accessibility, keyboard shortcuts, and animations.

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Page Index](#page-index)
- [P-100: Landing Page](#p-100-landing-page)
- [P-200: Dashboard](#p-200-dashboard)
- [P-300: War Room](#p-300-war-room)
- [P-400: Risk Radar](#p-400-risk-radar)
- [P-500: Timeline](#p-500-timeline)
- [P-600: NEXUS Activity Feed](#p-600-nexus-activity-feed)
- [P-700: Calendar View](#p-700-calendar-view)
- [P-800: Commitment Detail](#p-800-commitment-detail)
- [P-900: Settings](#p-900-settings)
- [P-1000: Profile](#p-1000-profile)
- [P-1100: Notifications Panel](#p-1100-notifications-panel)
- [P-1200: Command Palette](#p-1200-command-palette)
- [P-1300: Onboarding Wizard](#p-1300-onboarding-wizard)
- [Global Navigation](#global-navigation)
- [Responsive Strategy](#responsive-strategy)

---

## Design Philosophy

| Principle | Implementation |
|---|---|
| **Dramatic, not calm** | War Room uses bold colors, animated health scores, and urgency-driven layouts. This is a command center, not a meditation app. |
| **Information density** | Show maximum useful data per screen. Avoid "minimalist" empty space. Power users want density. |
| **Real-time first** | Every data point updates live via Supabase Realtime. No refresh buttons. |
| **Dark mode default** | Dark backgrounds reduce eye strain during long work sessions. Light mode available as option. |
| **Keyboard-first** | Every action is reachable via keyboard. Cmd+K for everything. |
| **Progressive disclosure** | Show summary first, reveal details on interaction. Don't overwhelm on first glance. |

---

## Page Index

| ID | Page | Route | Auth Required | Layout |
|---|---|---|---|---|
| P-100 | Landing Page | `/` | No | Full-width, no sidebar |
| P-200 | Dashboard | `/dashboard` | Yes | Sidebar + main |
| P-300 | War Room | `/war-room` | Yes | Sidebar + main (full-width content) |
| P-400 | Risk Radar | `/risk-radar` | Yes | Sidebar + main |
| P-500 | Timeline | `/timeline` | Yes | Sidebar + main |
| P-600 | NEXUS Activity Feed | `/activity` | Yes | Sidebar + main |
| P-700 | Calendar View | `/calendar` | Yes | Sidebar + main |
| P-800 | Commitment Detail | `/commitments/[id]` | Yes | Sidebar + main |
| P-900 | Settings | `/settings` | Yes | Sidebar + main (tabs) |
| P-1000 | Profile | `/settings/profile` | Yes | Sidebar + main |
| P-1100 | Notifications | Slide-over panel | Yes | Overlay panel |
| P-1200 | Command Palette | Modal overlay | Yes | Centered modal |
| P-1300 | Onboarding | `/onboarding` | Yes (first visit) | Full-screen wizard |

---

## P-100: Landing Page

### Route: `/`

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  NAVBAR: Logo | Features | How it Works | CTA              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  HERO SECTION                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  "The AI Execution Agent"                          │    │
│  │  "You focus on thinking. Delegat handles           │    │
│  │   execution."                                      │    │
│  │                                                    │    │
│  │  [Start Executing — Sign in with Google]           │    │
│  │                                                    │    │
│  │  Animated War Room preview ──────────────►         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
│  PROBLEM SECTION                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ Cognitive │ │ Passive  │ │ No       │                   │
│  │ Overload  │ │ Reminders│ │ Recovery │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                            │
│  HOW IT WORKS                                              │
│  Step 1: Input → Step 2: Decompose → Step 3: Execute →    │
│  Step 4: Monitor                                           │
│                                                            │
│  AGENT SHOWCASE                                            │
│  Agent 1 | Agent 2 | Agent 3 | Agent 4                    │
│  (interactive cards with hover effects)                    │
│                                                            │
│  COMPARISON TABLE                                          │
│  Delegat vs Todoist vs Motion vs Reclaim                   │
│                                                            │
│  CTA SECTION (repeated)                                    │
│  [Start Executing — Sign in with Google]                   │
│                                                            │
│  FOOTER: Links | Privacy | GitHub | Vibe2Ship 2026         │
└────────────────────────────────────────────────────────────┘
```

### Components

| Component | Type | Behavior |
|---|---|---|
| Navbar | Sticky, transparent → solid on scroll | Blur background on scroll |
| Hero headline | Animated text reveal | Characters fade in sequentially |
| War Room preview | Embedded animation/screenshot | Loops every 10s showing live dashboard |
| Problem cards | 3-column grid | Hover: card lifts with shadow |
| Agent cards | 4-column horizontal scroll on mobile | Click: reveals agent details |
| Comparison table | Responsive table | Scrollable on mobile |
| CTA button | Primary action | Gradient background, hover scale 1.02 |

### Responsive

| Breakpoint | Changes |
|---|---|
| Desktop (≥1280px) | Full layout, 4-column agent grid |
| Tablet (768–1279px) | 2-column problem cards, 2×2 agent grid |
| Mobile (<768px) | Single column, horizontal scroll for agents, stacked comparison |

### Loading State

Server-rendered HTML appears immediately. No loading spinner for landing page.

### Accessibility

| Requirement | Implementation |
|---|---|
| Skip to content link | Hidden link before navbar |
| CTA keyboard accessible | Focusable, Enter to activate |
| Animation respects prefers-reduced-motion | Disable all motion if set |
| Proper heading hierarchy | h1: tagline, h2: sections |
| Image alt texts | All illustrations have descriptive alt |

---

## P-200: Dashboard

### Route: `/dashboard`

### Layout

```
┌──────────┬─────────────────────────────────────────────────┐
│ SIDEBAR  │  MAIN CONTENT                                   │
│ (240px)  │                                                  │
│          │  ┌───────────────────────────────────────────┐   │
│ 🏠 Dash  │  │  Welcome, [Name]           [🔔] [Cmd+K]  │   │
│ ⚔️ War   │  └───────────────────────────────────────────┘   │
│ 🎯 Risk  │                                                  │
│ 📊 Time  │  ┌───────────────────────────────────────────┐   │
│ 📅 Cal   │  │  Overall Health: ████████░░  78%           │   │
│ 📈 Anal  │  │  5 active commitments · 2 due this week   │   │
│ ⚙️ Set   │  └───────────────────────────────────────────┘   │
│          │                                                  │
│          │  ┌─────────────┐  ┌─────────────┐               │
│          │  │ Due Today   │  │ At Risk     │               │
│          │  │ • Email to  │  │ • Client    │               │
│          │  │   John 🟢   │  │   prop 🔴   │               │
│          │  │ • Review PR │  │ • Board     │               │
│          │  │   🟢        │  │   deck 🟡   │               │
│          │  └─────────────┘  └─────────────┘               │
│          │                                                  │
│ ──────── │  ┌───────────────────────────────────────────┐   │
│ + New    │  │  NEXUS Recent Activity                    │   │
│ Cmd+K   │  │  ✅ Drafted reply to john@acme.com        │   │
│          │  │  ✅ Booked 3 focus blocks                  │   │
│          │  │  ✅ Created Research Doc                    │   │
│          │  └───────────────────────────────────────────┘   │
│          │                                                  │
│          │  ┌───────────────────────────────────────────┐   │
│          │  │  Quick Input                               │   │
│          │  │  "What do you need to get done?"           │   │
│          │  │  [____________________________________]    │   │
│          │  └───────────────────────────────────────────┘   │
└──────────┴─────────────────────────────────────────────────┘
```

### States

| State | Condition | Display |
|---|---|---|
| **Loading** | Initial data fetch | Skeleton with pulse animation for all cards |
| **Empty** | 0 commitments | Large centered prompt: "What do you need to get done?" with animated input |
| **Active** | ≥1 commitment | Full dashboard layout |
| **All Complete** | 0 active, ≥1 completed today | "🎉 All caught up!" with confetti and completion stats |
| **Error** | API failure | Error banner with retry button, cached data shown if available |

### Responsive Behavior

| Breakpoint | Changes |
|---|---|
| Desktop (≥1280px) | Sidebar visible. Two-column card layout (Due Today + At Risk side by side). |
| Tablet (768–1279px) | Sidebar collapses to icons only (64px). Cards stack vertically. |
| Mobile (<768px) | Sidebar hidden → bottom tab bar. Single column. Quick Input at top. |

---

## P-300: War Room

### Route: `/war-room`

*(Complete layout specified in [F-700: War Room Dashboard](04_FEATURE_SPECIFICATIONS.md#f-700-war-room-dashboard))*

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Full-width content (no max-width constraint) | War Room needs maximum information density |
| Dark background by default | Command center aesthetic; reduces eye strain |
| Animated health score | Creates urgency; number counts up/down smoothly |
| Color-coded status bars | Instant visual parsing without reading text |
| Persistent NEXUS feed | Users want to see what Delegat did while they were away |

### Animations Specification

| Element | Animation Type | CSS Property | Duration | Easing |
|---|---|---|---|---|
| Health Score bar | Width transition | `width` | 800ms | `ease-out` |
| Health Score number | Counter animation | JS (requestAnimationFrame) | 600ms | `ease-out` |
| Risk items entering | Slide + fade | `transform`, `opacity` | 300ms | `ease-out` |
| Risk color change | Color transition | `background-color` | 500ms | `ease-in-out` |
| NEXUS items | Fade up | `transform`, `opacity` | 200ms | `ease-out` |
| Timeline blocks | Horizontal fill | `width` | 1000ms | `linear` |
| Recovery mode banner | Slide down | `transform` | 400ms | `ease-out` |
| Pulse on at-risk | Scale pulse | `transform` | 2000ms | `ease-in-out` (infinite) |

---

## P-400: Risk Radar

### Route: `/risk-radar`

### Layout

```
┌──────────┬─────────────────────────────────────────────────┐
│ SIDEBAR  │                                                  │
│          │  RISK RADAR — [N] Active Commitments             │
│          │                                                  │
│          │  ┌─── Priority Matrix ─────────────────────┐    │
│          │  │                                         │    │
│          │  │  URGENT            │  NOT URGENT        │    │
│          │  │  ──────────────────┼─────────────────── │    │
│          │  │  IMPORTANT         │  IMPORTANT         │    │
│          │  │  🔴 Client prop    │  🟡 Board deck     │    │
│          │  │  🔴 Tax filing     │                    │    │
│          │  │  ──────────────────┼─────────────────── │    │
│          │  │  NOT IMPORTANT     │  NOT IMPORTANT     │    │
│          │  │  🟡 Blog post      │  🟢 Side project   │    │
│          │  │                    │                    │    │
│          │  └───────────────────────────────────────────┘   │
│          │                                                  │
│          │  ┌─── Risk Details ────────────────────────┐    │
│          │  │ Client Proposal          Health: 32%    │    │
│          │  │ Risk: 🔴 Critical                       │    │
│          │  │ Cause: 5 tasks behind, 2 days remaining │    │
│          │  │ Recovery: Defer formatting, focus on     │    │
│          │  │          content sections                │    │
│          │  │ [View Details] [Activate Recovery]       │    │
│          │  └───────────────────────────────────────────┘   │
└──────────┴─────────────────────────────────────────────────┘
```

---

## P-500: Timeline

### Route: `/timeline`

### Layout

A horizontal timeline showing the next 7 days with task blocks per day.

```
┌──────────┬─────────────────────────────────────────────────┐
│ SIDEBAR  │                                                  │
│          │  TIMELINE — This Week                            │
│          │                                                  │
│          │  Mon    Tue    Wed    Thu    Fri    Sat    Sun    │
│          │  ┌──┐   ┌──┐   ┌──┐   ┌──┐   ┌──┐              │
│          │  │▓▓│   │▓▓│   │▓▓│   │▓▓│   │░░│              │
│          │  │▓▓│   │▓▓│   │▓▓│   │░░│   │░░│              │
│          │  │░░│   │▓▓│   │░░│   │░░│   │  │              │
│          │  │░░│   │░░│   │  │   │  │   │  │              │
│          │  └──┘   └──┘   └──┘   └──┘   └──┘              │
│          │                                                  │
│          │  ▓ = Scheduled focus time                        │
│          │  ░ = Available for scheduling                    │
│          │  Capacity: 68% utilized                          │
│          │                                                  │
│          │  ┌─── Today Detail ───────────────────────┐     │
│          │  │ 9:00  ▓▓▓ Research: Literature search   │     │
│          │  │ 10:30 ░░░ [Free — 30 min]               │     │
│          │  │ 11:00 ▓▓▓ Client proposal: Section 2    │     │
│          │  │ 12:00 ░░░ Lunch                          │     │
│          │  │ 13:00 ▓▓▓ Email replies (batch)         │     │
│          │  │ 14:00 ░░░ [Free — 60 min]               │     │
│          │  │ 15:00 ▓▓▓ Board deck: Create outline    │     │
│          │  └───────────────────────────────────────────┘   │
└──────────┴─────────────────────────────────────────────────┘
```

---

## P-700: Calendar View

### Route: `/calendar`

Shows Google Calendar events integrated with Delegat's focus blocks. Read-only mirror of Google Calendar with Delegat overlays.

### Layout

Standard week-view calendar grid showing:
- Google Calendar events (gray)
- Delegat focus blocks (brand color, e.g., blue/purple)
- Free slots (empty)
- Conflicts (red border)

---

## P-900: Settings

### Route: `/settings`

### Tab Structure

| Tab | Route | Content |
|---|---|---|
| Integrations | `/settings/integrations` | Google API connection status |
| Working Hours | `/settings/working-hours` | Start/end time, working days |
| Notifications | `/settings/notifications` | Channel toggles, quiet hours |
| Appearance | `/settings/appearance` | Dark/light mode |
| Data | `/settings/data` | Export, delete account |

---

## P-1200: Command Palette

### Design

```
┌────────────────────────────────────────────┐
│  🔍 Type a command or commitment...        │
├────────────────────────────────────────────┤
│  Recent Commands                           │
│  ├── /war-room        → War Room           │
│  ├── /dashboard       → Dashboard          │
│  └── @Research paper  → View commitment    │
│                                            │
│  Quick Actions                             │
│  ├── ➕ New commitment                     │
│  ├── ⚔️ Open War Room                     │
│  └── ⚙️ Settings                           │
├────────────────────────────────────────────┤
│  Esc to close · Enter to select            │
└────────────────────────────────────────────┘
```

---

## Global Navigation

### Sidebar (Desktop)

| Item | Icon | Route | Keyboard |
|---|---|---|---|
| Dashboard | 🏠 | `/dashboard` | `Cmd+1` |
| War Room | ⚔️ | `/war-room` | `Cmd+2` |
| Risk Radar | 🎯 | `/risk-radar` | `Cmd+3` |
| Timeline | 📊 | `/timeline` | `Cmd+4` |
| Calendar | 📅 | `/calendar` | `Cmd+5` |
| Analytics | 📈 | `/analytics` | — |
| Settings | ⚙️ | `/settings` | — |
| New Commitment | ➕ | Command Palette | `Cmd+N` |

### Header Bar

| Element | Position | Behavior |
|---|---|---|
| Page title | Left | Dynamic based on current route |
| Search / Cmd+K hint | Center | Opens command palette |
| Notifications bell | Right | Badge count, opens slide-over panel |
| User avatar | Right | Dropdown: Profile, Settings, Sign Out |

### Mobile Bottom Tab Bar

| Tab | Icon | Route |
|---|---|---|
| Home | 🏠 | `/dashboard` |
| War Room | ⚔️ | `/war-room` |
| ➕ | ➕ | New commitment (opens input) |
| Risk | 🎯 | `/risk-radar` |
| More | ☰ | Menu (Timeline, Calendar, Settings) |

---

## Responsive Strategy

| Breakpoint | Width | Layout Changes |
|---|---|---|
| **Desktop** | ≥1280px | Full sidebar (240px) + main content. Multi-column cards. |
| **Tablet** | 768–1279px | Collapsed sidebar (64px, icons only). Single-column cards. |
| **Mobile** | <768px | No sidebar → bottom tab bar. Full-width cards. Stacked layout. |

### Touch Targets

| Element | Minimum Size | Rationale |
|---|---|---|
| Buttons | 44×44px | Apple HIG minimum |
| List items | 48px height | Comfortable tap target |
| Icons in sidebar | 40×40px | Easy tapping on tablet |
| Bottom tab items | 48px width | Even distribution |

---

*Previous: [04 — Feature Specifications](04_FEATURE_SPECIFICATIONS.md) · Next: [06 — Design System](06_DESIGN_SYSTEM.md)*
]]>
