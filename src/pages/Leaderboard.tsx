// ============================================================
// MathClub Nexus — Cinematic Hall of Champions Leaderboard
// ============================================================

import { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Search,
  Crown,
  Award,
  Sparkles,
  Info,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AppState } from '../types';
import AnimatedCounter from '../components/AnimatedCounter';
import { cinematicEase, springBouncy, springSmooth } from '../motion/motionTokens';
import Section from '../components/Section';

interface LeaderboardProps {
  data: AppState;
}

export default function Leaderboard({ data }: LeaderboardProps) {
  const [search, setSearch] = useState('');

  // Sorted rankings: score descending, then time ascending
  const allRankings = useMemo(() => {
    return [...data.quizAttempts].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTakenSeconds - b.timeTakenSeconds;
    });
  }, [data.quizAttempts]);

  // Filtered rankings
  const filteredRankings = useMemo(() => {
    const q = search.toLowerCase();
    return allRankings.filter((attempt) =>
      attempt.participantName.toLowerCase().includes(q)
    );
  }, [allRankings, search]);

  const topThree = useMemo(() => {
    return allRankings.slice(0, 3);
  }, [allRankings]);

  // Podium order: Silver (2nd), Gold (1st), Bronze (3rd)
  const podiumOrder = useMemo(() => {
    const first = topThree[0] || null;
    const second = topThree[1] || null;
    const third = topThree[2] || null;
    return [
      {
        item: second,
        rank: 2,
        place: 'Silver Medalist',
        border: 'border-slate-300/30 hover:border-slate-300/50',
        glow: 'from-slate-400/10 to-transparent',
        delay: 0.15,
      },
      {
        item: first,
        rank: 1,
        place: 'Gold Champion',
        border: 'border-amber-400/40 hover:border-amber-400/60',
        glow: 'from-amber-400/15 via-amber-500/5 to-transparent',
        delay: 0.3,
      },
      {
        item: third,
        rank: 3,
        place: 'Bronze Medalist',
        border: 'border-amber-700/30 hover:border-amber-700/50',
        glow: 'from-amber-700/10 to-transparent',
        delay: 0.0,
      },
    ];
  }, [topThree]);

  return (
    <Section className="space-y-16 lg:space-y-20 text-slate-100 !py-0">
      {/* ============================================================
          HEADER — Hall of Champions
         ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: cinematicEase }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800/80"
      >
        <div className="space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block font-mono">
            ACADEMIC HONORS & ARCHIVE
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Hall of Champions
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Celebrating mathematical excellence, speed, and analytical precision across all university club competitions.
          </p>
        </div>

        {/* Prototype disclosure pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0A1224] border border-slate-800 text-xs text-slate-400 font-mono flex-shrink-0">
          <Info size={14} className="text-cyan-400" />
          <span>Demo Prototype Standings</span>
        </div>
      </motion.div>

      {/* ============================================================
          PODIUM VISUAL FOR TOP 3 (ANIMATED ENTRANCE)
         ============================================================ */}
      {topThree.length > 0 && (
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block font-mono">
              OLYMPIAD PEDESTAL
            </span>
            <p className="text-sm text-slate-400">Top mathematical scholars of the current semester</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end max-w-4xl mx-auto pt-6">
            {podiumOrder.map(({ item, rank, place, border, glow, delay }, idx) => {
              if (!item) {
                return (
                  <div
                    key={idx}
                    className="rounded-3xl p-6 text-center border border-slate-800/60 bg-[#0A1224]/30 opacity-40 hidden md:block"
                  >
                    <span className="text-xs text-slate-500 font-mono">Position Open</span>
                  </div>
                );
              }

              const isFirst = rank === 1;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay, ease: cinematicEase }}
                  whileHover={{ y: isFirst ? -18 : -8, transition: { duration: 0.25 } }}
                  className={`rounded-3xl p-7 text-center relative overflow-hidden flex flex-col justify-between bg-[#0A1224]/85 border ${border} transition-colors shadow-2xl ${
                    isFirst ? 'md:-translate-y-4 ring-1 ring-amber-400/20' : ''
                  }`}
                >
                  {/* Subtle radial background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${glow} pointer-events-none opacity-60`}
                  />

                  {/* Top Rank Badge */}
                  <div className="relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl mx-auto mb-3.5 flex items-center justify-center font-black text-lg bg-slate-900 border ${
                        isFirst
                          ? 'border-amber-400/40 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                          : rank === 2
                          ? 'border-slate-300/30 text-slate-200'
                          : 'border-amber-700/30 text-amber-600'
                      }`}
                    >
                      {isFirst ? (
                        <Crown size={26} className="text-amber-400 animate-pulse" />
                      ) : rank === 2 ? (
                        <Medal size={24} className="text-slate-300" />
                      ) : (
                        <Award size={24} className="text-amber-600" />
                      )}
                    </div>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950 font-bold'
                          : 'bg-amber-700 text-white font-bold'
                      }`}
                    >
                      {rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place'}
                    </span>

                    <h3 className="text-lg sm:text-xl font-extrabold text-white mt-3.5 truncate">
                      {item.participantName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{place}</p>
                  </div>

                  {/* Score & Time Details with Animated Numbers */}
                  <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-around text-xs relative z-10">
                    <div>
                      <span className="text-slate-400 block font-medium">Sprint Score</span>
                      <span className="text-xl font-black text-cyan-400 font-mono mt-0.5 block">
                        <AnimatedCounter value={item.score} />
                        <span className="text-slate-500 text-xs">/{item.totalQuestions}</span>
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                      <span className="text-slate-400 block font-medium">Elapsed</span>
                      <span className="text-sm font-bold text-slate-200 font-mono mt-0.5 block">
                        <AnimatedCounter value={item.timeTakenSeconds} suffix="s" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================
          SEARCH & FULL RANKINGS DIRECTORY TABLE
         ============================================================ */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy size={18} className="text-cyan-400" />
            Complete Competitive Standing
          </h3>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholar name..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#0A1224]/90 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>
        </div>

        {filteredRankings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-3xl bg-[#0A1224]/50 border border-slate-800 text-slate-400 text-sm space-y-2"
          >
            <Trophy size={40} className="text-slate-600 mx-auto" />
            <p className="font-semibold text-white">No Rankings Found</p>
            <p className="text-xs text-slate-500">
              {search ? 'Try clearing your search term.' : 'Complete a sprint in the Quiz Arena to register the first score!'}
            </p>
          </motion.div>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-[#0A1224]/70 border border-slate-800/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">Standing</th>
                    <th className="py-4 px-4 sm:px-6">Scholar / Participant</th>
                    <th className="py-4 px-4 sm:px-6 text-center">Score</th>
                    <th className="py-4 px-4 sm:px-6 text-center">Accuracy</th>
                    <th className="py-4 px-4 sm:px-6 text-center">Completion Time</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredRankings.map((attempt, index) => {
                    const accuracy = Math.round((attempt.score / attempt.totalQuestions) * 100);
                    const isTopThree = index < 3;

                    return (
                      <motion.tr
                        key={attempt.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                        className="hover:bg-slate-800/35 transition-colors"
                      >
                        {/* Standing Rank */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6">
                          <span
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs font-mono ${
                              index === 0
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : index === 1
                                ? 'bg-slate-300 text-slate-950 font-bold'
                                : index === 2
                                ? 'bg-amber-700 text-white font-bold'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            #{index + 1}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {attempt.participantName}
                            </span>
                            {isTopThree && (
                              <Sparkles size={14} className="text-amber-400" />
                            )}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6 text-center font-mono">
                          <span className="text-cyan-400 font-bold">
                            {attempt.score}
                          </span>
                          <span className="text-slate-500">/{attempt.totalQuestions}</span>
                        </td>

                        {/* Accuracy */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                              accuracy >= 80
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : accuracy >= 50
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {accuracy}%
                          </span>
                        </td>

                        {/* Speed */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6 text-center text-slate-300 font-mono">
                          {attempt.timeTakenSeconds}s
                        </td>

                        {/* Date */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6 text-right text-xs text-slate-500 font-mono">
                          {new Date(attempt.completedAt).toLocaleDateString('en', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </Section>
  );
}
