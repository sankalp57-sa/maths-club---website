// ============================================================
// MathClub Nexus — Consistent Layout Shell
// ============================================================

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function Section({ children, className = "" }: SectionProps) {
  return (
    <section
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${className}`}
    >
      {children}
    </section>
  );
}
