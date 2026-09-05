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
        className="flex h-full min-h-66 flex-col border border-vault-outline-variant bg-vault-surface-soft p-6"
      >
        <span className="grid h-9 w-9 place-items-center rounded-vault bg-vault-surface-muted text-vault-primary">
          <Icon size={17} />
        </span>
        <h3 className="mt-5 font-display text-lg">{title}</h3>
        <p className="mt-3 text-sm leading-5 text-vault-text-secondary">
          {description}
        </p>
        <div className="mt-auto border-t border-vault-outline-variant pt-4">
          {footer}
        </div>
      </motion.article>
    </MotionReveal>
  );
}
