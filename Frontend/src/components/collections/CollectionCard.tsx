import { motion } from "motion/react";
import { NavLink } from "react-router-dom";
import { Folder, Clock, Layers } from "lucide-react";
import { MiniChessboard } from "../ui/MiniChessboard";
import type { FolderItem } from "@chess-vault/shared";

type CollectionCardProps = {
  folder: FolderItem;
};

export function CollectionCard({ folder }: CollectionCardProps) {
  const formattedDate = new Date(folder.updatedAt || folder.createdAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <NavLink to={`/collections/${folder.id}`}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.18 }}
        className="group relative flex flex-col justify-between overflow-hidden rounded-vault border border-vault-border-base hover:border-vault-bronze/60 bg-vault-surface-layer-1 hover:bg-vault-surface-layer-2 transition-all p-5 shadow-xs"
      >
        <div className="space-y-4">
          {/* Card Visual / Album Cover Preview */}
          <div className="relative aspect-video sm:aspect-[16/10] w-full overflow-hidden rounded-xs border border-vault-border-interactive/70 bg-vault-surface-layer-2">
            {folder.coverGame?.finalFen ? (
              <div className="relative h-full w-full flex items-center justify-center p-2">
                <MiniChessboard
                  fen={folder.coverGame.finalFen}
                  className="max-h-full max-w-[190px] shadow-sm"
                />
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-vault-text-muted">
                <Folder size={28} className="text-vault-bronze/40 group-hover:text-vault-bronze transition-colors" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-vault-text-muted">
                  Empty Album
                </span>
              </div>
            )}

            {/* Subtle Gradient vignette overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-vault-surface-layer-1/80 via-transparent to-transparent opacity-60" />
          </div>

          {/* Collection Identity */}
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-vault-bronze">
              <Folder size={13} />
              <span className="uppercase tracking-wider font-semibold">Album</span>
            </div>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-normal tracking-tight text-vault-text-primary group-hover:text-vault-bronze transition-colors line-clamp-1">
              {folder.name}
            </h3>
            <p className="mt-1 text-xs text-vault-text-secondary font-sans leading-relaxed line-clamp-2 min-h-[2rem]">
              {folder.description || "A curated anthology of games preserved in your vault."}
            </p>
          </div>
        </div>

        {/* Card Footer / Metadata Ribbon */}
        <div className="mt-5 flex items-center justify-between border-t border-vault-border-base/70 pt-3.5 font-mono text-xs text-vault-text-muted">
          <div className="flex items-center gap-1.5 text-vault-text-secondary">
            <Layers size={13} className="text-vault-bronze/80" />
            <span className="font-semibold text-vault-text-primary">
              {folder.gameCount}
            </span>
            <span>{folder.gameCount === 1 ? "game" : "games"}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <Clock size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </motion.article>
    </NavLink>
  );
}
