// ============================================================
// MathClub Nexus — Cinematic Motion Landing & Command Center
// ============================================================

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Users,
  Calendar,
  BrainCircuit,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  Trophy,
  MapPin,
  ChevronRight,
  Activity,
  Award,
  Crown,
} from 'lucide-react';
import type { AppState, NavSection, Event } from '../types';
import InteractiveMathVisual from '../components/InteractiveMathVisual';
import AnimatedCounter from '../components/AnimatedCounter';
import MotionSection from '../components/MotionSection';
import Section from '../components/Section';
import { cinematicEase, springSmooth } from '../motion/motionTokens';

interface DashboardProps {
  data: AppState;
  onNavigate: (section: NavSection) => void;
}

export default function Dashboard({ data, onNavigate }: DashboardProps) {
  const shouldReduceMotion = useReducedMotion();

  // Telemetry statistics directly from real AppState
  const stats = useMemo(() => {
    const totalParticipants = data.participants.length;
    const upcomingEvents = data.events.filter(
      (e) => new Date(e.date) >= new Date()
    ).length;
    const quizzesTaken = data.quizAttempts.length;
    const totalAttendance = data.attendance.length;
    const presentCount = data.attendance.filter(
      (a) => a.status === 'present'
    ).length;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    return {
      totalParticipants,
      upcomingEvents,
      quizzesTaken,
      attendanceRate,
    };
  }, [data]);

  // Upcoming events sorted chronologically
  const upcomingEvents = useMemo(() => {
    return [...data.events]
      .filter((e) => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data.events]);

  const featuredEvent = useMemo<Event | null>(() => {
    return upcomingEvents.length > 0 ? upcomingEvents[0] : (data.events[0] || null);
  }, [upcomingEvents, data.events]);

  const secondaryEvents = useMemo(() => {
    return upcomingEvents.filter((e) => e.id !== featuredEvent?.id).slice(0, 2);
  }, [upcomingEvents, featuredEvent]);

  // Top 3 champions for the leaderboard podium preview
  const topChampions = useMemo(() => {
    return [...data.quizAttempts]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeTakenSeconds - b.timeTakenSeconds;
      })
      .slice(0, 3);
  }, [data.quizAttempts]);

  // Recent 6 audit events
  const recentActivities = useMemo(() => {
    return data.activities.slice(0, 6);
  }, [data.activities]);

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Section className="space-y-24 lg:space-y-32 text-slate-100 !py-0">
      {/* ============================================================
          HERO SECTION — SIGNATURE CINEMATIC OPENING SEQUENCE
         ============================================================ */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        {/* Atmospheric ambient backdrop lighting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: cinematicEase }}
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[140px] pointer-events-none"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          {/* Left Column: Sequenced Storytelling Reveal */}
          <div className="lg:col-span-7 space-y-7">
            {/* Step D: Eyebrow Wordmark Reveal */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: cinematicEase }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>MATHEMATICS • LOGIC • INNOVATION</span>
            </motion.div>

            {/* Step E: Masked Text Reveal Headline */}
            <div className="overflow-hidden">
              <motion.h1
                initial={shouldReduceMotion ? {} : { y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.25, ease: cinematicEase }}
                className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] font-black text-white tracking-tight leading-[1.08]"
              >
                Where Logic Meets{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
                  Limitless Possibility
                </span>
              </motion.h1>
            </div>

            {/* Step F: Supporting Text Fade & Slide */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: cinematicEase }}
              className="text-base sm:text-lg text-slate-300 max-w-[580px] leading-relaxed"
            >
              Empowering collegiate mathematicians through university olympiads, rigorous algorithmic challenges, transparent attendance auditing, and real-time competitive leaderboards.
            </motion.p>

            {/* Step G: CTA Buttons with subtle scale & magnetic feel */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: cinematicEase }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                onClick={() => onNavigate('events')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
              >
                <Calendar size={17} />
                <span>Explore Events</span>
                <ArrowRight size={15} />
              </motion.button>

              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                onClick={() => onNavigate('quiz')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-colors"
              >
                <BrainCircuit size={17} className="text-cyan-400" />
                <span>Enter Quiz Arena</span>
              </motion.button>
            </motion.div>

            {/* Understated Feature Row */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Real-Time Event Registration
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Automated Speed Scoring
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Quorum Audit Records
              </span>
            </motion.div>
          </div>

          {/* Right Column: Steps B, C, H — Interactive Mathematical Visualization */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: cinematicEase }}
            className="lg:col-span-5 flex justify-center"
          >
            <InteractiveMathVisual />
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION: REFINED STATISTICS WITH ANIMATED COUNTERS
         ============================================================ */}
      <MotionSection className="space-y-6">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">
            TELEMETRY & IMPACT
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Operational Overview
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            Real-time metric summary calculated directly from active participants, event registrations, and scored challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Card 1: Participants */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -3, borderColor: 'rgba(0, 217, 245, 0.3)' }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Participants
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Users size={18} />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
              <AnimatedCounter value={stats.totalParticipants} />
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Active student scholars on club roster
            </p>
          </motion.div>

          {/* Card 2: Upcoming Events */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -3, borderColor: 'rgba(59, 130, 246, 0.3)' }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Upcoming Events
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Calendar size={18} />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
              <AnimatedCounter value={stats.upcomingEvents} />
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Scheduled Olympiads & colloquia
            </p>
          </motion.div>

          {/* Card 3: Quizzes Completed */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -3, borderColor: 'rgba(20, 184, 166, 0.3)' }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quizzes Completed
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300">
                <BrainCircuit size={18} />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
              <AnimatedCounter value={stats.quizzesTaken} />
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Validated attempts scored in Leaderboard
            </p>
          </motion.div>

          {/* Card 4: Attendance Rate */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -3, borderColor: 'rgba(99, 102, 241, 0.3)' }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Avg. Attendance Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ClipboardCheck size={18} />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
              <AnimatedCounter value={stats.attendanceRate} suffix="%" />
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Verified physical check-in quorum
            </p>
          </motion.div>
        </div>
      </MotionSection>

      {/* ============================================================
          SECTION: FEATURED EVENTS & COLLOQUIA
         ============================================================ */}
      <MotionSection className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">
              COLLEGIATE CALENDAR
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Featured Initiatives
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Upcoming mathematical workshops, research seminars, and student symposiums.
            </p>
          </div>

          <button
            onClick={() => onNavigate('events')}
            className="flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group flex-shrink-0"
          >
            <span>View All Events ({data.events.length})</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Event Showcase */}
        {featuredEvent ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Primary Event Feature Card */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -2, borderColor: 'rgba(0, 217, 245, 0.25)' }}
              transition={{ duration: 0.2 }}
              className={`rounded-3xl p-7 sm:p-9 bg-[#0A1224]/80 border border-slate-800 flex flex-col justify-between relative transition-colors ${
                secondaryEvents.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
              }`}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Featured Event
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(featuredEvent.date).toLocaleDateString('en', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {featuredEvent.name}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  {featuredEvent.description ||
                    'An intensive mathematical convergence challenging undergraduates in competitive calculus, discrete structures, and applied modeling.'}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-cyan-400 flex-shrink-0" />
                    {featuredEvent.venue}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users size={16} className="text-cyan-400 flex-shrink-0" />
                    {featuredEvent.registrations.length} / {featuredEvent.capacity} Seats Filled
                  </span>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {Math.round((featuredEvent.registrations.length / featuredEvent.capacity) * 100)}% capacity claimed
                </span>
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  onClick={() => onNavigate('events')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
                >
                  <span>Register Now</span>
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            </motion.div>

            {/* Secondary Events Column */}
            {secondaryEvents.length > 0 && (
              <div className="lg:col-span-5 space-y-6">
                {secondaryEvents.map((evt) => (
                  <motion.div
                    key={evt.id}
                    whileHover={shouldReduceMotion ? {} : { y: -2, borderColor: 'rgba(0, 217, 245, 0.2)' }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onNavigate('events')}
                    className="rounded-2xl p-6 bg-[#0A1224]/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex flex-col justify-between transition-colors group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="text-cyan-400 font-semibold">
                          {new Date(evt.date).toLocaleDateString('en', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 border border-slate-800">
                          {evt.registrations.length}/{evt.capacity} Seats
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {evt.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-500" />
                        {evt.venue}
                      </span>
                      <span className="text-cyan-400 font-medium flex items-center gap-1">
                        Details
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-[#0A1224]/40 border border-slate-800 text-slate-400">
            No events scheduled currently. Use the Events Hub to publish an initiative.
          </div>
        )}
      </MotionSection>

      {/* ============================================================
          SECTION: QUIZ ARENA PROMOTION (Wide Feature Panel)
         ============================================================ */}
      <MotionSection className="rounded-3xl p-8 sm:p-10 lg:p-12 bg-[#0A1224]/80 border border-slate-800 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase">
              <BrainCircuit size={14} />
              <span>ACADEMIC CHALLENGE ARENA</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Mathematical Sprint Challenge
            </h3>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Step into the timed arena covering Differential Equations, Linear Transformations, Prime Sieve Number Theory, and Combinatorics. Automatic scoring with precision timestamp tie-breakers.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                10 Curated Problems
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                5:00 Minute Timer
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                Instant Hall of Champions Scoring
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              onClick={() => onNavigate('quiz')}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
            >
              <BrainCircuit size={18} />
              <span>Launch Quiz Challenge</span>
            </motion.button>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Evaluated in real-time
            </p>
          </div>
        </div>
      </MotionSection>

      {/* ============================================================
          SECTION: HALL OF CHAMPIONS LEADERBOARD PREVIEW (Podium)
         ============================================================ */}
      <MotionSection className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">
              ACADEMIC HONORS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Top Mathematical Scholars
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Recognizing high-speed analytical problem solving and score accuracy.
            </p>
          </div>

          <button
            onClick={() => onNavigate('leaderboard')}
            className="flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group flex-shrink-0"
          >
            <span>Full Standings</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Podium for Top 3 */}
        {topChampions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {topChampions.map((champ, index) => {
              const medals = [
                {
                  rank: '1st',
                  label: 'Gold Champion',
                  border: 'border-amber-400/40',
                  badge: 'bg-amber-400 text-slate-950',
                  icon: <Crown size={20} className="text-amber-400" />,
                },
                {
                  rank: '2nd',
                  label: 'Silver Medalist',
                  border: 'border-slate-300/30',
                  badge: 'bg-slate-300 text-slate-950',
                  icon: <Trophy size={19} className="text-slate-300" />,
                },
                {
                  rank: '3rd',
                  label: 'Bronze Medalist',
                  border: 'border-amber-700/30',
                  badge: 'bg-amber-700 text-white',
                  icon: <Award size={19} className="text-amber-500" />,
                },
              ];
              const m = medals[index] || medals[2];

              return (
                <motion.div
                  key={champ.id}
                  whileHover={shouldReduceMotion ? {} : { y: -4 }}
                  transition={springSmooth}
                  className={`rounded-2xl p-6 bg-[#0A1224]/70 border ${m.border} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${m.badge}`}>
                        {m.rank} Place
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                        {m.icon}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-white truncate">
                      {champ.participantName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{m.label}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block">Score</span>
                      <span className="text-lg font-extrabold text-cyan-400 font-mono">
                        <AnimatedCounter value={champ.score} />/{champ.totalQuestions}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Speed</span>
                      <span className="text-sm font-semibold text-slate-200 font-mono">
                        {champ.timeTakenSeconds}s
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 rounded-2xl bg-[#0A1224]/40 border border-slate-800 text-slate-400 text-sm">
            No quiz attempts recorded yet. Be the first to enter the Quiz Arena!
          </div>
        )}
      </MotionSection>

      {/* ============================================================
          SECTION: REFINED ACTIVITY TIMELINE
         ============================================================ */}
      <MotionSection className="space-y-6">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">
            AUDIT TRAIL
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Recent Platform Activity
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time chronological log of participant registrations, quiz attempts, and check-in events.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0A1224]/70 border border-slate-800/80 divide-y divide-slate-800/80 overflow-hidden">
          {recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <div
                key={act.id}
                className="py-4 sm:py-4.5 px-6 flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <p className="text-sm text-slate-200 truncate leading-snug">
                    {act.message}
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono flex-shrink-0">
                  {formatTimeAgo(act.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">
              No recent activity recorded yet.
            </p>
          )}
        </div>
      </MotionSection>
    </Section>
  );
}
