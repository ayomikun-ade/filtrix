import type { Transition, Variants } from "motion/react";

/* Shared motion tokens. */

// Standard ease-out (cubic). ~160ms reads as instant-but-smooth.
export const EASE: Transition = {
  duration: 0.16,
  ease: [0.22, 1, 0.36, 1],
};

// Slightly longer for height/layout reflow so it doesn't feel jumpy.
export const EASE_LAYOUT: Transition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
};

// Enter/exit for a condition or group as it's added/removed from the tree.
export const nodeVariants: Variants = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

// Expand/collapse for a group's body.
export const collapseVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const riseItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
