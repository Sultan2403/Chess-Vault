import { motion } from "motion/react";

const stats = [
  { value: "1,240", label: "Games" },
  { value: "12", label: "Collections" },
  { value: "48", label: "Favorites" },
];

export function StatSummary() {
  return (
    <section
      aria-label="Archive summary"
      className="grid grid-cols-3 overflow-hidden rounded-vault border border-vault-outline-variant bg-vault-surface-soft"
    >
      {stats.map((stat, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          key={stat.label}
          transition={{ delay: index * 0.08, duration: 0.35 }}
          className={`px-3 py-6 text-center sm:px-7 ${index ? "border-l border-vault-outline-variant" : ""}`}
        >
          <p className="font-display text-3xl font-bold text-vault-secondary sm:text-5xl">
            {stat.value}
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[.17em]">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </section>
  );
}
