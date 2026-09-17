import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";

type ButtonProps = ComponentPropsWithoutRef<typeof motion.button> & {
  variant?: "primary" | "secondary" | "solid-bronze" | "dark" | "ghost" | "destructive";
  children: ReactNode;
};

const variants = {
  // Primary Archival: Transparent with 1px Archival Bronze border, uppercase label-caps
  primary:
    "border border-vault-bronze bg-transparent text-vault-text-primary hover:bg-vault-border-base hover:text-vault-bronze-hover shadow-xs",
  // Solid Bronze: Flood bronze for high-conversion CTAs (e.g. Deposit Game, Force Sync)
  "solid-bronze":
    "bg-vault-primary text-vault-on-primary hover:bg-vault-primary-container shadow-xs font-semibold",
  // Secondary: Clean whisper-thin border on dark surface
  secondary:
    "border border-vault-border-base bg-vault-surface-layer-1/80 text-vault-text-secondary hover:border-vault-border-interactive hover:bg-vault-surface-layer-2 hover:text-vault-text-primary shadow-xs",
  // Dark: Surface layer 2 container
  dark:
    "border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-text-primary hover:bg-vault-surface-layer-1",
  // Ghost: Minimalist hover state
  ghost:
    "bg-transparent text-vault-text-secondary hover:bg-vault-surface-layer-1 hover:text-vault-text-primary border-transparent",
  // Destructive: Muted crimson border & text
  destructive:
    "border border-vault-loss text-vault-loss hover:bg-vault-loss/10 shadow-xs",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-vault px-4 py-2 text-xs font-semibold tracking-wider transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
