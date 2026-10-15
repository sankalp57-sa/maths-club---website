// ============================================================
// MathClub Nexus — Core Type Definitions
// ============================================================

export interface Participant {
  id: string;
  name: string;
  studentId: string;
  email: string;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  venue: string;
  capacity: number;
  registrations: string[]; // participant IDs
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: 'algebra' | 'probability' | 'number-theory' | 'logic';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  id: string;
  participantId: string;
  participantName: string;
  score: number;
  totalQuestions: number;
  answers: number[];
  timeTakenSeconds: number;
  completedAt: string;
}

export interface AttendanceRecord {
  eventId: string;
  participantId: string;
  status: 'present' | 'absent';
  markedAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'registration' | 'quiz' | 'attendance' | 'event';
  message: string;
  timestamp: string;
}

export interface AppState {
  participants: Participant[];
  events: Event[];
  quizAttempts: QuizAttempt[];
  attendance: AttendanceRecord[];
  activities: ActivityItem[];
}

export type NavSection = 'dashboard' | 'events' | 'quiz' | 'leaderboard' | 'attendance';
