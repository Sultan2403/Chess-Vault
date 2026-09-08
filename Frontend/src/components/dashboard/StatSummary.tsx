import { motion } from "motion/react";
import { useGames } from "../../hooks/useGames";
import { useFolders } from "../../hooks/useFolders";
import { useAccountBootstrap } from "../../hooks/useAccount";

export function StatSummary() {
  const { data: gamesData } = useGames({ limit: 1 });
  const { data: foldersData } = useFolders({ limit: 1 });
  const { data: accountData } = useAccountBootstrap();
  const stats = [
    { value: gamesData?.pagination.total ?? 0, label: "GAMES" },
    { value: foldersData?.total ?? 0, label: "COLLECTIONS" },
    { value: accountData?.linkedAccounts.length ?? 0, label: "CONNECTED" },
  ];

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
            {stat.value.toLocaleString()}
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-vault-text-secondary">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </section>
  );
}

