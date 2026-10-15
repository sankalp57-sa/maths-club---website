// ============================================================
// MathClub Nexus — Editorial University Footer
// ============================================================

import { Code, Award } from 'lucide-react';
import type { NavSection } from '../types';
import Logo from './Logo';
import Section from './Section';

interface FooterProps {
  onNavigate: (section: NavSection) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#030712] relative overflow-hidden text-slate-400">
      <Section className="!py-12 md:!py-16 relative z-10">
        {/* Three well-spaced columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mb-12">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo size="footer" />
              <span className="text-lg font-bold text-white tracking-tight">
                MathClub Nexus
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier collegiate mathematics club platform. Orchestrating competitive math olympiads, student research colloquia, automated quiz leaderboards, and transparent participation auditing.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400/90 font-mono pt-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Offline-First Prototype • LocalStorage Engine</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explore Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Home & Command Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Events & Competitions Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Mathematical Quiz Arena
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Hall of Champions Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('attendance')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Attendance Verification Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('members')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Member Roster & Governance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('certificates')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Certificate Distribution System
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('feedback')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Feedback & Quality Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Quote & Tech Stack */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Academic Mission
            </h4>
            <p className="text-xs italic text-slate-300 leading-relaxed border-l-2 border-cyan-500/30 pl-3 py-1">
              "Pure mathematics is, in its way, the poetry of logical ideas."
              <span className="block text-[11px] text-cyan-400 not-italic mt-1">
                — Albert Einstein
              </span>
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 font-mono">
              <Code size={14} className="text-cyan-400" />
              <span>React 19 • TypeScript • Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* Separated bottom metadata */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Mathematics Club, MITS-DU Gwalior. All rights reserved.</p>
          <div className="flex items-center gap-2 text-cyan-400/80 font-medium">
            <Award size={14} />
            <span>MathClub Recruitment Task 2026</span>
          </div>
        </div>
      </Section>
    </footer>
  );
}
