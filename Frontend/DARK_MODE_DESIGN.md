---
name: Chess Vault
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#d1c5b4'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#9a8f80'
  outline-variant: '#4e4639'
  surface-tint: '#e9c176'
  primary: '#e9c176'
  on-primary: '#412d00'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#775a19'
  secondary: '#c2c6d4'
  on-secondary: '#2b303b'
  secondary-container: '#444954'
  on-secondary-container: '#b4b8c5'
  tertiary: '#88d6af'
  on-tertiary: '#003824'
  tertiary-container: '#68b58f'
  on-tertiary-container: '#00452d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#dee2f0'
  secondary-fixed-dim: '#c2c6d4'
  on-secondary-fixed: '#171c25'
  on-secondary-fixed-variant: '#424752'
  tertiary-fixed: '#a4f3ca'
  tertiary-fixed-dim: '#88d6af'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 34px
    fontWeight: '400'
    lineHeight: 42px
    letterSpacing: -0.01em
  display-md:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.015em
  display-md-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: '400'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  notation-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  notation-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 3rem
---

## Brand & Style

This design system establishes an archival, quiet, and intellectual environment tailored for serious chess practitioners, historians, and collectors. The visual language evokes leather-bound match registries, classical tournament bulletins, and museum-grade collection databases rather than gamified platforms or hyperactive consumer web applications.

### Design Movement: Archival Editorial Minimalism
The aesthetic balances physical library gravity with modern structural precision:
- **Permanent & Scholarly:** Generous negative space, restrained tonal separations, and rigorous typographical hierarchy prioritize long-form study, game annotation, and analytical reflection.
- **Tactile Clarity without Skewing Literal:** Surfaces suggest fine paper stock, patinated wood, and matte slate without relying on synthetic textures or skeuomorphic gimmickry.
- **Quiet Restraint:** Avoid gratuitous floating cards, loud primary fills, neon status glows, or decorative borders. Chessboards, game diagrams, and notation transcripts act as the primary visual anchors of every screen.

## Colors

The palette operates under a strict, low-light discipline. Contrast is achieved through subtle value transitions and warm typographic tones rather than jarring shifts.

### Canvas & Surface Hierarchy
- **Base Canvas (`#0F1115`):** Deep ink slate foundation for root viewports and background sheets.
- **Surface Layer 1 (`#14171E`):** Secondary canvas used for inspection panels, sidebar registries, and active match analysis areas.
- **Surface Layer 2 (`#1A1F29`):** Interactive containers, move log containers, and floating popovers.
- **Borders & Dividers (`#1F242E` base, `#282E3B` interactive):** Whisper-thin boundaries creating structural separation without visually compartmentalizing content into disjointed floating cards.

### Typography & Content Tones
- **Primary Text (`#FAF8F5`):** Warm antique parchment off-white, preventing the eye fatigue caused by clinical pure white against charcoal surfaces.
- **Secondary Text (`#C8C5BD`):** Muted linen tone for game metadata, move commentary, and annotations.
- **Tertiary/Muted Text (`#7D8494`):** Subdued slate for move numbers, coordinates, timestamps, and structural metadata.

### Accents & Evaluative Indicators
- **Archival Bronze (`#C5A059` primary, `#D4AF37` hover/highlight):** Applied with disciplined restraint to bookmarked variations, win-rate accents, master badges, and active move indicators. It is never used as a solid full-button flood.
- **Win / Advantaged (`#2E7D5B`):** Muted forest emerald for victory notation and positive evaluation differentials.
- **Loss / Deficit (`#9E3B3B`):** Muted madder crimson for defeat indicators and inaccuracy annotations.
- **Draw / Equal (`#6C7485`):** Calm warm slate for drawn games, dead-equal positions, and neutral evaluations.

## Typography

The typographic system creates an interplay between classical literary authority and analytical rigor.

### Font Roles
- **Display & Section Headers (Newsreader):** A sophisticated transitional serif that imparts editorial gravity to match titles, tournament origins, player names, and reflective essays. It evokes historic tournament literature and annotated monographs.
- **Interface & Analytical Prose (Hanken Grotesk):** A refined, low-contrast grotesque with open counters and exceptional legibility across metadata tables, settings, game lists, and UI controls.
- **Algebraic Notation, Timers & Engine Readouts (JetBrains Mono):** Monospaced type ensuring fixed columnar alignment for chess coordinates, PGN transcript grids, evaluation engine decimals (`+0.42`), ECO codes, and move indices.

### OpenType Features
- Enable `tnum` (Tabular Numbers) across all numerical data to prevent horizontal jitter during clock countdowns and engine analysis updates.
- Enable discretionary ligatures on Newsreader only for editorial titles; disable all ligatures in monospaced notation blocks.

## Layout & Spacing

The layout is architectural, balanced, and deliberately unhurried. The interface relies on horizontal rules, intentional blank space, and proportional rhythm rather than enclosing components within padded floating cards.

### Layout Philosophy
- **Asymmetric Golden Ratio Split:** On desktop study views, the chessboard occupies a fixed, uncompromising square viewport anchoring the left/center, while annotation transcripts, move lists, and engine evaluations flow through an adjacent multi-column reading pane.
- **Margins & Rhythms:** Page gutters and outer canvas margins expand generously on wide screens (`margin: 2.5rem` minimum) to frame the archive like an open monograph.
- **Fluidity with Breakpoints:**
  - **Desktop (1280px+):** Integrated two- or three-pane split (Board + Score Sheet + Archive Tree). Grid margins fixed at `2.5rem` to `4rem`.
  - **Tablet (768px - 1279px):** Top-anchored board with collapsible notation drawer underneath. Gutters compress to `1.25rem`, canvas margins to `1.5rem`.
  - **Mobile (< 768px):** Board spans 100% viewport width minus a `1rem` margin. Notation, controls, and evaluations stack into a single vertical scroll stream below.

## Elevation & Depth

This system avoids drop shadows, blur washes, and saturated glows. Depth is expressed purely through calibrated value steps and crisp 1px structural rules.

### Spatial Depth through Value Stepping
- **Level 0 (Recessed/Canvas):** `#0F1115` — The deep foundation layer for primary canvases and background surfaces.
- **Level 1 (Structural Pane):** `#14171E` — Subtle tonal lift applied to notation sidebars, archive indexes, and tool panels, defined by a 1px border of `#1F242E`.
- **Level 2 (Active/Selected Row or Tile):** `#1A1F29` — Interactive focus state for move logs, historical matches, and table rows.
- **Level 3 (Overlays & Dialogs):** `#1A1F29` surrounded by a clean 1px outline in `#282E3B`. If backdrop dimming is necessary, use an un-blurred `#07080A` wash at 75% opacity to maintain focus on the modal surface.

### Board Elevation
The chessboard sits flush with the base canvas, defined solely by a 1px border of `#282E3B`. It is never elevated above the canvas with a drop shadow, treating the board as a flat, inlaid surface of slate and bone.

## Shapes

The design system uses a strict **Soft (`roundedness: 1`)** shape language:
- **Default Elements:** Buttons, inputs, inline badges, and notation cells receive a subtle `0.25rem` (4px) radius. This softens raw corners while preserving architectural precision.
- **Containers & Panels:** Large viewports, dialogs, and boards use either `0px` or `0.25rem` radius maximum. Rounded pill shapes and large playful curves are strictly forbidden.
- **Square Cells:** Chessboard squares, move evaluation markers, and tabular data cells remain strictly square (`0px` radius) to maintain structural integrity.

## Components

### Buttons & Actions
- **Primary Action:** Transparent background with a refined 1px border in Archival Bronze (`#C5A059`), typography in `#FAF8F5` (`label-caps`), and a subtle hover shift to `#1F242E` with bronze text brightening to `#D4AF37`. Never use heavy, solid gold button fills.
- **Secondary / Ghost Action:** Flat transparent surface with subtle `#1F242E` borders and `#C8C5BD` text. Hover state transitions background to `#14171E` with `#FAF8F5` text.
- **Destructive Action:** Border in muted madder crimson (`#9E3B3B`), text in `#9E3B3B`, transitioning on hover to a 10% opacity crimson wash.

### Chess Move Notation Sheet
- **Structure:** Two-column tabular ledger formatted in `notation-md` (`JetBrains Mono`). Move numbers set in muted slate (`#7D8494`).
- **Active Ply:** Selected move highlighted with a restrained background pill (`#282E3B`) and an Archival Bronze underline (`1px solid #C5A059`).
- **Variations & Sub-lines:** Indented with a 1px left guide line in `#1F242E`, typography scaled to `notation-sm` and colored in `#C8C5BD`.

### Input Fields & Search Bars
- **Style:** Background `#14171E`, border 1px `#1F242E`, inner padding `0.625rem 0.875rem`, text `#FAF8F5`.
- **Focus State:** Border shifts cleanly to `#C5A059` without external rings or ambient glows. Placeholders rendered in `#7D8494`.

### Lists & Archive Tables
- **Row Styling:** Zero card wrapping. Rows are separated by 1px bottom dividers (`#1F242E`).
- **Hover State:** Smooth background shift to `#14171E`.
- **Result Badges:** Minimal monospaced badges (`1-0`, `0-1`, `½-½`):
  - Win: `#2E7D5B` text with an ultra-subtle tint (`rgba(46, 125, 91, 0.12)`).
  - Loss: `#9E3B3B` text with an ultra-subtle tint (`rgba(158, 59, 59, 0.12)`).
  - Draw: `#6C7485` text with neutral slate background (`#1A1F29`).

### Checkboxes & Toggle Controls
- **Checkboxes:** 14px square boxes, 1px border in `#282E3B`, background `#14171E`. Selected state displays a crisp Archival Bronze mark (`#C5A059`) with no gradient or outer shadow.
- **Segmented Toggles:** Enclosed in a single `#14171E` track with a 1px `#1F242E` border. The active option features a `#1A1F29` fill with `#FAF8F5` text and a bronze bottom indicator rule.

### Chessboard Visual Anchor
- **Dark Squares:** `#282E3B` (rich charcoal slate).
- **Light Squares:** `#E6E4DF` (warm archival bone).
- **Coordinates:** Small monospaced labels (`10px`, `JetBrains Mono`) placed discreetly inside corner squares, colored in inverted tones corresponding to the square value.
- **Last Move Highlight:** Translucent parchment gold wash (`rgba(197, 160, 89, 0.2)`) applied across source and destination squares without obstructing piece contrast.