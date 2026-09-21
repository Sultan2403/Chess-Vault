import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ArrowRight,
  Database,
  FolderKanban,
  FileText,
  Star,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { MiniChessboard } from "../components/ui/MiniChessboard";

const HERO_HEADLINES = [
  {
    lead: "Every move you've ever made.",
    accent: "Finally in one permanent home.",
  },
  {
    lead: "Google Photos,",
    accent: "but for your chess legacy.",
  },
  {
    lead: "Your intellectual footprint,",
    accent: "unbothered by algorithm feeds.",
  },
  {
    lead: "A permanent, timeless sanctuary",
    accent: "for every move you play.",
  },
];

export default function HomePage() {
  const [usernameInput, setUsernameInput] = useState("");
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HERO_HEADLINES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleStartFree = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      navigate(`/sign-up?username=${encodeURIComponent(usernameInput.trim())}`);
    } else {
      navigate("/sign-up");
    }
  };

  return (
    <div className="min-h-screen bg-vault-background text-vault-on-background font-body selection:bg-vault-primary/20 selection:text-vault-primary">
      {/* Editorial Navigation Header */}
      <header className="border-b border-vault-border-base bg-vault-surface-container-lowest/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-primary">
              <Shield size={16} strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-vault-text-primary leading-none">
                Chess Vault
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-vault-text-muted mt-0.5">
                Archival Chess Registry
              </span>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-7 text-xs font-mono md:flex text-vault-text-secondary">
            <a
              href="#philosophy"
              className="hover:text-vault-text-primary transition-colors"
            >
              Philosophy
            </a>
            <a
              href="#features"
              className="hover:text-vault-text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#the-archive"
              className="hover:text-vault-text-primary transition-colors"
            >
              The Archive
            </a>
            <a
              href="#evaluations"
              className="hover:text-vault-text-primary transition-colors"
            >
              Evaluations
            </a>
            <a
              href="#pricing"
              className="hover:text-vault-text-primary transition-colors"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4 text-xs font-mono">
            <NavLink
              to="/sign-in"
              className="text-vault-text-secondary hover:text-vault-text-primary transition-colors uppercase tracking-wider"
            >
              Sign In
            </NavLink>
            <NavLink to="/sign-up">
              <Button
                variant="primary"
                className="text-xs uppercase tracking-widest px-4 py-1.5"
              >
                Open Your Vault
              </Button>
            </NavLink>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-vault-border-interactive bg-vault-surface-layer-1 px-3 py-1 text-[11px] font-mono text-vault-text-secondary mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-vault-bronze" />
            <span>THE ARCHIVE FOR SERIOUS CHESS PRACTITIONERS</span>
            <span className="text-vault-text-muted">•</span>
            <span className="text-vault-text-muted">
              ESTABLISHED 2024 / REGISTER NO. 041
            </span>
          </div>

          <div className="min-h-[140px] sm:min-h-[160px] lg:min-h-[180px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h1
                key={headlineIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="font-display text-4xl sm:text-6xl lg:text-[68px] font-normal leading-[1.08] tracking-tight text-vault-text-primary"
              >
                {HERO_HEADLINES[headlineIndex].lead} <br />
                <span className="italic font-normal text-vault-bronze">
                  {HERO_HEADLINES[headlineIndex].accent}
                </span>
              </motion.h1>
            </AnimatePresence>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base leading-relaxed text-vault-text-secondary font-sans">
            Consolidate thousands of games across Chess.com, Lichess, and OTB
            tournaments into a clean, timeless library. Never lose your master
            ties to fleeting algorithm feeds.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <NavLink to="/sign-up">
              <Button
                variant="solid-bronze"
                className="px-6 py-3 text-xs tracking-widest uppercase"
              >
                Open For Free Vault
              </Button>
            </NavLink>
            <NavLink to="/dashboard">
              <Button
                variant="secondary"
                className="px-6 py-3 text-xs tracking-widest uppercase"
              >
                Explore Live Archive Demo{" "}
                <ArrowRight size={13} className="ml-1" />
              </Button>
            </NavLink>
          </div>


          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-vault-text-muted">
            <span>NO CREDIT CARD REQUIRED</span>
            <span>•</span>
            <span>IMPORT IN UNDER 30 SECONDS</span>
            <span>•</span>
            <span>SECURE ENCRYPTED STORAGE</span>
          </div>
        </section>

        {/* INTERACTIVE FEATURED MATCH SHOWCASE (Screenshot 1 Match Preview) */}
        <section className="mx-auto max-w-content px-6 py-8" id="the-archive">
          <div className="rounded-vault border border-vault-border-interactive bg-vault-surface-layer-1/90 overflow-hidden shadow-2xl">
            {/* Ledger Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vault-border-base bg-vault-surface-layer-2 px-6 py-3.5 text-xs font-mono">
              <div className="flex items-center gap-2 text-vault-text-secondary">
                <span className="h-2 w-2 rounded-full bg-vault-win" />
                <span className="font-semibold text-vault-text-primary">
                  Recent Archived Match
                </span>
                <span>•</span>
                <span className="text-vault-text-muted">FIDE ID: 120042</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-1 px-2 py-0.5 text-[11px] text-vault-text-secondary">
                  4,218 Games Curated
                </span>
                <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-1 px-2 py-0.5 text-[11px] text-vault-text-secondary">
                  Chess.com & Lichess Connected
                </span>
                <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-1 px-2 py-0.5 text-[11px] text-vault-bronze">
                  Universal Importer/Sync
                </span>
              </div>
            </div>

            {/* Match Preview Rows */}
            <div className="divide-y divide-vault-border-base">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-6 p-6 items-center hover:bg-vault-surface-layer-2/50 transition-colors">
                <div className="w-28 sm:w-32">
                  <MiniChessboard
                    fen="r1b2rk1/1pq1bppp/p1n1pn2/3p4/2PN4/1PN1P3/PB2BPPP/R2Q1RK1 w - - 0 11"
                    badgeLabel="34. Bxd5!"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xs bg-vault-win/15 px-2 py-0.5 font-mono text-xs font-semibold text-vault-win border border-vault-win/20">
                      1 - 0
                    </span>
                    <h3 className="font-display text-lg font-bold text-vault-text-primary">
                      Queen&apos;s Gambit Accepted: Classical Variation
                    </h3>
                    <span className="font-mono text-xs text-vault-text-muted">
                      ECO C52
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-mono text-vault-text-secondary">
                    White: Kasparov (2812) • Black: Anand (2795) • Match 1995
                    (PCA) • 34 M • 14 Oct 1995
                  </p>
                  <blockquote className="mt-3 rounded-xs border-l-2 border-vault-bronze bg-vault-surface-container/60 px-3 py-1.5 font-sans text-xs italic text-vault-text-secondary">
                    &ldquo;The knight sacrifice on f7 was an all-time opening
                    sacrifice in my pre-game preparation. The engine later
                    confirmed it was the only winning sequence.&rdquo;
                  </blockquote>
                </div>
                <div className="flex md:flex-col items-end gap-2 shrink-0">
                  <span className="rounded-xs border border-vault-win/30 bg-vault-win/10 px-2 py-1 font-mono text-xs text-vault-win">
                    +4.82 (Eval)
                  </span>
                  <NavLink to="/game/game-1">
                    <Button
                      variant="secondary"
                      className="text-[11px] px-3 py-1"
                    >
                      Inspect <ExternalLink size={11} className="ml-1" />
                    </Button>
                  </NavLink>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-6 p-6 items-center hover:bg-vault-surface-layer-2/50 transition-colors">
                <div className="w-28 sm:w-32">
                  <MiniChessboard
                    fen="r2q1rk1/pp1b1ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP1QBPPP/R4RK1 w - - 0 10"
                    badgeLabel="44... Rd2+ Resign"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xs bg-vault-draw/15 px-2 py-0.5 font-mono text-xs font-semibold text-vault-draw border border-vault-draw/20">
                      ½ - ½
                    </span>
                    <h3 className="font-display text-lg font-bold text-vault-text-primary">
                      Queen&apos;s Indian Defense: Classical Nimzo-Indian
                    </h3>
                    <span className="font-mono text-xs text-vault-text-muted">
                      ECO E15
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-mono text-vault-text-secondary">
                    White: Karpov (2745) • Black: Kasparov (2800) • Seville 1987
                    • 42 M • 18 Nov 1987
                  </p>
                  <blockquote className="mt-3 rounded-xs border-l-2 border-vault-border-interactive bg-vault-surface-container/60 px-3 py-1.5 font-sans text-xs italic text-vault-text-secondary">
                    &ldquo;Heavy-weight 48 moves. Subtle repetition by a thread
                    in the end-game pawn endgame when he refused h5, but 1-move
                    tempo error meant equal pawn race.&rdquo;
                  </blockquote>
                </div>
                <div className="flex md:flex-col items-end gap-2 shrink-0">
                  <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-1 font-mono text-xs text-vault-draw">
                    0.00 (Equal)
                  </span>
                  <NavLink to="/game/game-3">
                    <Button
                      variant="secondary"
                      className="text-[11px] px-3 py-1"
                    >
                      View Lines <ExternalLink size={11} className="ml-1" />
                    </Button>
                  </NavLink>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-6 p-6 items-center hover:bg-vault-surface-layer-2/50 transition-colors">
                <div className="w-28 sm:w-32">
                  <MiniChessboard
                    fen="r1bq1rk1/ppp2pbp/2np1np1/4p3/2PPP3/2N1BP2/PP2N1PP/R2QKB1R w KQ - 0 8"
                    badgeLabel="41. Ba3! (0-1)"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xs bg-vault-loss/15 px-2 py-0.5 font-mono text-xs font-semibold text-vault-loss border border-vault-loss/20">
                      0 - 1
                    </span>
                    <h3 className="font-display text-lg font-bold text-vault-text-primary">
                      King&apos;s Indian: Mar del Plata Variation
                    </h3>
                    <span className="font-mono text-xs text-vault-text-muted">
                      ECO E97
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-mono text-vault-text-secondary">
                    White: Spassky (2660) • Black: Fischer (2785) • Reykjavik
                    1972 • 41 M • 06 Aug 1972
                  </p>
                  <blockquote className="mt-3 rounded-xs border-l-2 border-vault-loss bg-vault-surface-container/60 px-3 py-1.5 font-sans text-xs italic text-vault-text-secondary">
                    &ldquo;Fischer&apos;s queenside pawn avalanche broke down
                    white&apos;s defense. Positional bind retained throughout.
                    King&apos;s Indian defense proved invincible in modern
                    tournament play.&rdquo;
                  </blockquote>
                </div>
                <div className="flex md:flex-col items-end gap-2 shrink-0">
                  <span className="rounded-xs border border-vault-loss/30 bg-vault-loss/10 px-2 py-1 font-mono text-xs text-vault-loss">
                    -M4 (Win Black)
                  </span>
                  <NavLink to="/game/game-2">
                    <Button
                      variant="secondary"
                      className="text-[11px] px-3 py-1"
                    >
                      Deep Analysis <ExternalLink size={11} className="ml-1" />
                    </Button>
                  </NavLink>
                </div>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-vault-border-base bg-vault-surface-layer-2 px-6 py-3 text-[11px] font-mono text-vault-text-muted">
              <span>Automatic Background Cloud Sync</span>
              <span>100% Data Loss Guarantee</span>
              <span>Universal PGN/FEN Export</span>
            </div>
          </div>
        </section>

        {/* THE THREE CANVASES (Features) */}
        <section className="mx-auto max-w-content px-6 py-20" id="features">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-vault-bronze">
              The Three Canvases
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-vault-text-primary">
              A sanctuary, not a social feed.
            </h2>
            <p className="mt-3 text-sm text-vault-text-secondary">
              Designed for reflection, not algorithm addiction. Most chess sites
              push endless tactical puzzles and ratings roulette. Chess Vault
              preserves your intellectual footprint.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze">
                  <Database size={20} />
                </div>
                <span className="mt-4 block font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
                  01 / ARCHIVE
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-vault-text-primary">
                  The Unified Game Bank
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-vault-text-secondary">
                  Connect your accounts once. Every encounter across Chess.com
                  and Lichess automatically federates into your private
                  permanent bank without duplicates or missing plies.
                </p>
              </div>
              <div className="mt-6 border-t border-vault-border-base pt-4 flex items-center justify-between font-mono text-[11px] text-vault-text-muted">
                <span>4,218 GAMES FEDERATED</span>
                <span className="text-vault-bronze">100% PARSED</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze">
                  <FolderKanban size={20} />
                </div>
                <span className="mt-4 block font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
                  02 / LABS
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-vault-text-primary">
                  Curated Anthologies
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-vault-text-secondary">
                  Assemble bespoke match folios: &ldquo;Tournament Matches
                  2024&rdquo;, &ldquo;Najdorf Defense Lab&rdquo;, or
                  &ldquo;Toughest Opponents&rdquo;. Your personal repertoires
                  treated as published works.
                </p>
              </div>
              <div className="mt-6 border-t border-vault-border-base pt-4 flex items-center justify-between font-mono text-[11px] text-vault-text-muted">
                <span>14 ACTIVE FOLIOS</span>
                <span className="text-vault-bronze">STRUCTURED</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze">
                  <FileText size={20} />
                </div>
                <span className="mt-4 block font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
                  03 / MEMORY
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-vault-text-primary">
                  Personal Memory Layer
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-vault-text-secondary">
                  Annotate key decisions, record physical tournament
                  atmospheres, clock management blunders, or tactical memories
                  directly alongside verified algebraic notation.
                </p>
              </div>
              <div className="mt-6 border-t border-vault-border-base pt-4 flex items-center justify-between font-mono text-[11px] text-vault-text-muted">
                <span>AUTO-SAVED MARGINALIA</span>
                <span className="text-vault-bronze">SEARCHABLE</span>
              </div>
            </div>
          </div>
        </section>

        {/* VINTAGE CARBON PAPER TO ALGEBRAIC LEDGER (Story Section) */}
        <section className="mx-auto max-w-content px-6 py-16" id="philosophy">
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-8 sm:p-12 grid gap-10 md:grid-cols-2 items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-vault-bronze">
                Physical Gravity
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-vault-text-primary">
                From vintage carbon paper to searchable algebraic ledger.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-vault-text-secondary">
                Before digital servers, chess knowledge survived in
                leather-bound volumes, yellowed carbon scoresheets, and
                tournament gazettes. Chess Vault brings that same permanence to
                the modern era.
              </p>
              <div className="mt-6 space-y-3 font-mono text-xs text-vault-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-vault-bronze shrink-0"
                  />
                  <span>High-resolution algebraic notation formatting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-vault-bronze shrink-0"
                  />
                  <span>Permanent timestamps, ECO codes, and move indices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-vault-bronze shrink-0"
                  />
                  <span>Universal PGN and EPD standard interoperability</span>
                </div>
              </div>
            </div>

            <div className="rounded-vault border border-vault-border-interactive bg-vault-surface-layer-2 p-6 shadow-inner font-mono text-xs">
              <div className="border-b border-vault-border-base pb-3 flex items-center justify-between text-vault-text-muted">
                <span>MONOGRAPH FOLIO SPECIFICATION</span>
                <span className="text-vault-bronze">REF: CV-LEDGER-01</span>
              </div>
              <div className="mt-4 space-y-2 text-vault-text-secondary">
                <p className="text-vault-text-primary font-semibold">
                  [Event &ldquo;Zurich Masters Invitational&rdquo;]
                </p>
                <p>[Site &ldquo;Zurich Hall, Switzerland&rdquo;]</p>
                <p>[Date &ldquo;2024.10.12&rdquo;]</p>
                <p>[Round &ldquo;4.1&rdquo;]</p>
                <p>
                  [White &ldquo;Sultan, K.&rdquo;] [WhiteElo &ldquo;2140&rdquo;]
                </p>
                <p>
                  [Black &ldquo;Chigorin, M.&rdquo;] [BlackElo
                  &ldquo;2089&rdquo;]
                </p>
                <p className="pt-2 text-vault-bronze">
                  1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4
                  7. O-O Nge7 8. cxd4 d5 9. exd5 Nxd5 ...
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="mx-auto max-w-content px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-vault-bronze">
              Architectural Contrast
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-vault-text-primary">
              A Platform Built for Your Legacy, <br />
              <span className="italic font-normal">
                not platform advertising.
              </span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Mainstream */}
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1/50 p-8 opacity-85">
              <div className="flex items-center gap-2 text-vault-loss font-mono text-xs uppercase tracking-wider">
                <XCircle size={16} />
                <span>Mainstream Green Platforms</span>
              </div>
              <h3 className="mt-3 font-display text-xl text-vault-text-secondary">
                Ephemeral feeds & casino engagement
              </h3>
              <ul className="mt-6 space-y-4 text-xs font-sans text-vault-text-muted leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-vault-loss font-bold">•</span>
                  <span>
                    Infinite scroll match feeds that push old games into
                    unreachable digital obscurity.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vault-loss font-bold">•</span>
                  <span>
                    Flashing evaluation arrows and game reviews designed to
                    provoke emotional dopamine reactions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vault-loss font-bold">•</span>
                  <span>
                    Fragmented across multiple sites: half your history on
                    Chess.com, half on Lichess.
                  </span>
                </li>
              </ul>
            </div>

            {/* Chess Vault */}
            <div className="rounded-vault border border-vault-bronze/40 bg-vault-surface-layer-1 p-8 shadow-md">
              <div className="flex items-center gap-2 text-vault-bronze font-mono text-xs uppercase tracking-wider">
                <CheckCircle2 size={16} />
                <span>The Chess Vault Standard</span>
              </div>
              <h3 className="mt-3 font-display text-xl text-vault-text-primary">
                Permanent, scholarly archive
              </h3>
              <ul className="mt-6 space-y-4 text-xs font-sans text-vault-text-secondary leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-vault-bronze font-bold">•</span>
                  <span>
                    Unified match registry indexing your games into structured
                    folios and searchable opening banks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vault-bronze font-bold">•</span>
                  <span>
                    Quiet typography and zero ads: distraction-free review
                    honoring chess as an intellectual art.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vault-bronze font-bold">•</span>
                  <span>
                    Standard PGN/EPD export ensures you maintain complete
                    ownership of every move you record.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mx-auto max-w-content px-6 py-16">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-vault-bronze">
              Endorsements
            </span>
            <h2 className="mt-2 font-display text-3xl text-vault-text-primary">
              Words from our Vault keepers.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "Revisiting my state tournament matches from 2018 directly in Chess Vault felt like opening a leather-bound notebook. Clean, dignified, and totally free from distractions.",
                author: "M. Kovacevic, IM",
                rating: "FIDE 2410",
              },
              {
                quote:
                  "Having all my Lichess classical games and Chess.com blitz matches in one searchable ledger completely transformed how I analyze my own opening tendencies.",
                author: "Elena Petrova, WGM",
                rating: "FIDE 2380",
              },
              {
                quote:
                  "The personal memory layer is what makes this special. Attaching notes on my psychological state during a round 7 time scramble is invaluable.",
                author: "Arthur Pendelton",
                rating: "Collector & Club Champion",
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-vault-bronze gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-vault-bronze" />
                    ))}
                  </div>
                  <p className="font-sans text-xs italic leading-relaxed text-vault-text-secondary">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 border-t border-vault-border-base pt-3 font-mono text-xs">
                  <p className="font-semibold text-vault-text-primary">
                    {t.author}
                  </p>
                  <p className="text-vault-text-muted text-[11px]">
                    {t.rating}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURED QUOTE BANNER */}
        <section className="mx-auto max-w-content px-6 py-8">
          <div className="rounded-vault border border-vault-border-interactive bg-vault-surface-layer-2 p-8 sm:p-12 text-center">
            <p className="font-display text-2xl sm:text-3xl italic text-vault-text-primary max-w-xl mx-auto">
              &ldquo;Yeah, I actually want to keep my games here.&rdquo;
            </p>
            <p className="mt-4 font-mono text-xs text-vault-text-muted">
              Built for chess players who care about what they leave behind.
            </p>
          </div>
        </section>

        {/* BOTTOM CONVERSION CALLOUT */}
        <section className="mx-auto max-w-content px-6 py-16">
          <div className="relative rounded-vault border border-vault-border-interactive bg-vault-surface-layer-1 p-8 sm:p-14 text-center overflow-hidden">
            {/* Corner Decorative Brackets */}
            <span className="absolute top-3 left-3 font-mono text-xs text-vault-bronze">
              ┌
            </span>
            <span className="absolute top-3 right-3 font-mono text-xs text-vault-bronze">
              ┐
            </span>
            <span className="absolute bottom-3 left-3 font-mono text-xs text-vault-bronze">
              └
            </span>
            <span className="absolute bottom-3 right-3 font-mono text-xs text-vault-bronze">
              ┘
            </span>

            <span className="font-mono text-xs uppercase tracking-[0.2em] text-vault-bronze">
              A Lifetime Archive, Instantly
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl text-vault-text-primary">
              Your chess life deserves more than a forgotten history log.
            </h2>
            <p className="mt-3 max-w-lg mx-auto text-xs sm:text-sm text-vault-text-secondary font-sans">
              Start your permanent archive today. Connect your username or
              upload your PGN archives in under 15 seconds.
            </p>

            <form
              onSubmit={handleStartFree}
              className="mt-8 mx-auto flex max-w-md flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter your Chess.com or Lichess handle..."
                className="flex-1 rounded-vault border border-vault-border-base bg-vault-surface-layer-2 px-4 py-2.5 text-xs text-vault-text-primary outline-none focus:border-vault-bronze font-mono placeholder:text-vault-text-muted"
              />
              <Button
                type="submit"
                variant="solid-bronze"
                className="px-5 py-2.5 text-xs tracking-wider uppercase whitespace-nowrap"
              >
                Start Free <ChevronRight size={13} className="ml-1" />
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-vault-text-muted">
              <span>100% Private by default</span>
              <span>•</span>
              <span>Open Standard PGN Export</span>
              <span>•</span>
              <span>Free Forever Tier Available</span>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-vault-border-base bg-vault-surface-container-lowest py-12 text-xs font-mono text-vault-text-muted">
        <div className="mx-auto max-w-content px-6 grid gap-8 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <span className="font-display text-lg font-bold text-vault-text-primary">
              The Grand Archive
            </span>
            <p className="mt-2 text-[11px] text-vault-text-secondary leading-relaxed">
              A curated digital sanctuary for grandmasters, club competitors,
              and collectors. Dedicated to precision, taxonomy, and memory
              preservation.
            </p>
          </div>

          <div>
            <h4 className="text-vault-text-primary uppercase tracking-wider font-semibold mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <NavLink to="/dashboard" className="hover:text-vault-text-primary">
                  Public Registry
                </NavLink>
              </li>
              <li>
                <a href="#philosophy" className="hover:text-vault-text-primary">
                  Monograph Manual
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-vault-text-primary">
                  ECO Taxonomic Codes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-vault-text-primary uppercase tracking-wider font-semibold mb-3">
              Standards
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <span>FIDE Compliant Export</span>
              </li>
              <li>
                <span>Standard Algebraic (SAN)</span>
              </li>
              <li>
                <span>Portable Game Notation</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-vault-text-primary uppercase tracking-wider font-semibold mb-3">
              Open Policy
            </h4>
            <p className="text-[11px] text-vault-text-secondary leading-relaxed">
              All stored game files are permanently preserved in standard
              algebraic notation. You retain complete ownership.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-content px-6 mt-10 pt-6 border-t border-vault-border-base flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>
            © {new Date().getFullYear()} CHESS VAULT • ARCHIVAL CHESS REGISTRY
          </span>
          <div className="flex gap-6">
            <span>Ref: FIDE / PGN / EPD Specification</span>
            <NavLink to="/sign-in" className="hover:text-vault-text-primary">
              Archival Preferences
            </NavLink>
          </div>
        </div>

      </footer>
    </div>
  );
}
