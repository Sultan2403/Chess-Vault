import { motion } from "motion/react";

const stats = [
  { value: "1,240", label: "GAMES" },
  { value: "12", label: "COLLECTIONS" },
  { value: "48", label: "FAVORITES" },
];

export function StatSummary() {
  return (
    <section
      aria-label="Archive summary"
      className="grid grid-cols-3 overflow-hidden rounded-vault border border-vault-outline-variant/60 bg-[#f7f3ea]/90 shadow-xs"
    >
      {stats.map((stat, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 8 }}
          key={stat.label}
          transition={{ delay: index * 0.08, duration: 0.35 }}
          className={`px-4 py-6 text-center sm:px-8 ${
            index ? "border-l border-vault-outline-variant/60" : ""
          }`}
        >
          <p className="font-display text-3xl font-bold tracking-tight text-[#8c6b2d] sm:text-[44px] leading-none">
            {stat.value}
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-vault-text-secondary">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </section>
  );
}

