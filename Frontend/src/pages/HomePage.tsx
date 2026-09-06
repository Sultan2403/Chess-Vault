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
      <header className="border-b border-vault-outline-variant/60 bg-vault-background">
        <div className="mx-auto flex h-20 max-w-content items-center justify-between px-6">
          <Link className="flex items-center gap-3" to="/">
            <img
              alt="Chess Vault"
              className="h-6 w-6 rounded-vault object-cover"
              src={logo}
            />
            <span className="font-display text-3xl font-bold italic tracking-tight text-vault-primary">
              Chess Vault
            </span>
          </Link>
          <nav className="hidden gap-8 text-xs font-bold uppercase tracking-[0.18em] text-vault-on-surface-variant sm:flex">
            <a
              href="#process"
              className="hover:text-vault-primary transition-colors"
            >
              FEATURES
            </a>
            <a
              href="#process"
              className="hover:text-vault-primary transition-colors"
            >
              HOW IT WORKS
            </a>
            <Link
              to="/sign-in"
              className="hover:text-vault-primary transition-colors"
            >
              SIGN IN
            </Link>
          </nav>
          <Link to="/dashboard">
            <Button className="hidden px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] sm:inline-flex">
              Start Archiving
            </Button>
          </Link>
        </div>
      </header>

      <main className="bg-paper">
        <section className="mx-auto grid max-w-content gap-12 px-6 py-16 md:grid-cols-[1fr_1.05fr] md:items-center">
          <MotionReveal>
            <h1 className="max-w-md font-display text-4xl font-bold leading-[1.08] text-vault-primary sm:text-5xl lg:text-[54px]">
              Keep the games worth remembering.
            </h1>
            <p className="mt-6 max-w-sm text-xs leading-6 text-vault-text-secondary">
              A digital sanctuary for your intellectual pursuit of chess. Curate
              your finest brilliancies and hardest-fought blunders in a
              beautifully crafted personal archive.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/dashboard">
                <Button className="px-6 py-3">
                  Open Your Vault <ArrowRight size={14} />
                </Button>
              </Link>
              <Link to="/library">
                <Button variant="secondary" className="px-6 py-3">
                  Explore the Archive
                </Button>
              </Link>
            </div>
            <p className="mt-8 flex items-center gap-4 text-[11px] text-vault-text-secondary/80">
              <span>⇄ Chess.com</span>
              <span>⇄ Lichess.org</span>
            </p>
          </MotionReveal>
          <MotionReveal delay={0.14}>
            <div className="mx-auto w-full max-w-[420px]">
              <HeroBoardPreview />
            </div>
          </MotionReveal>
        </section>

        <div className="mx-auto max-w-content border-t border-vault-outline-variant/60 px-6" />

        <section className="mx-auto max-w-content px-6 py-20" id="process">
          <div className="mx-auto max-w-lg text-center">
            <p className="font-display text-xl font-bold text-vault-primary">
              A Curated Process
            </p>
            <p className="mt-2.5 text-xs leading-5 text-vault-text-secondary">
              Treat your chess history with the respect of a physical library.
              No clutter, just the masterpieces.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <ProcessCard
              delay={0}
              description="Connect your Lichess or Chess.com accounts, or upload standard PGN files. We parse the notation instantly."
              footer={
                <>
                  <p className="text-[10px] font-medium text-vault-text-secondary">
                    Paste PGN
                  </p>
                  <div className="mt-1.5 border border-vault-outline-variant/60 bg-white/80 px-2.5 py-1.5 text-[10px] font-mono text-vault-outline">
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
                <div className="flex gap-2 text-[9px] font-medium text-vault-primary">
                  <span className="border border-vault-outline-variant/70 bg-white/60 px-2 py-1">
                    Sicilian Defense
                  </span>
                  <span className="border border-vault-outline-variant/70 bg-white/60 px-2 py-1">
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

      <footer className="border-t border-vault-outline-variant/60 bg-[#e4e2de]/60 py-8">
        <div className="mx-auto flex max-w-content flex-col gap-4 px-6 text-xs text-vault-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <strong className="font-display font-bold text-sm text-vault-primary">
              Chess Vault
            </strong>
            <span>
              © {new Date().getFullYear()} Chess Vault. A curated history of
              every move.
            </span>
          </div>
          <div className="flex gap-6 font-medium">
            <a
              href="#terms"
              className="hover:text-vault-primary transition-colors"
            >
              Terms
            </a>
            <a
              href="#privacy"
              className="hover:text-vault-primary transition-colors"
            >
              Privacy
            </a>
            <a
              href="#support"
              className="hover:text-vault-primary transition-colors"
            >
              Archive Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

