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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Ticket,
  UserCheck,
  ShieldCheck,
  Crown,
  User as UserIcon,
  Users,
  Award,
  MessageSquare,
} from 'lucide-react';
import type { NavSection, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  activeSection,
  onNavigate,
  isMobileOpen,
  onToggleMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { user, role } = useAuth();

  const handleNav = (section: NavSection) => {
    onNavigate(section);
    if (isMobileOpen) {
      onToggleMobile();
    }
  };

  // Build role-specific sidebar items
  const getSidebarItems = (): { id: NavSection; label: string; icon: React.ReactNode }[] => {
    if (role === 'participant') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'events', label: 'Events', icon: <Calendar size={20} /> },
        { id: 'my-registrations', label: 'My Registrations', icon: <Ticket size={20} /> },
        { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={20} /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
        { id: 'certificates', label: 'My Certificates', icon: <Award size={20} /> },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
      ];
    }

    if (role === 'member') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'events', label: 'Events Hub', icon: <Calendar size={20} /> },
        { id: 'my-events', label: 'Assigned Events', icon: <UserCheck size={20} /> },
        { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={20} /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
        { id: 'members', label: 'Member Roster', icon: <Users size={20} /> },
        { id: 'certificates', label: 'Certificates', icon: <Award size={20} /> },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
      ];
    }

    if (role === 'core') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'events', label: 'Events Hub', icon: <Calendar size={20} /> },
        { id: 'my-events', label: 'Assigned Events', icon: <UserCheck size={20} /> },
        { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={20} /> },
        { id: 'members', label: 'Member Directory', icon: <Users size={20} /> },
        { id: 'certificates', label: 'Certificates', icon: <Award size={20} /> },
        { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={20} /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
        { id: 'feedback', label: 'Feedback Hub', icon: <MessageSquare size={20} /> },
      ];
    }

    // President
    return [
      { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
      { id: 'events', label: 'Events Hub', icon: <Calendar size={20} /> },
      { id: 'my-events', label: 'Assigned Events', icon: <UserCheck size={20} /> },
      { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={20} /> },
      { id: 'users', label: 'User Governance', icon: <ShieldCheck size={20} /> },
      { id: 'members', label: 'Club Members', icon: <Users size={20} /> },
      { id: 'certificates', label: 'Certificates', icon: <Award size={20} /> },
      { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={20} /> },
      { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
      { id: 'feedback', label: 'Feedback Hub', icon: <MessageSquare size={20} /> },
    ];
  };

  const navItems = getSidebarItems();

  const navContent = (mobile = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-800/80 flex items-center ${isCollapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <Logo size="h-9 w-9" />
          {(!isCollapsed || mobile) && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                Mathematics Club
              </h1>
              <p className="text-[9px] font-semibold text-cyan-400 uppercase tracking-[0.18em]">
                MITS-DU Gwalior
              </p>
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
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/10 border border-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              } ${isCollapsed && !mobile ? 'justify-center px-2' : ''}`}
              title={isCollapsed && !mobile ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              {(!isCollapsed || mobile) && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile Section */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {(!isCollapsed || mobile) && user && (
          <div className="px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-cyan-400 font-mono capitalize">{user.role}</p>
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
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Mobile Drawer (Left off-canvas) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#050B16] border-r border-slate-800/80 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent(true)}
      </aside>

      {/* Desktop Persistent Sidebar (flex item, non-overlapping) */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-[#050B16]/95 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 sticky top-0 h-screen z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent(false)}
      </aside>
    </>
  );
}
