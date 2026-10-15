// ============================================================
// MathClub Nexus — Member Assigned Events & Participant Review
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  Check,
  X,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Search,
  Filter,
  CreditCard,
  Building,
  UserCheck,
} from 'lucide-react';
import type { AppState, Event, Registration, Feedback } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  markMemberSelfAttendance,
  checkInParticipant,
  updateRegistrationStatus,
} from '../utils/storage';
import Section from '../components/Section';

interface MyAssignedEventsProps {
  data: AppState;
  onDataChange: () => void;
  onNavigate: (section: any) => void;
}

export default function MyAssignedEvents({
  data,
  onDataChange,
  onNavigate,
}: MyAssignedEventsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'participants' | 'feedback'>('participants');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'pending'>('all');

  // Events assigned to this user
  // If user has linkedMemberId, check assignedTo; If President or Core, allow viewing all events if none directly assigned
  const memberId = user?.linkedMemberId;
  const directlyAssignedEvents = data.events.filter(
    (e) => memberId && Array.isArray(e.assignedTo) && e.assignedTo.includes(memberId)
  );

  // If user is President or Core, or if none assigned, show club events
  const displayEvents =
    directlyAssignedEvents.length > 0
      ? directlyAssignedEvents
      : (user?.role === 'president' || user?.role === 'core')
      ? data.events
      : [];

  const currentEvent: Event | undefined =
    data.events.find((e) => e.id === selectedEventId) || displayEvents[0];

  // Self attendance check for current member on current event
  const isSelfAttended = currentEvent && memberId
    ? data.attendance.some(
        (a) => a.eventId === currentEvent.id && a.participantId === memberId && a.status === 'present'
      )
    : false;

  const handleMarkSelfAttendance = () => {
    if (!currentEvent || !user) return;
    const res = markMemberSelfAttendance(
      currentEvent.id,
      user.linkedMemberId || user.id,
      user.name,
      user.role
    );
    if (res.success) {
      showToast('success', res.message);
      onDataChange();
    } else {
      showToast('error', res.message);
    }
  };

  const handleCheckIn = (registrationId: string, status: 'present' | 'absent') => {
    if (!user) return;
    const res = checkInParticipant(registrationId, status, {
      name: user.name,
      role: user.role,
    });
    if (res.success) {
      showToast('success', res.message);
      onDataChange();
    } else {
      showToast('error', res.message);
    }
  };

  const handleUpdateStatus = (registrationId: string, newStatus: 'confirmed' | 'rejected') => {
    if (!user) return;
    const res = updateRegistrationStatus(registrationId, newStatus, {
      name: user.name,
      role: user.role,
    });
    if (res.success) {
      showToast('info', res.message);
      onDataChange();
    } else {
      showToast('error', res.message);
    }
  };

  // Registrations for the selected event
  const eventRegistrations = currentEvent
    ? data.registrations.filter((r) => r.eventId === currentEvent.id)
    : [];

  // Filtered registrations
  const filteredRegistrations = eventRegistrations.filter((r) => {
    const matchesSearch =
      r.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transactionId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'present' && r.attendanceStatus === 'present') ||
      (statusFilter === 'pending' && r.attendanceStatus !== 'present');

    return matchesSearch && matchesStatus;
  });

  // Event feedback
  const eventFeedback = currentEvent
    ? data.feedback.filter((f) => f.eventId === currentEvent.id)
    : [];

  const avgRating =
    eventFeedback.length > 0
      ? (eventFeedback.reduce((acc, f) => acc + f.rating, 0) / eventFeedback.length).toFixed(1)
      : 'N/A';

  return (
    <Section
      title="My Assigned Events & Participant Operations"
      subtitle="Verify attendee credentials, audit payment vouchers, check-in scholars, and inspect attendee feedback"
    >
      {/* Event Selection Pills */}
      {displayEvents.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#091224] border border-slate-800 text-center">
          <Calendar size={40} className="mx-auto text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-white">No Events Assigned Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            You do not currently have assigned events on your schedule. Core officers and the President assign club coordinators to upcoming symposiums and olympiads.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Event Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {displayEvents.map((event) => {
              const isSelected = (currentEvent?.id || displayEvents[0].id) === event.id;
              const count = data.registrations.filter((r) => r.eventId === event.id).length;
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{event.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {count} enrolled
                  </span>
                </button>
              );
            })}
          </div>

          {currentEvent && (
            <div className="p-6 rounded-3xl bg-[#091224] border border-slate-800 shadow-xl space-y-6">
              {/* Event Header Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Coordinating Assignment
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Capacity: {currentEvent.capacity} seats
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {currentEvent.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-cyan-400" />
                      <span>{currentEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-cyan-400" />
                      <span>{currentEvent.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={14} className="text-cyan-400" />
                      <span>Entry Fee: {currentEvent.fee ? `₹${currentEvent.fee}` : 'Free'}</span>
                    </div>
                  </div>
                </div>

                {/* Member Self Attendance Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {isSelfAttended ? (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 justify-center">
                      <CheckCircle2 size={16} />
                      <span>My Attendance Recorded (Present)</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkSelfAttendance}
                      className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 justify-center transition-all shadow-lg shadow-cyan-400/20 cursor-pointer"
                    >
                      <UserCheck size={16} />
                      <span>Mark My Own Attendance</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Tabs: Participants vs Feedback */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'participants'
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Participant Check-in & Registrations ({eventRegistrations.length})
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'feedback'
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Read-Only Feedback Reviews ({eventFeedback.length}) • ★ {avgRating}
                </button>
              </div>

              {/* Tab 1: Participant Operations */}
              {activeTab === 'participants' && (
                <div className="space-y-4">
                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search scholar name, email, or transaction ID..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          statusFilter === 'all'
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setStatusFilter('present')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          statusFilter === 'present'
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Checked-In
                      </button>
                      <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          statusFilter === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Pending Check-in
                      </button>
                    </div>
                  </div>

                  {filteredRegistrations.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      No registrations match your search filters for this event.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Scholar / Attendee</th>
                            <th className="py-3 px-4">Institution / Dept</th>
                            <th className="py-3 px-4">Payment Status</th>
                            <th className="py-3 px-4">Registration</th>
                            <th className="py-3 px-4">Attendance</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {filteredRegistrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-white">{reg.participantName}</p>
                                <p className="text-[11px] text-slate-400">{reg.email}</p>
                                <p className="text-[10px] font-mono text-slate-500">{reg.phone || 'No phone'}</p>
                              </td>
                              <td className="py-3.5 px-4 text-slate-300">
                                <p className="font-medium">{reg.college}</p>
                                <p className="text-[11px] text-slate-400">{reg.department || reg.year}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                                    reg.paymentStatus === 'free'
                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  }`}
                                >
                                  {reg.paymentStatus === 'free' ? 'FREE' : `PAID ₹${reg.amount}`}
                                </span>
                                <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate max-w-[120px]">
                                  {reg.transactionId}
                                </p>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                    reg.status === 'confirmed'
                                      ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                                      : 'text-red-400 bg-red-500/10 border border-red-500/20'
                                  }`}
                                >
                                  {reg.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                                    reg.attendanceStatus === 'present'
                                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {reg.attendanceStatus === 'present' ? (
                                    <>
                                      <CheckCircle2 size={12} className="text-emerald-400" />
                                      <span>Checked In</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={12} />
                                      <span>Pending</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                                {reg.attendanceStatus !== 'present' ? (
                                  <button
                                    onClick={() => handleCheckIn(reg.id, 'present')}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Mark Attendee Checked-In"
                                  >
                                    <Check size={13} />
                                    <span>Check In</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCheckIn(reg.id, 'absent')}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-all cursor-pointer"
                                    title="Revoke Check-In"
                                  >
                                    Undo
                                  </button>
                                )}

                                {reg.status === 'confirmed' ? (
                                  <button
                                    onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Reject Registration"
                                  >
                                    <X size={14} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                                    className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20"
                                  >
                                    Approve
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Read-Only Feedback Review */}
              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Average Evaluation Rating</p>
                      <p className="text-2xl font-black text-amber-400 flex items-center gap-1">
                        <span>★ {avgRating}</span>
                        <span className="text-xs font-normal text-slate-500">/ 5.0</span>
                      </p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {eventFeedback.length} Verified Reviews
                    </span>
                  </div>

                  {eventFeedback.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      No feedback submitted yet by participants for this event.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {eventFeedback.map((fb) => (
                        <div
                          key={fb.id}
                          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                              {fb.anonymous ? 'Anonymous Scholar' : (fb.participantName || 'Verified Scholar')}
                            </span>
                            <span className="text-xs font-bold text-amber-400">
                              {'★'.repeat(fb.rating)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-lg font-mono">
                            <div>Content: {fb.categoryRatings.content}/5</div>
                            <div>Org: {fb.categoryRatings.organization}/5</div>
                            <div>Diff: {fb.categoryRatings.difficulty}/5</div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{fb.comment}"
                          </p>

                          <p className="text-[10px] text-slate-500">
                            Recorded: {new Date(fb.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
