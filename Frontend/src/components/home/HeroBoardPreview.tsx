import { Bookmark } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const squares = Array.from({ length: 16 }, (_, index) => index);

export function HeroBoardPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
      className="border border-vault-outline-variant bg-vault-surface-soft p-4"
      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-vault-text-secondary">
            Immortal Game Candidate
          </p>
          <h2 className="mt-1 font-display text-xl">Kasparov vs. Topalov</h2>
          <p className="mt-1 text-[10px] text-vault-text-secondary">
            Wijk aan Zee, 1999 · Round 4
          </p>
        </div>
        <span className="border border-vault-outline-variant bg-vault-surface-container-lowest px-2 py-1 text-[9px]">
          1–0
        </span>
      </div>

      <div className="relative mt-5 aspect-[1.04] border border-vault-outline">
        <div className="grid h-1/2 grid-cols-8">
          {squares.map((square) => (
            <span
              className={
                square % 2 === 0
                  ? "bg-vault-secondary-fixed"
                  : "bg-vault-secondary"
              }
              key={square}
            />
          ))}
        </div>
        <div className="grid h-1/2 grid-cols-8 opacity-20">
          {squares.map((square) => (
            <span
              className={
                square % 2 === 0
                  ? "bg-vault-secondary"
                  : "bg-vault-secondary-fixed"
              }
              key={square}
            />
          ))}
        </div>
        <Bookmark
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-vault-secondary-container text-vault-secondary"
          size={23}
        />
      </div>

      <p className="mt-4 border border-vault-outline-variant bg-vault-surface-container-lowest px-3 py-2 text-[10px] text-vault-text-secondary">
        24. &nbsp; Rxd4 cxd4 &nbsp; 25. Re7+ Kb6 &nbsp; 26. Qxd4+{" "}
        <strong className="text-vault-on-background">Kxa5</strong>
      </p>
    </motion.article>
  );
}
