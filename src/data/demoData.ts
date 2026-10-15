// ============================================================
// MathClub Nexus — Demo / Seed Data
// ============================================================

import type { AppState, User, Registration } from '../types';
import { generateId } from '../utils/storage';
import { DEMO_PASSWORD_HASH } from '../utils/crypto';

export function generateDemoData(): AppState {
  const now = new Date();

  // Participants
  const participants = [
    { id: generateId(), name: 'Arjun Mehta', studentId: 'MTH2024001', email: 'participant@mathclub.com', createdAt: new Date(now.getTime() - 86400000 * 5).toISOString() },
    { id: generateId(), name: 'Priya Sharma', studentId: 'MTH2024002', email: 'priya.s@university.edu', createdAt: new Date(now.getTime() - 86400000 * 4).toISOString() },
    { id: generateId(), name: 'Rohan Das', studentId: 'MTH2024003', email: 'rohan.d@university.edu', createdAt: new Date(now.getTime() - 86400000 * 3).toISOString() },
    { id: generateId(), name: 'Sneha Gupta', studentId: 'MTH2024004', email: 'sneha.g@university.edu', createdAt: new Date(now.getTime() - 86400000 * 3).toISOString() },
    { id: generateId(), name: 'Kabir Patel', studentId: 'MTH2024005', email: 'kabir.p@university.edu', createdAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: generateId(), name: 'Ananya Reddy', studentId: 'MTH2024006', email: 'ananya.r@university.edu', createdAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: generateId(), name: 'Vivek Nair', studentId: 'MTH2024007', email: 'vivek.n@university.edu', createdAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), name: 'Diya Iyer', studentId: 'MTH2024008', email: 'diya.i@university.edu', createdAt: new Date(now.getTime() - 86400000).toISOString() },
  ];

  // Members
  const members = [
    {
      id: generateId(),
      name: 'Dr. A. Sharma',
      email: 'president@mathclub.com',
      department: 'Applied Mathematics',
      year: 'Faculty Lead',
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
      email: 'core@mathclub.com',
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
      email: 'member@mathclub.com',
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

  // Users (Role-based Accounts with SHA-256 password hash for "Math@123")
  const users: User[] = [
    {
      id: 'usr-president-01',
      name: 'Dr. A. Sharma',
      email: 'president@mathclub.com',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'president',
      linkedMemberId: members[0].id,
      college: 'MITS-DU Gwalior',
      department: 'Applied Mathematics',
      status: 'active',
      createdAt: new Date(now.getTime() - 86400000 * 180).toISOString(),
    },
    {
      id: 'usr-core-01',
      name: 'Sneha Gupta',
      email: 'core@mathclub.com',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'core',
      linkedMemberId: members[2].id,
      college: 'MITS-DU Gwalior',
      department: 'Computer Science & AI',
      year: '2nd Year',
      status: 'active',
      createdAt: new Date(now.getTime() - 86400000 * 90).toISOString(),
    },
    {
      id: 'usr-member-01',
      name: 'Kabir Patel',
      email: 'member@mathclub.com',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'member',
      linkedMemberId: members[4].id,
      college: 'MITS-DU Gwalior',
      department: 'Mechanical Engineering',
      year: '1st Year',
      status: 'active',
      createdAt: new Date(now.getTime() - 86400000 * 30).toISOString(),
    },
    {
      id: 'usr-participant-01',
      name: 'Arjun Mehta',
      email: 'participant@mathclub.com',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'participant',
      linkedParticipantId: participants[0].id,
      phone: '+91 98765 43210',
      college: 'MITS-DU Gwalior',
      department: 'Mathematics & Computing',
      year: '2nd Year',
      status: 'active',
      createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
    },
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
      fee: 0,
      registrationDeadline: new Date(now.getTime() + 86400000 * 2).toISOString().split('T')[0],
      assignedTo: [members[4].id, members[2].id], // Assigned to Kabir (Member) and Sneha (Core)
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
      fee: 150,
      registrationDeadline: new Date(now.getTime() + 86400000 * 5).toISOString().split('T')[0],
      assignedTo: [members[2].id, members[3].id], // Assigned to Core Team
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
      fee: 0,
      registrationDeadline: new Date(now.getTime() + 86400000 * 12).toISOString().split('T')[0],
      assignedTo: [members[4].id], // Assigned to Kabir (Member)
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
      fee: 250,
      registrationDeadline: new Date(now.getTime() + 86400000 * 18).toISOString().split('T')[0],
      assignedTo: [members[4].id, members[3].id], // Assigned to Kabir (Member) and Rohan (Core)
      registrations: participants.map(p => p.id),
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
  ];

  // Detailed Registrations
  const registrations: Registration[] = [
    {
      id: generateId(),
      eventId: events[0].id,
      userId: users[3].id, // Arjun Mehta
      participantName: 'Arjun Mehta',
      email: 'participant@mathclub.com',
      phone: '+91 98765 43210',
      college: 'MITS-DU Gwalior',
      year: '2nd Year',
      department: 'Mathematics & Computing',
      amount: 0,
      paymentMethod: 'Free',
      paymentStatus: 'free',
      transactionId: 'TXN-FREE-001',
      status: 'confirmed',
      attendanceStatus: 'present',
      checkedInAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[3].id,
      userId: users[3].id, // Arjun Mehta
      participantName: 'Arjun Mehta',
      email: 'participant@mathclub.com',
      phone: '+91 98765 43210',
      college: 'MITS-DU Gwalior',
      year: '2nd Year',
      department: 'Mathematics & Computing',
      amount: 250,
      paymentMethod: 'UPI',
      paymentStatus: 'paid',
      transactionId: 'TXN-UPI-984321',
      status: 'confirmed',
      attendanceStatus: 'present',
      checkedInAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[1].id,
      userId: users[3].id, // Arjun Mehta
      participantName: 'Arjun Mehta',
      email: 'participant@mathclub.com',
      phone: '+91 98765 43210',
      college: 'MITS-DU Gwalior',
      year: '2nd Year',
      department: 'Mathematics & Computing',
      amount: 150,
      paymentMethod: 'Card',
      paymentStatus: 'paid',
      transactionId: 'TXN-CARD-442190',
      status: 'confirmed',
      attendanceStatus: 'pending',
      createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[0].id,
      userId: 'usr-p2',
      participantName: 'Priya Sharma',
      email: 'priya.s@university.edu',
      phone: '+91 98765 43211',
      college: 'MITS-DU Gwalior',
      year: '3rd Year',
      department: 'Mathematics & Computing',
      amount: 0,
      paymentMethod: 'Free',
      paymentStatus: 'free',
      transactionId: 'TXN-FREE-002',
      status: 'confirmed',
      attendanceStatus: 'present',
      checkedInAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      createdAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[3].id,
      userId: 'usr-p3',
      participantName: 'Rohan Das',
      email: 'rohan.d@university.edu',
      phone: '+91 98765 43212',
      college: 'MITS-DU Gwalior',
      year: '2nd Year',
      department: 'Electronics',
      amount: 250,
      paymentMethod: 'Net Banking',
      paymentStatus: 'paid',
      transactionId: 'TXN-NB-112233',
      status: 'confirmed',
      attendanceStatus: 'pending',
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
  ];

  // Quiz attempts
  const quizAttempts = [
    {
      id: generateId(),
      participantId: participants[1].id,
      participantName: participants[1].name,
      score: 9,
      totalQuestions: 10,
      answers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      timeTakenSeconds: 195,
      completedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[0].id,
      participantName: participants[0].name,
      score: 8,
      totalQuestions: 10,
      answers: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
      timeTakenSeconds: 210,
      completedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[3].id,
      participantName: participants[3].name,
      score: 8,
      totalQuestions: 10,
      answers: [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      timeTakenSeconds: 245,
      completedAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[2].id,
      participantName: participants[2].name,
      score: 7,
      totalQuestions: 10,
      answers: [0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
      timeTakenSeconds: 260,
      completedAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[4].id,
      participantName: participants[4].name,
      score: 6,
      totalQuestions: 10,
      answers: [0, 1, 1, 0, 0, 0, 0, 1, 0, 1],
      timeTakenSeconds: 290,
      completedAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      participantId: participants[5].id,
      participantName: participants[5].name,
      score: 5,
      totalQuestions: 10,
      answers: [1, 0, 0, 1, 0, 1, 0, 0, 1, 1],
      timeTakenSeconds: 310,
      completedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
  ];

  // Attendance records
  const attendance = [
    { eventId: events[0].id, participantId: participants[0].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { eventId: events[0].id, participantId: participants[1].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { eventId: events[0].id, participantId: participants[2].id, status: 'absent' as const, markedAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { eventId: events[0].id, participantId: participants[3].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { eventId: events[1].id, participantId: participants[0].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000).toISOString() },
    { eventId: events[1].id, participantId: participants[4].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000).toISOString() },
    { eventId: events[1].id, participantId: participants[5].id, status: 'absent' as const, markedAt: new Date(now.getTime() - 86400000).toISOString() },
    { eventId: events[3].id, participantId: participants[0].id, status: 'present' as const, markedAt: new Date(now.getTime() - 86400000 * 2).toISOString() },
  ];

  // Certificates
  const certificates = [
    {
      id: generateId(),
      participantName: 'Priya Sharma',
      eventId: events[3].id,
      type: 'Winner' as const,
      issuedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      certificateCode: 'MCN-2026-0001',
    },
    {
      id: generateId(),
      participantName: 'Arjun Mehta',
      eventId: events[3].id,
      type: 'Runner-up' as const,
      issuedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      certificateCode: 'MCN-2026-0002',
    },
    {
      id: generateId(),
      participantName: 'Arjun Mehta',
      eventId: events[0].id,
      type: 'Participation' as const,
      issuedAt: new Date(now.getTime() - 86400000).toISOString(),
      certificateCode: 'MCN-2026-0003',
    },
    {
      id: generateId(),
      participantName: 'Priya Sharma',
      eventId: events[1].id,
      type: 'Quiz Excellence' as const,
      issuedAt: new Date(now.getTime() - 3600000 * 6).toISOString(),
      certificateCode: 'MCN-2026-0004',
    },
  ];

  // Feedback
  const feedback = [
    {
      id: generateId(),
      eventId: events[0].id,
      participantName: 'Arjun Mehta',
      rating: 5,
      categoryRatings: { content: 5, organization: 5, difficulty: 4 },
      comment: 'Incredible puzzle stations and the pi digit recitation contest was thrilling! Perfectly organized.',
      anonymous: false,
      submittedAt: new Date(now.getTime() - 3600000 * 12).toISOString(),
    },
    {
      id: generateId(),
      eventId: events[1].id,
      participantName: 'Sneha Gupta',
      rating: 5,
      categoryRatings: { content: 5, organization: 4, difficulty: 5 },
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
    { id: generateId(), type: 'certificate' as const, actorName: 'Dr. A. Sharma', actorRole: 'president' as const, message: 'Winner Certificate (MCN-2026-0001) issued to Priya Sharma', timestamp: new Date(now.getTime() - 3600000 * 2).toISOString() },
    { id: generateId(), type: 'payment' as const, actorName: 'Arjun Mehta', actorRole: 'participant' as const, message: 'Arjun Mehta paid ₹250 for Inter-College Math Olympiad', timestamp: new Date(now.getTime() - 3600000 * 3).toISOString() },
    { id: generateId(), type: 'feedback' as const, actorName: 'Arjun Mehta', actorRole: 'participant' as const, message: 'New 5★ review submitted for Pi Day Celebration', timestamp: new Date(now.getTime() - 3600000 * 4).toISOString() },
    { id: generateId(), type: 'member' as const, actorName: 'Dr. A. Sharma', actorRole: 'president' as const, message: 'Kabir Patel inducted as Member (Mechanical Engineering)', timestamp: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'quiz' as const, actorName: 'Priya Sharma', actorRole: 'participant' as const, message: 'Priya Sharma scored 9/10 — Top scorer!', timestamp: new Date(now.getTime() - 86400000).toISOString() },
    { id: generateId(), type: 'registration' as const, actorName: 'Arjun Mehta', actorRole: 'participant' as const, message: 'Arjun Mehta registered for Pi Day Celebration', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString() },
    { id: generateId(), type: 'attendance' as const, actorName: 'Sneha Gupta', actorRole: 'core' as const, message: 'Attendance audited for Pi Day Celebration', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString() },
  ];

  return { participants, events, quizAttempts, attendance, activities, members, certificates, feedback, users, registrations };
}
