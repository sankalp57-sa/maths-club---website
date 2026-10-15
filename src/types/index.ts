// ============================================================
// MathClub Nexus — Core Type Definitions
// ============================================================

export type UserRole = 'president' | 'core' | 'member' | 'participant';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  linkedMemberId?: string;
  linkedParticipantId?: string;
  phone?: string;
  college?: string;
  department?: string;
  year?: string;
  status?: 'active' | 'deactivated';
  createdAt: string;
}

export interface UserSession {
  user: User;
  loginTime: string;
}

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
  fee?: number; // 0 = free
  registrationDeadline?: string;
  assignedTo?: string[]; // member IDs
  registrations: string[]; // participant IDs or registration IDs
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  participantName: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  department: string;
  amount: number;
  paymentMethod?: 'UPI' | 'Card' | 'Net Banking' | 'Free';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'free';
  transactionId: string;
  status: 'pending' | 'confirmed' | 'rejected';
  attendanceStatus?: 'present' | 'absent' | 'pending';
  checkedInAt?: string;
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
  type:
    | 'registration'
    | 'quiz'
    | 'attendance'
    | 'event'
    | 'member'
    | 'certificate'
    | 'feedback'
    | 'auth'
    | 'payment'
    | 'role';
  message: string;
  actorName?: string;
  actorRole?: UserRole;
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
  users: User[];
  registrations: Registration[];
}

export type NavSection =
  | 'dashboard'
  | 'events'
  | 'quiz'
  | 'leaderboard'
  | 'attendance'
  | 'members'
  | 'certificates'
  | 'feedback'
  | 'my-events'
  | 'my-registrations'
  | 'users'
  | 'login'
  | 'signup';
