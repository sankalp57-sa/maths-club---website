// ============================================================
// MathClub Nexus — LocalStorage Persistence Layer
// ============================================================

import type {
  AppState,
  Participant,
  Event,
  QuizAttempt,
  AttendanceRecord,
  ActivityItem,
  Member,
  Certificate,
  Feedback,
  MemberRole,
  MemberStatus,
  CertificateType,
  FeedbackCategoryRatings,
  User,
  UserRole,
  UserSession,
  Registration,
} from '../types';
import { generateDemoData } from '../data/demoData';

const STORAGE_KEY = 'mathclub_nexus_data';
const SESSION_KEY = 'mathclub_nexus_session';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed fresh default demo state
      const seed = generateDemoData();
      saveState(seed);
      return seed;
    }
    const parsed = JSON.parse(raw);
    const demo = generateDemoData();

    // Validate structure & safely migrate missing collections and fields
    const users: User[] = Array.isArray(parsed.users) && parsed.users.length > 0
      ? parsed.users
      : demo.users;

    const registrations: Registration[] = Array.isArray(parsed.registrations)
      ? parsed.registrations
      : (demo.registrations || []);

    const rawEvents: Event[] = Array.isArray(parsed.events) ? parsed.events : demo.events;
    const events: Event[] = rawEvents.map((e, idx) => ({
      ...e,
      fee: typeof e.fee === 'number' ? e.fee : (demo.events[idx]?.fee ?? 0),
      registrationDeadline: e.registrationDeadline || demo.events[idx]?.registrationDeadline || '',
      assignedTo: Array.isArray(e.assignedTo) && e.assignedTo.length > 0
        ? e.assignedTo
        : (demo.events[idx]?.assignedTo || []),
      registrations: Array.isArray(e.registrations) ? e.registrations : [],
    }));

    return {
      participants: Array.isArray(parsed.participants) ? parsed.participants : demo.participants,
      events,
      quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : demo.quizAttempts,
      attendance: Array.isArray(parsed.attendance) ? parsed.attendance : demo.attendance,
      activities: Array.isArray(parsed.activities) ? parsed.activities : demo.activities,
      members: Array.isArray(parsed.members) ? parsed.members : demo.members,
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : demo.certificates,
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : demo.feedback,
      users,
      registrations,
    };
  } catch (err) {
    console.error('Error loading state from localStorage, falling back to demo data:', err);
    const demo = generateDemoData();
    saveState(demo);
    return demo;
  }
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

// ---- Public Core API ----

export function getState(): AppState {
  return loadState();
}

export function resetState(actorRole?: UserRole): boolean {
  if (actorRole && actorRole !== 'president') {
    console.warn('Unauthorized: Only President can reset database state.');
    return false;
  }
  localStorage.removeItem(STORAGE_KEY);
  return true;
}

// ---- Session Storage API ----

export function getCurrentSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: UserSession = JSON.parse(raw);
    if (!session || !session.user || !session.user.id) return null;
    // Verify user is still active in current state
    const state = loadState();
    const current = state.users.find(u => u.id === session.user.id);
    if (!current || current.status === 'deactivated') {
      clearCurrentSession();
      return null;
    }
    return { ...session, user: current };
  } catch {
    clearCurrentSession();
    return null;
  }
}

export function saveCurrentSession(session: UserSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function clearCurrentSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ---- User & Account Management ----

export function getUsers(): User[] {
  return loadState().users;
}

export function getUserById(id: string): User | undefined {
  return loadState().users.find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  const norm = email.trim().toLowerCase();
  return loadState().users.find(u => u.email.trim().toLowerCase() === norm);
}

export function registerUser(user: {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  phone?: string;
  college?: string;
  department?: string;
  year?: string;
  linkedMemberId?: string;
}): { success: boolean; message: string; user?: User } {
  const state = loadState();
  const normEmail = user.email.trim().toLowerCase();

  if (state.users.some(u => u.email.trim().toLowerCase() === normEmail)) {
    return { success: false, message: 'An account with this email address already exists' };
  }

  // Self sign-ups can ONLY be participant
  const assignedRole: UserRole = user.role || 'participant';

  const newUser: User = {
    id: generateId(),
    name: user.name.trim(),
    email: user.email.trim(),
    passwordHash: user.passwordHash,
    role: assignedRole,
    phone: user.phone?.trim() || '',
    college: user.college?.trim() || 'MITS-DU Gwalior',
    department: user.department?.trim() || '',
    year: user.year?.trim() || '',
    linkedMemberId: user.linkedMemberId,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  // If registering as a participant, also create or link participant entry
  let participant = state.participants.find(p => p.email.toLowerCase() === normEmail);
  if (!participant) {
    participant = {
      id: generateId(),
      name: newUser.name,
      studentId: 'STU-' + Math.floor(100000 + Math.random() * 900000),
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
    state.participants.push(participant);
  }
  newUser.linkedParticipantId = participant.id;

  state.users.push(newUser);
  addActivity(
    state,
    'auth',
    `New ${assignedRole} account created for ${newUser.name}`,
    newUser.name,
    assignedRole
  );
  saveState(state);
  return { success: true, message: 'Account registered successfully', user: newUser };
}

export function updateUserRole(
  userId: string,
  newRole: UserRole,
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string; user?: User } {
  if (actor && actor.role !== 'president') {
    return { success: false, message: 'Access denied: Only President can manage user roles' };
  }

  const state = loadState();
  const user = state.users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found' };

  const prevRole = user.role;
  user.role = newRole;

  addActivity(
    state,
    'role',
    `${actor?.name || 'President'} changed role of ${user.name} from ${prevRole} to ${newRole}`,
    actor?.name || 'President',
    'president'
  );

  saveState(state);
  return { success: true, message: `Role updated to ${newRole}`, user };
}

export function resetUserPassword(
  userId: string,
  newPasswordHash: string,
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string } {
  if (actor && actor.role !== 'president') {
    return { success: false, message: 'Access denied: Only President can reset passwords' };
  }

  const state = loadState();
  const user = state.users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found' };

  user.passwordHash = newPasswordHash;
  addActivity(
    state,
    'auth',
    `Password reset for user ${user.name} by ${actor?.name || 'President'}`,
    actor?.name || 'President',
    'president'
  );

  saveState(state);
  return { success: true, message: `Password reset successfully for ${user.name}` };
}

export function toggleUserStatus(
  userId: string,
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string; user?: User } {
  if (actor && actor.role !== 'president') {
    return { success: false, message: 'Access denied: Only President can toggle user status' };
  }

  const state = loadState();
  const user = state.users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found' };

  user.status = user.status === 'deactivated' ? 'active' : 'deactivated';
  addActivity(
    state,
    'auth',
    `User ${user.name} marked as ${user.status} by ${actor?.name || 'President'}`,
    actor?.name || 'President',
    'president'
  );

  saveState(state);
  return { success: true, message: `User status set to ${user.status}`, user };
}

export function deleteUserAccount(
  userId: string,
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string } {
  if (actor && actor.role !== 'president') {
    return { success: false, message: 'Access denied: Only President can delete user accounts' };
  }

  const state = loadState();
  const idx = state.users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, message: 'User not found' };

  const name = state.users[idx].name;
  state.users.splice(idx, 1);
  addActivity(
    state,
    'auth',
    `Account ${name} permanently deleted by ${actor?.name || 'President'}`,
    actor?.name || 'President',
    'president'
  );

  saveState(state);
  return { success: true, message: `Account for ${name} deleted successfully` };
}

// ---- Participants ----

export function addParticipant(name: string, studentId: string, email: string): Participant {
  const state = loadState();
  const participant: Participant = {
    id: generateId(),
    name,
    studentId,
    email,
    createdAt: new Date().toISOString(),
  };
  state.participants.push(participant);
  addActivity(state, 'registration', `${name} registered as a new participant`);
  saveState(state);
  return participant;
}

export function getParticipant(id: string): Participant | undefined {
  return loadState().participants.find(p => p.id === id);
}

export function findParticipantByStudentId(studentId: string): Participant | undefined {
  return loadState().participants.find(p => p.studentId === studentId);
}

// ---- Events ----

export function addEvent(
  eventData: {
    name: string;
    description: string;
    date: string;
    venue: string;
    capacity: number;
    fee?: number;
    registrationDeadline?: string;
    assignedTo?: string[];
  },
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string; event?: Event } {
  if (actor && actor.role !== 'president' && actor.role !== 'core') {
    return { success: false, message: 'Access denied: Only President or Core Team can create events' };
  }

  const state = loadState();
  const newEvent: Event = {
    id: generateId(),
    name: eventData.name.trim(),
    description: eventData.description.trim(),
    date: eventData.date,
    venue: eventData.venue.trim(),
    capacity: Math.max(1, Number(eventData.capacity) || 50),
    fee: Math.max(0, Number(eventData.fee) || 0),
    registrationDeadline: eventData.registrationDeadline || '',
    assignedTo: Array.isArray(eventData.assignedTo) ? eventData.assignedTo : [],
    registrations: [],
    createdAt: new Date().toISOString(),
  };

  state.events.push(newEvent);
  addActivity(
    state,
    'event',
    `New event "${newEvent.name}" published (${newEvent.fee ? '₹' + newEvent.fee : 'Free'})`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return { success: true, message: `Event "${newEvent.name}" created successfully`, event: newEvent };
}

export function updateEvent(
  id: string,
  updates: Partial<Pick<Event, 'name' | 'description' | 'date' | 'venue' | 'capacity' | 'fee' | 'registrationDeadline' | 'assignedTo'>>,
  actor?: { name: string; role: UserRole }
): Event | null {
  if (actor && actor.role !== 'president' && actor.role !== 'core') {
    console.warn('Access denied: Only President or Core Team can edit events');
    return null;
  }

  const state = loadState();
  const idx = state.events.findIndex(e => e.id === id);
  if (idx === -1) return null;

  state.events[idx] = { ...state.events[idx], ...updates };
  addActivity(
    state,
    'event',
    `Event "${state.events[idx].name}" updated`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return state.events[idx];
}

export function deleteEvent(id: string, actor?: { name: string; role: UserRole }): boolean {
  if (actor && actor.role !== 'president') {
    console.warn('Access denied: Only President can delete events');
    return false;
  }

  const state = loadState();
  const idx = state.events.findIndex(e => e.id === id);
  if (idx === -1) return false;

  const name = state.events[idx].name;
  state.events.splice(idx, 1);
  state.attendance = state.attendance.filter(a => a.eventId !== id);
  state.registrations = state.registrations.filter(r => r.eventId !== id);

  addActivity(
    state,
    'event',
    `Event "${name}" deleted by ${actor?.name || 'President'}`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return true;
}

// ---- Registrations & Simulated Payment Flow ----

export function createRegistration(data: {
  eventId: string;
  userId: string;
  participantName: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  department: string;
  amount: number;
  paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Free';
  paymentStatus: 'paid' | 'free';
  transactionId: string;
}): { success: boolean; message: string; registration?: Registration } {
  const state = loadState();
  const event = state.events.find(e => e.id === data.eventId);
  if (!event) return { success: false, message: 'Event not found' };

  if (event.registrations.length >= event.capacity) {
    return { success: false, message: 'Event is already at full capacity' };
  }

  // Check deadline
  if (event.registrationDeadline) {
    const deadline = new Date(event.registrationDeadline + 'T23:59:59');
    if (new Date() > deadline) {
      return { success: false, message: 'Registration deadline for this event has passed' };
    }
  }

  // Check duplicate registration
  const normEmail = data.email.trim().toLowerCase();
  const isDuplicate = state.registrations.some(
    r => r.eventId === data.eventId && (r.userId === data.userId || r.email.trim().toLowerCase() === normEmail)
  );
  if (isDuplicate) {
    return { success: false, message: 'You have already registered for this event' };
  }

  // Ensure participant record exists
  let participant = state.participants.find(p => p.email.trim().toLowerCase() === normEmail);
  if (!participant) {
    participant = {
      id: generateId(),
      name: data.participantName.trim(),
      studentId: 'STU-' + Math.floor(100000 + Math.random() * 900000),
      email: data.email.trim(),
      createdAt: new Date().toISOString(),
    };
    state.participants.push(participant);
  }

  const registration: Registration = {
    id: generateId(),
    eventId: data.eventId,
    userId: data.userId,
    participantName: data.participantName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    college: data.college.trim(),
    year: data.year.trim(),
    department: data.department.trim(),
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentStatus,
    transactionId: data.transactionId,
    status: 'confirmed',
    attendanceStatus: 'pending',
    createdAt: new Date().toISOString(),
  };

  state.registrations.unshift(registration);
  if (!event.registrations.includes(participant.id)) {
    event.registrations.push(participant.id);
  }

  addActivity(
    state,
    'registration',
    `${data.participantName} registered for "${event.name}" (${data.amount > 0 ? 'Paid ₹' + data.amount : 'Free'})`,
    data.participantName,
    'participant'
  );

  saveState(state);
  return { success: true, message: `Successfully registered for ${event.name}!`, registration };
}

export function getRegistrationsForEvent(eventId: string): Registration[] {
  return loadState().registrations.filter(r => r.eventId === eventId);
}

export function getRegistrationsForUser(userId: string): Registration[] {
  return loadState().registrations.filter(r => r.userId === userId);
}

export function updateRegistrationStatus(
  registrationId: string,
  newStatus: 'confirmed' | 'rejected',
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string } {
  if (actor && actor.role === 'participant') {
    return { success: false, message: 'Access denied: Participants cannot approve or reject registrations' };
  }

  const state = loadState();
  const reg = state.registrations.find(r => r.id === registrationId);
  if (!reg) return { success: false, message: 'Registration record not found' };

  reg.status = newStatus;
  addActivity(
    state,
    'registration',
    `Registration for ${reg.participantName} marked as ${newStatus} by ${actor?.name || 'Club Member'}`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return { success: true, message: `Registration status updated to ${newStatus}` };
}

export function checkInParticipant(
  registrationId: string,
  attendanceStatus: 'present' | 'absent',
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string } {
  if (actor && actor.role === 'participant') {
    return { success: false, message: 'Access denied: Participants cannot check in other participants' };
  }

  const state = loadState();
  const reg = state.registrations.find(r => r.id === registrationId);
  if (!reg) return { success: false, message: 'Registration not found' };

  reg.attendanceStatus = attendanceStatus;
  if (attendanceStatus === 'present') {
    reg.checkedInAt = new Date().toISOString();
  }

  // Also sync with AttendanceRecord table
  const participant = state.participants.find(p => p.email.toLowerCase() === reg.email.toLowerCase());
  if (participant) {
    const existing = state.attendance.find(a => a.eventId === reg.eventId && a.participantId === participant.id);
    if (existing) {
      existing.status = attendanceStatus;
      existing.markedAt = new Date().toISOString();
    } else {
      state.attendance.push({
        eventId: reg.eventId,
        participantId: participant.id,
        status: attendanceStatus,
        markedAt: new Date().toISOString(),
      });
    }
  }

  addActivity(
    state,
    'attendance',
    `${reg.participantName} checked in (${attendanceStatus}) by ${actor?.name || 'Coordinator'}`,
    actor?.name,
    actor?.role
  );

  saveState(state);
  return { success: true, message: `Participant check-in recorded as ${attendanceStatus}` };
}

// ---- Member Assigned Events & Self-Attendance ----

export function markMemberSelfAttendance(
  eventId: string,
  memberId: string,
  memberName: string,
  actorRole: UserRole
): { success: boolean; message: string } {
  if (actorRole === 'participant') {
    return { success: false, message: 'Access denied: Only Club Members can mark member attendance' };
  }

  const state = loadState();
  const event = state.events.find(e => e.id === eventId);
  if (!event) return { success: false, message: 'Event not found' };

  // Check if existing attendance record exists for this member
  const existing = state.attendance.find(a => a.eventId === eventId && a.participantId === memberId);
  if (existing) {
    existing.status = 'present';
    existing.markedAt = new Date().toISOString();
  } else {
    state.attendance.push({
      eventId,
      participantId: memberId,
      status: 'present',
      markedAt: new Date().toISOString(),
    });
  }

  addActivity(
    state,
    'attendance',
    `Member ${memberName} marked their own attendance for "${event.name}"`,
    memberName,
    actorRole
  );

  saveState(state);
  return { success: true, message: `Your attendance has been recorded for ${event.name}` };
}

// Legacy event registration adapter for backwards compatibility
export function registerForEvent(
  eventId: string,
  participantName: string,
  studentId: string,
  email: string
): { success: boolean; message: string; participant?: Participant } {
  const state = loadState();
  const event = state.events.find(e => e.id === eventId);
  if (!event) return { success: false, message: 'Event not found' };
  if (event.registrations.length >= event.capacity) return { success: false, message: 'Event is at full capacity' };

  let participant = state.participants.find(p => p.studentId === studentId);
  if (!participant) {
    participant = {
      id: generateId(),
      name: participantName,
      studentId,
      email,
      createdAt: new Date().toISOString(),
    };
    state.participants.push(participant);
    addActivity(state, 'registration', `${participantName} registered as a new participant`);
  }

  if (event.registrations.includes(participant.id)) {
    return { success: false, message: 'Already registered for this event' };
  }

  event.registrations.push(participant.id);
  addActivity(state, 'registration', `${participantName} registered for "${event.name}"`);
  saveState(state);
  return { success: true, message: `Successfully registered for ${event.name}`, participant };
}

// ---- Quiz ----

export function addQuizAttempt(
  participantName: string,
  score: number,
  totalQuestions: number,
  answers: number[],
  timeTakenSeconds: number
): QuizAttempt {
  const state = loadState();

  let participant = state.participants.find(p => p.name.toLowerCase() === participantName.toLowerCase());
  if (!participant) {
    participant = {
      id: generateId(),
      name: participantName,
      studentId: 'QUIZ-' + generateId(),
      email: '',
      createdAt: new Date().toISOString(),
    };
    state.participants.push(participant);
  }

  const existing = state.quizAttempts.find(a => a.participantId === participant!.id);
  if (existing) {
    if (score > existing.score || (score === existing.score && timeTakenSeconds < existing.timeTakenSeconds)) {
      existing.score = score;
      existing.answers = answers;
      existing.timeTakenSeconds = timeTakenSeconds;
      existing.completedAt = new Date().toISOString();
      addActivity(state, 'quiz', `${participantName} improved their quiz score to ${score}/${totalQuestions}`);
      saveState(state);
      return existing;
    }
    saveState(state);
    return existing;
  }

  const attempt: QuizAttempt = {
    id: generateId(),
    participantId: participant.id,
    participantName,
    score,
    totalQuestions,
    answers,
    timeTakenSeconds,
    completedAt: new Date().toISOString(),
  };
  state.quizAttempts.push(attempt);
  addActivity(state, 'quiz', `${participantName} scored ${score}/${totalQuestions} on the quiz`);
  saveState(state);
  return attempt;
}

export function hasAttemptedQuiz(participantName: string): boolean {
  const state = loadState();
  const participant = state.participants.find(p => p.name.toLowerCase() === participantName.toLowerCase());
  if (!participant) return false;
  return state.quizAttempts.some(a => a.participantId === participant.id);
}

// ---- Attendance ----

export function markAttendance(
  eventId: string,
  participantId: string,
  status: 'present' | 'absent',
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string } {
  if (actor && (actor.role === 'member' || actor.role === 'participant')) {
    return { success: false, message: 'Access denied: Only President or Core Team can mark club attendance' };
  }

  const state = loadState();
  const existing = state.attendance.find(a => a.eventId === eventId && a.participantId === participantId);
  if (existing) {
    existing.status = status;
    existing.markedAt = new Date().toISOString();
  } else {
    state.attendance.push({
      eventId,
      participantId,
      status,
      markedAt: new Date().toISOString(),
    });
  }
  const participant = state.participants.find(p => p.id === participantId) || state.members.find(m => m.id === participantId);
  addActivity(
    state,
    'attendance',
    `${participant?.name || 'Member'} marked ${status} by ${actor?.name || 'Core Officer'}`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return { success: true, message: `Attendance marked as ${status}` };
}

export function getAttendanceForEvent(eventId: string): AttendanceRecord[] {
  return loadState().attendance.filter(a => a.eventId === eventId);
}

// ---- Member Directory ----

export function addMember(
  member: {
    name: string;
    email: string;
    department: string;
    year: string;
    role: MemberRole;
    status: MemberStatus;
  },
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string; member?: Member } {
  if (actor && actor.role !== 'president' && actor.role !== 'core') {
    return { success: false, message: 'Access denied: Only President or Core Team can add members' };
  }

  const state = loadState();
  const emailNorm = member.email.trim().toLowerCase();
  if (state.members.some(m => m.email.trim().toLowerCase() === emailNorm)) {
    return { success: false, message: 'A member with this email address already exists in the club directory' };
  }

  const newMember: Member = {
    id: generateId(),
    name: member.name.trim(),
    email: member.email.trim(),
    department: member.department.trim(),
    year: member.year,
    role: member.role,
    status: member.status,
    joinedAt: new Date().toISOString(),
  };

  state.members.push(newMember);
  addActivity(
    state,
    'member',
    `${newMember.name} joined as ${newMember.role} (${newMember.department})`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return { success: true, message: `Member "${newMember.name}" successfully registered`, member: newMember };
}

export function updateMember(
  id: string,
  updates: Partial<Pick<Member, 'name' | 'email' | 'department' | 'year' | 'role' | 'status'>>,
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string; member?: Member } {
  if (actor && actor.role !== 'president' && actor.role !== 'core') {
    return { success: false, message: 'Access denied: Only President or Core Team can update members' };
  }

  // Core cannot change roles
  if (updates.role && actor && actor.role === 'core') {
    return { success: false, message: 'Access denied: Only President can change member roles' };
  }

  const state = loadState();
  const idx = state.members.findIndex(m => m.id === id);
  if (idx === -1) return { success: false, message: 'Member record not found' };

  if (updates.email) {
    const emailNorm = updates.email.trim().toLowerCase();
    if (state.members.some(m => m.id !== id && m.email.trim().toLowerCase() === emailNorm)) {
      return { success: false, message: 'Another member is already registered with this email address' };
    }
  }

  state.members[idx] = { ...state.members[idx], ...updates };
  addActivity(
    state,
    'member',
    `Member directory record for ${state.members[idx].name} updated`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return { success: true, message: 'Member profile updated successfully', member: state.members[idx] };
}

export function toggleMemberStatus(
  id: string,
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string; member?: Member } {
  if (actor && actor.role !== 'president' && actor.role !== 'core') {
    return { success: false, message: 'Access denied: Insufficient permissions' };
  }

  const state = loadState();
  const idx = state.members.findIndex(m => m.id === id);
  if (idx === -1) return { success: false, message: 'Member not found' };

  const newStatus: MemberStatus = state.members[idx].status === 'Active' ? 'Inactive' : 'Active';
  state.members[idx].status = newStatus;
  addActivity(
    state,
    'member',
    `${state.members[idx].name} status updated to ${newStatus}`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return { success: true, message: `Member status toggled to ${newStatus}`, member: state.members[idx] };
}

export function deleteMember(id: string, actor?: { name: string; role: UserRole }): boolean {
  if (actor && actor.role !== 'president') {
    console.warn('Access denied: Only President can delete members');
    return false;
  }

  const state = loadState();
  const idx = state.members.findIndex(m => m.id === id);
  if (idx === -1) return false;

  const name = state.members[idx].name;
  state.members.splice(idx, 1);
  addActivity(
    state,
    'member',
    `Member ${name} removed from registry by ${actor?.name || 'President'}`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return true;
}

// ---- Certificates ----

export function generateCertificateCode(existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(4, '0');
  return `MCN-${year}-${seq}`;
}

export function issueCertificate(
  participantName: string,
  eventId: string,
  type: CertificateType,
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string; certificate?: Certificate } {
  if (actor && actor.role !== 'president' && actor.role !== 'core') {
    return { success: false, message: 'Access denied: Only President or Core Team can issue certificates' };
  }

  const state = loadState();
  const normName = participantName.trim().toLowerCase();
  const duplicate = state.certificates.some(
    c => c.eventId === eventId && c.type === type && c.participantName.trim().toLowerCase() === normName
  );
  if (duplicate) {
    return { success: false, message: `A ${type} certificate has already been issued to ${participantName} for this event` };
  }

  const code = generateCertificateCode(state.certificates.length);
  const certificate: Certificate = {
    id: generateId(),
    participantName: participantName.trim(),
    eventId,
    type,
    issuedAt: new Date().toISOString(),
    certificateCode: code,
  };
  state.certificates.unshift(certificate);
  addActivity(
    state,
    'certificate',
    `Issued ${type} Certificate (${code}) to ${participantName.trim()}`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return { success: true, message: `Certificate issued successfully (${code})`, certificate };
}

export function issueCertificatesBatch(
  items: Array<{ participantName: string; eventId: string; type: CertificateType }>,
  actor?: { name: string; role: UserRole }
): { count: number; skipped: number } {
  if (actor && actor.role !== 'president' && actor.role !== 'core') {
    return { count: 0, skipped: items.length };
  }

  const state = loadState();
  let count = 0;
  let skipped = 0;

  for (const item of items) {
    const normName = item.participantName.trim().toLowerCase();
    const duplicate = state.certificates.some(
      c => c.eventId === item.eventId && c.type === item.type && c.participantName.trim().toLowerCase() === normName
    );
    if (duplicate) {
      skipped++;
      continue;
    }

    const code = generateCertificateCode(state.certificates.length + count);
    const certificate: Certificate = {
      id: generateId(),
      participantName: item.participantName.trim(),
      eventId: item.eventId,
      type: item.type,
      issuedAt: new Date().toISOString(),
      certificateCode: code,
    };
    state.certificates.unshift(certificate);
    count++;
  }

  if (count > 0) {
    addActivity(
      state,
      'certificate',
      `Batch issued ${count} certificates to eligible scholars`,
      actor?.name,
      actor?.role
    );
    saveState(state);
  }
  return { count, skipped };
}

export function revokeCertificate(id: string, actor?: { name: string; role: UserRole }): boolean {
  if (actor && actor.role !== 'president' && actor.role !== 'core') {
    console.warn('Access denied: Only President or Core Team can revoke certificates');
    return false;
  }

  const state = loadState();
  const idx = state.certificates.findIndex(c => c.id === id);
  if (idx === -1) return false;

  const cert = state.certificates[idx];
  state.certificates.splice(idx, 1);
  addActivity(
    state,
    'certificate',
    `Revoked ${cert.type} certificate (${cert.certificateCode}) for ${cert.participantName}`,
    actor?.name,
    actor?.role
  );
  saveState(state);
  return true;
}

export function verifyCertificate(code: string): { valid: boolean; certificate?: Certificate; event?: Event } {
  const state = loadState();
  const cert = state.certificates.find(c => c.certificateCode.trim().toUpperCase() === code.trim().toUpperCase());
  if (!cert) return { valid: false };
  const event = state.events.find(e => e.id === cert.eventId);
  return { valid: true, certificate: cert, event };
}

// ---- Feedback ----

export function addFeedback(
  feedback: {
    eventId: string;
    participantName?: string;
    rating: number;
    categoryRatings: FeedbackCategoryRatings;
    comment: string;
    anonymous: boolean;
  },
  actor?: { name: string; role: UserRole }
): { success: boolean; message: string; feedback?: Feedback } {
  const state = loadState();
  const event = state.events.find(e => e.id === feedback.eventId);
  if (!event) {
    return { success: false, message: 'Invalid event specified' };
  }

  // Validate 1 feedback per participant per event when not anonymous
  if (!feedback.anonymous && feedback.participantName) {
    const normName = feedback.participantName.trim().toLowerCase();
    const duplicate = state.feedback.some(
      f => f.eventId === feedback.eventId && !f.anonymous && f.participantName?.trim().toLowerCase() === normName
    );
    if (duplicate) {
      return { success: false, message: 'You have already submitted feedback for this event' };
    }
  }

  const newFeedback: Feedback = {
    id: generateId(),
    eventId: feedback.eventId,
    participantName: feedback.anonymous ? undefined : feedback.participantName?.trim(),
    rating: Math.max(1, Math.min(5, feedback.rating)),
    categoryRatings: {
      content: Math.max(1, Math.min(5, feedback.categoryRatings.content)),
      organization: Math.max(1, Math.min(5, feedback.categoryRatings.organization)),
      difficulty: Math.max(1, Math.min(5, feedback.categoryRatings.difficulty)),
    },
    comment: feedback.comment.trim(),
    anonymous: feedback.anonymous,
    submittedAt: new Date().toISOString(),
  };

  state.feedback.unshift(newFeedback);
  const author = feedback.anonymous ? 'Anonymous Scholar' : (feedback.participantName || 'Scholar');
  addActivity(
    state,
    'feedback',
    `${author} submitted ${feedback.rating}★ feedback for "${event.name}"`,
    actor?.name || author,
    actor?.role || 'participant'
  );
  saveState(state);
  return { success: true, message: 'Thank you! Your feedback has been recorded successfully.', feedback: newFeedback };
}

// ---- Activity Feed ----

function addActivity(
  state: AppState,
  type: ActivityItem['type'],
  message: string,
  actorName?: string,
  actorRole?: UserRole
): void {
  state.activities.unshift({
    id: generateId(),
    type,
    message,
    actorName,
    actorRole,
    timestamp: new Date().toISOString(),
  });
  if (state.activities.length > 60) {
    state.activities = state.activities.slice(0, 60);
  }
}

export function logActivity(
  type: ActivityItem['type'],
  message: string,
  actorName?: string,
  actorRole?: UserRole
): void {
  const state = loadState();
  addActivity(state, type, message, actorName, actorRole);
  saveState(state);
}

export { generateId };
