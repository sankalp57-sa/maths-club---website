# MathClub Nexus — Mathematics Club Management Platform

> **Live Local URL**: [http://localhost:5173/](http://localhost:5173/)  
> **Built for**: College Mathematics Club Recruitment Task

---

## 🌟 Overview

**MathClub Nexus** is a modern, high-performance web platform engineered to eliminate paper-based workflows, scattered spreadsheets, and fragmented communication in collegiate mathematics clubs. It consolidates event registration, automated competitive quiz scoring, attendance auditing, and real-time leaderboards into an intuitive, cyber-mathematics inspired interface.

---

## 🚀 Key Modules & Features

### 1. 📊 Executive Dashboard
- **Key Metrics**: Real-time counters for Total Active Members, Upcoming Events, Quizzes Completed, and Average Attendance Rate.
- **Quick Actions**: Fast navigation to register events, launch the quiz arena, or audit attendance records.
- **Recent Activity Feed**: Real-time chronological audit trail of member registrations, quiz submissions, and event check-ins.
- **Upcoming Highlights**: Countdown and capacity indicators for upcoming club events.

### 2. 📅 Events & Registration Hub
- **Event Catalog**: Grid of mathematical events categorized by **Olympiad**, **Workshop**, **Seminar**, and **Hackathon**.
- **Interactive Registration Modal**: Allows any student to register dynamically with department, year, email, and phone validation.
- **Seat Capacity Tracking**: Displays current participant count against max venue capacity with status tags (`Upcoming`, `Ongoing`, `Completed`).
- **Dynamic Filtering & Search**: Instant real-time filtering by category and search queries.

### 3. 🧠 Mathematical Quiz Arena
- **Rich Question Bank**: Real college-level mathematics problems across **Calculus**, **Linear Algebra**, **Number Theory**, **Probability**, and **Discrete Math**.
- **Interactive Quiz Engine**:
  - Live timer with countdown visual cues.
  - Question-by-question progress stepper.
  - Dynamic score breakdown including accuracy and completion time.
  - Comprehensive answer explanation review after submission.
- **Anti-Duplication**: Prevents multiple submissions under the same participant profile.

### 4. 🏆 Dynamic Leaderboard & Scoring
- **Top 3 Podium**: Visual gold, silver, and bronze pedestals celebrating top performers.
- **Ranking Table**: High-precision sorting by score (descending) and completion time (ascending as a tie-breaker).
- **Performance Analytics**: Visual badges, percentile standings, and time efficiency metrics.

### 5. 📋 Attendance Management & Verification
- **Event-Specific Roll Call**: Select any event to review registered attendees.
- **One-Click Check-in**: Instant toggle between `Present` and `Absent` with automatic timestamping.
- **Attendance Statistics**: Live calculation of presence rate, total attendees, and absentees.

### 6. 💾 Persistence & Demo State Management
- **LocalStorage Powered**: Full state retention across page reloads.
- **Demo Data Generator**: Pre-loaded with realistic college participant profiles, events, and quiz scores for instant evaluation.
- **Instant Reset**: One-click "Reset Demo Data" button in the top navigation to restore pristine state at any time.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Modern Cyber/Dark Palette
- **Icons**: Lucide React
- **Typography**: Inter (Google Fonts)
- **State Management**: Reactive LocalStorage Storage Engine with Typed Events

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production (TypeScript checking + Vite bundle)
npm run build
```

The application will be live at `http://localhost:5173/`.
