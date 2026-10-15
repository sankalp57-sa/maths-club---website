// ============================================================
// MathClub Nexus — Certificate Distribution System
// ============================================================

import { useState, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Award,
  Search,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  Eye,
  Trash2,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  Check,
  AlertCircle,
  ExternalLink,
  X,
  FileCheck2,
} from 'lucide-react';
import type { AppState, Certificate, CertificateType, Event } from '../types';
import {
  issueCertificate,
  issueCertificatesBatch,
  revokeCertificate,
  verifyCertificate,
} from '../utils/storage';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Section from '../components/Section';
import MotionSection from '../components/MotionSection';
import AnimatedCounter from '../components/AnimatedCounter';
import { toPng } from 'html-to-image';

interface CertificatesPageProps {
  data: AppState;
  onDataChange: () => void;
}

export default function CertificatesPage({ data, onDataChange }: CertificatesPageProps) {
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  // Selected event for issuance
  const [selectedEventId, setSelectedEventId] = useState<string>(
    data.events[0]?.id || ''
  );
  const [issuingType, setIssuingType] = useState<CertificateType>('Participation');

  // Search & Filters on issued certificates
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | CertificateType>('All');

  // Verification Box State
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    searched: boolean;
    valid: boolean;
    cert?: Certificate;
    event?: Event;
  }>({ searched: false, valid: false });

  // Preview & Download Modal State
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Revoke Dialog State
  const [certToRevoke, setCertToRevoke] = useState<Certificate | null>(null);

  const selectedEvent = useMemo(() => {
    return data.events.find((e) => e.id === selectedEventId) || data.events[0];
  }, [data.events, selectedEventId]);

  // Derive eligible recipients for the selected event
  const eligibleRecipients = useMemo(() => {
    if (!selectedEvent) return [];

    // 1. Present attendees for this event
    const presentRecords = data.attendance.filter(
      (a) => a.eventId === selectedEvent.id && a.status === 'present'
    );
    const presentParticipantIds = new Set(presentRecords.map((a) => a.participantId));

    // 2. Quiz top scorers for special excellence certificates
    const quizHighScorers = data.quizAttempts
      .filter((q) => q.score >= 8)
      .map((q) => q.participantName.trim().toLowerCase());

    const list: Array<{
      name: string;
      reason: string;
      recommendedType: CertificateType;
      alreadyIssued: boolean;
      existingCode?: string;
    }> = [];

    // Check participants marked present
    data.participants.forEach((p) => {
      const wasPresent = presentParticipantIds.has(p.id);
      const isQuizTop = quizHighScorers.includes(p.name.trim().toLowerCase());

      if (wasPresent || isQuizTop) {
        const existing = data.certificates.find(
          (c) =>
            c.eventId === selectedEvent.id &&
            c.participantName.trim().toLowerCase() === p.name.trim().toLowerCase() &&
            c.type === issuingType
        );

        let reason = 'Attended Event';
        let recType: CertificateType = 'Participation';
        if (isQuizTop) {
          reason = 'Quiz Top Performer (8+/10)';
          recType = 'Quiz Excellence';
        }

        list.push({
          name: p.name,
          reason,
          recommendedType: recType,
          alreadyIssued: Boolean(existing),
          existingCode: existing?.certificateCode,
        });
      }
    });

    return list;
  }, [data.attendance, data.participants, data.quizAttempts, data.certificates, selectedEvent, issuingType]);

  // Statistics
  const stats = useMemo(() => {
    const totalIssued = data.certificates.length;
    const winnerCount = data.certificates.filter(
      (c) => c.type === 'Winner' || c.type === 'Runner-up' || c.type === 'Quiz Excellence'
    ).length;
    const distinctEvents = new Set(data.certificates.map((c) => c.eventId)).size;
    return { totalIssued, winnerCount, distinctEvents };
  }, [data.certificates]);

  // Filtered issued certificates
  const filteredCertificates = useMemo(() => {
    return data.certificates.filter((c) => {
      const matchesSearch =
        c.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.certificateCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || c.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data.certificates, searchTerm, typeFilter]);

  // Handlers
  const handleIssueSingle = (participantName: string) => {
    if (!selectedEvent) return;
    const res = issueCertificate(participantName, selectedEvent.id, issuingType);
    if (res.success) {
      showToast('success', res.message);
      onDataChange();
    } else {
      showToast('error', res.message);
    }
  };

  const handleIssueAllEligible = () => {
    if (!selectedEvent || eligibleRecipients.length === 0) return;
    const toIssue = eligibleRecipients
      .filter((r) => !r.alreadyIssued)
      .map((r) => ({
        participantName: r.name,
        eventId: selectedEvent.id,
        type: issuingType,
      }));

    if (toIssue.length === 0) {
      showToast('info', 'All eligible candidates already have this certificate');
      return;
    }

    const res = issueCertificatesBatch(toIssue);
    showToast(
      'success',
      `Issued ${res.count} certificates successfully (${res.skipped} skipped duplicates)`
    );
    onDataChange();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCodeInput.trim()) return;
    const res = verifyCertificate(verifyCodeInput.trim());
    setVerifyResult({
      searched: true,
      valid: res.valid,
      cert: res.certificate,
      event: res.event,
    });
  };

  const handleRevokeConfirm = () => {
    if (!certToRevoke) return;
    const ok = revokeCertificate(certToRevoke.id);
    if (ok) {
      showToast('info', `Certificate ${certToRevoke.certificateCode} has been revoked`);
      onDataChange();
      if (previewCert?.id === certToRevoke.id) {
        setPreviewCert(null);
      }
    } else {
      showToast('error', 'Failed to revoke certificate');
    }
    setCertToRevoke(null);
  };

  // Download certificate PNG
  const handleDownloadPNG = async () => {
    if (!certRef.current || !previewCert) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: '#050B16',
      });
      const link = document.createElement('a');
      link.download = `${previewCert.certificateCode}_${previewCert.participantName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      showToast('success', 'Certificate downloaded successfully');
    } catch (err) {
      console.error('Certificate render error:', err);
      showToast('error', 'Could not export image. Please try printing to PDF instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getEventName = (eventId: string) => {
    return data.events.find((e) => e.id === eventId)?.name || 'Math Olympiad';
  };

  return (
    <div className="w-full space-y-4">
      <Section className="!py-12 md:!py-16">
        <MotionSection>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-3 font-mono">
                CREDENTIALING & DISTRIBUTIONS
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                Certificate Distribution System
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                Issue verifiable mathematical credentials based on validated attendance records and quiz performance.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center gap-4 bg-[#0A1224]/80 border border-slate-800 p-3.5 rounded-2xl flex-shrink-0">
              <div className="text-center px-3 border-r border-slate-800">
                <span className="text-xs text-slate-400 block font-mono">Total Issued</span>
                <span className="text-xl font-bold text-white font-mono">
                  <AnimatedCounter value={stats.totalIssued} />
                </span>
              </div>
              <div className="text-center px-3 border-r border-slate-800">
                <span className="text-xs text-slate-400 block font-mono">Merit Awards</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  <AnimatedCounter value={stats.winnerCount} />
                </span>
              </div>
              <div className="text-center px-3">
                <span className="text-xs text-slate-400 block font-mono">Events Covered</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">
                  <AnimatedCounter value={stats.distinctEvents} />
                </span>
              </div>
            </div>
          </div>

          {/* Verification Box Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0A1224]/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.1)] mb-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <ShieldCheck size={20} className="text-cyan-400" />
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Verify Certificate Authenticity
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Enter any official credential code (e.g., <code className="text-cyan-300 font-mono">MCN-2026-0001</code>) to authenticate university issuance in the club ledger.
                </p>
              </div>

              <div className="lg:col-span-7">
                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={verifyCodeInput}
                      onChange={(e) => setVerifyCodeInput(e.target.value)}
                      placeholder="Enter Certificate Code (e.g. MCN-2026-0001)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 uppercase font-mono tracking-wider transition-colors"
                    />
                  </div>
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                    type="submit"
                    className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20 whitespace-nowrap"
                  >
                    Verify Credential
                  </motion.button>
                </form>

                {/* Verification Result Feedback */}
                {verifyResult.searched && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3.5 ${
                      verifyResult.valid
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-950/40 border-red-500/40 text-red-200'
                    }`}
                  >
                    {verifyResult.valid ? (
                      <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 flex-1">
                      {verifyResult.valid && verifyResult.cert ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Verified Authentic Credential</span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300">
                              {verifyResult.cert.certificateCode}
                            </span>
                          </div>
                          <p className="text-slate-300">
                            Issued to <strong className="text-white">{verifyResult.cert.participantName}</strong> for{' '}
                            <span className="text-cyan-300 font-semibold">{verifyResult.cert.type}</span> in{' '}
                            <em>{verifyResult.event?.name || 'Academic Event'}</em> on{' '}
                            {new Date(verifyResult.cert.issuedAt).toLocaleDateString()}.
                          </p>
                          <button
                            onClick={() => setPreviewCert(verifyResult.cert!)}
                            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold pt-1"
                          >
                            <Eye size={13} />
                            <span>Preview Full Certificate</span>
                          </button>
                        </>
                      ) : (
                        <div>
                          <p className="font-bold text-red-300">Invalid or Revoked Certificate Code</p>
                          <p className="text-slate-400 text-xs">
                            No active credential matches "{verifyCodeInput.toUpperCase()}". Please confirm code formatting with the Mathematics Club administrator.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Issuance Workbench */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0A1224]/80 border border-slate-800 mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1 font-mono">
                  ISSUANCE WORKBENCH
                </span>
                <h3 className="text-xl font-bold text-white">
                  Eligible Scholars for {selectedEvent?.name || 'Selected Event'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Derived from recorded attendance check-ins and quiz performance for this event.
                </p>
              </div>

              {/* Event & Certificate Type Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  {data.events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>

                <select
                  value={issuingType}
                  onChange={(e) => setIssuingType(e.target.value as CertificateType)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Participation">Participation</option>
                  <option value="Quiz Excellence">Quiz Excellence</option>
                  <option value="Winner">Winner</option>
                  <option value="Runner-up">Runner-up</option>
                </select>

                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  onClick={handleIssueAllEligible}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
                >
                  <Sparkles size={16} />
                  <span>Issue to All Eligible</span>
                </motion.button>
              </div>
            </div>

            {/* Eligible Scholars Grid / List */}
            {eligibleRecipients.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eligibleRecipients.map((recipient) => (
                  <div
                    key={recipient.name}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-white text-sm tracking-tight">
                        {recipient.name}
                      </p>
                      <p className="text-xs text-cyan-400 flex items-center gap-1 mt-0.5">
                        <Check size={12} />
                        {recipient.reason}
                      </p>
                    </div>

                    {recipient.alreadyIssued ? (
                      <span className="px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        {recipient.existingCode}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleIssueSingle(recipient.name)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all"
                      >
                        Issue
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">
                  No verified attendees found for this event yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mark participants present in the Attendance Portal to automatically qualify them for certification.
                </p>
              </div>
            )}
          </div>

          {/* Section: Issued Certificates Registry */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1 font-mono">
                  OFFICIAL REGISTRY
                </span>
                <h3 className="text-2xl font-bold text-white">Issued Credentials</h3>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by scholar or code..."
                    className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="All">All Types</option>
                  <option value="Participation">Participation</option>
                  <option value="Quiz Excellence">Quiz Excellence</option>
                  <option value="Winner">Winner</option>
                  <option value="Runner-up">Runner-up</option>
                </select>
              </div>
            </div>

            {/* Issued Certificates Table */}
            <div className="rounded-3xl border border-slate-800/80 bg-[#0A1224]/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                      <th className="px-6 py-4">Credential Code</th>
                      <th className="px-6 py-4">Recipient Scholar</th>
                      <th className="px-6 py-4">Event Title</th>
                      <th className="px-6 py-4">Credential Type</th>
                      <th className="px-6 py-4">Issued On</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCertificates.length > 0 ? (
                      filteredCertificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-slate-800/30 transition-colors group"
                        >
                          {/* Code */}
                          <td className="px-6 py-4">
                            <span className="font-mono text-cyan-400 font-bold text-xs px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                              {cert.certificateCode}
                            </span>
                          </td>

                          {/* Recipient */}
                          <td className="px-6 py-4 font-semibold text-white">
                            {cert.participantName}
                          </td>

                          {/* Event */}
                          <td className="px-6 py-4 text-slate-300">
                            {getEventName(cert.eventId)}
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold border ${
                                cert.type === 'Winner'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                  : cert.type === 'Runner-up'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                                  : cert.type === 'Quiz Excellence'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                                  : 'bg-teal-500/10 text-teal-400 border-teal-500/25'
                              }`}
                            >
                              {cert.type}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                            {new Date(cert.issuedAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setPreviewCert(cert)}
                                className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                title="Preview Certificate"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => setCertToRevoke(cert)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Revoke Certificate"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                          <Award size={36} className="mx-auto mb-3 text-slate-600" />
                          <p className="text-base font-semibold text-slate-300">
                            No issued certificates found
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Select an event above and issue credentials to eligible attendees.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </MotionSection>
      </Section>

      {/* High-Resolution Certificate Preview & Export Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#091224] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 overflow-hidden my-6">
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <FileCheck2 size={20} className="text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  Official Credential Preview
                </h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                  {previewCert.certificateCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadPNG}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20 disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>{isDownloading ? 'Rendering...' : 'Download PNG'}</span>
                </button>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable & Downloadable Certificate Card */}
            <div className="overflow-x-auto pb-2 flex justify-center">
              <div
                ref={certRef}
                className="w-[780px] h-[550px] relative p-10 bg-[#050B16] border-8 border-[#0d1c3a] text-center flex flex-col justify-between shadow-2xl select-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, rgba(0, 217, 245, 0.05) 0%, transparent 70%)',
                }}
              >
                {/* Outer ornamental border */}
                <div className="absolute inset-2 border-2 border-cyan-500/40 pointer-events-none" />
                <div className="absolute inset-3 border border-amber-500/20 pointer-events-none" />

                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                {/* Top Institution & Logo */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <img
                    src="/mits-du-logo.png"
                    alt="Mathematics Club MITS-DU Gwalior"
                    className="w-16 h-16 object-contain rounded-full drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                  />
                  <div className="text-left">
                    <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono">
                      MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE • GWALIOR
                    </p>
                    <h2 className="text-xl font-black text-white tracking-wide">
                      MATHEMATICS CLUB NEXUS
                    </h2>
                    <p className="text-[10px] tracking-widest text-slate-400 uppercase font-mono">
                      DEPARTMENT OF APPLIED MATHEMATICS & COMPUTING
                    </p>
                  </div>
                </div>

                {/* Certificate Title Banner */}
                <div className="my-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.3em] font-mono block mb-1">
                    OFFICIAL ACADEMIC CREDENTIAL
                  </span>
                  <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-teal-400 uppercase tracking-wider font-serif">
                    Certificate of {previewCert.type}
                  </h1>
                </div>

                {/* Body Citation */}
                <div className="space-y-3 px-8">
                  <p className="text-xs text-slate-400 uppercase tracking-widest">
                    This credential is proud to certify that
                  </p>
                  <p className="text-3xl font-bold text-cyan-300 tracking-tight font-serif underline decoration-cyan-500/40 underline-offset-8">
                    {previewCert.participantName}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed pt-1">
                    has successfully participated with high merit in{' '}
                    <strong className="text-white">"{getEventName(previewCert.eventId)}"</strong>,
                    demonstrating commitment to collegiate mathematics, logical rigor, and academic inquiry.
                  </p>
                </div>

                {/* Signatures & Verification Seal */}
                <div className="grid grid-cols-3 items-end pt-4 border-t border-slate-800/80 px-6">
                  {/* Left Signature */}
                  <div className="text-center">
                    <div className="font-serif italic text-sm text-cyan-300/80 mb-1">
                      Dr. R. K. Gupta
                    </div>
                    <div className="w-36 h-[1px] bg-slate-700 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Faculty Coordinator
                    </p>
                    <p className="text-[9px] text-slate-500">MITS-DU Mathematics Club</p>
                  </div>

                  {/* Center Authentic Verification Seal */}
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-cyan-400/50 mx-auto flex flex-col items-center justify-center p-1 bg-cyan-950/20">
                      <ShieldCheck size={18} className="text-cyan-400" />
                      <span className="text-[7px] text-cyan-300 uppercase font-mono font-bold leading-tight">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-cyan-400 mt-1 font-bold">
                      {previewCert.certificateCode}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Issued: {new Date(previewCert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right Signature */}
                  <div className="text-center">
                    <div className="font-serif italic text-sm text-cyan-300/80 mb-1">
                      Arjun Mehta
                    </div>
                    <div className="w-36 h-[1px] bg-slate-700 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Club President
                    </p>
                    <p className="text-[9px] text-slate-500">MathClub Executive Council</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Revoke */}
      <ConfirmDialog
        isOpen={Boolean(certToRevoke)}
        title="Revoke Issued Certificate"
        message={`Are you sure you want to revoke certificate "${certToRevoke?.certificateCode}" issued to ${certToRevoke?.participantName}? This will invalidate public verification.`}
        confirmText="Revoke Credential"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleRevokeConfirm}
        onCancel={() => setCertToRevoke(null)}
      />
    </div>
  );
}
