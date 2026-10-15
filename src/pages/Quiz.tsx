// ============================================================
// MathClub Nexus — Cinematic Mathematical Quiz Arena
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BrainCircuit,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trophy,
  Play,
  RotateCcw,
  Target,
  Sparkles,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AppState, QuizQuestion } from '../types';
import { getShuffledQuestions } from '../data/quizQuestions';
import { addQuizAttempt, hasAttemptedQuiz } from '../utils/storage';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import AnimatedCounter from '../components/AnimatedCounter';
import { cinematicEase } from '../motion/motionTokens';
import Section from '../components/Section';

interface QuizPageProps {
  data: AppState;
  onDataChange: () => void;
}

const QUIZ_DURATION_SECONDS = 300; // 5 minutes

export default function QuizPage({ data, onDataChange }: QuizPageProps) {
  const { showToast } = useToast();

  // Phase: 'intro' | 'active' | 'results'
  const [phase, setPhase] = useState<'intro' | 'active' | 'results'>('intro');

  // Pre-quiz form
  const [participantName, setParticipantName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [nameError, setNameError] = useState('');

  // Active quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [startTime, setStartTime] = useState<number>(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Results state
  const [finalScore, setFinalScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<number[]>([]);
  const [showReview, setShowReview] = useState(false);

  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submit and evaluate quiz
  const handleCompleteQuiz = useCallback(
    (answers: number[]) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const elapsed = Math.min(
        QUIZ_DURATION_SECONDS,
        Math.max(1, Math.round((Date.now() - startTime) / 1000))
      );
      setTimeTaken(elapsed);

      // Score calculation
      let score = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.correctIndex) score++;
      });

      setFinalScore(score);
      setSubmittedAnswers([...answers]);
      setPhase('results');

      // Record attempt in LocalStorage
      addQuizAttempt(participantName.trim(), score, questions.length, answers, elapsed);

      showToast('success', `Quiz completed! Scored ${score}/${questions.length}`);
      onDataChange();
    },
    [startTime, questions, participantName, onDataChange, showToast]
  );

  // Timer tick
  useEffect(() => {
    if (phase !== 'active') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          showToast('info', 'Time is up! Submitting answers automatically...');
          handleCompleteQuiz(selectedAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, selectedAnswers, handleCompleteQuiz, showToast]);

  // Start challenge handler
  const handleStartQuiz = (isDemo = false) => {
    if (isDemo) {
      setParticipantName('Carl Gauss');
      setStudentId('MTH-DEMO-01');
    } else {
      if (!participantName.trim()) {
        setNameError('Please provide your name');
        return;
      }
      if (!studentId.trim()) {
        setNameError('Please provide your university student ID');
        return;
      }

      // Check duplicate
      const participant = data.participants.find((p) => p.studentId === studentId.trim());
      if (participant && hasAttemptedQuiz(participant.id)) {
        showToast('error', 'This participant ID has already completed the quiz arena challenge.');
        return;
      }
    }

    setNameError('');
    const qList = getShuffledQuestions().slice(0, 10);
    setQuestions(qList);
    setSelectedAnswers(new Array(qList.length).fill(-1));
    setCurrentIndex(0);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setStartTime(Date.now());
    setPhase('active');
  };

  const handleSelectOption = (optIndex: number) => {
    const updated = [...selectedAnswers];
    updated[currentIndex] = optIndex;
    setSelectedAnswers(updated);
  };

  const handleResetChallenge = () => {
    setPhase('intro');
    setParticipantName('');
    setStudentId('');
    setShowReview(false);
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = selectedAnswers.filter((a) => a !== -1).length;

  // SVG circular score meter geometry (radius = 54)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = questions.length > 0 ? finalScore / questions.length : 0;
  const strokeOffset = circumference - scorePercent * circumference;

  return (
    <Section className="space-y-12 sm:space-y-16 text-slate-100 max-w-4xl">
      {/* ============================================================
          PHASE 1: CHALLENGE INTRODUCTION
         ============================================================ */}
      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: cinematicEase }}
          className="space-y-10 sm:space-y-12"
        >
          {/* Header Banner with Animated Mathematical Graphic */}
          <div className="text-center pb-8 border-b border-slate-800/80 relative mb-10">
            {/* Restrained Mathematical Vector Illustration */}
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full text-cyan-500/30" viewBox="0 0 100 100">
                  {/* Concentric Coordinate rings */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(0,217,245,0.4)" strokeWidth="1" />
                  {/* Astroid curve: x^(2/3) + y^(2/3) = a^(2/3) */}
                  <motion.path
                    d="M 50 18 Q 50 50 82 50 Q 50 50 50 82 Q 50 50 18 50 Q 50 50 50 18 Z"
                    fill="rgba(0, 217, 245, 0.08)"
                    stroke="#00D9F5"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.8, ease: cinematicEase }}
                  />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit size={22} className="text-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block font-mono mb-3">
              COMPUTATIONAL OLYMPIAD ARENA
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              Mathematical Sprint Challenge
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Test your theoretical precision, algebraic dexterity, and problem-solving speed under competitive collegiate time constraints.
            </p>
          </div>

          {/* Rules & Structure Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] text-center space-y-2.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Target size={20} />
              </div>
              <h4 className="text-base font-bold text-white">10 Problems</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Algebra, Probability, Number Theory & Logic</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] text-center space-y-2.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Clock size={20} />
              </div>
              <h4 className="text-base font-bold text-white">5:00 Minutes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Live countdown clock with automatic submission</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800 hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] text-center space-y-2.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 flex items-center justify-center mx-auto">
                <Trophy size={20} />
              </div>
              <h4 className="text-base font-bold text-white">Live Leaderboard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Immediate Hall of Champions score posting</p>
            </motion.div>
          </div>

          {/* Participant Credentials Form */}
          <div className="rounded-3xl p-7 sm:p-9 bg-[#0A1224]/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1 relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                Participant Credentials
              </h3>
              <p className="text-xs text-slate-400">
                Enter your details to generate your official challenge record.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="e.g. Katherine Johnson"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  University Student ID *
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. MTH-2024-108"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {nameError && (
              <p className="text-xs text-red-400 font-medium">{nameError}</p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <button
                type="button"
                onClick={() => handleStartQuiz(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium transition-colors"
              >
                Launch with Demo Profile (Carl Gauss)
              </button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStartQuiz(false)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 transition-all duration-150"
              >
                <Play size={16} fill="currentColor" />
                <span>Begin Sprint Challenge</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================
          PHASE 2: ACTIVE QUIZ ARENA (DISTRACTION-FREE & SMOOTH)
         ============================================================ */}
      {phase === 'active' && currentQ && (
        <div className="space-y-6">
          {/* Top Status Bar: Stepper & Countdown Timer */}
          <div className="rounded-2xl p-5 bg-[#0A1224]/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm border border-cyan-500/20">
                {currentIndex + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <p className="text-[11px] text-cyan-400 font-mono uppercase">
                  Category: {currentQ.category}
                </p>
              </div>
            </div>

            {/* Live Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold transition-all ${
                timeLeft < 60
                  ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              }`}
            >
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Animated Smooth Progress Bar */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,217,245,0.6)]"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: cinematicEase }}
            />
          </div>

          {/* Question Card with Smooth Directional Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction * 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 25 }}
              transition={{ duration: 0.3, ease: cinematicEase }}
              className="rounded-3xl p-7 sm:p-9 bg-[#0A1224]/80 border border-slate-800 space-y-6 shadow-xl relative"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed font-mono">
                {currentQ.question}
              </h2>

              {/* Answer Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <motion.button
                      key={optIdx}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 border relative overflow-hidden ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,217,245,0.15)] ring-1 ring-cyan-400/50'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-cyan-400 text-[#050B16] font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-medium leading-normal">{option}</span>
                      {isSelected && (
                        <motion.div
                          layoutId="selectedIndicator"
                          className="absolute right-3 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00D9F5]"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stepper Navigation Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setDirection(-1);
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span className="text-xs text-slate-500 font-mono">
              {answeredCount} of {questions.length} Answered
            </span>

            {currentIndex < questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setDirection(1);
                  setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-all shadow-sm shadow-cyan-400/20"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSubmitConfirm(true)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle size={16} />
                <span>Submit Challenge</span>
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          PHASE 3: PERFORMANCE RESULTS & CIRCULAR SVG SCORE METER
         ============================================================ */}
      {phase === 'results' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: cinematicEase }}
          className="space-y-10"
        >
          {/* Performance Card */}
          <div className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden bg-[#0A1224]/80 border border-slate-800 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/[0.08] rounded-full blur-3xl pointer-events-none" />

            {/* Circular SVG Score Visualization */}
            <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                {/* Background Track */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Animated Value Arc */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={scorePercent >= 0.7 ? '#00D9F5' : scorePercent >= 0.5 ? '#38BDF8' : '#F59E0B'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 1.4, ease: cinematicEase, delay: 0.2 }}
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white font-mono leading-none">
                  <AnimatedCounter value={finalScore} duration={1200} />
                  <span className="text-slate-400 text-sm font-normal">/{questions.length}</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mt-1">
                  Score
                </span>
              </div>
            </div>

            {/* Celebratory badge if strong performance */}
            {scorePercent >= 0.7 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-3 shadow-[0_0_12px_rgba(0,217,245,0.25)]"
              >
                <Zap size={14} className="text-cyan-400" />
                <span>Distinguished Performance Honor</span>
              </motion.div>
            )}

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Outstanding Effort, {participantName}!
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              Your results have been computed and synchronized with the official Hall of Champions.
            </p>

            {/* Score Metrics Trio with Animated Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl mx-auto mt-8">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Final Score</span>
                <span className="text-3xl font-black text-cyan-400 mt-1 block font-mono">
                  <AnimatedCounter value={finalScore} /> / {questions.length}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
                <span className="text-3xl font-black text-teal-300 mt-1 block font-mono">
                  <AnimatedCounter value={Math.round((finalScore / questions.length) * 100)} suffix="%" />
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Time Elapsed</span>
                <span className="text-3xl font-black text-blue-400 mt-1 block font-mono">
                  <AnimatedCounter value={timeTaken} suffix="s" />
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-800/80">
              <button
                onClick={() => setShowReview(!showReview)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <HelpCircle size={15} className="text-cyan-400" />
                <span>{showReview ? 'Hide Problem Review' : 'Review Questions & Solutions'}</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleResetChallenge}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-all shadow-sm shadow-cyan-400/20"
              >
                <RotateCcw size={15} />
                <span>Attempt Another Sprint</span>
              </motion.button>
            </div>
          </div>

          {/* Solutions & Explanations Review Mode */}
          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: cinematicEase }}
                className="space-y-6 pt-4 overflow-hidden"
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target size={18} className="text-cyan-400" />
                  Problem Breakdown & Verification
                </h3>

                <div className="space-y-4">
                  {questions.map((q, qIndex) => {
                    const userAns = submittedAnswers[qIndex];
                    const isCorrect = userAns === q.correctIndex;

                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qIndex * 0.04 }}
                        className={`rounded-2xl p-6 bg-[#0A1224]/70 border ${
                          isCorrect ? 'border-emerald-500/25' : 'border-red-500/25'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-cyan-400 font-bold">
                            Problem {qIndex + 1} • {q.category.toUpperCase()}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isCorrect
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/15 text-red-400 border-red-500/30'
                            }`}
                          >
                            {isCorrect ? 'Correct (+1 pt)' : 'Incorrect (0 pt)'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white font-mono mt-1">
                          {q.question}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                          {q.options.map((opt, oIdx) => {
                            const isUserPick = userAns === oIdx;
                            const isCorrectPick = q.correctIndex === oIdx;

                            let badgeStyle = 'bg-slate-900/60 border-slate-800 text-slate-400';
                            if (isCorrectPick) {
                              badgeStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold';
                            } else if (isUserPick && !isCorrect) {
                              badgeStyle = 'bg-red-500/15 border-red-500/40 text-red-300';
                            }

                            return (
                              <div
                                key={oIdx}
                                className={`p-3 rounded-xl border flex items-center justify-between ${badgeStyle}`}
                              >
                                <span>{opt}</span>
                                {isCorrectPick && <CheckCircle size={14} className="text-emerald-400" />}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Confirmation Dialog on Submission */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title="Submit Sprint Challenge?"
        message={`You have answered ${answeredCount} of ${questions.length} problems. Once submitted, your score will be committed to the official leaderboard.`}
        confirmText="Finalize Submission"
        onConfirm={() => {
          setShowSubmitConfirm(false);
          handleCompleteQuiz(selectedAnswers);
        }}
        onCancel={() => setShowSubmitConfirm(false)}
      />
    </Section>
  );
}
