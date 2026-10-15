// ============================================================
// MathClub Nexus — Demo / Seed Data
// ============================================================

import type { AppState } from '../types';
import { generateId } from '../utils/storage';

export function generateDemoData(): AppState {
  const now = new Date();

  // Participants
  const participants = [
    { id: generateId(), name: 'Arjun Mehta', studentId: 'MTH2024001', email: 'arjun.m@university.edu', createdAt: new Date(now.getTime() - 86400000 * 5).toISOString() },
    { id: generateId(), name: 'Priya Sharma', studentId: 'MTH2024002', email: 'priya.s@university.edu', createdAt: new Date(now.getTime() - 86400000 * 4).toISOString() },
    { id: generateId(), name: 'Rohan Das', studentId: 'MTH2024003', email: 'rohan.d@university.edu', createdAt: new Date(now.getTime() - 86400000 * 3).toISOString() },
    { id: generateId(), name: 'Sneha Gupta', studentId: 'MTH2024004', email: 'sneha.g@university.edu', createdAt: new Date(now.getTime() - 86400000 * 3).toISOString() },
    { id: generateId(), name: 'Kabir Patel', studentId: 'MTH2024005', email: 'kabir.p@university.edu', createdAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: generateId(), name: 'Ananya Reddy', studentId: 'MTH2024006', email: 'ananya.r@university.edu', createdAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: generateId(), name: 'Vivek Nair', studentId: 'MTH2024007', email: 'vivek.n@university.edu', createdAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), name: 'Diya Iyer', studentId: 'MTH2024008', email: 'diya.i@university.edu', createdAt: new Date(now.getTime() - 86400000).toISOString() },
  ];

  // Events
  const events = [
    {
      id: generateId(),
      name: 'Pi Day Celebration',
      description: 'Annual celebration of Pi Day with mathematical puzzles, competitions, and pi-themed refreshments. Open to all math enthusiasts!',
      date: new Date(now.getTime() + 86400000 * 3).toISOString().split('T')[0],
      venue: 'Auditorium Hall A',
      capacity: 50,
      registrations: [participants[0].id, participants[1].id, participants[2].id, participants[3].id],
      createdAt: new Date(now.getTime() - 86400000 * 7).toISOString(),
    },
    {
      id: generateId(),
      name: 'Number Theory Workshop',
      description: 'Deep dive into prime numbers, modular arithmetic, and Fermat\'s theorems. Bring your notebooks!',
      date: new Date(now.getTime() + 86400000 * 7).toISOString().split('T')[0],
      venue: 'Mathematics Lab, Room 203',
      capacity: 30,
      registrations: [participants[0].id, participants[4].id, participants[5].id],
      createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
    },
    {
      id: generateId(),
      name: 'Probability & Statistics Seminar',
      description: 'Guest lecture on Bayesian inference and its real-world applications in data science and machine learning.',
      date: new Date(now.getTime() + 86400000 * 14).toISOString().split('T')[0],
      venue: 'Conference Room B2',
      capacity: 40,
      registrations: [participants[1].id, participants[6].id, participants[7].id],
      createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
    },
    {
      id: generateId(),
      name: 'Inter-College Math Olympiad',
      description: 'Compete against the best mathematical minds from across the region. Prizes for top 3 teams!',
      date: new Date(now.getTime() + 86400000 * 21).toISOString().split('T')[0],
      venue: 'Main Auditorium',
      capacity: 100,
      registrations: participants.map(p => p.id),
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
  ];

  // Quiz attempts
  const quizAttempts = [
    { id: generateId(), participantId: participants[0].id, participantName: participants[0].name, score: 13, totalQuestions: 15, answers: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], timeTakenSeconds: 420, completedAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: generateId(), participantId: participants[1].id, participantName: participants[1].name, score: 12, totalQuestions: 15, answers: [0,0,0,0,0,1,0,0,0,0,0,1,0,0,1], timeTakenSeconds: 380, completedAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: generateId(), participantId: participants[2].id, participantName: participants[2].name, score: 11, totalQuestions: 15, answers: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,1], timeTakenSeconds: 500, completedAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), participantId: participants[3].id, participantName: participants[3].name, score: 14, totalQuestions: 15, answers: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], timeTakenSeconds: 350, completedAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), participantId: participants[4].id, participantName: participants[4].name, score: 10, totalQuestions: 15, answers: [0,0,1,0,0,0,1,0,1,0,0,0,1,0,1], timeTakenSeconds: 550, completedAt: new Date(now.getTime() - 3600000).toISOString() },
    { id: generateId(), participantId: participants[5].id, participantName: participants[5].name, score: 12, totalQuestions: 15, answers: [0,0,0,0,0,0,0,0,1,0,1,0,0,0,1], timeTakenSeconds: 430, completedAt: new Date(now.getTime() - 3600000).toISOString() },
  ];

  // Attendance
  const attendance = [
    { eventId: events[0].id, participantId: participants[0].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000).toISOString() },
    { eventId: events[0].id, participantId: participants[1].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000).toISOString() },
    { eventId: events[0].id, participantId: participants[2].id, status: 'absent' as const, markedAt: new Date(now.getTime() - 86400000).toISOString() },
    { eventId: events[0].id, participantId: participants[3].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000).toISOString() },
    { eventId: events[1].id, participantId: participants[0].id, status: 'present' as const, markedAt: new Date(now.getTime() - 3600000).toISOString() },
    { eventId: events[1].id, participantId: participants[4].id, status: 'present' as const, markedAt: new Date(now.getTime() - 3600000).toISOString() },
    { eventId: events[1].id, participantId: participants[5].id, status: 'absent' as const, markedAt: new Date(now.getTime() - 3600000).toISOString() },
  ];

  // Activities
  const activities = [
    { id: generateId(), type: 'quiz' as const, message: `${participants[3].name} scored 14/15 — Top scorer!`, timestamp: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'registration' as const, message: `${participants[7].name} registered for Probability Seminar`, timestamp: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'quiz' as const, message: `${participants[4].name} completed the Mathematics Quiz`, timestamp: new Date(now.getTime() - 3600000).toISOString() },
    { id: generateId(), type: 'event' as const, message: 'Inter-College Math Olympiad created', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: generateId(), type: 'attendance' as const, message: `Attendance marked for Pi Day Celebration`, timestamp: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'registration' as const, message: `${participants[0].name} registered for Number Theory Workshop`, timestamp: new Date(now.getTime() - 86400000 * 3).toISOString() },
  ];

  return { participants, events, quizAttempts, attendance, activities };
}
