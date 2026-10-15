// ============================================================
// MathClub Nexus — Participant Registrations & Receipts Portal
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ticket,
  Receipt,
  CheckCircle2,
  Clock,
  Award,
  MessageSquare,
  Printer,
  Calendar,
  MapPin,
  ExternalLink,
  X,
  CreditCard,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { AppState, Registration, Event, Certificate } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { addFeedback } from '../utils/storage';
import Section from '../components/Section';

interface MyRegistrationsProps {
  data: AppState;
  onDataChange: () => void;
  onNavigate: (section: any) => void;
}

export default function MyRegistrations({
  data,
  onDataChange,
  onNavigate,
}: MyRegistrationsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedReceipt, setSelectedReceipt] = useState<{
    registration: Registration;
    event?: Event;
  } | null>(null);

  const [feedbackModalEvent, setFeedbackModalEvent] = useState<Event | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [categoryRatings, setCategoryRatings] = useState({ content: 5, organization: 5, difficulty: 4 });
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackAnonymous, setFeedbackAnonymous] = useState(false);

  // Filter registrations belonging to current logged-in participant
  const userRegistrations = data.registrations.filter(
    (r) =>
      r.userId === user?.id ||
      (user?.email && r.email.toLowerCase() === user.email.toLowerCase())
  );

  // Find certificates issued to this participant
  const userCertificates = data.certificates.filter(
    (c) =>
      user?.name &&
      c.participantName.trim().toLowerCase() === user.name.trim().toLowerCase()
  );

  const handleOpenReceipt = (reg: Registration) => {
    const event = data.events.find((e) => e.id === reg.eventId);
    setSelectedReceipt({ registration: reg, event });
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalEvent) return;

    const res = addFeedback({
      eventId: feedbackModalEvent.id,
      participantName: user?.name,
      rating: feedbackRating,
      categoryRatings,
      comment: feedbackComment,
      anonymous: feedbackAnonymous,
    });

    if (res.success) {
      showToast('success', res.message);
      onDataChange();
      setFeedbackModalEvent(null);
      setFeedbackComment('');
    } else {
      showToast('error', res.message);
    }
  };

  return (
    <Section
      title="My Registrations & Credentials"
      subtitle="Track your enrolled competitions, payment vouchers, attendance status, and verified certificates"
    >
      {/* Top Participant Summary Bar */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#091224] border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Ticket size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Enrolled Events</p>
            <p className="text-xl font-bold text-white">{userRegistrations.length}</p>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#091224] border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Checked-in Attendance</p>
            <p className="text-xl font-bold text-white">
              {userRegistrations.filter((r) => r.attendanceStatus === 'present').length}
            </p>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#091224] border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Earned Certificates</p>
            <p className="text-xl font-bold text-white">{userCertificates.length}</p>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#091224] border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Receipt size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Fees Contributed</p>
            <p className="text-xl font-bold text-white">
              ₹{userRegistrations.reduce((acc, curr) => acc + (curr.amount || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Enrolled Event Passes</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {userRegistrations.length}
            </span>
          </h3>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Explore More Events</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {userRegistrations.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#091224]/80 border border-slate-800 text-center">
            <Ticket size={40} className="mx-auto text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-white">No Event Registrations Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              Explore the upcoming club competitions, symposiums, and olympiads to register your seat.
            </p>
            <button
              onClick={() => onNavigate('events')}
              className="px-4 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Ticket size={15} />
              <span>Browse Event Catalog</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userRegistrations.map((reg) => {
              const event = data.events.find((e) => e.id === reg.eventId);
              const cert = data.certificates.find(
                (c) =>
                  c.eventId === reg.eventId &&
                  user?.name &&
                  c.participantName.trim().toLowerCase() === user.name.trim().toLowerCase()
              );

              return (
                <div
                  key={reg.id}
                  className="p-5 rounded-2xl bg-[#091224] border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Event Name & Payment Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {event?.name || 'Academic Event'}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono border ${
                          reg.paymentStatus === 'free'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {reg.paymentStatus === 'free' ? 'FREE' : `PAID ₹${reg.amount}`}
                      </span>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                      {event && (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-cyan-400" />
                            <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-cyan-400" />
                            <span>{event.venue}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                        <span>Ref: {reg.transactionId}</span>
                      </div>
                    </div>

                    {/* Badges: Status and Attendance */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 mb-4">
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-cyan-400" />
                        <span>Registration: Confirmed</span>
                      </span>

                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                          reg.attendanceStatus === 'present'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        <Clock size={12} />
                        <span>
                          Attendance: {reg.attendanceStatus === 'present' ? 'Verified Present' : 'Not Marked Yet'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenReceipt(reg)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Receipt size={13} className="text-cyan-400" />
                      <span>View Receipt</span>
                    </button>

                    {/* Feedback button */}
                    {event && (
                      <button
                        onClick={() => setFeedbackModalEvent(event)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare size={13} className="text-amber-400" />
                        <span>Give Feedback</span>
                      </button>
                    )}

                    {/* Certificate download button if issued */}
                    {cert ? (
                      <button
                        onClick={() => onNavigate('certificates')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors ml-auto cursor-pointer"
                      >
                        <Award size={13} />
                        <span>Download Certificate</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* "My Certificates" Section */}
      <div className="mt-12 pt-8 border-t border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="text-amber-400" size={20} />
              <span>My Issued Certificates</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {userCertificates.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Official university credentials awarded for tournament rankings and colloquium participation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('certificates')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All in Certificate Arena</span>
            <ExternalLink size={13} />
          </button>
        </div>

        {userCertificates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#091224]/80 border border-slate-800 text-center">
            <Award size={36} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Certificates Awarded Yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Certificates are digitally issued by the Core Team & President following competition auditing and check-in verification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCertificates.map((cert) => {
              const event = data.events.find((e) => e.id === cert.eventId);
              return (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl bg-[#091224] border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {cert.certificateCode}
                      </span>
                      <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                        {cert.type}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight mb-1">
                      {event?.name || 'Mathematics Club Event'}
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Issued to <span className="text-slate-200 font-semibold">{cert.participantName}</span> on{' '}
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('certificates')}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Award size={14} />
                    <span>Download Official Credential</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#091224] border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Receipt Printable Content */}
              <div id="receipt-print-area" className="space-y-6">
                {/* Header with Emblem */}
                <div className="flex items-center gap-3.5 pb-5 border-b border-slate-800">
                  <img
                    src="/mits-du-logo.png"
                    alt="Logo"
                    className="h-12 w-12 object-contain rounded-full"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight">
                      Mathematics Club, MITS-DU Gwalior
                    </h4>
                    <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
                      Official Electronic Registration Voucher
                    </p>
                  </div>
                </div>

                {/* Voucher Meta Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-slate-400">Transaction ID</p>
                    <p className="font-mono text-cyan-300 font-bold">{selectedReceipt.registration.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Date Issued</p>
                    <p className="font-medium text-white">
                      {new Date(selectedReceipt.registration.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Payment Status</p>
                    <p className="font-bold uppercase text-emerald-400">
                      {selectedReceipt.registration.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Payment Method</p>
                    <p className="font-medium text-white">
                      {selectedReceipt.registration.paymentMethod || 'Complimentary'}
                    </p>
                  </div>
                </div>

                {/* Event & Participant Breakdown */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Event Details</span>
                    <p className="text-base font-bold text-white">
                      {selectedReceipt.event?.name || 'Club Academic Event'}
                    </p>
                    <p className="text-slate-400">
                      {selectedReceipt.event?.venue} • {selectedReceipt.event?.date}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Participant Name</span>
                      <p className="font-semibold text-white">{selectedReceipt.registration.participantName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Academic Email</span>
                      <p className="font-semibold text-white">{selectedReceipt.registration.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">College / Department</span>
                      <p className="font-semibold text-white">
                        {selectedReceipt.registration.college} ({selectedReceipt.registration.year || 'Student'})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Paid Amount</span>
                      <p className="text-base font-black text-cyan-300">
                        {selectedReceipt.registration.amount === 0 ? 'FREE' : `₹${selectedReceipt.registration.amount}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
                  <ShieldCheck size={16} className="flex-shrink-0" />
                  <span>Valid for event entry. Present this QR/Voucher at the registration verification desk.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-cyan-400/20"
                >
                  <Printer size={15} />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Give Feedback Modal */}
      <AnimatePresence>
        {feedbackModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#091224] border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setFeedbackModalEvent(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <MessageSquare className="text-amber-400" size={20} />
                <span>Submit Event Feedback</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Share your evaluation for <span className="text-white font-semibold">"{feedbackModalEvent.name}"</span>
              </p>

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Overall Experience Rating ({feedbackRating} / 5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`p-2.5 rounded-xl text-sm font-bold flex-1 border transition-all ${
                          feedbackRating >= star
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Content (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={categoryRatings.content}
                      onChange={(e) =>
                        setCategoryRatings({ ...categoryRatings, content: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Organization</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={categoryRatings.organization}
                      onChange={(e) =>
                        setCategoryRatings({ ...categoryRatings, organization: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Difficulty</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={categoryRatings.difficulty}
                      onChange={(e) =>
                        setCategoryRatings({ ...categoryRatings, difficulty: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Review & Suggestions
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us what you enjoyed or how the problems/logistics could be enhanced..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackAnonymous}
                    onChange={(e) => setFeedbackAnonymous(e.target.checked)}
                    className="rounded text-cyan-400"
                  />
                  <span>Submit anonymously without publishing my name</span>
                </label>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalEvent(null)}
                    className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
}
