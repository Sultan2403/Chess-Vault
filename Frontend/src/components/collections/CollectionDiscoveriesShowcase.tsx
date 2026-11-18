import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Clock,
  BookOpen,
  Flame,
  ArrowUpRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MiniChessboard } from "../ui/MiniChessboard";
import { Button } from "../ui/Button";
import { getPlayerPerspective, getGameDate } from "../../utils/game";
import type { CollectionDiscovery } from "@chess-vault/shared";

type CollectionDiscoveriesShowcaseProps = {
  discoveries: CollectionDiscovery[];
};

export function CollectionDiscoveriesShowcase({
  discoveries,
}: CollectionDiscoveriesShowcaseProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!discoveries || discoveries.length === 0) {
    return null;
  }

  const activeIndex = Math.min(selectedIndex, discoveries.length - 1);
  const active = discoveries[activeIndex];
  const game = active.game;
  const perspective = getPlayerPerspective(game);
  const gameDate = getGameDate(game);

  const getCategoryIcon = (cat: CollectionDiscovery["category"]) => {
    switch (cat) {
      case "biggest_win":
        return Trophy;
      case "marathon_battle":
        return Clock;
      case "personal_note":
        return BookOpen;
      case "quick_miniature":
        return Flame;
      default:
        return Sparkles;
    }
  };

  return (
    <section className="space-y-4">
      {/* Header and selector ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-vault-border-base pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Sparkles size={15} className="text-vault-bronze" />
          <span className="font-semibold uppercase tracking-wider text-vault-text-primary">
            Curator Highlight
          </span>
          <span className="text-vault-text-muted text-[11px]">
            • Notable moments in this album
          </span>
        </div>

        {discoveries.length > 1 && (
          <div className="flex items-center gap-2 font-mono text-xs text-vault-text-muted">
            <span>
              {activeIndex + 1} / {discoveries.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : discoveries.length - 1,
                  )
                }
                className="rounded-xs border border-vault-border-base px-2 py-0.5 hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                aria-label="Previous discovery"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev < discoveries.length - 1 ? prev + 1 : 0,
                  )
                }
                className="rounded-xs border border-vault-border-base px-2 py-0.5 hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                aria-label="Next discovery"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discovery Selector Pills if multiple */}
      {discoveries.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {discoveries.map((item, idx) => {
            const isSelected = idx === activeIndex;
            const Icon = getCategoryIcon(item.category);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex items-center gap-2 rounded-xs border px-3 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "border-vault-bronze bg-vault-surface-layer-2 text-vault-text-primary shadow-xs"
                    : "border-vault-border-base bg-vault-surface-layer-1 text-vault-text-muted hover:text-vault-text-secondary"
                }`}
              >
                <Icon
                  size={12}
                  className={isSelected ? "text-vault-bronze" : ""}
                />
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] text-vault-text-muted bg-vault-surface-container px-1.5 py-0.5 rounded-xs">
                  {item.badgeText}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Showcase Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-vault border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-6 md:p-8 transition-colors"
        >
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] items-center">
            {/* Story & Context Column */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="rounded-xs border border-vault-bronze/40 bg-vault-bronze/10 px-2 py-0.5 text-vault-bronze font-semibold">
                  {active.label}
                </span>
                <span className="text-vault-text-muted">•</span>
                <span className="text-vault-text-muted">{gameDate}</span>
                {game.time?.timeClass && (
                  <>
                    <span className="text-vault-text-muted">•</span>
                    <span className="capitalize text-vault-text-secondary">
                      {game.time.timeClass}
                    </span>
                  </>
                )}
              </div>

              {/* Headline / Narrative quote */}
              <h4 className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-vault-text-primary leading-snug">
                {active.storyQuote}
              </h4>

              {/* Players match overview */}
              <div className="flex items-center gap-3 font-mono text-xs text-vault-text-secondary border-t border-vault-border-base/70 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white border border-vault-border-base" />
                  <span className={game.userPlayedAs === "white" ? "font-bold text-vault-text-primary" : ""}>
                    {game.whitePlayer.username} ({game.whitePlayer.rating})
                  </span>
                </div>
                <span className="text-vault-text-muted">vs</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-800 border border-vault-border-base" />
                  <span className={game.userPlayedAs === "black" ? "font-bold text-vault-text-primary" : ""}>
                    {game.blackPlayer.username} ({game.blackPlayer.rating})
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <NavLink to={`/game/${game.id}`}>
                  <Button
                    variant="solid-bronze"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono uppercase"
                  >
                    <span>Revisit Game</span>
                    <ArrowUpRight size={14} />
                  </Button>
                </NavLink>
              </div>
            </div>

            {/* Board Column */}
            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-[240px]">
                <MiniChessboard
                  fen={game.finalFen}
                  orientation={perspective.playerColor}
                  badgeLabel={perspective.result.toUpperCase()}
                  className="rounded-xs shadow-md border-vault-border-interactive"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
