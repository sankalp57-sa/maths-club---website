// ============================================================
// MathClub Nexus — Interactive Events Exhibition & Registration
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  Edit3,
  Trash2,
  X,
  Search,
  UserPlus,
  Compass,
  CreditCard,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Sparkles,
  ArrowRight,
  Receipt,
  UserCheck,
} from 'lucide-react';
import type { AppState, Event, Registration, NavSection } from '../types';
import { addEvent, updateEvent, deleteEvent, createRegistration } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { springSmooth, cinematicEase } from '../motion/motionTokens';
import Section from '../components/Section';

interface EventsPageProps {
  data: AppState;
  onDataChange: () => void;
  onNavigate?: (section: NavSection) => void;
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  venue: string;
  capacity: string;
  fee: string;
  registrationDeadline: string;
  assignedTo: string[];
}

const emptyForm: EventFormData = {
  name: '',
  description: '',
  date: '',
  venue: '',
  capacity: '50',
  fee: '0',
  registrationDeadline: '',
  assignedTo: [],
};

interface RegFormData {
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  department: string;
  paymentMethod: 'UPI' | 'Card' | 'Net Banking';
  upiId: string;
  cardNumber: string;
  cardExpiry: string;
  selectedBank: string;
}

const categories = [
  { id: 'all', label: 'All Initiatives' },
  { id: 'olympiad', label: 'Olympiads' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'seminar', label: 'Colloquia & Seminars' },
  { id: 'hackathon', label: 'Hackathons' },
];

export default function EventsPage({ data, onDataChange, onNavigate }: EventsPageProps) {
  const { user, can } = useAuth();
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Permission checks
  const canCreate = can('create_event');
  const canEdit = can('edit_event');
  const canDelete = can('delete_event');
  const isParticipant = user?.role === 'participant';

  // Event creation & editing modal state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<EventFormData>>({});

  // Registration & Payment multi-step modal state
  const [regEvent, setRegEvent] = useState<Event | null>(null);
  const [regStep, setRegStep] = useState<'details' | 'payment' | 'success'>('details');
  const [regForm, setRegForm] = useState<RegFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    college: user?.college || 'MITS-DU Gwalior',
    year: user?.year || '2nd Year',
    department: user?.department || 'Mathematics & Computing',
    paymentMethod: 'UPI',
    upiId: 'scholar@okaxis',
    cardNumber: '4111 2222 3333 4444',
    cardExpiry: '12/28',
    selectedBank: 'State Bank of India',
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedRegistration, setCompletedRegistration] = useState<Registration | null>(null);

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<Event | null>(null);

  // Helper to categorize an event by keywords in its title
  const categorizeEvent = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('olympiad') || lower.includes('competition') || lower.includes('contest')) return 'olympiad';
    if (lower.includes('workshop') || lower.includes('bootcamp')) return 'workshop';
    if (lower.includes('colloquium') || lower.includes('seminar') || lower.includes('lecture')) return 'seminar';
    if (lower.includes('hackathon') || lower.includes('sprint') || lower.includes('marathon')) return 'hackathon';
    return 'workshop';
  };

  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase();
    return data.events
      .filter((e) => {
        const matchesQuery = e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q);
        if (!matchesQuery) return false;
        if (selectedCategory === 'all') return true;
        return categorizeEvent(e.name) === selectedCategory;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data.events, search, selectedCategory]);

  // Featured Event
  const featuredEvent = useMemo(() => {
    const upcoming = data.events
      .filter((e) => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming.length > 0 ? upcoming[0] : (data.events[0] || null);
  }, [data.events]);

  const validateForm = (): boolean => {
    const errors: Partial<EventFormData> = {};
    if (!form.name.trim()) errors.name = 'Required';
    if (!form.date) errors.date = 'Required';
    if (!form.venue.trim()) errors.venue = 'Required';
    const cap = parseInt(form.capacity);
    if (!form.capacity || isNaN(cap) || cap < 1) errors.capacity = 'Must be ≥ 1';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm() || !user) return;

    const actor = { name: user.name, role: user.role };
    const feeNum = Math.max(0, parseFloat(form.fee) || 0);

    if (editingEvent) {
      updateEvent(
        editingEvent.id,
        {
          name: form.name.trim(),
          description: form.description.trim(),
          date: form.date,
          venue: form.venue.trim(),
          capacity: parseInt(form.capacity),
          fee: feeNum,
          registrationDeadline: form.registrationDeadline,
          assignedTo: form.assignedTo,
        },
        actor
      );
      showToast('success', 'Event updated successfully');
    } else {
      addEvent(
        {
          name: form.name.trim(),
          description: form.description.trim(),
          date: form.date,
          venue: form.venue.trim(),
          capacity: parseInt(form.capacity),
          fee: feeNum,
          registrationDeadline: form.registrationDeadline,
          assignedTo: form.assignedTo,
        },
        actor
      );
      showToast('success', 'Event created successfully');
    }
    setShowForm(false);
    setEditingEvent(null);
    setForm(emptyForm);
    setFormErrors({});
    onDataChange();
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      name: event.name,
      description: event.description,
      date: event.date,
      venue: event.venue,
      capacity: event.capacity.toString(),
      fee: (event.fee ?? 0).toString(),
      registrationDeadline: event.registrationDeadline || '',
      assignedTo: event.assignedTo || [],
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteConfirm && user) {
      const success = deleteEvent(deleteConfirm.id, { name: user.name, role: user.role });
      if (success) {
        showToast('success', 'Event deleted');
        setDeleteConfirm(null);
        onDataChange();
      } else {
        showToast('error', 'Only President can delete events');
      }
    }
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) return { label: 'Concluded', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / 86400000);
    if (daysUntil <= 3) return { label: 'Imminent', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    return { label: 'Upcoming', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
  };

  // Open Participant Registration Modal
  const handleOpenRegister = (event: Event) => {
    // Check if user is already registered
    const alreadyRegistered = data.registrations.some(
      (r) =>
        r.eventId === event.id &&
        (r.userId === user?.id || (user?.email && r.email.toLowerCase() === user.email.toLowerCase()))
    );

    if (alreadyRegistered) {
      showToast('info', 'You are already registered for this event. Check My Registrations.');
      if (onNavigate) onNavigate('my-registrations');
      return;
    }

    setRegEvent(event);
    setRegStep('details');
    setRegForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '+91 98765 43210',
      college: user?.college || 'MITS-DU Gwalior',
      year: user?.year || '2nd Year',
      department: user?.department || 'Mathematics & Computing',
      paymentMethod: 'UPI',
      upiId: 'scholar@okaxis',
      cardNumber: '4111 2222 3333 4444',
      cardExpiry: '12/28',
      selectedBank: 'State Bank of India',
    });
  };

  // Submit Details and Handle Free vs Paid
  const handleProceedFromDetails = () => {
    if (!regForm.name.trim() || !regForm.email.trim()) {
      showToast('error', 'Name and Email are required.');
      return;
    }

    if (!regEvent) return;

    const eventFee = regEvent.fee ?? 0;

    if (eventFee === 0) {
      // Free Event: Skip payment step entirely!
      completeEnrollment('free', 'Free', 'TXN-FREE-' + Math.floor(100000 + Math.random() * 900000));
    } else {
      // Paid Event: Advance to Simulated Payment step
      setRegStep('payment');
    }
  };

  // Complete Payment and Create Registration
  const completeEnrollment = (
    paymentStatus: 'paid' | 'free',
    paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Free',
    transactionId: string
  ) => {
    if (!regEvent || !user) return;

    const result = createRegistration({
      eventId: regEvent.id,
      userId: user.id,
      participantName: regForm.name.trim(),
      email: regForm.email.trim(),
      phone: regForm.phone.trim(),
      college: regForm.college.trim(),
      year: regForm.year.trim(),
      department: regForm.department.trim(),
      amount: regEvent.fee ?? 0,
      paymentMethod,
      paymentStatus,
      transactionId,
    });

    if (result.success && result.registration) {
      setCompletedRegistration(result.registration);
      setRegStep('success');
      showToast('success', result.message);
      onDataChange();
    } else {
      showToast('error', result.message || 'Registration failed');
    }
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const txn =
        'TXN-' +
        regForm.paymentMethod.toUpperCase().replace(/\s+/g, '') +
        '-' +
        Math.floor(100000 + Math.random() * 900000);
      completeEnrollment('paid', regForm.paymentMethod, txn);
    }, 1200);
  };

  return (
    <Section className="space-y-16 lg:space-y-20 text-slate-100">
      {/* ============================================================
          SECTION 1: HERO SPOTLIGHT (FEATURED EVENT)
         ============================================================ */}
      {featuredEvent && (
        <section aria-labelledby="featured-heading">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 id="featured-heading" className="text-xs uppercase tracking-widest font-mono text-cyan-400">
              FEATURED INITIATIVE
            </h2>
          </div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: cinematicEase, duration: 0.6 }}
            className="relative rounded-3xl p-8 sm:p-12 border border-slate-700/80 bg-gradient-to-br from-[#091224] via-[#0A162D] to-[#060D1A] shadow-2xl overflow-hidden"
          >
            {/* Background mathematical decorative watermark */}
            <div className="absolute right-6 -bottom-10 text-[180px] font-serif text-cyan-400/[0.03] select-none pointer-events-none leading-none">
              ∫
            </div>

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {getEventStatus(featuredEvent).label}
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {featuredEvent.fee ? `Fee: ₹${featuredEvent.fee}` : 'Free Entry'}
                </span>
                {featuredEvent.registrationDeadline && (
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Deadline: {featuredEvent.registrationDeadline}
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {featuredEvent.name}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {featuredEvent.description || 'Join our premier academic gathering exploring advanced principles and applications.'}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-400" />
                  <span>{new Date(featuredEvent.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-cyan-400" />
                  <span>{featuredEvent.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-cyan-400" />
                  <span>{featuredEvent.registrations.length} / {featuredEvent.capacity} Enrolled</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                {isParticipant ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenRegister(featuredEvent)}
                    className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20 cursor-pointer flex items-center gap-2"
                  >
                    <UserPlus size={16} />
                    <span>Register for Initiative</span>
                  </motion.button>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Logged in with staff/officer privileges.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ============================================================
          SECTION 2: ALL EVENTS GRID WITH CONTROLS
         ============================================================ */}
      <section aria-labelledby="all-events-heading" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 id="all-events-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Colloquium & Competition Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse, register, and review symposium schedules across departments.
            </p>
          </div>

          {/* Create Event Button (Only Core & President) */}
          {canCreate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingEvent(null);
                setForm(emptyForm);
                setFormErrors({});
                setShowForm(true);
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-cyan-400/20 cursor-pointer self-start md:self-auto"
            >
              <Plus size={16} />
              <span>Publish Event</span>
            </motion.button>
          )}
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title or venue..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const isFull = event.registrations.length >= event.capacity;
            const eventDate = new Date(event.date);

            // Check if current user is registered
            const isRegistered = data.registrations.some(
              (r) =>
                r.eventId === event.id &&
                (r.userId === user?.id || (user?.email && r.email.toLowerCase() === user.email.toLowerCase()))
            );

            // Assigned coordinator names
            const assignedMembers = data.members.filter((m) => event.assignedTo?.includes(m.id));

            return (
              <motion.div
                key={event.id}
                layout
                className="rounded-2xl p-6 bg-[#091224] border border-slate-800 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(0,217,245,0.15)] flex flex-col justify-between transition-all group"
              >
                <div className="space-y-4">
                  {/* Top Bar: Date + Role Controls */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] uppercase font-bold text-cyan-400">
                          {eventDate.toLocaleDateString('en', { month: 'short' })}
                        </span>
                        <span className="text-base font-black text-white leading-none">
                          {eventDate.getDate()}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                        <p className="text-[11px] font-mono text-cyan-400 font-bold mt-1">
                          {event.fee ? `₹${event.fee} Fee` : 'FREE Entry'}
                        </p>
                      </div>
                    </div>

                    {/* Staff Actions (Core: Edit; President: Edit & Delete) */}
                    {(canEdit || canDelete) && (
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="Edit Event"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteConfirm(event)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {event.description || 'No detailed abstract provided.'}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Seats: {event.registrations.length} / {event.capacity}</span>
                      <span className="font-mono text-cyan-400">
                        {Math.round((event.registrations.length / event.capacity) * 100)}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isFull ? 'bg-red-400' : 'bg-cyan-400'}`}
                        style={{ width: `${Math.min(100, (event.registrations.length / event.capacity) * 100)}%` }}
                      />
                    </div>

                    {/* Assigned Coordinators */}
                    {assignedMembers.length > 0 && (
                      <p className="text-[10px] text-slate-400 truncate pt-1">
                        Coord: <span className="text-slate-300">{assignedMembers.map((m) => m.name).join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-5 mt-3">
                  {isParticipant ? (
                    isRegistered ? (
                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate('my-registrations');
                        }}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Enrolled • View Pass</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenRegister(event)}
                        disabled={isFull}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isFull
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-400/20'
                        }`}
                      >
                        <UserPlus size={14} />
                        <span>{isFull ? 'Full Capacity' : event.fee ? `Register (₹${event.fee})` : 'Register Free'}</span>
                      </button>
                    )
                  ) : (
                    <div className="py-2 text-center text-[11px] text-slate-500 border border-slate-800/80 rounded-xl bg-slate-900/40">
                      Coordinated via MathClub Leadership
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          PARTICIPANT REGISTRATION & SIMULATED PAYMENT MODAL
         ============================================================ */}
      <AnimatePresence>
        {regEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#091224] border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setRegEvent(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Step 1: Details Form */}
              {regStep === 'details' && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider">
                      Step 1 of 2 • Scholar Details
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                      Register for {regEvent.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {regEvent.venue} • {regEvent.date} • {regEvent.fee ? `Fee: ₹${regEvent.fee}` : 'Free Entry'}
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          College / University
                        </label>
                        <input
                          type="text"
                          value={regForm.college}
                          onChange={(e) => setRegForm({ ...regForm, college: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Academic Year
                        </label>
                        <input
                          type="text"
                          value={regForm.year}
                          onChange={(e) => setRegForm({ ...regForm, year: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Admission Fee:</span>
                    <span className="text-base font-black text-cyan-300">
                      {regEvent.fee ? `₹${regEvent.fee}` : 'FREE (No Charge)'}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setRegEvent(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedFromDetails}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-400/20 cursor-pointer"
                    >
                      <span>{regEvent.fee ? `Proceed to Payment (₹${regEvent.fee})` : 'Confirm Free Registration'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Simulated Payment Step */}
              {regStep === 'payment' && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider">
                      Step 2 of 2 • Simulated Payment Gateway
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                      Pay Entry Fee: ₹{regEvent.fee}
                    </h3>
                  </div>

                  {/* Mandatory Visible Notice */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 font-medium">
                    <ShieldCheck size={18} className="flex-shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <p className="font-bold">Demo Payment Gateway</p>
                      <p className="text-[11px] text-amber-200/90 mt-0.5">
                        Demo payment, no real money is charged. Real card numbers or CVV are never requested or stored.
                      </p>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Select Payment Mode:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['UPI', 'Card', 'Net Banking'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setRegForm({ ...regForm, paymentMethod: method })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            regForm.paymentMethod === method
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>

                    {/* Method Specific Fields */}
                    {regForm.paymentMethod === 'UPI' && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <label className="block text-[11px] text-slate-400">Virtual Payment Address (VPA)</label>
                        <input
                          type="text"
                          value={regForm.upiId}
                          onChange={(e) => setRegForm({ ...regForm, upiId: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                        />
                        <div className="flex gap-2 pt-1 text-[10px] text-slate-400">
                          <button
                            type="button"
                            onClick={() => setRegForm({ ...regForm, upiId: 'user@okaxis' })}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:text-white"
                          >
                            @okaxis
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegForm({ ...regForm, upiId: 'student@okhdfcbank' })}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:text-white"
                          >
                            @okhdfcbank
                          </button>
                        </div>
                      </div>
                    )}

                    {regForm.paymentMethod === 'Card' && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Simulated Card Number</label>
                          <input
                            type="text"
                            value={regForm.cardNumber}
                            onChange={(e) => setRegForm({ ...regForm, cardNumber: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Expiry</label>
                            <input
                              type="text"
                              value={regForm.cardExpiry}
                              onChange={(e) => setRegForm({ ...regForm, cardExpiry: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">CVV (Simulated)</label>
                            <input
                              type="password"
                              value="***"
                              disabled
                              className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-500 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {regForm.paymentMethod === 'Net Banking' && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <label className="block text-[11px] text-slate-400">Select Bank</label>
                        <select
                          value={regForm.selectedBank}
                          onChange={(e) => setRegForm({ ...regForm, selectedBank: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs cursor-pointer"
                        >
                          <option>State Bank of India</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Axis Bank</option>
                          <option>Punjab National Bank</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setRegStep('details')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ← Back to Details
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleSimulatePayment}
                      className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Simulating Transfer...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={15} />
                          <span>Complete Demo Payment (₹{regEvent.fee})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Success Confirmation & Receipt */}
              {regStep === 'success' && completedRegistration && (
                <div className="space-y-5 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Enrollment Confirmed!
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Your seat for <span className="text-white font-semibold">{regEvent.name}</span> is officially reserved.
                    </p>
                  </div>

                  {/* Printable Voucher Summary */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="text-cyan-300 font-bold">{completedRegistration.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Status:</span>
                      <span className="text-emerald-400 font-bold uppercase">{completedRegistration.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Attendee:</span>
                      <span className="text-white">{completedRegistration.participantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Paid:</span>
                      <span className="text-cyan-300 font-bold">₹{completedRegistration.amount}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer size={15} />
                      <span>Print Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegEvent(null);
                        if (onNavigate) onNavigate('my-registrations');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Receipt size={15} />
                      <span>View My Registrations</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          CREATE / EDIT EVENT MODAL (With fee, deadline, and assignedTo)
         ============================================================ */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#091224] border border-slate-700 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto text-left"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-1 mb-6">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  {editingEvent ? 'UPDATE COLLOQUIUM' : 'CURATE NEW EVENT'}
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {editingEvent ? 'Modify Event Particulars' : 'Create Mathematical Initiative'}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Riemann Hypothesis Workshop"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description / Abstract
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Topics covered, speaker details, prerequisites..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                    {formErrors.date && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Registration Deadline
                    </label>
                    <input
                      type="date"
                      value={form.registrationDeadline}
                      onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Entry Fee (₹ 0 = Free) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.fee}
                      onChange={(e) => setForm({ ...form, fee: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Capacity (Seats) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      placeholder="50"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                    {formErrors.capacity && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.capacity}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Venue / Lecture Hall *
                  </label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="e.g. Ramanujan Hall B-204"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {formErrors.venue && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.venue}</p>
                  )}
                </div>

                {/* Assigned Coordinators Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assign Club Coordinators / Members
                  </label>
                  <div className="max-h-32 overflow-y-auto p-2.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1.5">
                    {data.members.map((member) => {
                      const isAssigned = form.assignedTo.includes(member.id);
                      return (
                        <label
                          key={member.id}
                          className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, assignedTo: [...form.assignedTo, member.id] });
                              } else {
                                setForm({
                                  ...form,
                                  assignedTo: form.assignedTo.filter((id) => id !== member.id),
                                });
                              }
                            }}
                            className="rounded text-cyan-400"
                          />
                          <span>{member.name}</span>
                          <span className="text-[10px] text-slate-500">({member.role})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-all shadow-sm shadow-cyan-400/20 cursor-pointer"
                  >
                    {editingEvent ? 'Save Modifications' : 'Publish Event'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Colloquium Event"
        message={`Are you sure you want to permanently delete "${deleteConfirm?.name}"? All associated attendance logs and registration records will be removed.`}
        confirmText="Confirm Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </Section>
  );
}
