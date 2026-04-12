# Visitor Pass Management System - Walkthrough

You now possess a fully modular, clean architecture production MERN stack handling the entire visitor lifecycle.

## Overview
- **Project Scope**: Authentication, Visitor Management, Appointments, Digial Passes (QR + PDF dispatch), Check-in tracking, and Reporting. 
- **Database Architecture**: 5 highly-relational Mongoose Collections (`User`, `Visitor`, `Appointment`, `Pass`, `CheckLog`).
- **Authorization**: Integrated JWT Strategy (`/api/auth/me`) + Hardened Role-Based checks restricting views based on User Identity flags (`Admin`, `Employee`, `Security`, `Visitor`).

## System Flow (Integration Lifecycle)

1. **Authentication:**
   - Both Employees and Security guards log in from `http://localhost:5173/login`.
   - Based on their backend MongoDB identity, they are conditionally un-mounted from unauthorized routes inside the `App.jsx` React tree.

2. **Scheduling:**
   - Employees trigger the `RequestAppointment.jsx` form to pull existing `Visitors` globally and request an upcoming meet-up date securely. (Admin / Employee level only).

3. **Pass Dispatch (The AI Element):**
   - In `EmployeeDashboard.jsx`, Employees evaluate pending requests.
   - Upon pressing **"Issue Digital Pass"**, the Backend takes over securely. Node generates a 12-char Secure Pass key, encodes it directly into a scanned Base64 QR Image array using `qrcode`.
   - `pdfkit` fires asynchronously in the background. It structures the A5 Visitor printout without bogging down the main thread.
   - Finally, `nodemailer` routes it out securely attached. 

4. **Facility Entry:**
   - The Visitor arrives exactly at the `validFrom -> validUntil` timeframe boundary securely restricted by the internal Pass logic.
   - The Security Guard opens `http://localhost:5173/security/scanner`.
   - Scanning the pass (entering the text payload) evaluates the unique DB hash.
   - Using the exact identical endpoint `/checklogs/scan`, Node calculates if it needs to _Check the Visitor in_ globally or if there is an active log already, safely _checking them out_ automatically.

## Running It Successfully

To spin up the system locally, open two terminals.

### 1. The Backend
```bash
## Start up Express
cd backend
npm run start # If defined, or node server.js
```

### 2. The Frontend
```bash
## Spin up Vite
cd frontend
npm run dev
```

> [!WARNING]
> Please ensure you seed at least one 'Admin' or 'Employee' inside your database natively or remove the `protect` constraint for `POST /api/auth/register` momentarily to inject your first administrative user.
