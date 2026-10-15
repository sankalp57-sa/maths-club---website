// ============================================================
// MathClub Nexus — Role-Based Authentication Context
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, UserSession } from '../types';
import {
  getCurrentSession,
  saveCurrentSession,
  clearCurrentSession,
  getUserByEmail,
  registerUser,
  logActivity,
} from '../utils/storage';
import { hashPassword } from '../utils/crypto';

interface AuthContextType {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string, requiredRole: UserRole) => Promise<{ success: boolean; message?: string }>;
  signup: (data: { name: string; email: string; phone: string; college: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  can: (action: string) => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatRoleName(role: UserRole): string {
  switch (role) {
    case 'president':
      return 'President';
    case 'core':
      return 'Core Member';
    case 'member':
      return 'Member';
    case 'participant':
      return 'User';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(() => getCurrentSession());

  const refreshUser = useCallback(() => {
    const current = getCurrentSession();
    setSession(current);
  }, []);

  useEffect(() => {
    // Initial check
    const current = getCurrentSession();
    setSession(current);
  }, []);

  const login = async (
    email: string,
    password: string,
    requiredRole: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    if (!email.trim() || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }

    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'No registered account found with this email address.' };
    }

    if (user.status === 'deactivated') {
      return {
        success: false,
        message: 'This account has been deactivated. Please contact the Club President.',
      };
    }

    // Role check: A login only succeeds if the account's role equals the selected card
    if (user.role !== requiredRole) {
      return {
        success: false,
        message: `This account is not registered as ${formatRoleName(requiredRole)}.`,
      };
    }

    const hashed = await hashPassword(password);
    if (user.passwordHash !== hashed) {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }

    const newSession: UserSession = {
      user,
      loginTime: new Date().toISOString(),
    };

    saveCurrentSession(newSession);
    setSession(newSession);

    logActivity('auth', `${user.name} logged in as ${formatRoleName(user.role)}`, user.name, user.role);

    return { success: true };
  };

  const signup = async (data: {
    name: string;
    email: string;
    phone: string;
    college: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!data.name.trim() || !data.email.trim() || !data.password) {
      return { success: false, message: 'Name, email, and password are required.' };
    }

    const hashed = await hashPassword(data.password);
    const result = registerUser({
      name: data.name,
      email: data.email,
      passwordHash: hashed,
      phone: data.phone,
      college: data.college,
      role: 'participant',
    });

    if (!result.success || !result.user) {
      return { success: false, message: result.message };
    }

    const newSession: UserSession = {
      user: result.user,
      loginTime: new Date().toISOString(),
    };

    saveCurrentSession(newSession);
    setSession(newSession);

    logActivity('auth', `${result.user.name} registered and logged in as Participant`, result.user.name, 'participant');

    return { success: true, message: 'Account created successfully!' };
  };

  const logout = () => {
    if (session?.user) {
      logActivity(
        'auth',
        `${session.user.name} logged out`,
        session.user.name,
        session.user.role
      );
    }
    clearCurrentSession();
    setSession(null);
  };

  const can = (action: string): boolean => {
    if (!session?.user) return false;
    const role = session.user.role;

    switch (action) {
      case 'view_admin_dashboard':
        return role === 'president' || role === 'core' || role === 'member';

      case 'create_event':
      case 'edit_event':
      case 'assign_event':
        return role === 'president' || role === 'core';

      case 'delete_event':
        return role === 'president';

      case 'mark_club_attendance':
        return role === 'president' || role === 'core';

      case 'mark_own_attendance':
        return role === 'president' || role === 'core' || role === 'member';

      case 'manage_participants':
      case 'check_in_participants':
        return role === 'president' || role === 'core' || role === 'member';

      case 'view_feedback_reviews':
        return role === 'president' || role === 'core' || role === 'member';

      case 'issue_certificates':
      case 'revoke_certificates':
        return role === 'president' || role === 'core';

      case 'download_own_certificate':
        return true;

      case 'view_members':
        return role === 'president' || role === 'core' || role === 'member';

      case 'add_edit_members':
        return role === 'president' || role === 'core';

      case 'delete_members':
      case 'change_member_roles':
      case 'export_members':
        return role === 'president';

      case 'manage_users':
        return role === 'president';

      case 'reset_demo_data':
        return role === 'president';

      case 'register_event':
        return role === 'participant';

      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isAuthenticated: !!session?.user,
        role: session?.user?.role || null,
        login,
        signup,
        logout,
        can,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
