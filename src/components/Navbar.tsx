// ============================================================
// MathClub Nexus — Role-Aware Navigation Bar
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Calendar,
  BrainCircuit,
  Trophy,
  ClipboardCheck,
  Menu,
  X,
  Database,
  RotateCcw,
  Users,
  Award,
  MessageSquare,
  ChevronDown,
  Layers,
  LogOut,
  Ticket,
  UserCheck,
  ShieldCheck,
  Crown,
  User as UserIcon,
} from 'lucide-react';
import type { NavSection, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { springSmooth } from '../motion/motionTokens';
import Logo from './Logo';

interface NavbarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onLoadDemo: () => void;
  onReset: () => void;
}

interface NavLinkItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
  desc?: string;
  roles?: UserRole[];
}

export default function Navbar({
  activeSection,
  onNavigate,
  onLoadDemo,
  onReset,
}: NavbarProps) {
  const { user, role, logout } = useAuth();
  const { showToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (section: NavSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    setShowMoreMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    showToast('info', 'Logged out successfully. Returning to Login screen.');
    onNavigate('login');
  };

  // Build role-specific navigation links
  const getNavLinks = (): { primary: NavLinkItem[]; more: NavLinkItem[] } => {
    if (role === 'participant') {
      return {
        primary: [
          { id: 'dashboard', label: 'Home', icon: <Sparkles size={16} /> },
          { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
          { id: 'my-registrations', label: 'My Registrations', icon: <Ticket size={16} /> },
          { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={16} /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
        ],
        more: [
          { id: 'certificates', label: 'My Certificates', icon: <Award size={16} />, desc: 'Verified credentials' },
          { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={16} />, desc: 'Submit evaluations' },
        ],
      };
    }

    if (role === 'member') {
      return {
        primary: [
          { id: 'dashboard', label: 'Home', icon: <Sparkles size={16} /> },
          { id: 'events', label: 'Events Hub', icon: <Calendar size={16} /> },
          { id: 'my-events', label: 'My Assigned Events', icon: <UserCheck size={16} /> },
          { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={16} /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
        ],
        more: [
          { id: 'members', label: 'Member Directory', icon: <Users size={16} />, desc: 'Club roster view' },
          { id: 'certificates', label: 'Certificates', icon: <Award size={16} />, desc: 'Award credentials' },
          { id: 'feedback', label: 'Feedback Hub', icon: <MessageSquare size={16} />, desc: 'Quality & analytics' },
        ],
      };
    }

    if (role === 'core') {
      return {
        primary: [
          { id: 'dashboard', label: 'Home', icon: <Sparkles size={16} /> },
          { id: 'events', label: 'Events Hub', icon: <Calendar size={16} /> },
          { id: 'my-events', label: 'My Assigned Events', icon: <UserCheck size={16} /> },
          { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={16} /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
        ],
        more: [
          { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={16} />, desc: 'Tournament arena' },
          { id: 'members', label: 'Member Roster', icon: <Users size={16} />, desc: 'Manage coordinators' },
          { id: 'certificates', label: 'Certificates', icon: <Award size={16} />, desc: 'Issue credentials' },
          { id: 'feedback', label: 'Feedback Hub', icon: <MessageSquare size={16} />, desc: 'Participant evaluations' },
        ],
      };
    }

    // President
    return {
      primary: [
        { id: 'dashboard', label: 'Home', icon: <Sparkles size={16} /> },
        { id: 'events', label: 'Events Hub', icon: <Calendar size={16} /> },
        { id: 'my-events', label: 'My Assigned Events', icon: <UserCheck size={16} /> },
        { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={16} /> },
        { id: 'users', label: 'User Governance', icon: <ShieldCheck size={16} /> },
      ],
      more: [
        { id: 'members', label: 'Members Directory', icon: <Users size={16} />, desc: 'Full club directory' },
        { id: 'certificates', label: 'Certificates', icon: <Award size={16} />, desc: 'Issue & revoke credentials' },
        { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={16} />, desc: 'Challenge question arena' },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} />, desc: 'Hall of champions' },
        { id: 'feedback', label: 'Feedback Hub', icon: <MessageSquare size={16} />, desc: 'Quality reviews & sentiment' },
      ],
    };
  };

  const { primary: primaryNavLinks, more: moreNavLinks } = getNavLinks();
  const allMobileNavLinks = [...primaryNavLinks, ...moreNavLinks];
  const isMoreActive = moreNavLinks.some((m) => m.id === activeSection);

  const getRoleBadgeStyle = (userRole?: UserRole) => {
    switch (userRole) {
      case 'president':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'core':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'member':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 'participant':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRoleIcon = (userRole?: UserRole) => {
    switch (userRole) {
      case 'president':
        return <Crown size={12} className="text-amber-400" />;
      case 'core':
        return <ShieldCheck size={12} className="text-emerald-400" />;
      case 'member':
        return <Users size={12} className="text-blue-400" />;
      case 'participant':
        return <UserIcon size={12} className="text-cyan-400" />;
      default:
        return null;
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-[#050B16]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-[84px]">
          {/* Brand Logo & Title */}
          <div
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none flex-shrink-0 group py-2"
          >
            <Logo size="navbar" interactive />
            <div>
              <span className="text-base sm:text-lg lg:text-xl font-extrabold text-white tracking-tight">
                MathClub
              </span>
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                MATHEMATICS CLUB PORTAL
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 relative">
            {primaryNavLinks.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-cyan-300'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavPill"
                      transition={springSmooth}
                      className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,217,245,0.15)] z-0"
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}

            {/* Desktop "More" Dropdown Menu */}
            {moreNavLinks.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    isMoreActive
                      ? 'text-cyan-300'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isMoreActive && (
                    <motion.span
                      layoutId="activeNavPill"
                      transition={springSmooth}
                      className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,217,245,0.15)] z-0"
                    />
                  )}
                  <span className={`relative z-10 ${isMoreActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                    <Layers size={16} />
                  </span>
                  <span className="relative z-10">More</span>
                  <ChevronDown
                    size={14}
                    className={`relative z-10 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {showMoreMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMoreMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#091224] border border-slate-700/80 shadow-2xl p-2 z-50 space-y-1"
                      >
                        {moreNavLinks.map((sub) => {
                          const isSubActive = activeSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleNav(sub.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                                isSubActive
                                  ? 'bg-cyan-500/15 text-cyan-300'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                              }`}
                            >
                              <span className={isSubActive ? 'text-cyan-400' : 'text-slate-400'}>
                                {sub.icon}
                              </span>
                              <div>
                                <p className="text-xs font-semibold">{sub.label}</p>
                                {sub.desc && <p className="text-[10px] text-slate-400">{sub.desc}</p>}
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* User Profile Pill & Role Badge */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    <span>{user.role}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Demo State Dropdown (ONLY Visible to President!) */}
            {role === 'president' && (
              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                  title="President Demo Tools"
                >
                  <Database size={13} className="text-amber-400" />
                  <span>Demo State</span>
                </button>

                <AnimatePresence>
                  {showDemoMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDemoMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#091224] border border-slate-700/80 shadow-2xl p-1.5 z-50"
                      >
                        <button
                          onClick={() => {
                            onLoadDemo();
                            setShowDemoMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Database size={13} className="text-cyan-400" />
                          <span>Load Full Demo Data</span>
                        </button>
                        <button
                          onClick={() => {
                            onReset();
                            setShowDemoMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          <span>Reset Prototype State</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 transition-all cursor-pointer"
              title="Logout from session"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-t border-slate-800 bg-[#050B16]/98 backdrop-blur-2xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
              {/* Mobile User Profile Header */}
              {user && (
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${getRoleBadgeStyle(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    <span>{user.role}</span>
                  </span>
                </div>
              )}

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block px-1 font-mono">
                AVAILABLE MODULES ({role?.toUpperCase()})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allMobileNavLinks.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/25'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Mobile Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
                {role === 'president' && (
                  <button
                    onClick={() => {
                      onLoadDemo();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 cursor-pointer"
                  >
                    <Database size={14} />
                    <span>Load Demo Data</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
