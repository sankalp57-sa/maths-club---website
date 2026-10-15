// ============================================================
// MathClub Nexus — Consistent Layout Shell
// ============================================================

import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
}

export default function Section({ children, className = '', id, title, subtitle }: SectionProps) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-10 text-left">
          {title && (
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
