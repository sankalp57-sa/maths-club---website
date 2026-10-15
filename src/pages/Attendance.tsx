// ============================================================
// MathClub Nexus — Attendance & Participation Portal
// ============================================================

import { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  UserCheck,
  UserX,
  Calendar,
  Users,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AppState } from '../types';
import { markAttendance, getAttendanceForEvent } from '../utils/storage';
import { useToast } from '../components/Toast';
import AnimatedCounter from '../components/AnimatedCounter';
import { cinematicEase } from '../motion/motionTokens';
import Section from '../components/Section';

interface AttendancePageProps {
  data: AppState;
  onDataChange: () => void;
}

export default function AttendancePage({ data, onDataChange }: AttendancePageProps) {
  const { showToast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string>(
    data.events[0]?.id || ''
  );
  const [search, setSearch] = useState('');

  const selectedEvent = useMemo(() => {
    return data.events.find((e) => e.id === selectedEventId);
  }, [data.events, selectedEventId]);

  // Registered participants for selected event
  const registeredParticipants = useMemo(() => {
    if (!selectedEvent) return [];
    return selectedEvent.registrations
      .map((pId) => data.participants.find((p) => p.id === pId))
      .filter(Boolean) as typeof data.participants;
  }, [selectedEvent, data.participants]);

  // Attendance records for this event
  const eventAttendance = useMemo(() => {
    if (!selectedEventId) return [];
    return getAttendanceForEvent(selectedEventId);
  }, [selectedEventId, data.attendance]);

  // Attendance stats
  const stats = useMemo(() => {
    const total = registeredParticipants.length;
    let present = 0;
    let absent = 0;
    let unrecorded = 0;

    registeredParticipants.forEach((p) => {
      const rec = eventAttendance.find((a) => a.participantId === p.id);
      if (!rec) {
        unrecorded++;
      } else if (rec.status === 'present') {
        present++;
      } else {
        absent++;
      }
    });

    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, unrecorded, rate };
  }, [registeredParticipants, eventAttendance]);

  // Filtered participants by search
  const filteredParticipants = useMemo(() => {
    const q = search.toLowerCase();
    return registeredParticipants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.studentId.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [registeredParticipants, search]);

  const handleToggleAttendance = (participantId: string, currentStatus?: 'present' | 'absent') => {
    if (!selectedEventId) return;
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    markAttendance(selectedEventId, participantId, newStatus);
    showToast('success', `Participant marked as ${newStatus}`);
    onDataChange();
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    if (!selectedEventId || registeredParticipants.length === 0) return;
    registeredParticipants.forEach((p) => {
      markAttendance(selectedEventId, p.id, status);
    });
    showToast('success', `Marked all participants as ${status}`);
    onDataChange();
  };

  return (
    <Section className="space-y-16 lg:space-y-20 text-slate-100">
      {/* ============================================================
          HEADER — Attendance & Participation
         ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: cinematicEase }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800/80 mb-10"
      >
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block font-mono mb-3">
            EVENT OPERATIONS & AUDITING
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Attendance & Participation
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Verify academic presence, record check-in timestamps, and monitor quorum for all club initiatives.
          </p>
        </div>
      </motion.div>

      {/* ============================================================
          EVENT SELECTOR BAR
         ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: cinematicEase }}
        className="rounded-2xl p-6 sm:p-7 bg-[#0A1224]/80 border border-slate-800 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5 w-full sm:w-auto">
            <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block font-mono">
              Active Initiative
            </label>
            <div className="relative inline-block w-full sm:w-80">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-cyan-500 pr-10 cursor-pointer transition-colors"
              >
                {data.events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedEvent && (
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap items-center gap-5 text-xs text-slate-300"
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-cyan-400" />
                  {new Date(selectedEvent.date).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-cyan-400" />
                  {selectedEvent.venue}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={15} className="text-cyan-400" />
                  {registeredParticipants.length} Registrations
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ============================================================
          STATISTICS CARDS ROW WITH ANIMATED COUNTERS
         ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all duration-200"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Registered Attendees
          </span>
          <p className="text-3xl font-extrabold text-white mt-3 font-mono">
            <AnimatedCounter value={stats.total} />
          </p>
          <p className="text-xs text-slate-400 mt-2">Total registered for this session</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-200"
        >
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck size={14} />
            Confirmed Present
          </span>
          <p className="text-3xl font-extrabold text-emerald-300 mt-3 font-mono">
            <AnimatedCounter value={stats.present} />
          </p>
          <p className="text-xs text-slate-400 mt-2">Verified attendance check-in</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-200"
        >
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserX size={14} />
            Absent / Pending
          </span>
          <p className="text-3xl font-extrabold text-amber-300 mt-3 font-mono">
            <AnimatedCounter value={stats.absent + stats.unrecorded} />
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {stats.unrecorded} unrecorded, {stats.absent} marked absent
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all duration-200"
        >
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Attendance Rate
          </span>
          <p className="text-3xl font-extrabold text-cyan-300 mt-3 font-mono">
            <AnimatedCounter value={stats.rate} suffix="%" />
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <motion.div
              className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,217,245,0.6)]"
              initial={false}
              animate={{ width: `${stats.rate}%` }}
              transition={{ duration: 0.5, ease: cinematicEase }}
            />
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          ATTENDEE ROSTER TABLE WITH SEARCH & QUICK ACTIONS
         ============================================================ */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholar or student ID..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#0A1224]/90 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>

          {/* Bulk quick actions */}
          {registeredParticipants.length > 0 && (
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMarkAll('present')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors"
              >
                Mark All Present
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMarkAll('absent')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                Reset All Absent
              </motion.button>
            </div>
          )}
        </div>

        {/* Table View */}
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-[#0A1224]/50 border border-slate-800 text-slate-400 text-sm space-y-2">
            <Users size={40} className="text-slate-600 mx-auto" />
            <p className="font-semibold text-white">No Attendees Registered Yet</p>
            <p className="text-xs text-slate-500">
              Students who register in the Events Hub will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-[#0A1224]/70 border border-slate-800/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">Student Scholar</th>
                    <th className="py-4 px-4 sm:px-6">ID & Academic Email</th>
                    <th className="py-4 px-4 sm:px-6 text-center">Status</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredParticipants.map((participant) => {
                    const record = eventAttendance.find(
                      (a) => a.participantId === participant.id
                    );
                    const status = record?.status;

                    return (
                      <motion.tr
                        key={participant.id}
                        layout
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Name */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6">
                          <span className="font-bold text-white block">
                            {participant.name}
                          </span>
                        </td>

                        {/* ID & Email */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6 font-mono text-xs text-slate-400">
                          <span className="text-cyan-400 font-semibold block">
                            {participant.studentId}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {participant.email}
                          </span>
                        </td>

                        {/* Status Badge with Smooth Transition */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6 text-center">
                          <AnimatePresence mode="wait">
                            {status === 'present' ? (
                              <motion.span
                                key="present"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              >
                                <CheckCircle2 size={13} />
                                Present
                              </motion.span>
                            ) : status === 'absent' ? (
                              <motion.span
                                key="absent"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30"
                              >
                                <XCircle size={13} />
                                Absent
                              </motion.span>
                            ) : (
                              <motion.span
                                key="unrecorded"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700"
                              >
                                <Clock size={13} />
                                Unrecorded
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </td>

                        {/* Action Control */}
                        <td className="py-4 sm:py-4.5 px-4 sm:px-6 text-right">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleToggleAttendance(participant.id, status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              status === 'present'
                                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shadow-sm shadow-cyan-400/10'
                            }`}
                          >
                            {status === 'present' ? 'Mark Absent' : 'Check In Present'}
                          </motion.button>
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
