import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type MotionRevealProps = ComponentPropsWithoutRef<typeof motion.div> & {
  children: ReactNode;
  delay?: number;
};

export function MotionReveal({
  children,
  delay = 0,
  ...props
}: MotionRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      {...props}
      animate={{ opacity: 1, y: 0 }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      transition={{ delay, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
