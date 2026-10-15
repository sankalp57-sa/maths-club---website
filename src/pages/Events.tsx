// ============================================================
// MathClub Nexus — Interactive Events Exhibition
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
} from 'lucide-react';
import type { AppState, Event } from '../types';
import { addEvent, updateEvent, deleteEvent, registerForEvent } from '../utils/storage';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { springSmooth, cinematicEase } from '../motion/motionTokens';
import Section from '../components/Section';

interface EventsPageProps {
  data: AppState;
  onDataChange: () => void;
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  venue: string;
  capacity: string;
}

const emptyForm: EventFormData = { name: '', description: '', date: '', venue: '', capacity: '' };

interface RegFormData {
  name: string;
  studentId: string;
  email: string;
}

const emptyRegForm: RegFormData = { name: '', studentId: '', email: '' };

const categories = [
  { id: 'all', label: 'All Initiatives' },
  { id: 'olympiad', label: 'Olympiads' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'seminar', label: 'Colloquia & Seminars' },
  { id: 'hackathon', label: 'Hackathons' },
];

export default function EventsPage({ data, onDataChange }: EventsPageProps) {
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Event creation & editing modal state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<EventFormData>>({});

  // Registration modal state
  const [regEventId, setRegEventId] = useState<string | null>(null);
  const [regForm, setRegForm] = useState<RegFormData>(emptyRegForm);
  const [regErrors, setRegErrors] = useState<Partial<RegFormData>>({});

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
    if (!validateForm()) return;
    if (editingEvent) {
      updateEvent(editingEvent.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        date: form.date,
        venue: form.venue.trim(),
        capacity: parseInt(form.capacity),
      });
      showToast('success', 'Event updated successfully');
    } else {
      addEvent(form.name.trim(), form.description.trim(), form.date, form.venue.trim(), parseInt(form.capacity));
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
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteEvent(deleteConfirm.id);
      showToast('success', 'Event deleted');
      setDeleteConfirm(null);
      onDataChange();
    }
  };

  const validateRegForm = (): boolean => {
    const errors: Partial<RegFormData> = {};
    if (!regForm.name.trim()) errors.name = 'Full name is required';
    if (!regForm.studentId.trim()) errors.studentId = 'Student ID is required';
    if (!regForm.email.trim()) errors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) errors.email = 'Enter a valid academic email';
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = () => {
    if (!regEventId || !validateRegForm()) return;
    const result = registerForEvent(regEventId, regForm.name.trim(), regForm.studentId.trim(), regForm.email.trim());
    if (result.success) {
      showToast('success', result.message);
      setRegEventId(null);
      setRegForm(emptyRegForm);
      setRegErrors({});
      onDataChange();
    } else {
      showToast('error', result.message);
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

  const selectedEventForReg = useMemo(() => {
    return data.events.find((e) => e.id === regEventId);
  }, [data.events, regEventId]);

  return (
    <Section className="space-y-16 lg:space-y-20 text-slate-100 !py-0">
      {/* ============================================================
          SECTION: EDITORIAL HEADER
         ============================================================ */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: cinematicEase }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800/80"
      >
        <div className="space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
            COLLEGIATE CALENDAR
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Discover What's Next
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Workshops, Olympiads, research seminars, and hackathons curated by the Mathematics Club.
          </p>
        </div>

        <motion.button
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          onClick={() => {
            setShowForm(true);
            setEditingEvent(null);
            setForm(emptyForm);
            setFormErrors({});
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20 flex-shrink-0"
        >
          <Plus size={17} />
          <span>Host New Event</span>
        </motion.button>
      </motion.div>

      {/* ============================================================
          FEATURED EVENT HERO CARD
         ============================================================ */}
      {featuredEvent && (
        <motion.section
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: cinematicEase }}
          className="rounded-3xl p-7 sm:p-9 bg-[#0A1224]/80 border border-slate-800 relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  FEATURED COLLOQUIUM
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

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {featuredEvent.name}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {featuredEvent.description ||
                  'Engage with university faculty and student peers in high-level mathematical problem solving and open research dialogue.'}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-cyan-400" />
                  {featuredEvent.venue}
                </span>
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-cyan-400" />
                  {featuredEvent.registrations.length} / {featuredEvent.capacity} Seats Filled
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center space-y-4">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Capacity Booked</span>
                  <span className="font-mono text-cyan-400">
                    {Math.round((featuredEvent.registrations.length / featuredEvent.capacity) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        (featuredEvent.registrations.length / featuredEvent.capacity) * 100
                      )}%`,
                    }}
                    transition={{ duration: 0.9, ease: cinematicEase }}
                    className="h-full bg-cyan-400 rounded-full"
                  />
                </div>
              </div>

              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                onClick={() => {
                  setRegEventId(featuredEvent.id);
                  setRegForm(emptyRegForm);
                  setRegErrors({});
                }}
                disabled={featuredEvent.registrations.length >= featuredEvent.capacity}
                className="w-full max-w-xs flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-cyan-400/20"
              >
                <UserPlus size={16} />
                <span>
                  {featuredEvent.registrations.length >= featuredEvent.capacity ? 'Event Full' : 'Claim Seat Now'}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.section>
      )}

      {/* ============================================================
          SEARCH & CATEGORY FILTERS WITH ANIMATED INDICATOR
         ============================================================ */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${
                    isActive
                      ? 'text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="eventCategoryPill"
                      transition={springSmooth}
                      className="absolute inset-0 rounded-xl bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,217,245,0.15)] z-0"
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search initiatives, venues..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#0A1224]/90 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>
        </div>

        {/* ============================================================
            EVENT CARDS GRID WITH ANIMATEPRESENCE
           ============================================================ */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-[#0A1224]/50 border border-slate-800 space-y-4">
            <Calendar size={44} className="text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Matching Events Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or switch category filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-2"
          >
            <AnimatePresence>
              {filteredEvents.map((event) => {
                const status = getEventStatus(event);
                const isFull = event.registrations.length >= event.capacity;
                const eventDate = new Date(event.date);

                return (
                  <motion.div
                    layout
                    key={event.id}
                    initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                    whileHover={shouldReduceMotion ? {} : { y: -4, borderColor: 'rgba(0, 217, 245, 0.3)' }}
                    transition={springSmooth}
                    className="rounded-2xl p-6 sm:p-7 bg-[#0A1224]/70 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between transition-colors group"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Date Block + Actions */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center flex-shrink-0">
                            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                              {eventDate.toLocaleDateString('en', { month: 'short' })}
                            </span>
                            <span className="text-base font-extrabold text-white leading-none">
                              {eventDate.getDate()}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                              {status.label}
                            </span>
                            <p className="text-xs text-slate-400 mt-1 font-mono">
                              {eventDate.toLocaleDateString('en', { weekday: 'short' })}
                            </p>
                          </div>
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(event)}
                            title="Edit event"
                            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(event)}
                            title="Delete event"
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                          {event.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {event.description || 'No detailed abstract provided for this mathematical colloquium.'}
                        </p>
                      </div>

                      {/* Venue & Capacity */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-cyan-400 flex-shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-cyan-400 flex-shrink-0" />
                            Seats: {event.registrations.length} / {event.capacity}
                          </span>
                          <span className="font-mono text-cyan-400 font-semibold">
                            {Math.round((event.registrations.length / event.capacity) * 100)}%
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(100, (event.registrations.length / event.capacity) * 100)}%`,
                            }}
                            transition={{ duration: 0.6, ease: cinematicEase }}
                            className={`h-full rounded-full ${
                              isFull ? 'bg-red-400' : 'bg-cyan-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Register CTA */}
                    <div className="pt-6 mt-4">
                      <motion.button
                        whileHover={shouldReduceMotion || isFull ? {} : { scale: 1.02 }}
                        whileTap={shouldReduceMotion || isFull ? {} : { scale: 0.98 }}
                        onClick={() => {
                          setRegEventId(event.id);
                          setRegForm(emptyRegForm);
                          setRegErrors({});
                        }}
                        disabled={isFull}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                          isFull
                            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25'
                        }`}
                      >
                        <UserPlus size={14} />
                        <span>{isFull ? 'Event Full' : 'Register for Event'}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* ============================================================
          REGISTRATION MODAL WITH ANIMATEPRESENCE
         ============================================================ */}
      <AnimatePresence>
        {regEventId && selectedEventForReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRegEventId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={springSmooth}
              className="w-full max-w-lg rounded-3xl p-7 sm:p-8 bg-[#0A1224] border border-slate-700 shadow-2xl relative z-10"
            >
              <button
                onClick={() => setRegEventId(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-1 mb-6">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  PARTICIPANT REGISTRATION
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {selectedEventForReg.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedEventForReg.venue} • {new Date(selectedEventForReg.date).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="e.g. Alan Turing"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {regErrors.name && (
                    <p className="text-xs text-red-400 mt-1">{regErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    University Student ID *
                  </label>
                  <input
                    type="text"
                    value={regForm.studentId}
                    onChange={(e) => setRegForm({ ...regForm, studentId: e.target.value })}
                    placeholder="e.g. MTH-2024-042"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {regErrors.studentId && (
                    <p className="text-xs text-red-400 mt-1">{regErrors.studentId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academic Email Address *
                  </label>
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="e.g. alan@university.edu"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {regErrors.email && (
                    <p className="text-xs text-red-400 mt-1">{regErrors.email}</p>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRegEventId(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleRegister}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-all shadow-sm shadow-cyan-400/20"
                  >
                    Confirm Registration
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          CREATE / EDIT EVENT MODAL
         ============================================================ */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={springSmooth}
              className="w-full max-w-lg rounded-3xl p-7 sm:p-8 bg-[#0A1224] border border-slate-700 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
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
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Topics covered, speaker details, prerequisites..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    {formErrors.date && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.date}</p>
                    )}
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
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
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
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {formErrors.venue && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.venue}</p>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-all shadow-sm shadow-cyan-400/20"
                  >
                    {editingEvent ? 'Save Modifications' : 'Publish Event'}
                  </motion.button>
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
        message={`Are you sure you want to permanently delete "${deleteConfirm?.name}"? All associated attendance logs will be discarded.`}
        confirmText="Confirm Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </Section>
  );
}
