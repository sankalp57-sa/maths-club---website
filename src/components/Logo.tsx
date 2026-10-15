// ============================================================
// MathClub Nexus — Reusable MITS-DU Gwalior Mathematics Club Badge Logo
// ============================================================

import React from 'react';
import { motion } from 'motion/react';

export interface LogoProps {
  size?: 'navbar' | 'footer' | string;
  className?: string;
  interactive?: boolean;
}

export default function Logo({
  size = 'navbar',
  className = '',
  interactive = false,
}: LogoProps) {
  // Determine sizing class
  let sizeClass = 'h-9 w-9 sm:h-11 sm:w-11';
  if (size === 'navbar') {
    sizeClass = 'h-9 w-9 sm:h-11 sm:w-11';
  } else if (size === 'footer') {
    sizeClass = 'h-10 w-10';
  } else if (size) {
    sizeClass = size;
  }

  const imageElement = (
    <img
      src="/mits-du-logo.png"
      alt="Mathematics Club MITS-DU Gwalior"
      className={`${sizeClass} object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.35)] select-none ${className}`}
      draggable={false}
    />
  );

  if (interactive) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className="inline-flex items-center justify-center flex-shrink-0 cursor-pointer"
      >
        {imageElement}
      </motion.div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center flex-shrink-0">
      {imageElement}
    </div>
  );
}
