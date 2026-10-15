// ============================================================
// MathClub Nexus — Main Application Container
// ============================================================

import { useState, useCallback } from 'react';
import type { NavSection, AppState } from './types';
import { getState, resetState } from './utils/storage';
import { generateDemoData } from './data/demoData';
import { ToastProvider, useToast } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import EventsPage from './pages/Events';
import QuizPage from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import AttendancePage from './pages/Attendance';

import { motion, AnimatePresence } from 'motion/react';
import MathParticleField from './components/MathParticleField';
import { pageTransitionVariants } from './motion/motionTokens';

function AppContent() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [data, setData] = useState<AppState>(getState());

  const refreshData = useCallback(() => {
    setData(getState());
  }, []);

  const handleLoadDemo = () => {
    const demoData = generateDemoData();
    localStorage.setItem('mathclub_nexus_data', JSON.stringify(demoData));
    refreshData();
    showToast('info', 'Demo data synchronized: 8 participants, 4 events, 6 quiz records');
  };

  const handleReset = () => {
    resetState();
    refreshData();
    showToast('info', 'Local prototype state has been cleared');
  };

  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard data={data} onNavigate={setActiveSection} />;
      case 'events':
        return <EventsPage data={data} onDataChange={refreshData} />;
      case 'quiz':
        return <QuizPage data={data} onDataChange={refreshData} />;
      case 'leaderboard':
        return <Leaderboard data={data} />;
      case 'attendance':
        return <AttendancePage data={data} onDataChange={refreshData} />;
      default:
        return <Dashboard data={data} onNavigate={setActiveSection} />;
    }
  };

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
        onNavigate={setActiveSection}
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
      <Footer onNavigate={setActiveSection} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
