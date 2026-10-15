// ============================================================
// MathClub Nexus — Role-First Authentication Portal
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  ShieldCheck,
  Users,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  KeyRound,
  Mail,
} from 'lucide-react';
import type { UserRole, NavSection } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import MathParticleField from '../components/MathParticleField';

interface LoginProps {
  onNavigate: (section: NavSection) => void;
  targetRedirect?: NavSection;
}

interface RoleCardConfig {
  role: UserRole;
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  demoEmail: string;
  accentColor: string;
  glowColor: string;
}

const roleCards: RoleCardConfig[] = [
  {
    role: 'president',
    title: 'President',
    badge: 'Executive',
    icon: <Crown className="w-6 h-6 text-amber-400" />,
    description: 'Full access to the whole portal',
    demoEmail: 'president@mathclub.com',
    accentColor: 'border-amber-500/40 text-amber-400',
    glowColor: 'shadow-[0_0_25px_rgba(251,191,36,0.25)]',
  },
  {
    role: 'core',
    title: 'Core Member',
    badge: 'Officer',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    description: 'Events, attendance and certificates',
    demoEmail: 'core@mathclub.com',
    accentColor: 'border-emerald-500/40 text-emerald-400',
    glowColor: 'shadow-[0_0_25px_rgba(52,211,153,0.25)]',
  },
  {
    role: 'member',
    title: 'Member',
    badge: 'Collegiate',
    icon: <Users className="w-6 h-6 text-blue-400" />,
    description: 'Own attendance, participants and feedback',
    demoEmail: 'member@mathclub.com',
    accentColor: 'border-blue-500/40 text-blue-400',
    glowColor: 'shadow-[0_0_25px_rgba(96,165,250,0.25)]',
  },
  {
    role: 'participant',
    title: 'User (Participant / Visitor)',
    badge: 'Public & Scholar',
    icon: <UserIcon className="w-6 h-6 text-cyan-400" />,
    description: 'Register for events and get certificates',
    demoEmail: 'participant@mathclub.com',
    accentColor: 'border-cyan-500/40 text-cyan-400',
    glowColor: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
  },
];

export default function Login({ onNavigate, targetRedirect }: LoginProps) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>('president');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeCard = roleCards.find((c) => c.role === selectedRole)!;

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleUseDemoCredentials = (role: UserRole) => {
    const card = roleCards.find((c) => c.role === role);
    if (!card) return;
    setEmail(card.demoEmail);
    setPassword('Math@123');
    setErrorMessage(null);
    showToast('info', `Pre-filled ${card.title} credentials: ${card.demoEmail}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      const msg = 'Please enter your registered email address.';
      setErrorMessage(msg);
      showToast('error', msg);
      return;
    }

    if (!password) {
      const msg = 'Please enter your password.';
      setErrorMessage(msg);
      showToast('error', msg);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email.trim(), password, selectedRole);

      if (!result.success) {
        const msg = result.message || 'Login failed. Please check your credentials.';
        setErrorMessage(msg);
        showToast('error', msg);
        setIsLoading(false);
        return;
      }

      showToast('success', `Welcome to MathClub Portal! Logged in as ${activeCard.title}`);

      // Role-based destination redirect
      if (targetRedirect && targetRedirect !== 'login' && targetRedirect !== 'signup') {
        onNavigate(targetRedirect);
      } else {
        switch (selectedRole) {
          case 'president':
          case 'core':
            onNavigate('dashboard');
            break;
          case 'member':
            onNavigate('my-events');
            break;
          case 'participant':
            onNavigate('my-registrations');
            break;
        }
      }
    } catch {
      const msg = 'An unexpected authentication error occurred.';
      setErrorMessage(msg);
      showToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050B16] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background ambient lighting & geometric grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 217, 245, 0.6) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <MathParticleField />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-cyan-500/[0.08] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/[0.04] rounded-full blur-[140px]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl mx-auto w-full">
        {/* Header Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/mits-du-logo.png"
              alt="MITS-DU Gwalior Mathematics Club"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full drop-shadow-[0_0_20px_rgba(0,217,245,0.4)]"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            MathClub <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">Portal</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-[0.25em]">
            Mathematics Club, MITS-DU Gwalior
          </p>
          <p className="mt-1 text-xs text-cyan-400/80 font-mono">
            Collegiate Academic & Olympiad Management Platform
          </p>
        </motion.div>

        {/* Role Selector: 4 Large Cards (2x2 on tablet, 4 across on desktop, stacked on mobile) */}
        <div className="w-full mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center sm:text-left">
            Select Your Account Tier:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {roleCards.map((card) => {
              const isSelected = selectedRole === card.role;
              return (
                <motion.button
                  key={card.role}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRole(card.role)}
                  type="button"
                  className={`text-left p-4 sm:p-4.5 rounded-2xl transition-all relative overflow-hidden border ${
                    isSelected
                      ? `bg-slate-900/90 border-cyan-400 ${card.glowColor} ring-1 ring-cyan-400/50`
                      : 'bg-[#091224]/80 border-slate-800 hover:border-slate-700 hover:bg-[#0c1830]'
                  }`}
                >
                  {/* Active Indicator Top Pill */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 inline-flex">
                      {card.icon}
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>

                  {isSelected && (
                    <motion.div
                      layoutId="roleActiveLine"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Animated Login Form beneath the cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl bg-[#091224]/90 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative"
          >
            {/* Header of Form */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sign In Portal
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    {activeCard.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter registered academic credentials for verification.
                </p>
              </div>

              {/* Demo Credentials Quick Button */}
              <button
                type="button"
                onClick={() => handleUseDemoCredentials(selectedRole)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all self-start sm:self-auto cursor-pointer"
              >
                <Sparkles size={13} className="text-cyan-400" />
                <span>Use demo credentials</span>
              </button>
            </div>

            {/* Error Banner Area */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Authentication Denied</p>
                  <p className="mt-0.5 text-red-200/90">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Login Inputs Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={activeCard.demoEmail}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <KeyRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login as {activeCard.title}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Bottom Actions: Sign-up Link (ONLY on User/Participant card) */}
            {selectedRole === 'participant' ? (
              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  New visitor or student?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('signup')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Create a free participant account
                  </button>
                </p>
              </div>
            ) : (
              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-500">
                  Leadership & Member accounts are officially provisioned by the Club President.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mandatory On-screen Banner at the bottom */}
      <footer className="relative z-10 py-3.5 px-4 bg-[#030712]/90 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400 font-mono tracking-wide">
          🛡️ Demo prototype: accounts and data are stored in your browser only.
        </p>
      </footer>
    </div>
  );
}
