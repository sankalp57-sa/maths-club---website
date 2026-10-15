// ============================================================
// MathClub Nexus — Editorial University Footer
// ============================================================

import { Sigma, Code, Award } from 'lucide-react';
import type { NavSection } from '../types';

interface FooterProps {
  onNavigate: (section: NavSection) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-24 lg:mt-32 border-t border-slate-800/80 bg-[#030712] relative overflow-hidden text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 lg:pt-16 pb-12 relative z-10">
        {/* Three well-spaced columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mb-12 lg:mb-16">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/15">
                <Sigma size={22} className="text-white" />
              </div>
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
            <ul className="space-y-3 text-sm">
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
          <p>© {new Date().getFullYear()} University Mathematics Club. All rights reserved.</p>
          <div className="flex items-center gap-2 text-cyan-400/80 font-medium">
            <Award size={14} />
            <span>MathClub Recruitment Task 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
