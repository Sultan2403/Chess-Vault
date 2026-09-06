import { BookOpen, Bookmark, ChevronRight, Folder, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export function Collections() {
  return (
    <section className="mt-14">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-vault-primary">
          <Folder className="text-vault-ochre" size={18} strokeWidth={2} /> Collections
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Featured Left Card: Favorite Games with tactile chess image background */}
        <Link to="/library?collection=favorites">
          <motion.article
            whileHover={{ y: -3 }}
            className="group relative min-h-[220px] h-full overflow-hidden rounded-vault border border-vault-outline-variant/60 bg-[#f5efe4] p-7 shadow-xs flex flex-col justify-between"
          >
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&auto=format&fit=crop&q=80"
                alt="Chess pieces"
                className="h-full w-full object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#f5efe4] via-[#f5efe4]/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="text-vault-ochre">
                <Star size={20} className="fill-vault-ochre/20" strokeWidth={2} />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-vault-primary">
                Favorite Games
              </h3>
              <p className="mt-1.5 max-w-xs text-xs leading-5 text-vault-text-secondary">
                Your curated masterpieces and brilliant tactics.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-vault-text-secondary">
                48 ENTRIES
              </span>
            </div>
          </motion.article>
        </Link>

        {/* Right 2 Compact Cards */}
        <div className="grid gap-4">
          <Link to="/library?collection=tournaments">
            <motion.article
              whileHover={{ y: -2 }}
              className="rounded-vault border border-vault-outline-variant/60 bg-white/70 p-6 shadow-xs transition-colors hover:bg-white/90"
            >
              <div className="text-vault-text-secondary">
                <Trophy size={18} strokeWidth={1.75} />
              </div>
              <h3 className="mt-3.5 font-display text-lg font-bold text-vault-primary">
                Tournament Games
              </h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-vault-text-secondary">
                142 ENTRIES
              </p>
            </motion.article>
          </Link>

          <Link to="/library?collection=openings">
            <motion.article
              whileHover={{ y: -2 }}
              className="rounded-vault border border-vault-outline-variant/60 bg-white/70 p-6 shadow-xs transition-colors hover:bg-white/90"
            >
              <div className="text-vault-text-secondary">
                <BookOpen size={18} strokeWidth={1.75} />
              </div>
              <h3 className="mt-3.5 font-display text-lg font-bold text-vault-primary">
                Opening Studies
              </h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-vault-text-secondary">
                12 ENTRIES
              </p>
            </motion.article>
          </Link>
        </div>

        {/* Bottom Full-Width Banner: Memorable Games */}
        <Link to="/library?collection=memorable" className="md:col-span-2">
          <motion.article
            whileHover={{ y: -2 }}
            className="flex items-center gap-4 rounded-vault bg-[#2d221c] px-6 py-5 text-white shadow-sm transition-opacity hover:opacity-95"
          >
            <Bookmark className="text-vault-ochre shrink-0" size={20} strokeWidth={2} />
            <div>
              <h3 className="font-display text-base font-bold text-[#fdfbf7]">
                Memorable Games
              </h3>
              <p className="text-xs text-[#d3c3bd]">
                Personal milestones and nostalgic matches.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d3c3bd]">
                36 ENTRIES
              </span>
              <ChevronRight className="text-[#d3c3bd]" size={16} />
            </div>
          </motion.article>
        </Link>
      </div>
    </section>
  );
}

