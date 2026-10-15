// ============================================================
// MathClub Nexus — Smooth Animated Number Counter
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 1.2,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animFrame: number;

    const startVal = 0;
    const endVal = value;

    // Cubic bezier ease-out approximation: 1 - pow(1 - t, 3)
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * easedProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    animFrame = requestAnimationFrame(step);

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
