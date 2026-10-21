# Chess Vault — Frontend Design System

## 1. Overview & Brand Philosophy

Chess Vault is a permanent archive and rediscovery system for a player's chess history. The visual architecture embodies the quiet, focused gravity of a classical manuscript library fused with the precision of master chess analysis.

The design movement balances **Editorial Elegance** and **Architectural Tactility**:
- **Permanent & Scholarly**: Unhurried negative space, hairline rules reminiscent of bookbindery, and disciplined typographic hierarchy.
- **Tactile Clarity**: Surfaces suggest vellum paper stock, patinated wood, and matte slate without skeuomorphic gimmickry.
- **Anti-Gamification**: Rejects neon gamification badges, aggressive saturated glows, or confetti effects in favor of scholarly authority and focus.

---

## 2. Dual Themes: Archival Sanctuary (Light) & Archival Slate (Dark)

Chess Vault natively supports both **Light Mode** and **Dark Mode** via centralized CSS variables.

Detailed token breakdowns and design specifications are maintained in their respective design documents:
- 📖 [Light Mode Specification: Archival Sanctuary](LIGHT_MODE_DESIGN.md)
- 📖 [Dark Mode Specification: Archival Slate](DARK_MODE_DESIGN.md)

### Theme Architecture

All design tokens are defined in [`src/index.css`](src/index.css) as CSS custom properties under `:root` / `[data-theme="light"]` and `[data-theme="dark"]` / `.dark`.

Tailwind classes in [`tailwind.config.js`](tailwind.config.js) reference these variables using dynamic RGB opacity channels (`rgb(var(--color-vault-*) / <alpha-value>)`).

> [!IMPORTANT]
> **Single Definition Rule**: Never write ad-hoc `dark:` and `light:` variant classes across components for colors. Always use the semantic `vault-*` tokens (`bg-vault-background`, `bg-vault-surface-layer-1`, `border-vault-border-base`, `text-vault-text-primary`, etc.). The theme system automatically resolves the colors based on the active theme.

### Core Token Mapping

| Token Name | Light Mode (Archival Sanctuary) | Dark Mode (Archival Slate) | Intended Semantic Usage |
| :--- | :--- | :--- | :--- |
| `vault-background` | `#FAF8F5` (Parchment Base) | `#111317` (Deep Ink Slate) | Root viewport background |
| `vault-canvas-base` | `#FAF8F5` | `#0F1115` | Recessed page canvas |
| `vault-surface-layer-1` | `#FFFFFF` (Paper Vitrine) | `#14171E` | Primary cards, sidebars, panels |
| `vault-surface-layer-2` | `#F3F3F9` / `#EDE7DC` | `#1A1F29` | Inset wells, move lists, active cards |
| `vault-border-base` | `#E2DBD0` | `#1F242E` | Baseline structural rules & dividers |
| `vault-border-interactive` | `#D5CDC0` | `#282E3B` | Focusable outlines, button borders |
| `vault-text-primary` | `#181A1E` (Lampblack Ink) | `#FAF8F5` (Antique Parchment) | Primary titles, active moves, inputs |
| `vault-text-secondary` | `#5A606D` (Warm Slate) | `#C8C5BD` (Muted Linen) | Descriptions, annotations, metadata |
| `vault-text-muted` | `#858D9C` | `#7D8494` (Subdued Slate) | Timestamps, coordinates, trailing plies |
| `vault-bronze` | `#9E7B35` | `#C5A059` | Key moments, active plies, highlights |
| `vault-bronze-hover` | `#B8934A` | `#D4AF37` | Hover states on interactive bronze items |
| `vault-win` | `#1E7048` (Forest Emerald) | `#2E7D5B` | Wins, positive evaluations, mate |
| `vault-loss` | `#A83232` (Madder Crimson) | `#9E3B3B` | Losses, inaccuracies, blunders |
| `vault-draw` | `#646D7D` | `#6C7485` | Drawn outcomes, equal evaluation |
| `vault-board-dark` | `#B5A895` | `#282E3B` | Chessboard dark squares |
| `vault-board-light` | `#F7F4EB` | `#E6E4DF` | Chessboard light squares |

---

## 3. Typography Scale & Roles

Chess Vault standardizes on a tripartite typography system:

1. **Newsreader** (`font-display`): Transitional editorial serif.
   - Used for major match titles, player monographs, historic game annotations, and classical opening headings.
   - Expresses literary authority and history.
2. **Hanken Grotesk** (`font-body`, `font-sans`): Clean humanist grotesque.
   - Standard interface typography for navigation, buttons, form controls, data tables, and player info tags.
   - High legibility across small sizes.
3. **JetBrains Mono** (`font-mono`, `font-notation`): Precision tabular monospace.
   - Standardized for algebraic move transcripts, clocks (`tnum`), file/rank board coordinates, and Stockfish evaluations.
   - Always pair numerical clocks and notation tables with `.tnum` (`font-variant-numeric: tabular-nums`) to prevent layout shifts.

### Standard Type Tokens

- `display-lg`: 48px / 56px (Newsreader)
- `display-md`: 36px / 44px (Newsreader)
- `headline-lg`: 26px / 34px (Newsreader)
- `headline-md`: 20px / 28px (Hanken Grotesk)
- `headline-sm`: 16px / 24px (Hanken Grotesk, 600)
- `body-lg`: 16px / 26px (Hanken Grotesk)
- `body-md`: 14px / 22px (Hanken Grotesk)
- `body-sm`: 13px / 18px (Hanken Grotesk)
- `notation-md`: 14px / 22px (JetBrains Mono)
- `notation-sm`: 12px / 18px (JetBrains Mono)
- `label-caps`: 11px / 16px (Hanken Grotesk, 600, uppercase, letter-spacing: 0.08em)

---

## 4. Shapes, Elevation & Spacing

### Corner Radii
- **Default Corner Radius**: `rounded-vault` (`0.25rem` / `4px`). Elements adhere strictly to crisp 4px corners to convey architectural formality.
- **Pills Disallowed**: Heavy rounded pills (`rounded-full`) are banned for core interface cards and buttons.
- **Board Squares**: Board squares and notation matrix cells remain strictly square (`0px` radius).

### Elevation & Depth
Depth is created through value stepping and hairline 1px borders rather than saturated drops or heavy blur filters:
- **Level 0 (Canvas)**: Base background (`bg-vault-background`).
- **Level 1 (Card/Pane)**: Surface Layer 1 (`bg-vault-surface-layer-1 border border-vault-border-base`).
- **Level 2 (Active/Hover/Selected)**: Surface Layer 2 (`bg-vault-surface-layer-2 border border-vault-border-interactive`).
- **Level 3 (Modal/Overlay)**: Surface Layer 2 or Layer 1 with a hairline border (`border-vault-border-interactive shadow-lg`).

---

## 5. Components & UI Patterns

### Buttons
- **Primary**: Transparent background with Archival Bronze border (`border border-vault-bronze text-vault-text-primary hover:bg-vault-border-base`).
- **Solid Bronze**: High-emphasis action (`bg-vault-primary text-vault-on-primary hover:bg-vault-primary-container`).
- **Secondary**: Clean whisper border on surface (`border border-vault-border-base bg-vault-surface-layer-1/80 text-vault-text-secondary hover:bg-vault-surface-layer-2`).
- **Destructive**: Muted crimson (`border border-vault-loss text-vault-loss hover:bg-vault-loss/10`).

### Move Notation Ledger
- Two-column tabular ledger with `JetBrains Mono`.
- Active ply: highlighted with background `bg-vault-surface-layer-2` and a 1px bronze underline or accent bar.

### Chessboard
- Integrated via `react-chessboard` with colors wired dynamically from `useTheme().boardColors`:
  - Dark squares: `boardColors.boardDark`
  - Light squares: `boardColors.boardLight`
- Pieces animate smoothly; rapid moves (<280ms) automatically suppress animation to prevent input lag.

### Theme Switching & Transitions
- `useTheme()` hook provides `theme` (`"light" | "dark" | "system"`), `resolvedTheme` (`"light" | "dark"`), and `setTheme()`.
- Smooth 250ms cross-fade animation is applied dynamically to the root DOM tree during theme toggling, ensuring instantaneous, stutter-free theme switching.
