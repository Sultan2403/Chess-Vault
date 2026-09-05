import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";

type ButtonProps = ComponentPropsWithoutRef<typeof motion.button> & {
  variant?: "primary" | "secondary" | "dark";
  children: ReactNode;
};
const variants = {
  primary:
    "bg-vault-secondary text-vault-on-secondary hover:bg-vault-on-secondary-container",
  secondary:
    "border border-vault-outline-variant bg-transparent text-vault-primary hover:bg-vault-surface-soft",
  dark: "bg-vault-primary text-vault-on-primary hover:bg-vault-primary-container",
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
        "inline-flex items-center justify-center gap-2 rounded-vault px-5 py-3 text-xs font-bold uppercase tracking-[.14em] transition-colors duration-200",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
