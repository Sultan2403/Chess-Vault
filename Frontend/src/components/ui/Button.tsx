import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "dark"; children: ReactNode };
export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const variants = { primary: "bg-vault-gold text-white hover:bg-vault-goldDark", secondary: "border border-vault-line bg-transparent text-vault-ink hover:bg-vault-surface", dark: "bg-vault-wood text-white hover:bg-vault-ink" };
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-vault px-5 py-3 text-xs font-bold uppercase tracking-[.14em] transition duration-200 active:translate-y-px", variants[variant], className)} {...props}>{children}</button>;
}
