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
  type: 'registration' | 'quiz' | 'attendance' | 'event' | 'member' | 'certificate' | 'feedback';
  message: string;
  timestamp: string;
}

export type MemberRole = 'Member' | 'Core Team' | 'Coordinator' | 'President';
export type MemberStatus = 'Active' | 'Inactive';

export interface Member {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}

export type CertificateType = 'Participation' | 'Winner' | 'Runner-up' | 'Quiz Excellence';

export interface Certificate {
  id: string;
  participantName: string;
  eventId: string;
  type: CertificateType;
  issuedAt: string;
  certificateCode: string; // e.g. MCN-2026-0001
}

export interface FeedbackCategoryRatings {
  content: number;
  organization: number;
  difficulty: number;
}

export interface Feedback {
  id: string;
  eventId: string;
  participantName?: string;
  rating: number;
  categoryRatings: FeedbackCategoryRatings;
  comment: string;
  anonymous: boolean;
  submittedAt: string;
}

export interface AppState {
  participants: Participant[];
  events: Event[];
  quizAttempts: QuizAttempt[];
  attendance: AttendanceRecord[];
  activities: ActivityItem[];
  members: Member[];
  certificates: Certificate[];
  feedback: Feedback[];
}

export type NavSection =
  | 'dashboard'
  | 'events'
  | 'quiz'
  | 'leaderboard'
  | 'attendance'
  | 'members'
  | 'certificates'
  | 'feedback';
