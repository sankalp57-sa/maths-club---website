// ============================================================
// MathClub Nexus — Executive User & Role Management Portal
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Crown,
  Users,
  User as UserIcon,
  Search,
  KeyRound,
  Trash2,
  UserX,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Lock,
  X,
  Mail,
  Building,
  Calendar,
} from 'lucide-react';
import type { AppState, User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  updateUserRole,
  resetUserPassword,
  toggleUserStatus,
  deleteUserAccount,
} from '../utils/storage';
import { hashPassword } from '../utils/crypto';
import Section from '../components/Section';
import ConfirmDialog from '../components/ConfirmDialog';

interface UserManagementProps {
  data: AppState;
  onDataChange: () => void;
}

export default function UserManagement({ data, onDataChange }: UserManagementProps) {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('Math@123');
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null);

  // Filter accounts
  const filteredUsers = data.users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.college && u.college.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!currentUser) return;
    const res = updateUserRole(userId, newRole, {
      name: currentUser.name,
      role: currentUser.role,
    });
    if (res.success) {
      showToast('success', res.message);
      onDataChange();
    } else {
      showToast('error', res.message);
    }
  };

  const handleToggleStatus = (u: User) => {
    if (!currentUser) return;
    if (u.id === currentUser.id) {
      showToast('error', 'You cannot deactivate your own executive account.');
      return;
    }
    const res = toggleUserStatus(u.id, {
      name: currentUser.name,
      role: currentUser.role,
    });
    if (res.success) {
      showToast('info', res.message);
      onDataChange();
    } else {
      showToast('error', res.message);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPasswordReset || !currentUser) return;

    if (!newPassword || newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters.');
      return;
    }

    const hashed = await hashPassword(newPassword);
    const res = resetUserPassword(selectedUserForPasswordReset.id, hashed, {
      name: currentUser.name,
      role: currentUser.role,
    });

    if (res.success) {
      showToast('success', res.message);
      setSelectedUserForPasswordReset(null);
      setNewPassword('Math@123');
      onDataChange();
    } else {
      showToast('error', res.message);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialogUser || !currentUser) return;
    if (deleteDialogUser.id === currentUser.id) {
      showToast('error', 'You cannot delete your own executive account.');
      return;
    }

    const res = deleteUserAccount(deleteDialogUser.id, {
      name: currentUser.name,
      role: currentUser.role,
    });

    if (res.success) {
      showToast('success', res.message);
      setDeleteDialogUser(null);
      onDataChange();
    } else {
      showToast('error', res.message);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'president':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold';
      case 'core':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold';
      case 'member':
        return 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-semibold';
      case 'participant':
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-medium';
    }
  };

  return (
    <Section
      title="User & Access Governance"
      subtitle="Executive management for platform credentials, privilege tiers, security auditing, and password resets"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#091224] border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Accounts</p>
            <p className="text-xl font-bold text-white">{data.users.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#091224] border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Crown size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Presidents</p>
            <p className="text-xl font-bold text-white">
              {data.users.filter((u) => u.role === 'president').length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#091224] border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Core Officers</p>
            <p className="text-xl font-bold text-white">
              {data.users.filter((u) => u.role === 'core').length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#091224] border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Participants</p>
            <p className="text-xl font-bold text-white">
              {data.users.filter((u) => u.role === 'participant').length}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account by scholar name, email, or college..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['all', 'president', 'core', 'member', 'participant'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#091224] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Account User</th>
              <th className="py-3 px-4">Current Role Tier</th>
              <th className="py-3 px-4">Promote / Demote</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredUsers.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                        <p className="text-[10px] text-slate-500">{u.college || 'MITS-DU Gwalior'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-mono border ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 disabled:opacity-40 cursor-pointer"
                    >
                      <option value="president">President</option>
                      <option value="core">Core Member</option>
                      <option value="member">Member</option>
                      <option value="participant">Participant</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        u.status === 'deactivated'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {u.status === 'deactivated' ? 'Deactivated' : 'Active'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    {/* Reset Password Button */}
                    <button
                      onClick={() => setSelectedUserForPasswordReset(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                      title="Reset Account Password"
                    >
                      <KeyRound size={15} />
                    </button>

                    {/* Toggle Status (Active / Deactivated) */}
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={isSelf}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors disabled:opacity-30"
                      title={u.status === 'deactivated' ? 'Activate Account' : 'Deactivate Account'}
                    >
                      {u.status === 'deactivated' ? <UserCheck size={15} /> : <UserX size={15} />}
                    </button>

                    {/* Delete Account */}
                    <button
                      onClick={() => setDeleteDialogUser(u)}
                      disabled={isSelf}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors disabled:opacity-30"
                      title="Permanently Delete Account"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {selectedUserForPasswordReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#091224] border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setSelectedUserForPasswordReset(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <KeyRound size={22} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    Reset User Password
                  </h4>
                  <p className="text-xs text-slate-400">
                    For <span className="text-cyan-300 font-semibold">{selectedUserForPasswordReset.name}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    New Account Password
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Will be securely hashed using Web Crypto SHA-256 before storage.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPassword('Math@123')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700"
                  >
                    Set to default: Math@123
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForPasswordReset(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
                  >
                    Apply New Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User ConfirmDialog */}
      <ConfirmDialog
        isOpen={!!deleteDialogUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the account for "${deleteDialogUser?.name}" (${deleteDialogUser?.email})? This action cannot be undone.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogUser(null)}
      />
    </Section>
  );
}
