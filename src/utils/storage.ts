// ============================================================
// MathClub Nexus — LocalStorage Persistence Layer
// ============================================================

import type { AppState, Participant, Event, QuizAttempt, AttendanceRecord, ActivityItem } from '../types';

const STORAGE_KEY = 'mathclub_nexus_data';

const defaultState: AppState = {
  participants: [],
  events: [],
  quizAttempts: [],
  attendance: [],
  activities: [],
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    // Validate structure
    return {
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
      attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
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

export { generateId };
