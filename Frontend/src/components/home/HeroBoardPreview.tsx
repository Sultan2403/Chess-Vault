import { Bookmark } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const rows = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
];

export function HeroBoardPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
      className="rounded-vault border border-vault-outline-variant/80 bg-vault-surface-soft p-5 shadow-xs"
      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-vault-text-secondary">
            Immortal Game Candidate
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-vault-primary">
            Kasparov vs. Topalov
          </h2>
          <p className="mt-0.5 text-xs text-vault-text-secondary">
            Wijk aan Zee, 1999 • Round 4
          </p>
        </div>
        <span className="rounded-vault border border-vault-outline-variant bg-white px-2 py-0.5 text-[10px] font-semibold text-vault-primary shadow-xs">
          1-0
        </span>
      </div>

      <div className="relative mt-5 aspect-square overflow-hidden border border-vault-outline-variant/70 bg-[#f4ebd9]">
        {/* Top 4 rows with tiles */}
        <div className="grid grid-rows-4 h-1/2">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-8">
              {row.map((val, cIdx) => (
                <span
                  key={cIdx}
                  className={
                    val === 0
                      ? "bg-[#e5ded0]/90 border-t border-l border-white/20"
                      : "bg-[#b8a692]/90 border-t border-l border-black/5"
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {/* Bottom 4 rows with soft faded cream */}
        <div className="relative h-1/2 bg-[#efede6]/80 flex items-center justify-center">
          <Bookmark
            className="absolute -top-4 text-vault-ochre fill-vault-ochre/20"
            size={24}
            strokeWidth={1.75}
          />
        </div>
      </div>

      <div className="mt-4 rounded-vault border border-vault-outline-variant/60 bg-white/90 px-3 py-2 text-[11px] font-mono text-vault-text-secondary shadow-xs">
        <span className="text-vault-primary font-medium">24.</span> Rxd4 cxd4 &nbsp;
        <span className="text-vault-primary font-medium">25.</span> Re7+ Kb6 &nbsp;
        <span className="text-vault-primary font-medium">26.</span> Qxd4+{" "}
        <strong className="font-bold text-vault-primary font-sans">Kxa5</strong>
      </div>
    </motion.article>
  );
}

