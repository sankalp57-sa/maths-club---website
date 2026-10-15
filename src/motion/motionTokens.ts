// ============================================================
// MathClub Nexus — Motion Tokens & Animation Primitives
// ============================================================

// Custom cubic bezier easing curves
export const cinematicEase = [0.16, 1, 0.3, 1] as const;
export const gentleEase = [0.25, 0.1, 0.25, 1] as const;
export const snappyEase = [0.4, 0, 0.2, 1] as const;

// Spring configurations
export const springSmooth = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
};

export const springBouncy = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 22,
};

export const springGentle = {
  type: 'spring' as const,
  stiffness: 180,
  damping: 24,
};

// Common animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: custom * 0.1,
      ease: cinematicEase,
    },
  }),
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: custom * 0.08,
      ease: cinematicEase,
    },
  }),
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const pageTransitionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: cinematicEase,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: snappyEase,
    },
  },
};

