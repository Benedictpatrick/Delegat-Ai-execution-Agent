<![CDATA[# 08 — Frontend Architecture

> Next.js 15 App Router architecture with TypeScript, state management, routing, caching, server/client components, and performance optimization.

---

## Table of Contents

- [Technology Choices](#technology-choices)
- [Folder Structure](#folder-structure)
- [Routing Architecture](#routing-architecture)
- [Server vs Client Components](#server-vs-client-components)
- [State Management](#state-management)
- [Data Fetching](#data-fetching)
- [Caching Strategy](#caching-strategy)
- [Optimistic Updates](#optimistic-updates)
- [Error Boundaries](#error-boundaries)
- [Performance Optimization](#performance-optimization)
- [Realtime Architecture](#realtime-architecture)

---

## Technology Choices

| Technology | Version | Purpose | Decision Rationale |
|---|---|---|---|
| **Next.js** | 15.x | App Router, RSC, SSR/SSG | Best React framework for production |
| **TypeScript** | 5.x | Type safety | Strict mode — no `any` |
| **Tailwind CSS** | 4.x | Styling | Utility-first, design token integration |
| **Radix UI** | Latest | Headless components | Accessible primitives (Dialog, Dropdown, Tooltip) |
| **Zustand** | 5.x | Client state | War Room real-time state, UI state |
| **TanStack Query** | 5.x | Server state | Caching, background refetch, optimistic updates |
| **Supabase Client** | Latest | Database + Auth + Realtime | Type-safe generated from schema |
| **Lucide React** | Latest | Icons | Tree-shakeable, consistent |
| **Recharts** | Latest | Charts | React-native, composable |
| **class-variance-authority** | Latest | Component variants | Type-safe variant API |
| **date-fns** | Latest | Date utilities | Tree-shakeable, immutable |
| **zod** | Latest | Runtime validation | Schema validation for forms + API responses |

---

## Folder Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth route group (no layout)
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx
│   ├── (dashboard)/               # Dashboard route group (shared layout)
│   │   ├── layout.tsx             # Sidebar + Header shell
│   │   ├── dashboard/page.tsx
│   │   ├── war-room/page.tsx
│   │   ├── risk-radar/page.tsx
│   │   ├── timeline/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── commitments/
│   │   │   └── [id]/page.tsx      # Commitment detail
│   │   └── settings/
│   │       ├── page.tsx           # Settings overview
│   │       ├── integrations/page.tsx
│   │       ├── notifications/page.tsx
│   │       └── profile/page.tsx
│   ├── api/                       # API Routes
│   │   ├── commitments/
│   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   └── [id]/route.ts      # GET, PATCH, DELETE
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── agents/
│   │   │   └── execute/route.ts   # POST — trigger agent execution
│   │   ├── google/
│   │   │   ├── gmail/route.ts
│   │   │   ├── calendar/route.ts
│   │   │   ├── docs/route.ts
│   │   │   └── slides/route.ts
│   │   ├── inngest/route.ts       # Inngest webhook handler
│   │   ├── health/route.ts
│   │   └── webhooks/route.ts
│   ├── onboarding/page.tsx
│   ├── layout.tsx                 # Root layout (providers, fonts, metadata)
│   ├── page.tsx                   # Landing page
│   ├── not-found.tsx
│   ├── error.tsx
│   └── globals.css
├── components/                    # (See 07_COMPONENT_LIBRARY.md)
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client (createBrowserClient)
│   │   ├── server.ts              # Server client (createServerClient)
│   │   └── admin.ts               # Service role client (admin operations)
│   ├── stores/                    # Zustand stores
│   │   ├── war-room-store.ts
│   │   ├── notification-store.ts
│   │   └── ui-store.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-commitments.ts     # TanStack Query hook for commitments
│   │   ├── use-tasks.ts
│   │   ├── use-health-score.ts
│   │   ├── use-realtime.ts        # Supabase Realtime subscription
│   │   ├── use-keyboard.ts        # Global keyboard shortcuts
│   │   └── use-media-query.ts     # Responsive breakpoint detection
│   ├── queries/                   # TanStack Query key factories + fetchers
│   │   ├── commitment-queries.ts
│   │   ├── task-queries.ts
│   │   └── activity-queries.ts
│   ├── validators/                # Zod schemas
│   │   ├── commitment.ts
│   │   ├── task.ts
│   │   └── settings.ts
│   ├── utils/
│   │   ├── cn.ts                  # Tailwind className merge utility
│   │   ├── format-date.ts
│   │   └── health-score.ts        # Client-side health calculation
│   ├── types/
│   │   ├── database.ts            # Auto-generated from Supabase
│   │   ├── api.ts                 # API request/response types
│   │   └── ui.ts                  # UI-specific types
│   └── constants/
│       ├── routes.ts
│       ├── keyboard-shortcuts.ts
│       └── config.ts
└── middleware.ts                   # Auth middleware (redirect unauthenticated)
```

---

## Routing Architecture

### Route Groups

| Group | Prefix | Layout | Auth Required |
|---|---|---|---|
| `(auth)` | `/login`, `/callback` | Minimal (no sidebar) | No |
| `(dashboard)` | `/dashboard`, `/war-room`, etc. | Full (sidebar + header) | Yes |
| Root | `/` | None (full-width) | No |

### Middleware

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
    || request.nextUrl.pathname.startsWith('/war-room')
    || request.nextUrl.pathname.startsWith('/risk-radar');

  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Server vs Client Components

### Decision Matrix

| Component | Type | Reason |
|---|---|---|
| **Page shells** | Server | No interactivity, data fetching at build/request time |
| **Data display** (commitment list, NEXUS feed) | Server | Render data, pass to client for interactivity |
| **Forms** (commitment input, settings) | Client | User input, validation |
| **Animations** (health score counter, risk pulse) | Client | Browser APIs, requestAnimationFrame |
| **Realtime subscriptions** | Client | WebSocket connections |
| **Sidebar navigation** | Client | Active state, collapse toggle |
| **Command Palette** | Client | Keyboard events, focus management |
| **Charts** | Client | Recharts requires browser APIs |

### Pattern

```typescript
// Page (Server Component) — fetches data
export default async function WarRoomPage() {
  const supabase = createServerClient();
  const commitments = await supabase.from('commitments').select('*');

  return (
    <div>
      <HealthScoreGauge score={calculateOverall(commitments)} />
      <WarRoomClient initialCommitments={commitments} />
    </div>
  );
}

// Client Component — handles interactivity + realtime
'use client';
export function WarRoomClient({ initialCommitments }) {
  // Realtime subscriptions, animations, interactions
}
```

---

## State Management

### State Categories

| Category | Tool | Examples |
|---|---|---|
| **Server state** | TanStack Query | Commitments, tasks, NEXUS items |
| **UI state** | Zustand | Sidebar collapsed, command palette open, theme |
| **Realtime state** | Zustand + Supabase Realtime | Health scores, live NEXUS updates |
| **Form state** | React Hook Form + Zod | Commitment form, settings form |
| **URL state** | Next.js searchParams | Filters, pagination, active tab |

### Zustand Store: War Room

```typescript
// src/lib/stores/war-room-store.ts
import { create } from 'zustand';

interface WarRoomState {
  healthScore: number;
  previousHealthScore: number;
  recoveryMode: boolean;
  tasks: ScheduledTask[];
  nexusItems: NexusItem[];

  setHealthScore: (score: number) => void;
  addNexusItem: (item: NexusItem) => void;
  setRecoveryMode: (active: boolean) => void;
  updateTask: (taskId: string, updates: Partial<ScheduledTask>) => void;
}

export const useWarRoomStore = create<WarRoomState>((set) => ({
  healthScore: 0,
  previousHealthScore: 0,
  recoveryMode: false,
  tasks: [],
  nexusItems: [],

  setHealthScore: (score) => set((state) => ({
    previousHealthScore: state.healthScore,
    healthScore: score,
    recoveryMode: score < 70,
  })),

  addNexusItem: (item) => set((state) => ({
    nexusItems: [item, ...state.nexusItems].slice(0, 50),
  })),

  setRecoveryMode: (active) => set({ recoveryMode: active }),

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t),
  })),
}));
```

### TanStack Query: Commitment Queries

```typescript
// src/lib/queries/commitment-queries.ts
import { queryOptions } from '@tanstack/react-query';

export const commitmentKeys = {
  all: ['commitments'] as const,
  lists: () => [...commitmentKeys.all, 'list'] as const,
  list: (filters: CommitmentFilters) => [...commitmentKeys.lists(), filters] as const,
  details: () => [...commitmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...commitmentKeys.details(), id] as const,
};

export function commitmentListOptions(filters: CommitmentFilters) {
  return queryOptions({
    queryKey: commitmentKeys.list(filters),
    queryFn: () => fetchCommitments(filters),
    staleTime: 30_000,        // 30 seconds
    refetchInterval: 60_000,  // 1 minute background refetch
  });
}
```

---

## Optimistic Updates

Every user action should feel instant. Pattern:

```typescript
const mutation = useMutation({
  mutationFn: (taskId: string) => toggleTask(taskId),
  onMutate: async (taskId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: commitmentKeys.all });

    // Snapshot previous value
    const previous = queryClient.getQueryData(commitmentKeys.list(filters));

    // Optimistically update
    queryClient.setQueryData(commitmentKeys.list(filters), (old) =>
      old?.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) =>
          t.id === taskId ? { ...t, status: 'completed' } : t
        ),
      }))
    );

    return { previous };
  },
  onError: (err, taskId, context) => {
    // Rollback on error
    queryClient.setQueryData(commitmentKeys.list(filters), context?.previous);
    toast.error('Failed to update task');
  },
  onSettled: () => {
    // Always refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: commitmentKeys.all });
  },
});
```

---

## Error Boundaries

### Error Boundary Hierarchy

```
RootLayout
├── GlobalErrorBoundary (error.tsx)
│   └── DashboardLayout
│       ├── PageErrorBoundary (per route error.tsx)
│       │   └── Page content
│       └── ComponentErrorBoundary (per widget)
│           └── HealthScoreGauge, NexusFeed, etc.
```

### Implementation

```typescript
// src/app/(dashboard)/war-room/error.tsx
'use client';

export default function WarRoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorState
      title="War Room couldn't load"
      description="We're looking into it. Try refreshing."
      retry={reset}
    />
  );
}
```

---

## Performance Optimization

| Technique | Implementation |
|---|---|
| **Code splitting** | Dynamic imports for heavy components (charts, command palette) |
| **Image optimization** | Next.js `<Image>` with priority for above-fold images |
| **Font optimization** | `next/font/google` with `display: swap` |
| **Bundle analysis** | `@next/bundle-analyzer` in CI |
| **Prefetching** | `<Link prefetch>` for sidebar navigation |
| **Streaming** | `loading.tsx` files for Suspense streaming |
| **Memoization** | `React.memo` for expensive list items (commitment cards) |
| **Virtualization** | `react-window` for NEXUS feed if >100 items |
| **Debouncing** | Command palette search debounced to 150ms |

---

## Realtime Architecture

```typescript
// src/lib/hooks/use-realtime.ts
'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useWarRoomStore } from '@/lib/stores/war-room-store';

export function useRealtimeWarRoom(userId: string) {
  const { setHealthScore, addNexusItem, updateTask } = useWarRoomStore();

  useEffect(() => {
    const supabase = createBrowserClient();

    const channel = supabase
      .channel('war-room')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'commitments',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.new) {
          setHealthScore(payload.new.health_score);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nexus_items',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        addNexusItem(payload.new as NexusItem);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        updateTask(payload.new.id, payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);
}
```

---

*Previous: [07 — Component Library](07_COMPONENT_LIBRARY.md) · Next: [09 — Backend Architecture](09_BACKEND_ARCHITECTURE.md)*
]]>
