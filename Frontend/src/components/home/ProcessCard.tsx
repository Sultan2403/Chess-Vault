import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { MotionReveal } from "../ui/Motion";

type ProcessCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
  footer: ReactNode;
};

export function ProcessCard({
  icon: Icon,
  title,
  description,
  delay,
  footer,
}: ProcessCardProps) {
  return (
    <MotionReveal delay={delay}>
      <motion.article
        whileHover={{ y: -3 }}
        className="flex h-full min-h-[280px] flex-col rounded-vault border border-vault-outline-variant/70 bg-[#f7f3ea] p-6 shadow-xs"
      >
        <span className="grid h-10 w-10 place-items-center rounded-vault bg-[#ebe4d5] text-vault-primary">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-vault-primary">
          {title}
        </h3>
        <p className="mt-2 text-xs leading-5 text-vault-text-secondary">
          {description}
        </p>
        <div className="mt-auto pt-6">
          {footer}
        </div>
      </motion.article>
    </MotionReveal>
  );
}

