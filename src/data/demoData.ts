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
      description: "Deep dive into prime numbers, modular arithmetic, and Fermat's theorems. Bring your notebooks!",
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

  // Quiz attempts (10 questions total, realistic varied scores descending: 9/10, 8/10, 8/10, 7/10, 6/10, 5/10)
  const quizAttempts = [
    {
      id: generateId(),
      participantId: participants[1].id,
      participantName: participants[1].name, // Priya Sharma (Gold: 9/10, 195s)
      score: 9,
      totalQuestions: 10,
      answers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      timeTakenSeconds: 195,
      completedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[0].id,
      participantName: participants[0].name, // Arjun Mehta (Silver: 8/10, 210s)
      score: 8,
      totalQuestions: 10,
      answers: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
      timeTakenSeconds: 210,
      completedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[3].id,
      participantName: participants[3].name, // Sneha Gupta (Bronze: 8/10, 245s)
      score: 8,
      totalQuestions: 10,
      answers: [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      timeTakenSeconds: 245,
      completedAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[2].id,
      participantName: participants[2].name, // Rohan Das (7/10, 260s)
      score: 7,
      totalQuestions: 10,
      answers: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
      timeTakenSeconds: 260,
      completedAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[5].id,
      participantName: participants[5].name, // Ananya Reddy (6/10, 280s)
      score: 6,
      totalQuestions: 10,
      answers: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
      timeTakenSeconds: 280,
      completedAt: new Date(now.getTime() - 3600000 * 4).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[4].id,
      participantName: participants[4].name, // Kabir Patel (5/10, 295s)
      score: 5,
      totalQuestions: 10,
      answers: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      timeTakenSeconds: 295,
      completedAt: new Date(now.getTime() - 3600000).toISOString(),
    },
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

  // Members (6 members, varied roles & departments)
  const members = [
    {
      id: generateId(),
      name: 'Arjun Mehta',
      email: 'arjun.m@university.edu',
      department: 'Mathematics & Computing',
      year: '3rd Year',
      role: 'President' as const,
      status: 'Active' as const,
      joinedAt: new Date(now.getTime() - 86400000 * 180).toISOString(),
    },
    {
      id: generateId(),
      name: 'Priya Sharma',
      email: 'priya.s@university.edu',
      department: 'Mathematics & Computing',
      year: '3rd Year',
      role: 'Coordinator' as const,
      status: 'Active' as const,
      joinedAt: new Date(now.getTime() - 86400000 * 150).toISOString(),
    },
    {
      id: generateId(),
      name: 'Sneha Gupta',
      email: 'sneha.g@university.edu',
      department: 'Computer Science & AI',
      year: '2nd Year',
      role: 'Core Team' as const,
      status: 'Active' as const,
      joinedAt: new Date(now.getTime() - 86400000 * 90).toISOString(),
    },
    {
      id: generateId(),
      name: 'Rohan Das',
      email: 'rohan.d@university.edu',
      department: 'Electronics & Communication',
      year: '2nd Year',
      role: 'Core Team' as const,
      status: 'Active' as const,
      joinedAt: new Date(now.getTime() - 86400000 * 85).toISOString(),
    },
    {
      id: generateId(),
      name: 'Kabir Patel',
      email: 'kabir.p@university.edu',
      department: 'Mechanical Engineering',
      year: '1st Year',
      role: 'Member' as const,
      status: 'Active' as const,
      joinedAt: new Date(now.getTime() - 86400000 * 30).toISOString(),
    },
    {
      id: generateId(),
      name: 'Ananya Reddy',
      email: 'ananya.r@university.edu',
      department: 'Data Science & Analytics',
      year: '1st Year',
      role: 'Member' as const,
      status: 'Inactive' as const,
      joinedAt: new Date(now.getTime() - 86400000 * 20).toISOString(),
    },
  ];

  // Certificates (4 certificates across events)
  const certificates = [
    {
      id: generateId(),
      participantName: 'Priya Sharma',
      eventId: events[3].id, // Inter-College Math Olympiad
      type: 'Winner' as const,
      issuedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      certificateCode: 'MCN-2026-0001',
    },
    {
      id: generateId(),
      participantName: 'Arjun Mehta',
      eventId: events[3].id, // Inter-College Math Olympiad
      type: 'Runner-up' as const,
      issuedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      certificateCode: 'MCN-2026-0002',
    },
    {
      id: generateId(),
      participantName: 'Sneha Gupta',
      eventId: events[0].id, // Pi Day Celebration
      type: 'Participation' as const,
      issuedAt: new Date(now.getTime() - 86400000).toISOString(),
      certificateCode: 'MCN-2026-0003',
    },
    {
      id: generateId(),
      participantName: 'Priya Sharma',
      eventId: events[1].id, // Number Theory Workshop
      type: 'Quiz Excellence' as const,
      issuedAt: new Date(now.getTime() - 3600000 * 6).toISOString(),
      certificateCode: 'MCN-2026-0004',
    },
  ];

  // Feedback (6 entries across events)
  const feedback = [
    {
      id: generateId(),
      eventId: events[0].id,
      participantName: 'Priya Sharma',
      rating: 5,
      categoryRatings: { content: 5, organization: 5, difficulty: 4 },
      comment: 'Incredible puzzle stations and the pi digit recitation contest was thrilling! Perfectly organized.',
      anonymous: false,
      submittedAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[0].id,
      participantName: 'Sneha Gupta',
      rating: 5,
      categoryRatings: { content: 5, organization: 4, difficulty: 3 },
      comment: 'Loved the teamwork aspect in the mathematical relay. The refreshments and venue setup were great.',
      anonymous: false,
      submittedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[1].id,
      participantName: 'Arjun Mehta',
      rating: 5,
      categoryRatings: { content: 5, organization: 5, difficulty: 5 },
      comment: "The rigorous proofs of Fermat's Little Theorem and RSA cryptosystem connections were masterfully delivered.",
      anonymous: false,
      submittedAt: new Date(now.getTime() - 3600000 * 8).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[1].id,
      participantName: 'Kabir Patel',
      rating: 4,
      categoryRatings: { content: 4, organization: 4, difficulty: 4 },
      comment: 'Deep dive into prime factorization algorithms. A slightly slower pace on modular inverses would help newcomers.',
      anonymous: false,
      submittedAt: new Date(now.getTime() - 3600000 * 5).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[2].id,
      participantName: 'Diya Iyer',
      rating: 5,
      categoryRatings: { content: 5, organization: 5, difficulty: 4 },
      comment: 'Superb guest lecture on Bayesian inference and machine learning models. High academic caliber!',
      anonymous: false,
      submittedAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[3].id,
      rating: 4,
      categoryRatings: { content: 5, organization: 4, difficulty: 5 },
      comment: 'Demanding and rewarding olympiad problems! Well-audited timers and transparent scoring.',
      anonymous: true,
      submittedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
  ];

  // Activities
  const activities = [
    { id: generateId(), type: 'certificate' as const, message: 'Winner Certificate (MCN-2026-0001) issued to Priya Sharma', timestamp: new Date(now.getTime() - 3600000 * 2).toISOString() },
    { id: generateId(), type: 'feedback' as const, message: 'New 5★ review submitted for Pi Day Celebration', timestamp: new Date(now.getTime() - 3600000 * 4).toISOString() },
    { id: generateId(), type: 'member' as const, message: 'Arjun Mehta assigned role President (Mathematics & Computing)', timestamp: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'quiz' as const, message: `${participants[1].name} scored 9/10 — Top scorer!`, timestamp: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'registration' as const, message: `${participants[7].name} registered for Probability Seminar`, timestamp: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'attendance' as const, message: 'Attendance marked for Pi Day Celebration', timestamp: new Date(now.getTime() - 86400000).toISOString() },
  ];

  return { participants, events, quizAttempts, attendance, activities, members, certificates, feedback };
}
