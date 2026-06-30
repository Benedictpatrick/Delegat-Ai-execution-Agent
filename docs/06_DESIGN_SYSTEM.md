<![CDATA[# 06 — Design System

> Complete design token specification for Delegat: typography, spacing, grid, colors (dark + light), icons, buttons, inputs, cards, charts, animations, shadows, elevation, and component rules.

---

## Table of Contents

- [Design Tokens Overview](#design-tokens-overview)
- [Typography](#typography)
- [Spacing](#spacing)
- [Grid System](#grid-system)
- [Colors](#colors)
- [Icons](#icons)
- [Buttons](#buttons)
- [Inputs](#inputs)
- [Cards](#cards)
- [Tables](#tables)
- [Charts](#charts)
- [Animations](#animations)
- [Shadows & Elevation](#shadows--elevation)
- [Component Rules](#component-rules)

---

## Design Tokens Overview

All tokens are defined as CSS custom properties and consumed via Tailwind CSS v4.

```css
/* src/app/globals.css — Token Layer */
@layer base {
  :root {
    /* Colors, spacing, typography, shadows defined below */
  }

  [data-theme="dark"] {
    /* Dark mode overrides */
  }
}
```

---

## Typography

### Font Stack

| Usage | Font | Weight | Fallback | Source |
|---|---|---|---|---|
| **Headings** | Inter | 600, 700 | system-ui, sans-serif | Google Fonts |
| **Body** | Inter | 400, 500 | system-ui, sans-serif | Google Fonts |
| **Monospace** | JetBrains Mono | 400 | ui-monospace, monospace | Google Fonts |

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `--text-xs` | 12px / 0.75rem | 16px / 1rem | 400 | Labels, captions, timestamps |
| `--text-sm` | 14px / 0.875rem | 20px / 1.25rem | 400 | Body small, descriptions |
| `--text-base` | 16px / 1rem | 24px / 1.5rem | 400 | Body default |
| `--text-lg` | 18px / 1.125rem | 28px / 1.75rem | 500 | Card titles, emphasis |
| `--text-xl` | 20px / 1.25rem | 28px / 1.75rem | 600 | Section headings |
| `--text-2xl` | 24px / 1.5rem | 32px / 2rem | 600 | Page section titles |
| `--text-3xl` | 30px / 1.875rem | 36px / 2.25rem | 700 | Page titles |
| `--text-4xl` | 36px / 2.25rem | 40px / 2.5rem | 700 | Hero headings |
| `--text-5xl` | 48px / 3rem | 48px / 3rem | 700 | Landing page hero |
| `--text-health` | 64px / 4rem | 64px / 4rem | 700 | Deadline Health Score number |

### Letter Spacing

| Size | Letter Spacing |
|---|---|
| xs–sm | 0.01em |
| base–lg | 0 |
| xl–3xl | -0.01em |
| 4xl–5xl | -0.02em |
| health | -0.03em |

---

## Spacing

### Spacing Scale

Based on a 4px base unit.

| Token | Value | Usage |
|---|---|---|
| `--space-0` | 0px | Reset |
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Icon-text gap, dense list items |
| `--space-3` | 12px | Compact card padding |
| `--space-4` | 16px | Default padding, form gaps |
| `--space-5` | 20px | Card padding |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Section margins |
| `--space-10` | 40px | Large section gaps |
| `--space-12` | 48px | Page section spacing |
| `--space-16` | 64px | Major section breaks |
| `--space-20` | 80px | Landing page section spacing |
| `--space-24` | 96px | Hero section vertical spacing |

---

## Grid System

### Layout Grid

| Property | Value |
|---|---|
| Type | CSS Grid + Flexbox |
| Columns | 12-column on desktop, 4-column on mobile |
| Gutter | 24px (desktop), 16px (mobile) |
| Margin | 32px (desktop), 16px (mobile) |
| Max content width | 1440px (landing), 100% (dashboard) |

### Sidebar Grid

| State | Sidebar Width | Main Content |
|---|---|---|
| Expanded (desktop) | 240px | `calc(100vw - 240px)` |
| Collapsed (tablet) | 64px | `calc(100vw - 64px)` |
| Hidden (mobile) | 0px | 100vw |

---

## Colors

### Color Palette

#### Brand Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-brand-50` | `#EEF2FF` | `#1E1B4B` | Subtle backgrounds |
| `--color-brand-100` | `#E0E7FF` | `#312E81` | Hover states |
| `--color-brand-200` | `#C7D2FE` | `#3730A3` | Borders |
| `--color-brand-300` | `#A5B4FC` | `#4338CA` | Secondary elements |
| `--color-brand-400` | `#818CF8` | `#4F46E5` | Interactive elements |
| `--color-brand-500` | `#6366F1` | `#6366F1` | Primary brand color (same in both) |
| `--color-brand-600` | `#4F46E5` | `#818CF8` | Primary buttons, links |
| `--color-brand-700` | `#4338CA` | `#A5B4FC` | Hover on primary |
| `--color-brand-800` | `#3730A3` | `#C7D2FE` | Active state |
| `--color-brand-900` | `#312E81` | `#E0E7FF` | Text on dark backgrounds |

#### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-success` | `#10B981` | `#34D399` | Health ≥ 70%, completed actions |
| `--color-warning` | `#F59E0B` | `#FBBF24` | Health 40–69%, at-risk |
| `--color-danger` | `#EF4444` | `#F87171` | Health < 40%, errors |
| `--color-info` | `#3B82F6` | `#60A5FA` | Informational alerts |

#### Surface Colors (Dark Mode — Default)

| Token | Value | Usage |
|---|---|---|
| `--surface-0` | `#09090B` | Page background |
| `--surface-1` | `#18181B` | Card background, sidebar |
| `--surface-2` | `#27272A` | Elevated cards, dropdowns |
| `--surface-3` | `#3F3F46` | Hover states |
| `--surface-4` | `#52525B` | Active states |
| `--surface-border` | `#27272A` | Default borders |

#### Surface Colors (Light Mode)

| Token | Value | Usage |
|---|---|---|
| `--surface-0` | `#FFFFFF` | Page background |
| `--surface-1` | `#F4F4F5` | Card background, sidebar |
| `--surface-2` | `#E4E4E7` | Elevated cards, dropdowns |
| `--surface-3` | `#D4D4D8` | Hover states |
| `--surface-4` | `#A1A1AA` | Active states |
| `--surface-border` | `#E4E4E7` | Default borders |

#### Text Colors

| Token | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| `--text-primary` | `#FAFAFA` | `#09090B` | Headlines, body |
| `--text-secondary` | `#A1A1AA` | `#71717A` | Descriptions, labels |
| `--text-tertiary` | `#71717A` | `#A1A1AA` | Timestamps, hints |
| `--text-disabled` | `#52525B` | `#D4D4D8` | Disabled elements |
| `--text-on-brand` | `#FFFFFF` | `#FFFFFF` | Text on brand backgrounds |

---

## Icons

### Icon Library

Use **Lucide Icons** (MIT licensed, 1000+ icons, consistent style, tree-shakeable).

```bash
pnpm add lucide-react
```

### Icon Sizing

| Size | Pixels | Token | Usage |
|---|---|---|---|
| XS | 14×14 | `--icon-xs` | Inline with small text |
| SM | 16×16 | `--icon-sm` | Inline with body text |
| MD | 20×20 | `--icon-md` | Buttons, list items |
| LG | 24×24 | `--icon-lg` | Sidebar navigation |
| XL | 32×32 | `--icon-xl` | Section headers |
| 2XL | 48×48 | `--icon-2xl` | Empty states, onboarding |

### Icon Colors

Icons inherit `currentColor` by default. Override with semantic tokens when needed.

---

## Buttons

### Button Variants

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| **Primary** | `--color-brand-600` | `--text-on-brand` | None | Main actions (Create, Save, Execute) |
| **Secondary** | `transparent` | `--text-primary` | `--surface-border` | Secondary actions (Cancel, Back) |
| **Ghost** | `transparent` | `--text-secondary` | None | Tertiary actions, icon buttons |
| **Danger** | `--color-danger` | `--text-on-brand` | None | Destructive actions (Delete) |
| **Success** | `--color-success` | `--text-on-brand` | None | Positive actions (Complete, Approve) |

### Button Sizes

| Size | Height | Padding | Font | Icon |
|---|---|---|---|---|
| SM | 32px | 12px 16px | `--text-sm` | 16×16 |
| MD | 40px | 12px 20px | `--text-base` | 20×20 |
| LG | 48px | 16px 24px | `--text-lg` | 24×24 |

### Button States

| State | Visual Change |
|---|---|
| Default | As defined above |
| Hover | Brightness +10%, slight scale (1.01) |
| Active/Pressed | Brightness -5%, scale (0.99) |
| Focus | 2px focus ring (`--color-brand-400`), offset 2px |
| Disabled | Opacity 0.5, cursor not-allowed |
| Loading | Content replaced with spinner, width maintained |

---

## Inputs

### Text Input

| Property | Value |
|---|---|
| Height | 40px (MD), 32px (SM), 48px (LG) |
| Padding | 12px horizontal |
| Border | 1px solid `--surface-border` |
| Border radius | 8px |
| Background | `--surface-1` |
| Font | `--text-base` |
| Placeholder color | `--text-tertiary` |

### Input States

| State | Visual |
|---|---|
| Default | Standard border |
| Focus | Border color → `--color-brand-500`, shadow: `0 0 0 3px rgba(99,102,241,0.1)` |
| Error | Border color → `--color-danger`, error message below in `--color-danger` |
| Disabled | Background → `--surface-2`, opacity 0.6 |
| Read-only | Background → `--surface-2`, cursor default |

---

## Cards

### Card Variants

| Variant | Background | Border | Shadow | Usage |
|---|---|---|---|---|
| **Default** | `--surface-1` | `--surface-border` | `--shadow-sm` | Commitment cards, stats |
| **Elevated** | `--surface-2` | None | `--shadow-md` | Modals, dropdowns |
| **Interactive** | `--surface-1` | `--surface-border` | `--shadow-sm` → `--shadow-md` on hover | Clickable cards |
| **Status** | `--surface-1` | Left 3px border in status color | `--shadow-sm` | Risk items, NEXUS items |

### Card Padding

| Size | Padding |
|---|---|
| SM | 12px |
| MD | 16px |
| LG | 24px |

### Card Border Radius

| Size | Radius |
|---|---|
| SM | 8px |
| MD | 12px |
| LG | 16px |

---

## Charts

### Chart Colors (Ordered Palette)

| Index | Color | Token |
|---|---|---|
| 1 | `#6366F1` | `--chart-1` (Brand) |
| 2 | `#10B981` | `--chart-2` (Success) |
| 3 | `#F59E0B` | `--chart-3` (Warning) |
| 4 | `#3B82F6` | `--chart-4` (Info) |
| 5 | `#EC4899` | `--chart-5` (Pink) |
| 6 | `#8B5CF6` | `--chart-6` (Violet) |

### Chart Library

Use **Recharts** (React-native, composable, Tailwind-friendly).

---

## Animations

### Duration Scale

| Token | Duration | Usage |
|---|---|---|
| `--duration-fast` | 150ms | Hover effects, micro-interactions |
| `--duration-normal` | 300ms | Transitions, panel open/close |
| `--duration-slow` | 500ms | Color transitions, complex animations |
| `--duration-health` | 800ms | Health score bar fill |
| `--duration-counter` | 600ms | Number counting animation |

### Easing Functions

| Token | Value | Usage |
|---|---|---|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful interactions |

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Shadows & Elevation

### Shadow Scale

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Dropdowns, tooltips |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modals |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Command palette |
| `--shadow-glow-green` | `0 0 20px rgba(16,185,129,0.3)` | Health score glow (green) |
| `--shadow-glow-amber` | `0 0 20px rgba(245,158,11,0.3)` | Health score glow (amber) |
| `--shadow-glow-red` | `0 0 20px rgba(239,68,68,0.3)` | Health score glow (red) |

### Elevation Levels

| Level | Shadow | Z-Index | Usage |
|---|---|---|---|
| 0 | None | auto | Flat elements |
| 1 | `--shadow-xs` | auto | Subtle raised elements |
| 2 | `--shadow-sm` | auto | Cards |
| 3 | `--shadow-md` | 10 | Dropdowns |
| 4 | `--shadow-lg` | 40 | Modals |
| 5 | `--shadow-xl` | 50 | Command palette |
| 6 | — | 100 | Toast notifications |

---

## Component Rules

### General Rules

1. **All interactive elements** must have a minimum 44×44px touch target
2. **All colors** must meet WCAG 2.1 AA contrast requirements (4.5:1 for text, 3:1 for UI)
3. **All transitions** must respect `prefers-reduced-motion`
4. **All components** must support keyboard navigation
5. **No hardcoded colors** — always use design tokens
6. **No hardcoded spacing** — always use spacing scale
7. **No hardcoded font sizes** — always use type scale
8. **Dark mode is default** — light mode is an override

### Border Radius Rules

| Element | Radius |
|---|---|
| Buttons | 8px |
| Inputs | 8px |
| Cards | 12px |
| Modals | 16px |
| Avatars | 9999px (circle) |
| Badges | 9999px (pill) |
| Tooltips | 8px |

### Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `--z-dropdown` | 10 | Dropdown menus |
| `--z-sticky` | 20 | Sticky navbar, sidebar |
| `--z-overlay` | 30 | Backdrop overlays |
| `--z-modal` | 40 | Modal dialogs |
| `--z-command` | 50 | Command palette |
| `--z-toast` | 100 | Toast notifications |

---

*Previous: [05 — UI/UX System](05_UI_UX_SYSTEM.md) · Next: [07 — Component Library](07_COMPONENT_LIBRARY.md)*
]]>
