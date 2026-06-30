<![CDATA[# 07 — Component Library

> Every reusable UI component in Delegat, with props, behavior, accessibility, states, variants, and examples.

---

## Table of Contents

- [Component Architecture](#component-architecture)
- [Base Components](#base-components)
- [Layout Components](#layout-components)
- [Dashboard Components](#dashboard-components)
- [War Room Components](#war-room-components)
- [Commitment Components](#commitment-components)
- [Feedback Components](#feedback-components)

---

## Component Architecture

### File Structure

```
src/components/
├── ui/                    # Base design system components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── tooltip.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── progress-bar.tsx
│   ├── skeleton.tsx
│   ├── spinner.tsx
│   ├── toast.tsx
│   └── switch.tsx
├── layout/
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── mobile-tab-bar.tsx
│   └── page-shell.tsx
├── dashboard/
│   ├── health-score-card.tsx
│   ├── commitment-list.tsx
│   ├── quick-input.tsx
│   └── stats-row.tsx
├── war-room/
│   ├── health-score-gauge.tsx
│   ├── timeline-view.tsx
│   ├── risk-radar-grid.tsx
│   └── nexus-feed.tsx
├── commitment/
│   ├── commitment-card.tsx
│   ├── commitment-detail.tsx
│   ├── task-list.tsx
│   ├── task-item.tsx
│   └── commitment-form.tsx
├── command-palette/
│   └── command-palette.tsx
└── notifications/
    ├── notification-panel.tsx
    └── notification-item.tsx
```

### Design Principles

1. **Radix UI primitives** for all interactive patterns (dialogs, dropdowns, tooltips)
2. **Tailwind CSS** for styling — no CSS modules or styled-components
3. **Composition over configuration** — prefer children/slots over complex prop APIs
4. **Server Components by default** — add `'use client'` only when needed
5. **TypeScript strict** — every component has explicit prop types

---

## Base Components

### Button

```typescript
// src/components/ui/button.tsx
'use client';

import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
        secondary: 'border border-surface-border bg-transparent text-text-primary hover:bg-surface-3',
        ghost: 'text-text-secondary hover:bg-surface-3 hover:text-text-primary',
        danger: 'bg-danger text-white hover:bg-red-600',
        success: 'bg-success text-white hover:bg-green-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-base gap-2',
        lg: 'h-12 px-6 text-lg gap-2.5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `icon` | `ReactNode` | — | Leading icon |
| `disabled` | `boolean` | `false` | Disables button |
| `children` | `ReactNode` | — | Button label |

**Accessibility**: Uses native `<button>`. Focus ring visible on keyboard navigation. `aria-busy` set when loading. `aria-disabled` set when disabled.

---

### Input

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Label above input |
| `error` | `string` | — | Error message below input |
| `hint` | `string` | — | Hint text below input |
| `icon` | `ReactNode` | — | Leading icon inside input |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input height |

**States**: default, focus (brand ring), error (red border + message), disabled (grayed).

**Accessibility**: `<label>` associated via `htmlFor`. Error announced via `aria-describedby`. Required indicated via `aria-required`.

---

### Card

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive' | 'status';
  statusColor?: 'green' | 'amber' | 'red' | 'blue';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `string` | `'default'` | Visual style |
| `statusColor` | `string` | — | Left border color (for `status` variant) |
| `padding` | `string` | `'md'` | Internal padding |
| `onClick` | `function` | — | Makes card clickable (adds hover effect) |

---

### Badge

```typescript
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}
```

| Variant | Background | Text |
|---|---|---|
| `default` | `surface-3` | `text-primary` |
| `success` | `success/10` | `success` |
| `warning` | `warning/10` | `warning` |
| `danger` | `danger/10` | `danger` |
| `info` | `info/10` | `info` |

---

### ProgressBar

```typescript
interface ProgressBarProps {
  value: number;           // 0–100
  max?: number;            // Default: 100
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | Required | Current progress (0–100) |
| `color` | `string` | `'auto'` | Bar color. `'auto'` uses green/amber/red based on value |
| `animated` | `boolean` | `true` | Smooth width transition |
| `showLabel` | `boolean` | `false` | Shows percentage text |

**`auto` color logic**: ≥70 = green, 40–69 = amber, <40 = red.

**Accessibility**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`.

---

### Skeleton

```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}
```

Used for loading states. Renders a pulsing placeholder matching the shape of the content it replaces.

---

### Toast

```typescript
interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;     // ms, default: 5000
  action?: { label: string; onClick: () => void };
}
```

Toast notifications appear bottom-right, stack vertically, auto-dismiss after `duration` ms. Uses Radix UI Toast primitive.

---

## Layout Components

### Sidebar

```typescript
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath: string;
}
```

| State | Width | Content |
|---|---|---|
| Expanded | 240px | Icons + labels |
| Collapsed | 64px | Icons only |
| Mobile | 0px | Hidden (bottom tab bar shown instead) |

**Navigation items**: Dashboard, War Room, Risk Radar, Timeline, Calendar, Analytics, Settings.

**Bottom section**: New Commitment button + Cmd+K shortcut hint.

---

### Header

```typescript
interface HeaderProps {
  title: string;
  breadcrumb?: { label: string; href: string }[];
}
```

Contains: Page title, search/Cmd+K trigger, notification bell (with unread count badge), user avatar dropdown.

---

### PageShell

```typescript
interface PageShellProps {
  children: React.ReactNode;
}
```

The root layout wrapper. Composes Sidebar + Header + main content area. Handles responsive layout switching.

---

## Dashboard Components

### HealthScoreCard

```typescript
interface HealthScoreCardProps {
  score: number;           // 0–100
  activeCommitments: number;
  dueThisWeek: number;
}
```

Displays the overall health score as a large animated number with a progress bar and summary text. Color auto-adjusts: green ≥70, amber 40–69, red <40.

---

### CommitmentList

```typescript
interface CommitmentListProps {
  commitments: Commitment[];
  filter?: 'all' | 'due_today' | 'at_risk' | 'completed';
  onSelect: (id: string) => void;
}
```

Renders a list of `CommitmentCard` components. Supports filtering and sorting.

---

### QuickInput

```typescript
interface QuickInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  loading?: boolean;
}
```

A large text input at the bottom of the dashboard for quick commitment creation. Placeholder: "What do you need to get done?"

---

## War Room Components

### HealthScoreGauge

```typescript
interface HealthScoreGaugeProps {
  score: number;            // 0–100
  previousScore?: number;   // For animation direction
  message: string;          // "On track", "At risk", "Recovery mode"
}
```

Large centered health score with:
- Animated counter (previous → current)
- Gradient progress bar
- Glowing shadow based on color
- Descriptive message below

```
        ████████████████░░░░░░  78%
       "On track — maintain current velocity"
```

---

### TimelineView

```typescript
interface TimelineViewProps {
  date: Date;
  tasks: ScheduledTask[];
  events: CalendarEvent[];
}
```

Hour-by-hour vertical timeline showing:
- Focus blocks (filled, brand color)
- Calendar events (gray)
- Free slots (empty/dashed)
- Completed blocks (green check overlay)
- Drift (gaps between planned and actual)

---

### RiskRadarGrid

```typescript
interface RiskRadarGridProps {
  commitments: CommitmentWithRisk[];
  onSelect: (id: string) => void;
}
```

Renders commitments as a list sorted by risk score (highest first). Each item shows:
- Risk indicator (🔴🟡🟢)
- Commitment title
- Health score percentage
- Time remaining
- Click to expand: cause + recovery suggestion

---

### NexusFeed

```typescript
interface NexusFeedProps {
  items: NexusItem[];
  maxItems?: number;      // Default: 20
  realtime?: boolean;     // Default: true
}
```

Reverse-chronological feed of autonomous actions. New items animate in from top with fade+slide. Each item shows:
- Status icon (✅, ⚠️, ❌)
- Action description
- Relative timestamp ("2 min ago")
- Click to view details

---

## Commitment Components

### CommitmentCard

```typescript
interface CommitmentCardProps {
  commitment: Commitment;
  compact?: boolean;
  onClick?: () => void;
}
```

| Element | Content |
|---|---|
| Left border | Status color (green/amber/red) |
| Title | Commitment title |
| Deadline | Relative date ("Due in 2 days") |
| Health badge | Score with color |
| Task progress | "5 of 12 tasks" progress bar |
| Status badge | "Active", "At Risk", "Recovery" |

---

### TaskList

```typescript
interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  editable?: boolean;
}
```

Renders a list of `TaskItem` components with:
- Checkbox for completion toggle
- Task title
- Duration badge ("30 min")
- Type indicator (human/auto)
- Dependency indicator (blocked if dependency incomplete)

---

### TaskItem

```typescript
interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onEdit?: () => void;
  blocked?: boolean;
}
```

| State | Visual |
|---|---|
| Pending | Unchecked checkbox, normal text |
| In Progress | Highlighted border, progress indicator |
| Completed | Checked checkbox, strikethrough text, green |
| Deferred | Dimmed, "Deferred" badge |
| Blocked | Lock icon, tooltip: "Waiting for [dependency]" |

**Accessibility**: Checkbox is an actual `<input type="checkbox">` with label. Keyboard: Space to toggle.

---

## Feedback Components

### EmptyState

```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}
```

Centered layout with large icon, title, description, and optional CTA button. Used when lists are empty.

---

### ErrorState

```typescript
interface ErrorStateProps {
  title?: string;           // Default: "Something went wrong"
  description?: string;
  retry?: () => void;
}
```

Shows error icon, message, and retry button. Used when API calls fail.

---

### LoadingState

```typescript
interface LoadingStateProps {
  variant?: 'skeleton' | 'spinner' | 'dots';
  count?: number;           // Number of skeleton rows
}
```

| Variant | Usage |
|---|---|
| `skeleton` | Page-level loading (mimics content shape) |
| `spinner` | Inline loading (buttons, small areas) |
| `dots` | Chat-like loading (AI processing) |

---

*Previous: [06 — Design System](06_DESIGN_SYSTEM.md) · Next: [08 — Frontend Architecture](08_FRONTEND_ARCHITECTURE.md)*
]]>
