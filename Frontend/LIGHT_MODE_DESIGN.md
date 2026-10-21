---
name: Archival Sanctuary
colors:
  surface: '#f9f9fe'
  surface-dim: '#d9d9df'
  surface-bright: '#f9f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f9'
  surface-container: '#ededf3'
  surface-container-high: '#e8e8ed'
  surface-container-highest: '#e2e2e8'
  on-surface: '#1a1c20'
  on-surface-variant: '#4e4638'
  inverse-surface: '#2e3035'
  inverse-on-surface: '#f0f0f6'
  outline: '#807667'
  outline-variant: '#d1c5b3'
  surface-tint: '#785915'
  primary: '#765713'
  on-primary: '#ffffff'
  primary-container: '#916f2a'
  on-primary-container: '#fffbff'
  inverse-primary: '#eac173'
  secondary: '#186c44'
  on-secondary: '#ffffff'
  secondary-container: '#a4f4c1'
  on-secondary-container: '#20724a'
  tertiary: '#a73131'
  on-tertiary: '#ffffff'
  tertiary-container: '#c84a47'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#eac173'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5d4200'
  secondary-fixed: '#a4f4c1'
  secondary-fixed-dim: '#88d7a7'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#005230'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#891b1f'
  background: '#f9f9fe'
  on-background: '#1a1c20'
  surface-variant: '#e2e2e8'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 44px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  code-notation:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.02em
  code-clock:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies the quiet, focused gravity of a classical manuscript library combined with the precision of competitive master chess analysis. Designed for grandmasters, serious students, and collectors of the game, the aesthetic evokes heavy vellum paper stock, engraved woodblock prints, museum vitrines, and ink on archival fiber.

The design movement mixes **Editorial Elegance** and **Architectural Tactility**. Layouts prioritize deep, unhurried negative space, hairline rules reminiscent of editorial bindery, and dense, typographic notation charts. It deliberately rejects the noisy neon gamification common to casual chess platforms in favor of a timeless, authoritative, and tranquil study environment.

## Colors

The palette reproduces the optical sensation of high-grade ivory book paper illuminated by natural north-facing window light. Pure blacks and synthetic cold grays are banned.

### Palette Architecture
- **Parchment Base (Canvas)**: `#FAF8F5` provides a restful, non-glare foundation.
- **Card & Modal Surface (`surface-low`)**: `#FFFFFF` creates an optical lift against the parchment canvas.
- **Interactive Layers & Plies (`surface-high`)**: `#EDE7DC` highlights past plies, hovered rows, and subtle inset wells.
- **Rules & Fillets**: `#E2DBD0` for subtle separation; `#D5CDC0` for structural framing.
- **Typography & Ink**:
  - Primary Ink: `#181A1E` (deep lampblack charcoal, maximum editorial legibility).
  - Secondary Commentary: `#5A606D` (warm slate for annotations and metadata).
  - Muted Glyphs: `#858D9C` (board coordinates, trailing moves, timestamp labels).
- **Accents & Chess Semantics**:
  - Archival Bronze (`#9E7B35` / `#B8934A`): Key moments, engine advantage, brilliant moves, book openings.
  - Emerald Forest (`#1E7048`): Checkmate delivery, rating gain, winning evaluation branches.
  - Madder Crimson (`#A83232`): Blunders, check, loss indicators.
  - Equilibrium Slate (`#646D7D`): Draw, book theory, neutral engine evaluations.
- **Tactile Board Tone**:
  - Light Squares: `#F7F4EB`
  - Dark Squares: `#B5A895`

## Typography

The tripartite typographic scale serves distinct cognitive domains:

1. **Newsreader**: The narrative voice. Used for major study titles, player monographs, historic game annotations, and classical opening titles. Set with open, generous leading to honor literary typography.
2. **Hanken Grotesk**: The interface layer. Clean, humanist, unobtrusive. Drives menus, settings, game setup dialogs, player names, and chat analysis with high legibility.
3. **JetBrains Mono**: The analytical instrument. Standardized for PGN notation streams, clock countdowns, board rank/file coordinates, and engine evaluation depth readouts. Its tabular figures guarantee move columns align without layout shift during active games.

## Layout & Spacing

The layout operates on a dual architecture: an asymmetric editorial column system for study modules and a disciplined split-cockpit for live play.

- **Desktop (1280px+)**: A central or anchored square viewport (ratio 1:1) dedicated to the chessboard, flanked by a 380px fixed analytical sidebar (notation, engine lines, opening trees) and an optional archival notebook drawer.
- **Tablet (768px - 1279px)**: Chessboard scaled dynamically to 60vw; notation shifts beneath the board or into a toggled right panel. Gutters compress to `1rem`.
- **Mobile (<768px)**: Board snaps to 100vw minus `0.75rem` outer margins. Move history renders horizontally above or below the board in a synchronized single-line ribbon. Clocks dock into the player identification strips.

Spacing between functional data rows follows the compact rhythm of an encyclopedia (`space-xs` and `space-sm`), while reading canvases use generous margins (`space-xl`) to establish scholarly pacing.

## Elevation & Depth

Visual hierarchy uses physical paper layering, hairline debossed rules, and whisper-soft umber-tinted ambient drops. Never use cold black or diffuse modern SaaS drops.

- **Level 0 (Parchment Base)**: `#FAF8F5`. Flat, raw texture base.
- **Level 1 (Card & Paper Vitrine)**: `#FFFFFF` resting on parchment. Framed by a 1px border of `#E2DBD0`. Shadow: `0 1px 3px rgba(24, 26, 30, 0.04), 0 4px 12px rgba(158, 123, 53, 0.03)`.
- **Level 2 (Active Modals, Menus, Floating Clocks)**: Elevated cards with `0 6px 20px rgba(24, 26, 30, 0.08), 0 1px 3px rgba(24, 26, 30, 0.04)` and a defined `#D5CDC0` hairline border.
- **Inset (Evaluation Bar & Chessboard Wells)**: Inset 1px line `#D5CDC0` paired with `inset 0 1px 3px rgba(24, 26, 30, 0.05)`.

## Shapes

The geometry reflects cut card stock, bound folio edges, and linotype slugs.

Elements adhere strictly to a crisp `4px` corner radius (`roundedness: 1`), conveying structural integrity and historical formality. Pills and heavy roundings are disallowed, maintaining an architectural character.

Chess pieces glide on square tiles (`0px` radius inside the board matrix), while the encompassing wooden board rim retains a tight `4px` exterior radius with an inset double border.

## Components

### Buttons
- **Primary Action (Analyze, Resign Confirmation, Accept Draw)**: Solid deep ink `#181A1E` background, `#FAF8F5` text, 4px corner radius. Hover shifts to Archival Bronze `#9E7B35`.
- **Secondary (Flip Board, Download PGN, Annotate)**: Crisp `#FFFFFF` surface, 1px `#D5CDC0` border, `#181A1E` text. Hover subtle wash `#EDE7DC`.
- **Ghost (Step Forward/Back Icons)**: Transparent background, `#5A606D` icon color. Active down-press snaps to `#EDE7DC`.

### Move Notation Table
- Displayed in paired columns (White / Black) with `JetBrains Mono` tabular lining.
- Plies use `4px` border radius on selection.
- Active move: `#EDE7DC` background with a left 2px `#9E7B35` bronze accent marker.
- Variations and engine sub-lines are indented with a vertical `#E2DBD0` thread line and set in `body-sm`.

### Input Fields & Search
- Surface: `#FFFFFF` with inset appearance using 1px `#D5CDC0` border.
- Focused state: Border changes to `#9E7B35` with no aggressive halo—only a subtle `0 0 0 1px #9E7B35`.
- Text utilizes `Hanken Grotesk` at 15px.

### Chess Clocks
- Inset rectangular module with `#EDE7DC` field.
- Digits set in `JetBrains Mono` (`code-clock`) in deep ink `#181A1E`.
- Active player's clock receives a warm bronze underline indicator (`#9E7B35`). Low-time warnings (<30s) transition subtly to `#A83232` with steady, high-contrast clarity.

### Evaluation Bar
- Minimalist vertical bar alongside file `a`.
- White advantage rendered in `#F7F4EB`; Black in `#181A1E`. The dividing threshold is drawn with a razor-thin `#9E7B35` thread.

### Cards & Study Folders
- Encased in 1px `#E2DBD0` border.
- Card header features small caps metadata in `Hanken Grotesk` (`label-sm`), separated from the body by a horizontal hairline rule.