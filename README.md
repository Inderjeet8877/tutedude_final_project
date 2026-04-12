# Visitor Pass Management System (MERN)

## Objective
A modern, production-grade Visitor Pass Management System built on the MERN stack (MongoDB, Express, React, Node.js). This platform digitizes the manual visitor management process enabling secure pre-registration, dynamic generation of digital passes (QR-Code + PDF badges), and a structured role-based authorization hierarchy spanning Administration, Host Employees, and Security Checkpoint Guards.

## Core Features 🚀
- **Role-Based Authentication:** JWT-secured routes utilizing explicit RBAC (`Admin`, `Security`, `Employee`, `Visitor`).
- **Visitor Registration & Pass Issuance:** Real-time processing for expected visitors. Backend explicitly dispatches `application/pdf` Digital Pass Badges directly via automated Emails dynamically rendered using `pdfkit`.
- **QR Code Check-In/Check-Out Logic:** Unique Pass hashes are encoded into high-fidelity QR DataURI payloads. The Security Portal Scanner securely evaluates passing times and enforces expiration boundaries preventing unauthorized repeat entries. 
- **Appointment Approval System:** Internal hosts (Employees) maintain complete sovereignty over their incoming expected visitors through a dedicated Dashboard feed.
- **Reporting Dashboard:** Administrators hold real-time analytical overwatch across active visitor density and facility check logs.

---

## How It Works: The Workflow

The system is designed to streamline the lifecycle of a visitor pass from creation to expiration. Here's a quick breakdown of the logical flow:

1. **User Management (Admin):** The Administrator is the superuser who creates accounts for Employees and Security Guards.
2. **Appointment Creation (Employee/Admin):** Host Employees or Admins schedule incoming visitors. They provide visitor details (Name, Email, Phone, Purpose) and an Expected Visit Date.
3. **Pass Generation:** Upon appointment creation, the backend takes over:
   - A unique Pass Hash is generated and bound to the Appointment.
   - A secure QR Code encompassing this hash is created.
   - An aesthetically branded PDF badge containing the QR code and visitor details is dynamically compiled in memory using `pdfkit`.
   - The PDF is automatically dispatched to the Visitor's email address using `nodemailer`.
4. **Physical Check-In (Security):** The visitor arrives at the facility and presents their PDF badge (on phone or printed). The Security guard scans the QR code via the Security Dashboard scanner module.
   - *Valid Pass:* Changes status to "Checked-In" and records the timestamp.
   - *Invalid/Expired Pass:* The system explicitly rejects it, citing reasons like expiration, already checked in, or invalid signature.
5. **Physical Check-Out (Security):** Upon leaving, the visitor is scanned again to explicitly record their check-out timestamp, terminating the pass lifecycle.

---

## Detailed Step-by-Step Usage Guide

### Logging In
- Navigate to the root URL (e.g., `http://localhost:5173/login`).
- Enter your registered email and password.
- Based on your role, the core routing logic will redirect you to your respective, protected dashboard.

### Admin Operations
Administrators have a top-down view of the entire facility's visitor traffic.
- **Dashboard:** Instantly see metrics like Total Visitors, Currently Inside, and Total Employees.
- **Visitor Directory:** View a searchable, unified list of all past and present scheduled visitors, their pass statuses, and who they are visiting.
- **Manage Users:** Create new `Employee` and `Security` accounts to scale the platform. Adhere to strong initial temporary passwords.

### Employee Operations
Employees act as internal hosts initiating expected visitor events.
- **My Appointments:** A personalized feed showing only the visitors explicitly scheduled to meet this employee.
- **Request Appointment:** Click "New Appointment" to fill out basic info. Submitting this form automatically triggers the backend email sequence to deliver the Digital Pass to the expected visitor.

### Security Checkpoint Operations
Geared for speed and deterministic pass verification.
- **Scanner Dashboard:** Switch between Check-In and Check-Out parsing modes.
- **Read Pass / Enter Pass Code:** If camera modules are unavailable, security personnel can enter the raw 6-digit or alphanumeric pass serial hash directly into the lookup engine to validate the visitor, verify their face against any ID, and clock them into the facility.

---

## Tech Stack 🛠
**Backend:**
- Node.js & Express.js (RESTful architecture)
- MongoDB & Mongoose (Strict schema relations)
- Security: `bcryptjs` (Hashing), `jsonwebtoken` (Auth)
- Integrations: `qrcode` (Pass Hash Coding), `pdfkit` (Dynamic Badge Generation), `nodemailer` (Automated Dispatch)

**Frontend:**
- React.js + Vite (Fast HMR)
- TailwindCSS 4 + Framer Motion (Premium, glassmorphic UI layout mechanics & animations)
- React Router DOM 7 (Dynamic routing & Conditional rendering)
- Axios (API Client wrapper utilizing HTTP-only cookie interception)
- Lucide React (Premium sharp iconography)

---

## Deliverables & Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- Local MongoDB Instance running on `:27017` or a MongoDB Atlas URI.

### 2. Environment Variables Integration
At the root of the `/backend` directory, create a `.env` file referencing the following layout:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/visitor-pass-db
JWT_SECRET=super_secret_jwt_signature_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Nodemailer configuration
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_NAME="Admin Pass System"
FROM_EMAIL="noreply@visitor-system.com"
```

### 3. Installation
Open your terminal and clone the repository.

**Backend Setup**
```bash
cd backend
npm install
npm start
```
*The API will mount at `http://localhost:5000/api`*

**Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
*The UI will mount at `http://localhost:5173`*

### 4. Demo Seeding (Seed Script)
To quickly set up testing data and create initial users for all roles (Admin, Security, Employee, Visitor), run the included demo seed script.

Make sure your MongoDB instance is running, then execute the following within the `/backend` directory:

```bash
npm run seed
```

This will automatically populate your database with the following demo testing accounts:

| Role       | Email                 | Password    |
|------------|-----------------------|-------------|
| Admin      | admin@system.com      | password123 |
| Security   | security@system.com   | password123 |
| Employee   | employee@system.com   | password123 |
| Visitor    | visitor@system.com    | password123 |

You can use these credentials to log in and explore the various system portals.

### 5. Architectural Map (Clean Flow)
1. **Model** → Establishes strict MongoDB schema and virtual relationships.
2. **Controller** → Carries out business logic (e.g. Generating PDF buffers locally in-memory, evaluating Check-In vs Check-Out time deltas).
3. **Middleware** → Intercepts bad tokens or un-authorized hierarchical scopes.
4. **Routes** → Binds `/api` paths safely.

---

> Built rigorously to scale and efficiently serve secure pass infrastructures.