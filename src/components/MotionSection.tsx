// ============================================================
// MathClub Nexus — Motion Section Wrapper with Scroll Triggers
// ============================================================

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cinematicEase } from '../motion/motionTokens';

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export default function MotionSection({
  children,
  className = '',
  delay = 0,
  id,
}: MotionSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.75,
        delay,
        ease: cinematicEase,
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
