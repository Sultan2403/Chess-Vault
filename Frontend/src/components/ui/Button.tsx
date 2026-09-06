import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";

type ButtonProps = ComponentPropsWithoutRef<typeof motion.button> & {
  variant?: "primary" | "secondary" | "dark" | "ghost";
  children: ReactNode;
};

const variants = {
  primary:
    "bg-vault-ochre text-white hover:bg-vault-ochre-hover shadow-sm border border-transparent",
  secondary:
    "border border-vault-outline-variant bg-white/80 text-vault-primary hover:bg-vault-surface-soft shadow-xs",
  dark: "bg-vault-primary text-vault-on-primary hover:bg-vault-primary-container",
  ghost: "bg-transparent text-vault-primary hover:bg-vault-surface-soft border-transparent",
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
        "inline-flex items-center justify-center gap-2 rounded-vault px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

