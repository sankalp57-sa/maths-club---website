// ============================================================
// MathClub Nexus — Sidebar Navigation
// ============================================================

import {
  LayoutDashboard,
  Calendar,
  BrainCircuit,
  Trophy,
  ClipboardCheck,
  X,
  Sigma,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { NavSection } from '../types';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'events', label: 'Events Hub', icon: <Calendar size={20} /> },
  { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={20} /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
  { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={20} /> },
];

export default function Sidebar({
  activeSection,
  onNavigate,
  isMobileOpen,
  onToggleMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const handleNav = (section: NavSection) => {
    onNavigate(section);
    if (isMobileOpen) {
      onToggleMobile();
    }
  };

  const navContent = (mobile = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-800/80 flex items-center ${isCollapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
            <Sigma size={22} className="text-white" />
          </div>
          {(!isCollapsed || mobile) && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                MathClub
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  v1.0
                </span>
              </h1>
              <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-[0.2em]">Nexus Platform</p>
            </div>
          )}
        </div>

        {mobile && (
          <button
            onClick={onToggleMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              title={isCollapsed && !mobile ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isCollapsed && !mobile ? 'justify-center p-3' : 'gap-3 px-3.5 py-3'
              } ${
                isActive
                  ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.icon}
              </span>

              {(!isCollapsed || mobile) && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {isActive && (!isCollapsed || mobile) && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Toggle Section */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {(!isCollapsed || mobile) && (
          <div className="px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-2.5">
            <Sparkles size={16} className="text-violet-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-300 truncate">MathClub Nexus</p>
              <p className="text-[10px] text-slate-500 truncate">Live Offline Storage</p>
            </div>
          </div>
        )}

        {/* Desktop Collapse / Expand Button */}
        {!mobile && (
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-transparent ${
              isCollapsed ? 'justify-center' : 'justify-between px-3'
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {!isCollapsed && <span>Collapse Sidebar</span>}
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (flex item, non-overlapping) */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen z-40 bg-slate-900/95 border-r border-slate-800 backdrop-blur-xl transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent(false)}
      </aside>

      {/* Mobile Drawer (off-canvas overlay) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onToggleMobile}
          />

          {/* Drawer content */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col z-10 animate-fade-in">
            {navContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
