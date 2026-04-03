// src/utils/motionPresets.ts
// Premium Motion Design System - Framer Motion Presets
// Compatible with reduced-motion accessibility

import { Variants, Transition } from 'framer-motion';

/**
 * Premium cubic-bezier easing curves
 */
export const easings = {
  premium: [0.16, 1, 0.3, 1] as const,
  smooth: [0.45, 0, 0.15, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  elastic: [0.175, 0.885, 0.32, 1.275] as const,
} as const;

/**
 * Standard durations (milliseconds)
 */
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
} as const;

/**
 * Glass Panel Enter Animation
 * Usage: <motion.div variants={premiumMotion.glassEnter} initial="initial" animate="animate" exit="exit">
 */
export const glassEnter: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: durations.slow,
      ease: easings.premium,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    filter: 'blur(10px)',
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

/**
 * Modal Overlay Animation
 */
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: durations.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast },
  },
};

/**
 * Modal Content Animation (slides up from bottom)
 */
export const modalContent: Variants = {
  initial: {
    opacity: 0,
    y: 100,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.premium,
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    scale: 0.95,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

/**
 * Button Hover/Tap Interactions
 * Usage: <motion.button variants={premiumMotion.buttonHover} whileHover="hover" whileTap="tap">
 */
export const buttonHover: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    transition: {
      duration: durations.fast,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: durations.instant,
    },
  },
};

/**
 * Stagger Container (for lists)
 * Usage: <motion.div variants={premiumMotion.staggerContainer} initial="initial" animate="animate">
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger Child (individual list items)
 */
export const staggerChild: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

/**
 * Page Transition (slide)
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, x: 300 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.slow,
      ease: easings.premium,
    },
  },
  exit: {
    opacity: 0,
    x: -300,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

/**
 * Premium Glow Animation (success feedback)
 */
export const glowPulse: Variants = {
  initial: {},
  animate: {
    boxShadow: [
      '0 0 0 0 hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0)',
      '0 0 20px 8px hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.3)',
      '0 0 0 0 hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: 3,
      ease: 'easeInOut',
    },
  },
};

/**
 * Fade In (simple)
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: durations.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast },
  },
};

/**
 * Scale In (zoom effect)
 */
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.premium,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * Slide In From Left
 */
export const slideInLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
  exit: {
    x: -50,
    opacity: 0,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * Slide In From Right
 */
export const slideInRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
  exit: {
    x: 50,
    opacity: 0,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * Bounce In (playful)
 */
export const bounceIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.bounce,
    },
  },
};

/**
 * Accordion Expand/Collapse
 */
export const accordion: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

/**
 * Premium Motion Presets Collection
 */
export const premiumMotion = {
  glassEnter,
  modalOverlay,
  modalContent,
  buttonHover,
  staggerContainer,
  staggerChild,
  pageTransition,
  glowPulse,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  bounceIn,
  accordion,
} as const;

/**
 * Helper: Get transition config for specific duration
 */
export function getTransition(
  duration: keyof typeof durations = 'normal',
  easing: keyof typeof easings = 'premium'
): Transition {
  return {
    duration: durations[duration],
    ease: easings[easing],
  };
}

/**
 * Helper: Spring transition (for natural motion)
 */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const softSpringTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};
