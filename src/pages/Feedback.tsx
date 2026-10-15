// ============================================================
// MathClub Nexus — Feedback Collection & Analytics System
// ============================================================

import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  MessageSquare,
  Star,
  Download,
  Filter,
  Send,
  UserCheck,
  EyeOff,
  BarChart3,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react';
import type { AppState, Feedback } from '../types';
import { addFeedback } from '../utils/storage';
import { useToast } from '../components/Toast';
import Section from '../components/Section';
import MotionSection from '../components/MotionSection';
import AnimatedCounter from '../components/AnimatedCounter';

interface FeedbackPageProps {
  data: AppState;
  onDataChange: () => void;
}

export default function FeedbackPage({ data, onDataChange }: FeedbackPageProps) {
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  // Active Event Filter for Analytics & List
  const [filterEventId, setFilterEventId] = useState<string>('All');

  // Form State
  const [eventId, setEventId] = useState<string>(data.events[0]?.id || '');
  const [participantName, setParticipantName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [contentRating, setContentRating] = useState<number>(5);
  const [orgRating, setOrgRating] = useState<number>(5);
  const [diffRating, setDiffRating] = useState<number>(3);
  const [comment, setComment] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Deriving filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    if (filterEventId === 'All') return data.feedback;
    return data.feedback.filter((f) => f.eventId === filterEventId);
  }, [data.feedback, filterEventId]);

  // Overall Statistics
  const stats = useMemo(() => {
    const list = filteredFeedbacks;
    const total = list.length;
    if (total === 0) {
      return {
        avgOverall: 0,
        avgContent: 0,
        avgOrg: 0,
        avgDiff: 0,
        distribution: [0, 0, 0, 0, 0],
      };
    }
    const sumOverall = list.reduce((acc, f) => acc + f.rating, 0);
    const sumContent = list.reduce((acc, f) => acc + f.categoryRatings.content, 0);
    const sumOrg = list.reduce((acc, f) => acc + f.categoryRatings.organization, 0);
    const sumDiff = list.reduce((acc, f) => acc + f.categoryRatings.difficulty, 0);

    const distribution = [0, 0, 0, 0, 0]; // 1 star to 5 star
    list.forEach((f) => {
      const idx = Math.min(5, Math.max(1, f.rating)) - 1;
      distribution[idx]++;
    });

    return {
      avgOverall: Number((sumOverall / total).toFixed(1)),
      avgContent: Number((sumContent / total).toFixed(1)),
      avgOrg: Number((sumOrg / total).toFixed(1)),
      avgDiff: Number((sumDiff / total).toFixed(1)),
      distribution,
    };
  }, [filteredFeedbacks]);

  // Event list averages breakdown
  const eventBreakdown = useMemo(() => {
    return data.events.map((event) => {
      const eventReviews = data.feedback.filter((f) => f.eventId === event.id);
      const count = eventReviews.length;
      const avg =
        count > 0
          ? Number(
              (
                eventReviews.reduce((sum, f) => sum + f.rating, 0) / count
              ).toFixed(1)
            )
          : null;
      return { event, count, avg };
    });
  }, [data.events, data.feedback]);

  // Form Validation & Submission
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!eventId) {
      errors.eventId = 'Please select a valid event';
    }
    if (!isAnonymous && !participantName.trim()) {
      errors.participantName = 'Please enter your name or check anonymous submission';
    }
    if (!comment.trim()) {
      errors.comment = 'Feedback comment is required';
    } else if (comment.trim().length < 10) {
      errors.comment = 'Please provide at least 10 characters of detailed feedback';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = addFeedback({
      eventId,
      participantName: isAnonymous ? undefined : participantName,
      rating: overallRating,
      categoryRatings: {
        content: contentRating,
        organization: orgRating,
        difficulty: diffRating,
      },
      comment,
      anonymous: isAnonymous,
    });

    if (res.success) {
      showToast('success', res.message);
      onDataChange();
      // Reset form
      setComment('');
      if (!isAnonymous) setParticipantName('');
      setFormErrors({});
    } else {
      showToast('error', res.message);
    }
  };

  // Export Feedback to CSV
  const handleExportCSV = () => {
    if (data.feedback.length === 0) {
      showToast('info', 'No feedback records available to export');
      return;
    }
    const headers = [
      'Feedback ID',
      'Event Name',
      'Participant Name',
      'Overall Rating',
      'Content Rating',
      'Organization Rating',
      'Difficulty Rating',
      'Anonymous',
      'Comment',
      'Submitted Date',
    ];

    const rows = data.feedback.map((f) => {
      const eventName = data.events.find((e) => e.id === f.eventId)?.name || 'Event';
      return [
        `"${f.id}"`,
        `"${eventName}"`,
        `"${f.anonymous ? 'Anonymous' : f.participantName || 'Scholar'}"`,
        `"${f.rating}"`,
        `"${f.categoryRatings.content}"`,
        `"${f.categoryRatings.organization}"`,
        `"${f.categoryRatings.difficulty}"`,
        `"${f.anonymous ? 'Yes' : 'No'}"`,
        `"${f.comment.replace(/"/g, '""')}"`,
        `"${new Date(f.submittedAt).toLocaleDateString()}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `MathClub_Feedback_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Exported ${data.feedback.length} feedback entries to CSV`);
  };

  const getEventName = (id: string) => {
    return data.events.find((e) => e.id === id)?.name || 'Mathematics Colloquium';
  };

  return (
    <div className="w-full space-y-4">
      <Section className="!py-12 md:!py-16">
        <MotionSection>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-3 font-mono">
                ACADEMIC APPRAISAL & SENTIMENT
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                Feedback & Quality Analytics
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                Collegiate attendee assessments, qualitative commentary, and pedagogical evaluation across club events.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-colors"
              >
                <Download size={16} className="text-cyan-400" />
                <span>Export Reviews CSV</span>
              </motion.button>
            </div>
          </div>

          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Overall Rating Card */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Overall Score
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Star size={18} fill="currentColor" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-3 font-mono">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {stats.avgOverall || 0}
                </span>
                <span className="text-sm text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    fill={s <= Math.round(stats.avgOverall) ? 'currentColor' : 'none'}
                    className={s <= Math.round(stats.avgOverall) ? 'text-amber-400' : 'text-slate-700'}
                  />
                ))}
              </div>
            </motion.div>

            {/* Total Reviews Card */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Reviews
                </span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <MessageSquare size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                <AnimatedCounter value={filteredFeedbacks.length} />
              </p>
              <p className="text-xs text-slate-400 mt-2">Verified attendee submissions</p>
            </motion.div>

            {/* Content Quality Rating */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Content Rigor
                </span>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Sparkles size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                {stats.avgContent || 0}
                <span className="text-sm font-normal text-slate-400"> / 5.0</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">Mathematical Depth & Proofs</p>
            </motion.div>

            {/* Organization Rating */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Organization
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                {stats.avgOrg || 0}
                <span className="text-sm font-normal text-slate-400"> / 5.0</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">Logistics, Venue & Timing</p>
            </motion.div>
          </div>

          {/* Two-Column Layout: Form on Left, Analytics Breakdown on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Left Column: Submit Feedback Form */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl p-6 sm:p-8 bg-[#0A1224]/90 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                    <Send size={17} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Submit Event Assessment
                    </h3>
                    <p className="text-xs text-slate-400">
                      Help elevate university mathematics workshops
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Event Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Select Event <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    >
                      {data.events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EyeOff size={16} className={isAnonymous ? 'text-cyan-400' : 'text-slate-500'} />
                      <span className="text-xs font-semibold text-slate-300">
                        Submit anonymously
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        isAnonymous ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-white shadow-md"
                        animate={{ x: isAnonymous ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Scholar Name (if not anonymous) */}
                  {!isAnonymous && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Scholar Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        placeholder="e.g. Ramanujan Sharma"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                      {formErrors.participantName && (
                        <p className="text-xs text-red-400 mt-1">{formErrors.participantName}</p>
                      )}
                    </motion.div>
                  )}

                  {/* Overall Star Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Overall Experience Rating
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating !== null ? hoverRating : overallRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setOverallRating(star)}
                            className="p-1 text-slate-700 hover:scale-110 transition-transform"
                          >
                            <Star
                              size={24}
                              fill={active ? '#F59E0B' : 'transparent'}
                              className={active ? 'text-amber-400' : 'text-slate-700'}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-mono font-bold text-amber-400 pl-2">
                        {hoverRating || overallRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Category Ratings (1 - 5)
                    </span>

                    {/* Content Rigor */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Content & Rigor</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setContentRating(val)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              contentRating === val
                                ? 'bg-cyan-500 text-[#050B16]'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Organization */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Logistics & Venue</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setOrgRating(val)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              orgRating === val
                                ? 'bg-cyan-500 text-[#050B16]'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Problem Difficulty</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDiffRating(val)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              diffRating === val
                                ? 'bg-cyan-500 text-[#050B16]'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Qualitative Commentary <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts on lecture clarity, mathematical proofs, pacing, or recommendations..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                    {formErrors.comment && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.comment}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
                  >
                    Submit Assessment
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Right Column: Rating Distribution & Per-Event Analytics */}
            <div className="lg:col-span-7 space-y-6">
              {/* Rating Distribution Bar Chart */}
              <div className="rounded-3xl p-6 sm:p-8 bg-[#0A1224]/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Rating Distribution
                    </h3>
                    <p className="text-xs text-slate-400">
                      Overall satisfaction breakdown across 1★ to 5★
                    </p>
                  </div>
                  <BarChart3 size={20} className="text-cyan-400" />
                </div>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = stats.distribution[stars - 1] || 0;
                    const pct =
                      filteredFeedbacks.length > 0
                        ? Math.round((count / filteredFeedbacks.length) * 100)
                        : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 w-14 font-mono text-slate-300">
                          <span>{stars}</span>
                          <Star size={12} fill="#F59E0B" className="text-amber-400" />
                        </div>
                        <div className="flex-1 h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full rounded-full ${
                              stars >= 4
                                ? 'bg-cyan-400'
                                : stars === 3
                                ? 'bg-teal-400'
                                : 'bg-amber-400'
                            }`}
                          />
                        </div>
                        <div className="w-16 text-right font-mono text-slate-400">
                          {count} ({pct}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-Event Breakdown Summary */}
              <div className="rounded-3xl p-6 sm:p-8 bg-[#0A1224]/80 border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold text-white tracking-tight mb-4">
                  Per-Event Quality Index
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {eventBreakdown.map(({ event, count, avg }) => (
                    <div
                      key={event.id}
                      onClick={() => setFilterEventId(event.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        filterEventId === event.id
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-white text-xs sm:text-sm line-clamp-1">
                          {event.name}
                        </h4>
                        {avg !== null ? (
                          <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Star size={11} fill="currentColor" />
                            {avg}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">No data</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 font-mono">
                        {count} verified submission{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Recent Comments and Filter */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1 font-mono">
                  SCHOLAR PERSPECTIVES
                </span>
                <h3 className="text-2xl font-bold text-white">Attendee Feedback Log</h3>
              </div>

              {/* Event Filter dropdown */}
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-slate-400" />
                <select
                  value={filterEventId}
                  onChange={(e) => setFilterEventId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="All">All Events ({data.feedback.length})</option>
                  {data.events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comments List */}
            {filteredFeedbacks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFeedbacks.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={shouldReduceMotion ? {} : { y: -6 }}
                    className="rounded-2xl p-6 bg-[#0A1224]/80 border border-slate-800/80 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Author & Stars */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 uppercase">
                            {item.anonymous ? '?' : item.participantName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {item.anonymous ? 'Anonymous Scholar' : item.participantName || 'Scholar'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {getEventName(item.eventId)}
                            </p>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400 text-xs font-mono font-bold">
                          <Star size={12} fill="currentColor" />
                          <span>{item.rating}.0</span>
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-cyan-500/30 pl-3 py-1 mb-4">
                        "{item.comment}"
                      </p>
                    </div>

                    {/* Bottom Metadata: Category Badges & Date */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          Content: {item.categoryRatings.content}★
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          Org: {item.categoryRatings.organization}★
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          Diff: {item.categoryRatings.difficulty}★
                        </span>
                      </div>
                      <span>
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 p-16 text-center text-slate-400 bg-[#0A1224]/40">
                <MessageSquare size={36} className="mx-auto mb-3 text-slate-600" />
                <p className="text-base font-semibold text-slate-300">
                  No feedback recorded for this selection yet
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Be the first to submit an appraisal using the form above!
                </p>
              </div>
            )}
          </div>
        </MotionSection>
      </Section>
    </div>
  );
}
