# MathClub Portal — Mathematics Club Management & Governance Platform

> **Live Deployed URL**: [https://maths-club-website.onrender.com](https://maths-club-website.onrender.com)  
> *(Hosted on Render's free tier; first load may take ~30–60 seconds if spinning up from idle).*  
> **Local Development URL**: [http://localhost:5173/](http://localhost:5173/)  
> **Institutional Affiliation**: Mathematics Club, MITS-DU Gwalior  
> **Built for**: College Mathematics Club Recruitment Task

---

## 🌟 Overview

**MathClub Portal** (formerly MathClub Nexus) is an offline-first, enterprise-grade web application engineered to modernize and automate collegiate mathematics club operations. Built with **React 19, TypeScript, Vite, Tailwind CSS v4, and Motion**, the platform eliminates paper registrations, scattered spreadsheets, and manual attendance auditing.

The system features a **role-based authentication architecture** spanning four distinct roles, complete with strict UI/storage permission matrix enforcement, Web Crypto SHA-256 password hashing, participant simulated payment gateways, printable registration receipts, member coordinator workbenches, and executive governance tools.

---

## 🔐 Authentication-First Architecture & Demo Accounts

On initial launch or after logout, the application routes directly to a full-screen, focused **Authentication Gateway** (no header/footer leakage):
- **4 Role Selection Cards**: President, Core Member, Member, and User (Participant).
- **Interactive Motion Interface**: Selecting any role card illuminates it with a cyan glow and animates the corresponding sign-in form.
- **Strict Role Matching**: Users can only authenticate through the role card corresponding to their assigned tier. Mismatched attempts are blocked with clear feedback.
- **Web Crypto Security**: Passwords are cryptographically hashed using native **SHA-256 (Web Crypto API)** before storage; plaintext passwords and mock card credentials are never saved.
- **One-Click Demo Credentials**: Each card includes a `"Use demo credentials"` quick-fill button for fast evaluation.

### 🔑 Demo Credentials (`Math@123`):

| Role | Email | Password | Primary Destination | Key Responsibilities |
|---|---|---|---|---|
| **President** | `president@mathclub.com` | `Math@123` | Executive Dashboard | Full platform governance, user management, state reset |
| **Core Member** | `core@mathclub.com` | `Math@123` | Executive Dashboard | Event creation, member assignments, attendance roll call |
| **Member** | `member@mathclub.com` | `Math@123` | My Assigned Events | Self-attendance, participant check-in, registration review |
| **User (Participant)** | `participant@mathclub.com` | `Math@123` | My Registrations | Event registration, simulated payments, certificates |

> **Public Sign-Up**: Public self-registration (`/signup`) strictly creates **Participant** accounts. Executive tiers (President, Core, Member) can only be provisioned by the President.

---

## 🛡️ Role-Based Permission Matrix

Every capability is strictly enforced across both the presentation layer (hidden buttons, guarded navigation) and the data layer (`storage.ts` action functions):

| Platform Capability | President | Core Member | Club Member | Participant |
|---|:---:|:---:|:---:|:---:|
| **Access Dashboard & Leaderboard** | ✅ Full | ✅ Full | ✅ Full | ✅ Personal Stats |
| **Create / Edit / Assign Events** | ✅ Full | ✅ Full | ❌ Blocked | ❌ Blocked |
| **Delete Events** | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **Conduct Member Attendance Roll Call** | ✅ Full | ✅ Full | ❌ Blocked | ❌ Blocked |
| **Mark Own Coordinator Attendance** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ Blocked |
| **Check-in & Approve/Reject Participants** | ✅ Full | ✅ Full | ✅ Assigned Only | ❌ Blocked |
| **Review Feedback Analytics** | ✅ Full | ✅ Full | ✅ Read-only | ❌ Submit Only |
| **Issue & Revoke Certificates** | ✅ Full | ✅ Full | ❌ Blocked | ❌ Blocked |
| **Download Own Certificate / Voucher** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **Member Directory Management** | ✅ Full (CSV, Delete) | ✅ Add / Edit | ✅ Read-only | ❌ Blocked |
| **User & Role Governance Portal** | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **Reset / Reload Prototype State** | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **Event Registration & Mock Payment** | N/A | N/A | N/A | ✅ Allowed |

---

## 🚀 Key Modules & User Workflows

### 1. 🎟️ Participant Flow (Registration, Simulated Payment & Receipts)
- **Dynamic Event Registration**: Participants can register for upcoming olympiads and seminars with pre-filled profile information.
- **Simulated Payment Gateway**: For events with an entry fee, a multi-step checkout offers simulated **UPI**, **Credit/Debit Card**, and **Net Banking** options. Features realistic processing indicators and a clear disclaimer: *"Demo payment, no real money is charged."*
- **Official Vouchers & Receipts**: Successful registration immediately issues a unique Transaction ID and generates a printable, downloadable **Official Registration Pass**.
- **My Registrations Dashboard**: Track enrolled event passes, payment status, event feedback submission, and view verified certificate achievements.

### 2. 📋 Member Coordinator Workbench ("My Assigned Events")
- **Assigned Event Roster**: Displays only events where the member is assigned as an event coordinator.
- **Self-Attendance Check-In**: One-click confirmation to verify their own on-duty coordinator attendance.
- **Attendee Verification**: Review attendee payment statuses, perform fast participant check-in, and approve or reject registrations.
- **Read-Only Feedback**: Inspect aggregated participant ratings and commentary for their coordinated initiatives.

### 3. 🛡️ Core Member Capabilities
- **Event Scheduling & Coordinator Assignment**: Create events with custom seat capacities, registration deadlines, entry fees, and assign club members as coordinators.
- **Member Attendance Roll Call**: Bulk and individual attendance tracking for club meetings and official sessions.
- **Certificate Issuance Workbench**: Generate verifiable achievement awards with auto-generated credential verification codes.

### 4. 👑 President Governance & Executive Administration
- **User and Role Management (`/users`)**: Complete roster of portal accounts with abilities to promote/demote roles, deactivate/reactivate users, reset passwords via SHA-256, and delete accounts with `ConfirmDialog` confirmation.
- **State Control**: Dedicated top-navigation dropdown to reload pristine demo datasets or wipe prototype storage safely.

### 5. 📊 Executive & Personal Telemetry Dashboard
- **Leadership Overview**: Real-time counters for Total Active Members, Quorum Rates, Upcoming Colloquia, and Feedback Averages.
- **Participant Workspace**: Personalized counters showing Enrolled Passes, Issued Certificates, Open Events, and Highest Quiz Sprint Score.
- **Real-Time Audit Trail**: Chronological event log documenting logins, logouts, registrations, mock payments, attendance actions, and role updates with actor attribution.

### 6. 🧠 Mathematical Quiz Arena & Hall of Champions
- **10-Question Sprint**: Rigorous collegiate problems across Calculus, Linear Algebra, Number Theory, Probability, and Discrete Mathematics.
- **Speed Scoring**: High-precision timer tracking completion speed down to the second.
- **Dynamic Leaderboard**: Visual podium honoring Gold, Silver, and Bronze medalists with tie-breaking logic.

---

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Custom Cyber-Mathematical `#050B16` Palette
- **Animations**: Motion (Framer Motion v14) with `prefers-reduced-motion` compliance
- **Icons**: Lucide React
- **Cryptography**: Native Web Crypto API (SHA-256)
- **Data Architecture**: Reactive, safe-migrating `LocalStorage` engine with typed models

---

## 💻 Local Development & Build

```bash
# 1. Clone the repository
git clone https://github.com/sankalp57-sa/maths-club---website.git
cd maths-club---website

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Compile TypeScript & build production bundle
npm run build

# 5. Preview production build locally
npm run preview
```

The local development server will be available at: **`http://localhost:5173/`**.

---

## 🚢 Production Deployment

The project is pre-configured for automated deployment on **Render**:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start` (`vite preview --host 0.0.0.0 --port $PORT`)
- **Allowed Hosts**: Configured in `vite.config.ts` for zero CORS or host validation issues.
