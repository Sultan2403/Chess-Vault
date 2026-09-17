# Chess Vault: UI Prototype Mismatches, Assumptions & Pending Features (TODO)

## Purpose
This document tracks all inconsistencies, prototype placeholders ("propaganda"), and architectural gaps between the new **Archival Editorial Minimalism** UI designs and the existing server/data layer contracts. 

Strictly conforming to `AGENTS.md`, we do not invent unverified backend APIs or alter the core domain model (`Game`, `Folder`, `User`). Instead, the UI renders high-fidelity representations of these archival concepts with graceful fallbacks to real data where available, and documents all pending server/client implementations below.

---

## Screen-by-Screen Mismatch Analysis

### 1. Landing Page (`/` — Screenshot 1)
| Feature in UI Prototype | Existing Codebase Reality | Current Handling | Future Implementation Required (TODO) |
|---|---|---|---|
| **Live Match Showcase (3 Cards with Mini Boards)** | Unauthenticated visitors do not have access to private user games. | Curated historical masterpieces (e.g. Evans Gambit, Nimzo-Indian, King's Indian) embedded as default demonstration ledgers. | Optional public demo games endpoint or static curated showcase registry. |
| **Instant Username Ingestion Form ("Enter username -> START FREE")** | Backend requires Clerk authentication before linked account association and sync. | Directs user into the `/sign-up` onboarding flow with pre-filled state where supported. | Implement unauthenticated public ledger preview before signup. |
| **OCR Paper & Carbon Ledger Ingestion** | No optical character recognition (OCR) or photo upload pipelines exist. | Informational / marketing showcase explaining the future vision. | Add OCR pipeline for physical scoresheets (Vision AI / Tesseract integration). |
| **Universal PGN/FEN Export & 100% Data Loss Guarantee** | Games have PGN strings, but no bulk batch ZIP/archive export endpoint exists. | Single game PGN download works; batch export UI triggers notification. | Implement bulk archive export endpoint (`/games/export/all.zip`). |

---

### 2. Library / Dashboard (`/dashboard` & `/library` — Screenshot 2)
| Feature in UI Prototype | Existing Codebase Reality | Current Handling | Future Implementation Required (TODO) |
|---|---|---|---|
| **TOTAL INDEXED ("4,218 +12 this wk")** | `useGames({ limit: 1 })` provides `pagination.total`. If account is empty, returns `0`. | Displays real `pagination.total` from the server. If `0`, displays an archival starter indicator with quick account connect trigger. | Add weekly change tracking (`+X this wk`) in backend analytics. |
| **CURATED FOLIOS ("14 active")** | `useFolders()` provides real user folder count via `total`. | Displays real folder count. Fallbacks to `0` when no folders are created. | N/A — Connected to real data. |
| **ANNOTATED STUDIES ("62 Starred")** | The `Game` model has `notes?: string; tags?: string;`, but no boolean `isStarred` or `isStudy` field. | Counts games with non-empty `notes` or tagged records. | Add explicit `isStarred` or study collection taxonomy to the Game schema if needed. |
| **ARCHIVE SOURCES ("3 connected repositories: Lichess, Chess.com, OTB FIDE")** | The server supports `chess.com` and `lichess` only (`PlatformType`). OTB FIDE is not a supported platform. | Shows connected platforms from `useAccountBootstrap()`. OTB FIDE is tagged as "Manual Ingestion / OTB". | Implement FIDE ID registry lookup or manual OTB tournament ingestion. |
| **Recent Engagements (3 Interactive Boards)** | Real user games retrieved via `useGames({ limit: 3 })`. | Renders real user games if imported; falls back to curated sample matches if the vault is brand new. | N/A — Connected to real data. |
| **Archive Observations (Opening Drift, W/D/L in Catalan, Rapid Peak 2,185)** | No server-side analytics, opening performance calculations, or Elo milestone tracking exist. | Renders UI prototype with high fidelity using mock observation models. | Build an analytical aggregation service for opening tendencies and rating peaks. |
| **Force Sync Now** | `accountApi.syncLinkedAccount(id)` exists for individual linked accounts. | Triggers sync on active linked accounts from bootstrap. | Add a single unified `syncAll` endpoint on the server. |

---

### 3. Game Viewer (`/game/:id` — Screenshot 3)
| Feature in UI Prototype | Existing Codebase Reality | Current Handling | Future Implementation Required (TODO) |
|---|---|---|---|
| **Stockfish 16.1 Evaluation Badge & Bar (`+4.82`, `Depth 36`)** | The backend stores raw PGN text. No engine evaluation server or local WebAssembly Stockfish worker is integrated. | Displays an archival evaluation bar with high-fidelity visual feedback. | Integrate `stockfish.js` WebAssembly worker client-side for on-device move analysis. |
| **Move Highlight Badge on Board Square (`34. Bxd5! (+4.82)`)** | Moves are stepped using `chess.js` verbose history. Move annotation glyphs (`!`, `?`, `!!`) and dynamic centipawn scores are not in the standard PGN headers unless parsed from NAGs. | Renders active move indicator with coordinate badge. Extracts NAGs where present. | Parse PGN NAGs (`$1`, `$3`, `$4`) into glyphs (`!`, `!?`, `!!`). |
| **Clocks & Captured Pieces readouts** | Standard PGNs from Chess.com and Lichess sometimes include clock comments `{ [%clk 0:14:28] }`, but they are stripped during fallback parsing. | Derived from board piece counts dynamically for captured pieces; clock displays formatted time. | Add dedicated PGN comment parser to extract clock timestamps per ply. |
| **Player Reflection & Memory Log (Auto-Save)** | The `Game` model has a single `notes?: string` field (max 1000 chars). | Editable textarea that updates notes state and debounces changes to the server/mock. | Add rich multi-block marginalia and timestamped memory log to the Game schema. |
| **Print Scoresheet & PDF Export** | No client-side PDF renderer or server PDF generation exists. | Window print stylesheet trigger (`window.print()`) formatted for archival paper. | Integrate `@react-pdf/renderer` or server PDF generation if approved. |
| **Audio Move Commentary** | No text-to-speech or recorded audio files exist. | UI-only icon with tooltip indicating feature in prototype. | Integrate Web Speech API / audio move pronunciation. |

---

### 4. Collections / Folio Detail (`/collections` & `/collections/:id` — Screenshot 4)
| Feature in UI Prototype | Existing Codebase Reality | Current Handling | Future Implementation Required (TODO) |
|---|---|---|---|
| **Folio Metadata (Folio No. 04, 24 entries, Calculated Performance 2241)** | `Folder` model has `id`, `userId`, `name`, `description`, `color`, `createdAt`, `updatedAt`. It has no `folioNumber` or performance rating. | Derives folio identifier from folder ID / index. Computes performance metric from member games where available. | Add folder metadata extensions in backend (repertoire type, performance rating). |
| **Post-Mortem Monograph Notes & Autopsies** | Game schema has `notes?: string`, not structured post-mortem cards with `Accuracy: 94.8%`. | Parses structured notes if present, otherwise displays notes in the monograph callout format. | Provide structured analysis schema (accuracy, preparation match %). |
| **Key Ply Transcript (Plies 28-34)** | PGN contains the entire move sequence. | Automatically extracts the critical tactical phase (final 6-8 plies) of the game. | N/A — Derived client-side from `chess.js` move history. |
| **Replay Suite & Scoresheet Ref (`#CV-2024-009`)** | Deep replay suites are linked directly to `/game/:id`. | Links directly into the Game Viewer with auto-focused move. | N/A — Functional via routing. |

---

### 5. Game Bank (`/game-bank` — Screenshot 5)
| Feature in UI Prototype | Existing Codebase Reality | Current Handling | Future Implementation Required (TODO) |
|---|---|---|---|
| **Platform Tabs: OTB FIDE & Parameters** | Server filter accepts `platform: "chess.com" \| "lichess"`. | Client-side tab filters smoothly across connected sources and platforms. | Add server query parameter support for custom sources. |
| **Multi-Select Staging Bar ("Select all 12 visible • 0 games staged")** | Frontend-only batch selection state. | Fully functional multi-select state (select all, clear, count staged games). Bulk actions display confirmation. | Add batch endpoints for `addGamesToFolder` and `batchDeleteGames`. |
| **ECO Codes & Opening Lines (`ECO B90 • Sicilian, Najdorf Variation`)** | `GameSchema` has `title` (often formatted as `Opening: Variation` by importers), but no standalone `eco` field. | Extracts ECO code and opening name from game title or PGN headers dynamically. | Store explicit `eco` and `openingName` fields in the `Game` database schema. |
| **Pagination: Epochs ("Page 1 of 703")** | Server supports `page` and `limit` (max 100). | Full pagination wired to `useGames({ page, limit })`. | N/A — Connected to real pagination. |

---

## Codebase Protections & Rules Kept
1. **Core `Game` type protected**: Untouched in `shared/src/types/games.types.ts`.
2. **Zero unauthorized dependencies**: Built entirely with `react-chessboard`, `chess.js`, `lucide-react`, `motion`, `@clerk/react`, `@tanstack/react-query`.
3. **No server disruptions**: All APIs consumed via existing endpoints (`/games`, `/folders`, `/account/bootstrap`).
