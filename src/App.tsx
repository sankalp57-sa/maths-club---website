// ============================================================
// MathClub Nexus — Main Application Container & Route Governance
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type { NavSection, AppState, UserRole } from './types';
import { getState, resetState, getCurrentSession } from './utils/storage';
import { generateDemoData } from './data/demoData';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/Events';
import QuizPage from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import AttendancePage from './pages/Attendance';
import MembersPage from './pages/Members';
import CertificatesPage from './pages/Certificates';
import FeedbackPage from './pages/Feedback';
import MyAssignedEventsPage from './pages/MyAssignedEvents';
import MyRegistrationsPage from './pages/MyRegistrations';
import UserManagementPage from './pages/UserManagement';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';

import { motion, AnimatePresence } from 'motion/react';
import MathParticleField from './components/MathParticleField';
import { pageTransitionVariants } from './motion/motionTokens';

function getRoleHome(role?: UserRole | null): NavSection {
  switch (role) {
    case 'president':
    case 'core':
      return 'dashboard';
    case 'member':
      return 'my-events';
    case 'participant':
      return 'my-registrations';
    default:
      return 'dashboard';
  }
}

function AppContent() {
  const { role, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState<NavSection>(() => {
    const current = getCurrentSession();
    if (!current) return 'login';
    return getRoleHome(current.user.role);
  });

  const [targetRedirect, setTargetRedirect] = useState<NavSection | undefined>(undefined);
  const [data, setData] = useState<AppState>(getState());

  const refreshData = useCallback(() => {
    setData(getState());
  }, []);

  // Sync active section when auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      if (activeSection !== 'signup') {
        setActiveSection('login');
      }
    } else {
      if (activeSection === 'login' || activeSection === 'signup') {
        setActiveSection(getRoleHome(role));
      }
    }
  }, [isAuthenticated, role, activeSection]);

  const handleNavigate = useCallback(
    (section: NavSection) => {
      // If user is not logged in:
      if (!isAuthenticated) {
        if (section === 'signup') {
          setActiveSection('signup');
        } else {
          setTargetRedirect(section !== 'login' ? section : undefined);
          setActiveSection('login');
          if (section !== 'login') {
            showToast('error', 'Please log in to access this section.');
          }
        }
        return;
      }

      // If user is authenticated and navigating to login/signup:
      if (section === 'login' || section === 'signup') {
        setActiveSection(getRoleHome(role));
        return;
      }

      // Role permission checks (Matrix enforcement)
      if (section === 'users') {
        if (role !== 'president') {
          showToast('error', 'Access denied. User & Role Management requires President authorization.');
          return;
        }
      }

      if (section === 'attendance') {
        if (role !== 'president' && role !== 'core') {
          showToast('error', 'Access denied. Attendance logging requires Core or President privileges.');
          return;
        }
      }

      if (section === 'members') {
        if (role === 'participant') {
          showToast('error', 'Access denied. Member Directory is restricted to club staff.');
          return;
        }
      }

      if (section === 'my-events') {
        if (role === 'participant') {
          showToast('error', 'Access denied. Assigned Events portal is restricted to club staff.');
          setActiveSection('my-registrations');
          return;
        }
      }

      setActiveSection(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [isAuthenticated, role, showToast]
  );

  const handleLoadDemo = () => {
    if (role !== 'president') {
      showToast('error', 'Permission denied. Only President can reload demo data.');
      return;
    }
    const demoData = generateDemoData();
    localStorage.setItem('mathclub_nexus_data', JSON.stringify(demoData));
    refreshData();
    showToast(
      'info',
      'Demo data synchronized: 8 participants, 4 events, 6 members, 4 certificates, 6 reviews'
    );
  };

  const handleReset = () => {
    if (role !== 'president') {
      showToast('error', 'Permission denied. Only President can reset prototype state.');
      return;
    }
    resetState();
    refreshData();
    showToast('info', 'Local prototype state has been cleared');
  };

  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard data={data} onNavigate={handleNavigate} />;
      case 'events':
        return <EventsPage data={data} onDataChange={refreshData} onNavigate={handleNavigate} />;
      case 'quiz':
        return <QuizPage data={data} onDataChange={refreshData} />;
      case 'leaderboard':
        return <Leaderboard data={data} />;
      case 'attendance':
        return <AttendancePage data={data} onDataChange={refreshData} />;
      case 'members':
        return <MembersPage data={data} onDataChange={refreshData} />;
      case 'certificates':
        return <CertificatesPage data={data} onDataChange={refreshData} />;
      case 'feedback':
        return <FeedbackPage data={data} onDataChange={refreshData} />;
      case 'my-events':
        return <MyAssignedEventsPage data={data} onDataChange={refreshData} onNavigate={handleNavigate} />;
      case 'my-registrations':
        return <MyRegistrationsPage data={data} onDataChange={refreshData} onNavigate={handleNavigate} />;
      case 'users':
        return <UserManagementPage data={data} onDataChange={refreshData} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} targetRedirect={targetRedirect} />;
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} />;
      default:
        return <Dashboard data={data} onNavigate={handleNavigate} />;
    }
  };

  // If user is not authenticated: show Login or Signup screen ONLY. No Navbar, no Footer!
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050B16] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-white">
        {activeSection === 'signup' ? (
          <SignupPage onNavigate={handleNavigate} />
        ) : (
          <LoginPage onNavigate={handleNavigate} targetRedirect={targetRedirect} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B16] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-white">
      {/* Background ambient lighting & subtle geometric grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle coordinate dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 217, 245, 0.5) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Mathematical Particle Field */}
        <MathParticleField />

        {/* Cinematic atmospheric glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-cyan-500/[0.07] rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-blue-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-teal-500/[0.04] rounded-full blur-[120px]" />

        {/* Restrained mathematical watermarks */}
        <div className="absolute top-32 right-12 text-[180px] font-serif text-cyan-400/[0.015] select-none leading-none">∑</div>
        <div className="absolute top-1/2 left-8 text-[160px] font-serif text-blue-400/[0.015] select-none leading-none">∫</div>
        <div className="absolute bottom-32 right-1/4 text-[130px] font-serif text-cyan-400/[0.015] select-none leading-none">π</div>
      </div>

      {/* Top Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
      />

      {/* Main Page Content with smooth page transition */}
      <main className="flex-1 w-full pt-24 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            variants={pageTransitionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Cinematic Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
