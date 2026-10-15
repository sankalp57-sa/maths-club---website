// ============================================================
// MathClub Nexus — Premium Motion Navigation Bar
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
  Compass,
} from 'lucide-react';
import type { NavSection } from '../types';
import { springSmooth } from '../motion/motionTokens';

interface NavbarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onLoadDemo: () => void;
  onReset: () => void;
}

const navLinks: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <Sparkles size={16} /> },
  { id: 'events', label: 'Events Hub', icon: <Calendar size={16} /> },
  { id: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit size={16} /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
  { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={16} /> },
];

export default function Navbar({
  activeSection,
  onNavigate,
  onLoadDemo,
  onReset,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050B16]/92 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-[84px]">
          {/* Brand Logo & Title */}
          <div
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none flex-shrink-0 group py-2"
          >
            {/* Club circular logo */}
            <div className="w-11 h-11 lg:w-13 lg:h-13 rounded-full overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/10">
              <img
                src="/logo.png"
                alt="Mathematics Club MITS-DU Gwalior"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base lg:text-lg font-extrabold text-white tracking-tight leading-tight">
                  Mathematics Club
                </span>
              </div>
              <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-[0.18em]">
                MITS-DU Gwalior
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links with animated layoutId indicator */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 relative">
            {navLinks.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
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
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3.5">
            {/* Demo State Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
                title="Prototype Data Tools"
              >
                <Database size={13} className="text-cyan-400" />
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      >
                        <Database size={13} className="text-cyan-400" />
                        <span>Load Full Demo Data</span>
                      </button>
                      <button
                        onClick={() => {
                          onReset();
                          setShowDemoMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <RotateCcw size={13} />
                        <span>Reset Prototype State</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Primary Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleNav(activeSection === 'events' ? 'quiz' : 'events')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
            >
              <Compass size={16} />
              <span>{activeSection === 'events' ? 'Enter Challenge' : 'Explore Events'}</span>
            </motion.button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
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
            className="md:hidden border-t border-slate-800 bg-[#050B16]/98 backdrop-blur-2xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 space-y-2.5">
              {navLinks.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
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

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    onLoadDemo();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25"
                >
                  <Database size={14} />
                  <span>Load Demo Data</span>
                </button>
                <button
                  onClick={() => {
                    onReset();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800"
                >
                  <RotateCcw size={14} />
                  <span>Reset Prototype State</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
