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
} from '../types';

const STORAGE_KEY = 'mathclub_nexus_data';

const defaultState: AppState = {
  participants: [],
  events: [],
  quizAttempts: [],
  attendance: [],
  activities: [],
  members: [],
  certificates: [],
  feedback: [],
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    // Validate structure & safely migrate missing collections
    return {
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
      attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      members: Array.isArray(parsed.members) ? parsed.members : [],
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { ...defaultState };
  }
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save state to localStorage');
  }
}

// ---- Public API ----

export function getState(): AppState {
  return loadState();
}

export function resetState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Participants
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

// Events
export function addEvent(name: string, description: string, date: string, venue: string, capacity: number): Event {
  const state = loadState();
  const event: Event = {
    id: generateId(),
    name,
    description,
    date,
    venue,
    capacity,
    registrations: [],
    createdAt: new Date().toISOString(),
  };
  state.events.push(event);
  addActivity(state, 'event', `New event "${name}" created`);
  saveState(state);
  return event;
}

export function updateEvent(id: string, updates: Partial<Pick<Event, 'name' | 'description' | 'date' | 'venue' | 'capacity'>>): Event | null {
  const state = loadState();
  const idx = state.events.findIndex(e => e.id === id);
  if (idx === -1) return null;
  state.events[idx] = { ...state.events[idx], ...updates };
  addActivity(state, 'event', `Event "${state.events[idx].name}" updated`);
  saveState(state);
  return state.events[idx];
}

export function deleteEvent(id: string): boolean {
  const state = loadState();
  const idx = state.events.findIndex(e => e.id === id);
  if (idx === -1) return false;
  const name = state.events[idx].name;
  state.events.splice(idx, 1);
  // Also remove attendance records for this event
  state.attendance = state.attendance.filter(a => a.eventId !== id);
  addActivity(state, 'event', `Event "${name}" deleted`);
  saveState(state);
  return true;
}

export function registerForEvent(eventId: string, participantName: string, studentId: string, email: string): { success: boolean; message: string; participant?: Participant } {
  const state = loadState();
  const event = state.events.find(e => e.id === eventId);
  if (!event) return { success: false, message: 'Event not found' };
  if (event.registrations.length >= event.capacity) return { success: false, message: 'Event is at full capacity' };

  // Find or create participant
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

  // Check duplicate
  if (event.registrations.includes(participant.id)) {
    return { success: false, message: 'Already registered for this event' };
  }

  event.registrations.push(participant.id);
  addActivity(state, 'registration', `${participantName} registered for "${event.name}"`);
  saveState(state);
  return { success: true, message: `Successfully registered for ${event.name}`, participant };
}

// Quiz
export function addQuizAttempt(participantName: string, score: number, totalQuestions: number, answers: number[], timeTakenSeconds: number): QuizAttempt {
  const state = loadState();

  // Find participant by name or create a quiz-only entry
  let participant = state.participants.find(p => p.name === participantName);
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

  // Check for existing attempt - prevent repeat
  const existing = state.quizAttempts.find(a => a.participantId === participant!.id);
  if (existing) {
    // Update if better score
    if (score > existing.score || (score === existing.score && timeTakenSeconds < existing.timeTakenSeconds)) {
      existing.score = score;
      existing.answers = answers;
      existing.timeTakenSeconds = timeTakenSeconds;
      existing.completedAt = new Date().toISOString();
      addActivity(state, 'quiz', `${participantName} improved their quiz score to ${score}/${totalQuestions}`);
      saveState(state);
      return existing;
    }
    // Return existing, don't update
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
  const participant = state.participants.find(p => p.name === participantName);
  if (!participant) return false;
  return state.quizAttempts.some(a => a.participantId === participant.id);
}

// Attendance
export function markAttendance(eventId: string, participantId: string, status: 'present' | 'absent'): { success: boolean; message: string } {
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
  const participant = state.participants.find(p => p.id === participantId);
  addActivity(state, 'attendance', `${participant?.name || 'Unknown'} marked ${status} for event`);
  saveState(state);
  return { success: true, message: `Attendance marked as ${status}` };
}

export function getAttendanceForEvent(eventId: string): AttendanceRecord[] {
  return loadState().attendance.filter(a => a.eventId === eventId);
}

// ============================================================
// Member Management Helpers
// ============================================================

export function addMember(member: {
  name: string;
  email: string;
  department: string;
  year: string;
  role: MemberRole;
  status: MemberStatus;
}): { success: boolean; message: string; member?: Member } {
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
  addActivity(state, 'member', `${newMember.name} joined as ${newMember.role} (${newMember.department})`);
  saveState(state);
  return { success: true, message: `Member "${newMember.name}" successfully registered`, member: newMember };
}

export function updateMember(
  id: string,
  updates: Partial<Pick<Member, 'name' | 'email' | 'department' | 'year' | 'role' | 'status'>>
): { success: boolean; message: string; member?: Member } {
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
  addActivity(state, 'member', `Member directory record for ${state.members[idx].name} updated`);
  saveState(state);
  return { success: true, message: 'Member profile updated successfully', member: state.members[idx] };
}

export function toggleMemberStatus(id: string): { success: boolean; message: string; member?: Member } {
  const state = loadState();
  const idx = state.members.findIndex(m => m.id === id);
  if (idx === -1) return { success: false, message: 'Member not found' };
  const newStatus: MemberStatus = state.members[idx].status === 'Active' ? 'Inactive' : 'Active';
  state.members[idx].status = newStatus;
  addActivity(state, 'member', `${state.members[idx].name} status updated to ${newStatus}`);
  saveState(state);
  return { success: true, message: `Member status toggled to ${newStatus}`, member: state.members[idx] };
}

export function deleteMember(id: string): boolean {
  const state = loadState();
  const idx = state.members.findIndex(m => m.id === id);
  if (idx === -1) return false;
  const name = state.members[idx].name;
  state.members.splice(idx, 1);
  addActivity(state, 'member', `Member ${name} removed from registry`);
  saveState(state);
  return true;
}

// ============================================================
// Certificate Management Helpers
// ============================================================

export function generateCertificateCode(existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(4, '0');
  return `MCN-${year}-${seq}`;
}

export function issueCertificate(
  participantName: string,
  eventId: string,
  type: CertificateType
): { success: boolean; message: string; certificate?: Certificate } {
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
  addActivity(state, 'certificate', `Issued ${type} Certificate (${code}) to ${participantName.trim()}`);
  saveState(state);
  return { success: true, message: `Certificate issued successfully (${code})`, certificate };
}

export function issueCertificatesBatch(
  items: Array<{ participantName: string; eventId: string; type: CertificateType }>
): { count: number; skipped: number } {
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
    addActivity(state, 'certificate', `Batch issued ${count} certificates to eligible scholars`);
    saveState(state);
  }
  return { count, skipped };
}

export function revokeCertificate(id: string): boolean {
  const state = loadState();
  const idx = state.certificates.findIndex(c => c.id === id);
  if (idx === -1) return false;
  const cert = state.certificates[idx];
  state.certificates.splice(idx, 1);
  addActivity(state, 'certificate', `Revoked ${cert.type} certificate (${cert.certificateCode}) for ${cert.participantName}`);
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

// ============================================================
// Feedback Collection Helpers
// ============================================================

export function addFeedback(feedback: {
  eventId: string;
  participantName?: string;
  rating: number;
  categoryRatings: FeedbackCategoryRatings;
  comment: string;
  anonymous: boolean;
}): { success: boolean; message: string; feedback?: Feedback } {
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
  addActivity(state, 'feedback', `${author} submitted ${feedback.rating}★ feedback for "${event.name}"`);
  saveState(state);
  return { success: true, message: 'Thank you! Your feedback has been recorded successfully.', feedback: newFeedback };
}

// Activity feed
function addActivity(state: AppState, type: ActivityItem['type'], message: string): void {
  state.activities.unshift({
    id: generateId(),
    type,
    message,
    timestamp: new Date().toISOString(),
  });
  // Keep only last 50
  if (state.activities.length > 50) {
    state.activities = state.activities.slice(0, 50);
  }
}

export function logActivity(type: ActivityItem['type'], message: string): void {
  const state = loadState();
  addActivity(state, type, message);
  saveState(state);
}

export { generateId };
