import { ArrowRight, BookOpen, Download, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { ArchiveFeature } from "../components/home/ArchiveFeature";
import { HeroBoardPreview } from "../components/home/HeroBoardPreview";
import { ProcessCard } from "../components/home/ProcessCard";
import { Button } from "../components/ui/Button";
import { MotionReveal } from "../components/ui/Motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-vault-background text-vault-on-background">
      <header className="border-b border-vault-outline-variant">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <Link className="flex items-center gap-3" to="/">
            <img alt="Chess Vault" className="h-6 w-6" src={logo} />
            <span className="font-display text-3xl font-bold italic">
              Chess Vault
            </span>
          </Link>
          <nav className="hidden gap-7 text-[10px] font-bold uppercase tracking-[.18em] sm:flex">
            <a href="#process">Features</a>
            <a href="#process">How it works</a>
            <Link to="/sign-in">Sign in</Link>
          </nav>
          <Link to="/dashboard">
            <Button className="hidden px-4 py-2 text-[10px] sm:inline-flex">
              Start archiving
            </Button>
          </Link>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-content gap-12 px-6 py-18 md:grid-cols-[.9fr_1.1fr] md:items-center">
          <MotionReveal>
            <h1 className="max-w-md font-display text-5xl font-bold leading-[1.02] sm:text-6xl">
              Keep the games worth remembering.
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-6 text-vault-text-secondary">
              A digital sanctuary for your intellectual pursuit of chess. Curate
              your finest brilliancies and hardest-fought blunders in a
              beautifully crafted personal archive.
            </p>
            <div className="mt-8 flex">
              <Link to="/dashboard">
                <Button className="rounded-none">
                  Open your vault <ArrowRight size={14} />
                </Button>
              </Link>
              <Link to="/library">
                <Button className="rounded-none" variant="secondary">
                  Explore the archive
                </Button>
              </Link>
            </div>
            <p className="mt-9 text-[10px] text-vault-text-secondary">
              ↯ Chess.com &nbsp;&nbsp; ↯ Lichess.org
            </p>
          </MotionReveal>
          <MotionReveal delay={0.14}>
            <div className="mx-auto w-full max-w-95">
              <HeroBoardPreview />
            </div>
          </MotionReveal>
        </section>
        <div className="mx-auto max-w-content border-t border-vault-outline-variant px-6" />
        <section className="mx-auto max-w-content px-6 py-20" id="process">
          <div className="mx-auto max-w-lg text-center">
            <p className="font-display text-lg">A Curated Process</p>
            <p className="mt-3 text-xs leading-5 text-vault-text-secondary">
              Treat your chess history with the respect of a physical library.
              No clutter, just the masterpieces.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <ProcessCard
              delay={0}
              description="Connect your Lichess or Chess.com accounts, or upload standard PGN files. We parse the notation instantly."
              footer={
                <>
                  <p className="text-[10px] text-vault-text-secondary">
                    Paste PGN
                  </p>
                  <div className="mt-2 border-b border-vault-outline bg-vault-surface-container-lowest px-2 py-1 text-[9px] text-vault-outline">
                    [Event “Live Chess”]...
                  </div>
                </>
              }
              icon={Download}
              title="I. Import"
            />
            <ProcessCard
              delay={0.1}
              description="File games into distinct, searchable folders. Add marginalia, tag opening variations, or note your psychological state."
              footer={
                <div className="flex gap-2 text-[8px]">
                  <span className="border border-vault-outline-variant px-2 py-1">
                    Sicilian Defense
                  </span>
                  <span className="border border-vault-outline-variant px-2 py-1">
                    Tournament Play
                  </span>
                </div>
              }
              icon={Upload}
              title="II. Organize"
            />
            <ProcessCard
              delay={0.2}
              description="Study your games in an editorial layout designed for deep focus. No engine arrows blinking, just you and the board."
              footer={
                <p className="text-right font-display text-xs italic text-vault-text-secondary">
                  “Study the classics.”
                </p>
              }
              icon={BookOpen}
              title="III. Revisit"
            />
          </div>
        </section>
        <ArchiveFeature />
      </main>
      <footer className="border-t border-vault-outline-variant bg-vault-surface-dim">
        <div className="mx-auto flex max-w-content flex-col gap-4 px-6 py-8 text-[10px] text-vault-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <strong className="text-sm text-vault-on-background">
            Chess Vault
          </strong>
          <span>© 2024 Chess Vault. A curated history of every move.</span>
          <div className="flex gap-5">
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <a href="#support">Archive Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
