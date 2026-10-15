// ============================================================
// MathClub Nexus — Member Management Portal
// ============================================================

import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  GraduationCap,
  X,
  Mail,
  Calendar,
  Sparkles,
} from 'lucide-react';
import type { AppState, Member, MemberRole, MemberStatus } from '../types';
import { addMember, updateMember, toggleMemberStatus, deleteMember } from '../utils/storage';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Section from '../components/Section';
import MotionSection from '../components/MotionSection';
import AnimatedCounter from '../components/AnimatedCounter';
import { cinematicEase } from '../motion/motionTokens';

interface MembersPageProps {
  data: AppState;
  onDataChange: () => void;
}

export default function MembersPage({ data, onDataChange }: MembersPageProps) {
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | MemberRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | MemberStatus>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    department: string;
    year: string;
    role: MemberRole;
    status: MemberStatus;
  }>({
    name: '',
    email: '',
    department: '',
    year: '1st Year',
    role: 'Member',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Confirm Delete Dialog State
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Departments List for filter & dropdown
  const departments = useMemo(() => {
    const list = new Set<string>();
    data.members.forEach((m) => {
      if (m.department) list.add(m.department);
    });
    return Array.from(list).sort();
  }, [data.members]);

  // Statistics derived from AppState
  const stats = useMemo(() => {
    const total = data.members.length;
    const active = data.members.filter((m) => m.status === 'Active').length;
    const coreTeam = data.members.filter(
      (m) => m.role === 'Core Team' || m.role === 'Coordinator' || m.role === 'President'
    ).length;
    const depts = new Set(data.members.map((m) => m.department)).size;
    return { total, active, coreTeam, depts };
  }, [data.members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return data.members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || m.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchesDept = deptFilter === 'All' || m.department === deptFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [data.members, searchTerm, roleFilter, statusFilter, deptFilter]);

  // Modal Handlers
  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      department: departments[0] || 'Mathematics & Computing',
      year: '1st Year',
      role: 'Member',
      status: 'Active',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      department: member.department,
      year: member.year,
      role: member.role,
      status: member.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid academic email address';
    } else {
      // Check duplicate email
      const isDuplicate = data.members.some(
        (m) =>
          m.id !== editingMember?.id &&
          m.email.trim().toLowerCase() === formData.email.trim().toLowerCase()
      );
      if (isDuplicate) {
        errors.email = 'A member with this email is already registered';
      }
    }
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingMember) {
      const res = updateMember(editingMember.id, formData);
      if (res.success) {
        showToast('success', res.message);
        onDataChange();
        setIsModalOpen(false);
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = addMember(formData);
      if (res.success) {
        showToast('success', res.message);
        onDataChange();
        setIsModalOpen(false);
      } else {
        showToast('error', res.message);
      }
    }
  };

  const handleToggleStatus = (id: string) => {
    const res = toggleMemberStatus(id);
    if (res.success) {
      showToast('info', res.message);
      onDataChange();
    }
  };

  const handleDeleteConfirm = () => {
    if (!memberToDelete) return;
    const ok = deleteMember(memberToDelete.id);
    if (ok) {
      showToast('info', `Member ${memberToDelete.name} has been removed`);
      onDataChange();
    } else {
      showToast('error', 'Failed to remove member');
    }
    setMemberToDelete(null);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (data.members.length === 0) {
      showToast('info', 'No member records available to export');
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Department', 'Academic Year', 'Role', 'Status', 'Joined Date'];
    const rows = data.members.map((m) => [
      `"${m.id}"`,
      `"${m.name}"`,
      `"${m.email}"`,
      `"${m.department}"`,
      `"${m.year}"`,
      `"${m.role}"`,
      `"${m.status}"`,
      `"${new Date(m.joinedAt).toLocaleDateString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MathClub_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Exported ${data.members.length} member records to CSV`);
  };

  // Role Badge Styling
  const getRoleBadge = (role: MemberRole) => {
    switch (role) {
      case 'President':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'Coordinator':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25';
      case 'Core Team':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header and Telemetry */}
      <Section className="!py-12 md:!py-16">
        <MotionSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-3 font-mono">
                MEMBERSHIP ROSTER & GOVERNANCE
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                Member Management Portal
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                Central registry for student mathematicians, coordinators, and executive committee officers across university departments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-colors"
              >
                <Download size={16} className="text-cyan-400" />
                <span>Export CSV</span>
              </motion.button>

              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
              >
                <UserPlus size={16} />
                <span>Add Member</span>
              </motion.button>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Card 1: Total */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Members
                </span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Users size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                <AnimatedCounter value={stats.total} />
              </p>
              <p className="text-xs text-slate-400 mt-2">Enrolled collegiate scholars</p>
            </motion.div>

            {/* Card 2: Active */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Status
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                <AnimatedCounter value={stats.active} />
              </p>
              <p className="text-xs text-slate-400 mt-2">In good standing this term</p>
            </motion.div>

            {/* Card 3: Core Team */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Executive / Core
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                <AnimatedCounter value={stats.coreTeam} />
              </p>
              <p className="text-xs text-slate-400 mt-2">Club leadership & committees</p>
            </motion.div>

            {/* Card 4: Departments */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className="rounded-2xl p-6 bg-[#0A1224]/70 border border-slate-800/80 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Departments
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Building2 size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3 font-mono">
                <AnimatedCounter value={stats.depts} />
              </p>
              <p className="text-xs text-slate-400 mt-2">Academic faculties represented</p>
            </motion.div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl p-5 bg-[#0A1224]/80 border border-slate-800 mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search input */}
              <div className="md:col-span-5 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, department..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {/* Department filter */}
              <div className="md:col-span-3">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role filter */}
              <div className="md:col-span-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="All">All Roles</option>
                  <option value="President">President</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Core Team">Core Team</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="md:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Active Filters readout */}
            {(searchTerm || roleFilter !== 'All' || statusFilter !== 'All' || deptFilter !== 'All') && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <span>
                  Showing {filteredMembers.length} of {data.members.length} members
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('All');
                    setStatusFilter('All');
                    setDeptFilter('All');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Members Table */}
          <div className="rounded-3xl border border-slate-800/80 bg-[#0A1224]/80 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    <th className="px-6 py-4">Member Name</th>
                    <th className="px-6 py-4">Department & Year</th>
                    <th className="px-6 py-4">Club Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* Member Name & Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-xs uppercase flex-shrink-0">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-white tracking-tight">
                                {member.name}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail size={12} className="text-slate-500" />
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department & Year */}
                        <td className="px-6 py-4">
                          <p className="text-slate-200 font-medium">{member.department}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <GraduationCap size={12} className="text-cyan-400/80" />
                            {member.year}
                          </p>
                        </td>

                        {/* Club Role */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold border ${getRoleBadge(
                              member.role
                            )}`}
                          >
                            {member.role}
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(member.id)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-all ${
                              member.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                member.status === 'Active'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : 'bg-slate-500'
                              }`}
                            />
                            {member.status}
                          </button>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                          {new Date(member.joinedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(member)}
                              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              title="Edit member details"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setMemberToDelete(member)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remove member"
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
                        <Users size={36} className="mx-auto mb-3 text-slate-600" />
                        <p className="text-base font-semibold text-slate-300">
                          No member records matched your criteria
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                          Try adjusting search keywords or clearing department/role filters to explore registered club scholars.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </MotionSection>
      </Section>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#091224] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 overflow-hidden my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                  <UserPlus size={18} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {editingMember ? 'Edit Member Profile' : 'Register New Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramanujan Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Email <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. scholar@university.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Department & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Department <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  {formErrors.department && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Club Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="Member">Member</option>
                    <option value="Core Team">Core Team</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="President">President</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#050B16] bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-400/20"
                >
                  {editingMember ? 'Save Changes' : 'Register Member'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        title="Remove Member from Registry"
        message={`Are you sure you want to remove "${memberToDelete?.name}" (${memberToDelete?.email})? This action cannot be undone.`}
        confirmText="Remove Member"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}
