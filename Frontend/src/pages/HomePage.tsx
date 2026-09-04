import { ArrowRight, BookOpen, Upload } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { Button } from "../components/ui/Button";
import { MotionReveal } from "../components/ui/Motion";

const processSteps = [
  {
    icon: Upload,
    title: "I. Import",
    text: "Connect your Lichess or Chess.com accounts, or upload standard PGN files.",
  },
  {
    icon: BookOpen,
    title: "II. Organize",
    text: "File games into distinct, searchable folders. Add your marginalia.",
  },
  {
    icon: ArrowRight,
    title: "III. Revisit",
    text: "Study your games in an editorial layout designed for deep focus.",
  },
];

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-vault-background text-vault-on-background">
      <header className="mx-auto flex max-w-content items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <img alt="Chess Vault" className="h-9 w-9" src={logo} />
          <span className="font-display text-3xl font-bold italic">
            Chess Vault
          </span>
        </div>
        <nav className="hidden gap-7 text-xs font-bold uppercase tracking-[.16em] sm:flex">
          <a href="#process">Features</a>
          <a href="#archive">How it works</a>
          <Link to="/sign-in">Sign in</Link>
        </nav>
        <Link to="/dashboard">
          <Button className="hidden sm:inline-flex">Start archiving</Button>
        </Link>
      </header>

      <main>
        <section className="mx-auto grid max-w-content gap-16 px-6 pb-28 pt-20 md:grid-cols-2 md:items-center">
          <MotionReveal>
            <p className="font-display text-5xl font-bold leading-[1.08] sm:text-7xl">
              Keep the games worth remembering.
            </p>
            <p className="mt-7 max-w-md leading-7 text-vault-text-secondary">
              A digital sanctuary for your intellectual pursuit of chess. Curate
              your finest brilliancies and hardest-fought blunders in a
              beautifully crafted personal archive.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/dashboard">
                <Button>
                  Open your vault <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/library">
                <Button variant="secondary">Explore the archive</Button>
              </Link>
            </div>
            <p className="mt-9 text-xs text-vault-text-secondary">
              ↯ Chess.com &nbsp;&nbsp; ↯ Lichess.org
            </p>
          </MotionReveal>

          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
            className="rounded-vault border border-vault-outline-variant bg-vault-surface-soft p-5"
            transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
          >
            <div className="rounded-vault border border-vault-outline-variant bg-vault-surface-container-lowest p-4">
              <p className="text-xs text-vault-text-secondary">
                Immortal Game Candidate
              </p>
              <h2 className="font-display text-2xl">Kasparov vs. Topalov</h2>
              <div className="mt-5 aspect-square bg-[conic-gradient(theme(colors.vault.secondary)_25%,theme(colors.vault.secondary-fixed)_0_50%,theme(colors.vault.secondary)_0_75%,theme(colors.vault.secondary-fixed)_0)] bg-[length:25%_25%]" />
            </div>
            <p className="mt-4 border border-vault-outline-variant bg-vault-surface-container-lowest px-3 py-2 text-xs">
              24. &nbsp; Rxd4 cxd4 &nbsp; 25. Re7+ Kb6 &nbsp; 26. Qxd4+
            </p>
          </motion.div>
        </section>

        <section
          className="border-y border-vault-outline-variant bg-vault-surface-soft"
          id="process"
        >
          <div className="mx-auto max-w-content px-6 py-20">
            <div className="text-center">
              <p className="font-display text-xl">A Curated Process</p>
              <p className="mt-3 text-sm text-vault-text-secondary">
                Treat your chess history with the respect of a physical library.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {processSteps.map(({ icon: Icon, title, text }, index) => (
                <MotionReveal delay={index * 0.1} key={title}>
                  <article className="h-full rounded-vault border border-vault-outline-variant bg-vault-surface-container-low p-7">
                    <Icon size={20} />
                    <h3 className="mt-6 font-display text-xl">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-vault-text-secondary">
                      {text}
                    </p>
                  </article>
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
