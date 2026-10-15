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
  Star,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import type { AppState, NavSection, Event } from '../types';
import InteractiveMathVisual from '../components/InteractiveMathVisual';
import AnimatedCounter from '../components/AnimatedCounter';
import MotionSection from '../components/MotionSection';
import Section from '../components/Section';
import { cinematicEase } from '../motion/motionTokens';

interface DashboardProps {
  data: AppState;
  onNavigate: (section: NavSection) => void;
}

export default function Dashboard({ data, onNavigate }: DashboardProps) {
  const shouldReduceMotion = useReducedMotion();

  // Telemetry statistics directly from real AppState
  const stats = useMemo(() => {
    const totalParticipants = data.participants.length;
    const now = new Date();
    const upcomingEvents = data.events.filter(
      (e) => new Date(e.date) >= now
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
    const totalMembers = data.members?.length || 0;
    const certificatesIssued = data.certificates?.length || 0;
    const feedbackCount = data.feedback?.length || 0;
    const avgFeedback =
      feedbackCount > 0
        ? Number(
            (
              data.feedback.reduce((sum, f) => sum + f.rating, 0) /
              feedbackCount
            ).toFixed(1)
          )
        : 5.0;

    return {
      totalParticipants,
      upcomingEvents,
      quizzesTaken,
      attendanceRate,
      totalMembers,
      certificatesIssued,
      avgFeedback,
    };
  }, [data]);

  // Upcoming events sorted chronologically
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return [...data.events]
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data.events]);

  const featuredEvent = useMemo<Event | null>(() => {
    return upcomingEvents.length > 0 ? upcomingEvents[0] : (data.events[0] || null);
  }, [upcomingEvents, data.events]);

  const secondaryEvents = useMemo(() => {
    return upcomingEvents.filter((e) => e.id !== featuredEvent?.id).slice(0, 2);
  }, [upcomingEvents, featuredEvent]);

  // Top 3 champions for the leaderboard podium preview (never show 0-score gold champion)
  const topChampions = useMemo(() => {
    return [...data.quizAttempts]
      .filter((attempt) => attempt.score > 0)
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

  // Stagger variants for card grids
  const containerStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: cinematicEase },
    },
  };

  return (
    <div className="w-full space-y-4">
      {/* ============================================================
          SECTION 1: HERO SECTION
         ============================================================ */}
      <Section className="relative !py-12 md:!py-20 overflow-hidden">
        {/* Atmospheric ambient backdrop lighting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: cinematicEase }}
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[140px] pointer-events-none"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          {/* Left Column: Sequenced Storytelling Reveal */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow Wordmark Reveal */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: cinematicEase }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full whitespace-nowrap bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>MATHEMATICS • LOGIC • INNOVATION</span>
            </motion.div>

            {/* Headline with animated gradient shimmer */}
            <div className="overflow-hidden">
              <motion.h1
                initial={shouldReduceMotion ? {} : { y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.25, ease: cinematicEase }}
                className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] font-black text-white tracking-tight leading-[1.08] mb-4"
              >
                Where Logic Meets{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 via-cyan-300 to-blue-500 animate-shimmer">
                  Limitless Possibility
                </span>
              </motion.h1>
            </div>

            {/* Supporting Text Fade & Slide */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: cinematicEase }}
              className="text-base sm:text-lg text-slate-300 max-w-[580px] leading-relaxed mb-4"
            >
              Empowering collegiate mathematicians through university olympiads, rigorous algorithmic challenges, transparent attendance auditing, and real-time competitive leaderboards.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: cinematicEase }}
              className="flex flex-wrap items-center gap-4 pt-2 mb-10"
            >
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={() => onNavigate('events')}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
              >
                <Calendar size={17} />
                <span>Explore Events</span>
                <ArrowRight size={15} />
              </motion.button>

              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={() => onNavigate('quiz')}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-colors"
              >
                <BrainCircuit size={17} className="text-cyan-400" />
                <span>Enter Quiz Arena</span>
              </motion.button>
            </motion.div>

            {/* Key Value Micro-Pills */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400"
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

          {/* Right Column: Interactive Mathematical Visualization */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: cinematicEase }}
            className="lg:col-span-5 flex justify-center"
          >
            <InteractiveMathVisual />
          </motion.div>
        </div>
      </Section>

      {/* ============================================================
          SECTION 2: TELEMETRY & IMPACT METRICS
         ============================================================ */}
      <Section className="!py-14 md:!py-20">
        <MotionSection>
          <div className="mb-10">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-3 font-mono">
              TELEMETRY & IMPACT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Operational Overview
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Real-time metric summary calculated directly from active participants, event registrations, and scored challenges.
            </p>
          </div>

          {/* Card Grid with Stagger & Card Hover Glow */}
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Card 1: Participants */}
            <motion.div
              variants={itemFadeIn}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all duration-200"
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
              variants={itemFadeIn}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] transition-all duration-200"
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
              variants={itemFadeIn}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Quizzes Completed
                </span>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <BrainCircuit size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                <AnimatedCounter value={stats.quizzesTaken} />
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Evaluated algorithmic problem attempts
              </p>
            </motion.div>

            {/* Card 4: Attendance Rate */}
            <motion.div
              variants={itemFadeIn}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Avg Attendance
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ClipboardCheck size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                <AnimatedCounter value={stats.attendanceRate} suffix="%" />
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Verified member participation quorum
              </p>
            </motion.div>
          </motion.div>

          {/* Compact Row for Unified Club Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {/* Members Module Card */}
            <motion.div
              variants={itemFadeIn}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              onClick={() => onNavigate('members')}
              className="cursor-pointer rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                  Club Members
                </span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Users size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-3 font-mono">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  <AnimatedCounter value={stats.totalMembers} />
                </span>
                <span className="text-xs text-cyan-400 font-sans font-semibold">Active Roster →</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Registered scholars across academic faculties
              </p>
            </motion.div>

            {/* Certificates Module Card */}
            <motion.div
              variants={itemFadeIn}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              onClick={() => onNavigate('certificates')}
              className="cursor-pointer rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-amber-300 transition-colors">
                  Certificates Issued
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Award size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-3 font-mono">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  <AnimatedCounter value={stats.certificatesIssued} />
                </span>
                <span className="text-xs text-amber-400 font-sans font-semibold">Verified Codes →</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Authenticated collegiate credentials & merit honors
              </p>
            </motion.div>

            {/* Feedback Module Card */}
            <motion.div
              variants={itemFadeIn}
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              onClick={() => onNavigate('feedback')}
              className="cursor-pointer rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-teal-300 transition-colors">
                  Avg Feedback Rating
                </span>
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-3 font-mono">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.avgFeedback}
                </span>
                <span className="text-xs text-teal-400 font-sans font-semibold">/ 5.0 Rating →</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Aggregated workshop assessments & appraisals
              </p>
            </motion.div>
          </div>
        </MotionSection>
      </Section>

      {/* ============================================================
          SECTION 3: FEATURED INITIATIVES (EVENTS)
         ============================================================ */}
      <Section className="!py-14 md:!py-20">
        <MotionSection>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-3 font-mono">
                COLLEGIATE CALENDAR
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
                Featured Initiatives
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary Event Feature Card */}
              <motion.div
                whileHover={shouldReduceMotion ? {} : { y: -6 }}
                transition={{ duration: 0.2 }}
                className={`rounded-3xl p-7 sm:p-9 bg-[#0A1224]/80 border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] flex flex-col justify-between relative transition-all duration-200 ${
                  secondaryEvents.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Featured Event
                    </span>
                    <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                      {new Date(featuredEvent.date).toLocaleDateString('en', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                    {featuredEvent.name}
                  </h3>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {featuredEvent.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-2 font-mono">
                    <span className="flex items-center gap-2">
                      <MapPin size={15} className="text-cyan-400" />
                      {featuredEvent.venue}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users size={15} className="text-blue-400" />
                      {featuredEvent.registrations.length} / {featuredEvent.capacity} Reserved
                    </span>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                    onClick={() => onNavigate('events')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
                  >
                    <span>Register Participant</span>
                    <ArrowRight size={14} />
                  </motion.button>

                  <span className="text-xs text-slate-500 font-mono">
                    {Math.max(0, featuredEvent.capacity - featuredEvent.registrations.length)} seats remaining
                  </span>
                </div>
              </motion.div>

              {/* Secondary Events Column */}
              {secondaryEvents.length > 0 && (
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {secondaryEvents.map((evt) => (
                    <motion.div
                      key={evt.id}
                      whileHover={shouldReduceMotion ? {} : { y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800 hover:border-slate-700 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] flex flex-col justify-between flex-1 transition-all duration-200"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-3 py-1 rounded-full whitespace-nowrap bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            Upcoming
                          </span>
                          <span className="text-slate-400 font-mono">
                            {new Date(evt.date).toLocaleDateString('en', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <h4 className="text-lg font-bold text-white tracking-tight">
                          {evt.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400" />
                          {evt.venue}
                        </span>
                        <button
                          onClick={() => onNavigate('events')}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          View Details →
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-[#0A1224]/40 border border-slate-800 text-slate-400 text-sm">
              No upcoming events scheduled. Create one in the Events Hub!
            </div>
          )}
        </MotionSection>
      </Section>

      {/* ============================================================
          SECTION 4: ACADEMIC CHALLENGE ARENA (QUIZ PROMO PANEL)
         ============================================================ */}
      <Section className="!py-14 md:!py-20">
        <MotionSection className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0B172E] via-[#071120] to-[#050B16] border border-cyan-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.05] rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full whitespace-nowrap bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase mb-3">
                <BrainCircuit size={14} />
                <span>ACADEMIC CHALLENGE ARENA</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Mathematical Sprint Challenge
              </h3>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mb-6">
                Step into the timed arena covering Algebra, Probability, Number Theory, and Logic. Automatic scoring with precision timestamp tie-breakers.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-2 mb-10">
                <span className="px-3 py-1 rounded-full whitespace-nowrap bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                  10 Curated Problems
                </span>
                <span className="px-3 py-1 rounded-full whitespace-nowrap bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                  5:00 Minute Timer
                </span>
                <span className="px-3 py-1 rounded-full whitespace-nowrap bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                  Instant Hall of Champions Scoring
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={() => onNavigate('quiz')}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
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
      </Section>

      {/* ============================================================
          SECTION 5: TOP MATHEMATICAL PERFORMERS (PODIUM PREVIEW)
         ============================================================ */}
      <Section className="!py-14 md:!py-20">
        <MotionSection>
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-3 font-mono">
                ACADEMIC HONORS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4">
                Top Mathematical Performers
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
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
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
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
                    variants={itemFadeIn}
                    whileHover={shouldReduceMotion ? {} : { y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-2xl p-6 bg-[#0A1224]/70 border ${m.border} hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] flex flex-col justify-between transition-all duration-200`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-bold ${m.badge}`}>
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
                          <AnimatedCounter value={champ.score} />/{champ.totalQuestions || 10}
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
            </motion.div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-[#0A1224]/50 border border-slate-800 text-slate-400 text-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
                <Trophy size={24} />
              </div>
              <p className="font-semibold text-white">No Quiz Attempts Recorded Yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Be the first scholar to complete the 10-question sprint and claim the Gold Champion podium!
              </p>
              <button
                onClick={() => onNavigate('quiz')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 text-[#050B16] text-xs font-bold hover:bg-cyan-300 transition-colors"
              >
                <span>Enter Quiz Arena</span>
              </button>
            </div>
          )}
        </MotionSection>
      </Section>

      {/* ============================================================
          SECTION 6: REFINED ACTIVITY TIMELINE
         ============================================================ */}
      <Section className="!py-14 md:!py-20">
        <MotionSection>
          <div className="mb-10">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-3 font-mono">
              AUDIT TRAIL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Recent Platform Activity
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Real-time chronological log of participant registrations, quiz attempts, and check-in events.
            </p>
          </div>

          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="rounded-2xl bg-[#0A1224]/70 border border-slate-800/80 divide-y divide-slate-800/80 overflow-hidden shadow-lg"
          >
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <motion.div
                  key={act.id}
                  variants={itemFadeIn}
                  className="py-4 sm:py-4.5 px-6 flex items-center justify-between gap-6 hover:bg-slate-800/30 transition-colors"
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
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">
                No recent activity recorded yet.
              </p>
            )}
          </motion.div>
        </MotionSection>
      </Section>
    </div>
  );
}
