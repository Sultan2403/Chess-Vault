import { BookOpen, Bookmark, ChevronRight, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { Collection } from "../../types/archive";
const collections: Collection[] = [
  {
    title: "Favorite Games",
    entries: 48,
    description: "Your curated masterpieces and brilliant tactics.",
    variant: "feature",
  },
  {
    title: "Tournament Games",
    entries: 142,
    description: "",
    variant: "compact",
  },
  {
    title: "Opening Studies",
    entries: 12,
    description: "",
    variant: "compact",
  },
  {
    title: "Memorable Games",
    entries: 36,
    description: "Personal milestones and nostalgic matches.",
    variant: "dark",
  },
];
const Icon = ({ type }: { type: Collection["variant"] }) =>
  type === "feature" ? (
    <Star />
  ) : type === "compact" ? (
    <Trophy />
  ) : (
    <Bookmark />
  );
export function Collections() {
  return (
    <section className="mt-14">
      <h2 className="mb-7 flex items-center gap-3 text-xl font-bold">
        <BookOpen className="text-vault-secondary" size={22} /> Collections
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <motion.article
          whileHover={{ y: -4 }}
          className="group relative min-h-64 overflow-hidden rounded-vault border border-vault-outline-variant bg-vault-surface-soft p-8 md:row-span-2"
        >
          <div className="text-vault-secondary">
            <Icon type="feature" />
          </div>
          <h3 className="mt-7 font-display text-3xl font-bold">
            {collections[0].title}
          </h3>
          <p className="mt-2 text-vault-text-secondary">
            {collections[0].description}
          </p>
          <span className="absolute bottom-7 text-xs font-bold uppercase tracking-[.16em]">
            48 entries
          </span>
        </motion.article>
        <div className="grid gap-6">
          {collections.slice(1, 3).map((collection) => (
            <motion.article
              whileHover={{ y: -4 }}
              key={collection.title}
              className="rounded-vault border border-vault-outline-variant bg-vault-surface-container-low p-7"
            >
              <span className="text-vault-text-secondary">
                <Icon type={collection.variant} />
              </span>
              <h3 className="mt-5 text-xl font-bold">{collection.title}</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-[.15em]">
                {collection.entries} entries
              </p>
            </motion.article>
          ))}
        </div>
        <motion.article
          whileHover={{ y: -2 }}
          className="md:col-span-2 flex items-center gap-5 rounded-vault bg-vault-primary p-8 text-vault-on-primary"
        >
          <Bookmark className="text-vault-secondary-fixed" size={29} />
          <div>
            <h3 className="text-xl font-bold">Memorable Games</h3>
            <p className="mt-1 text-sm text-vault-on-primary-container">
              Personal milestones and nostalgic matches.
            </p>
          </div>
          <span className="ml-auto hidden text-xs font-bold uppercase tracking-[.15em] sm:block">
            36 entries
          </span>
          <ChevronRight className="text-vault-secondary-fixed" />
        </motion.article>
      </div>
    </section>
  );
}
