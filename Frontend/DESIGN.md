---
name: Chess Vault
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#4f4540'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#81756f'
  outline-variant: '#d3c3bd'
  surface-tint: '#705a4f'
  primary: '#25160e'
  on-primary: '#ffffff'
  primary-container: '#3c2a21'
  on-primary-container: '#aa9084'
  inverse-primary: '#dec1b3'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#0c1c1c'
  on-tertiary: '#ffffff'
  tertiary-container: '#213131'
  on-tertiary-container: '#889999'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fbdcce'
  primary-fixed-dim: '#dec1b3'
  on-primary-fixed: '#281810'
  on-primary-fixed-variant: '#574238'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#d4e6e5'
  tertiary-fixed-dim: '#b8cac9'
  on-tertiary-fixed: '#0e1e1e'
  on-tertiary-fixed-variant: '#394a4a'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
  surface-soft: '#F5F0E6'
  surface-muted: '#E5DED0'
  text-secondary: '#6D5D51'
  ink-black: '#1A1412'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Karla
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Karla
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Karla
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Karla
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  margin-page: 40px
  gutter: 24px
  container-max: 1120px
---

## Brand & Style
The design system is centered on the concept of a **Personal Archive**—a digital sanctuary for the intellectual pursuit of chess. Moving away from the competitive, high-adrenaline aesthetic of modern gaming platforms, this design system evokes the tactile quality of a high-end physical library or a beautifully printed chess monograph.

The style is **Editorial Tactile**. It leverages heavy whitespace, exquisite typography, and subtle paper-like textures to create a premium, nostalgic atmosphere. It avoids the "gamification" tropes of neon lights and aggressive animations, favoring a slow-paced, reflective user experience that treats every chess game as a piece of history worth preserving.

## Colors
The palette is grounded in organic, warm tones that mimic natural materials like vellum, aged paper, and polished wood. 

- **Primary Background:** Use `#FDFBF7` (Light Cream) as the base for all pages to ensure a warm, inviting canvas.
- **Surfaces:** Use `#F5F0E6` for secondary sections and `#E5DED0` for deeper UI layers like sidebars or card backgrounds.
- **Typography:** The primary text is `#3C2A21` (Dark Brown), which provides high contrast without the harshness of pure black. Secondary metadata uses `#6D5D51`.
- **Accents:** `#C5A059` (Gold/Ochre) is reserved for highlighting the "Golden Path"—critical actions like "Export PGN" or "Analyze Game," as well as winning moves.

## Typography
The typography pairing establishes an editorial rhythm. **Libre Caslon Text** provides a scholarly, historical weight for headings, reminiscent of classic book typesetting. **Karla** provides a slightly quirky, grotesque clarity for UI elements and body text, ensuring the interface feels modern and accessible despite its nostalgic leanings.

Large display headings should use tighter letter spacing to emphasize their "ink-on-paper" feel. Labels and small metadata should use the uppercase `label-caps` style to provide clear hierarchy in data-dense areas like move lists.

## Layout & Spacing
The layout follows a **Fixed Center-Column** philosophy on desktop to mimic the focused reading experience of a book. Content is centered with generous outer margins (`40px+`) to prevent the UI from feeling "crowded" or corporate.

A 12-column grid is used for the archive dashboard, while game analysis pages transition to a modular 2-column layout (Board vs. Notation). Spacing should be airy; favor larger paddings (`32px` or `48px`) between sections to allow the user's eyes to rest.

## Elevation & Depth
In keeping with the tactile theme, this design system rejects standard drop shadows. Instead, it uses **Tonal Layering** and **Subtle Insets**.

- **Level 0 (Base):** Light Cream (`#FDFBF7`).
- **Level 1 (Cards/Panels):** Soft Beige (`#F5F0E6`) with a 1px solid border of `#E5DED0`.
- **Active States:** Instead of a shadow, use a 2px "inset" border or a slight shift in background color to create a physical "pressed" sensation.
- **Overlays:** Use a subtle "film grain" or paper texture overlay (low opacity) on large surfaces to enhance the physical archive aesthetic.

## Shapes
Shapes are **Soft** but disciplined. A 4px (`0.25rem`) corner radius is applied to cards, buttons, and input fields to bridge the gap between classic stationery (sharp) and modern UI (rounded). The chessboard itself remains sharp-cornered to maintain its geometric integrity, but the surrounding container should be softened.

## Components
- **Buttons:** Primary buttons use the Ochre accent (`#C5A059`) with White text. Secondary buttons are "Ghost" style—Dark Brown text with a simple `#E5DED0` border.
- **Chessboard:** Eschew bright greens/blues. Use Ivory and Wood-brown for the tiles. Pieces should be high-contrast "Inked" silhouettes.
- **Notation Cards:** Use `label-caps` for move numbers. The active move should be highlighted with a soft ochre background (`#F5F0E6` mixed with accent) rather than a bold highlight.
- **Input Fields:** Styled like traditional ledger lines—a bottom-border only (`1px solid #3C2A21`) with the label floating above in `label-caps`.
- **Archive List:** Items should be separated by a single thin rule. On hover, the entire row shifts to the Soft Beige surface color.