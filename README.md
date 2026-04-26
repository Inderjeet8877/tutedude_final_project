# Visitor Pass Management System

A full-stack MERN application that digitizes visitor management for offices and facilities. Visitors receive a QR-code PDF pass via email, and security guards scan it to log check-in and check-out events.

---

## Features

- **Role-based access control** — Admin, Employee, Security Guard, and Visitor roles, each with their own dashboard
- **Visitor registration with photo upload** — Store a photo ID alongside visitor details
- **Appointment scheduling** — Employees request and approve visitor appointments
- **Automated pass generation** — PDF badge with QR code emailed to visitor on approval
- **QR / manual code scanner** — Security scans QR or types the pass code to check in
- **OTP verification on check-in** — 6-digit OTP sent to visitor's phone via SMS (Twilio)
- **Check-in / Check-out tracking** — Full log of every entry and exit
- **Admin dashboard** — Live stats: total visitors, active inside, appointments today, pending approvals
- **Visitor directory** — Search by name/email, filter by status, export to CSV
- **Staff account management** — Admin can create, enable/disable, and delete Employee/Security accounts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS 4, Framer Motion, React Router 7 |
| HTTP Client | Axios (JWT sent via Authorization header) |
| QR Scanner | @yudiel/react-qr-scanner |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| PDF | PDFKit |
| QR Code | qrcode |
| SMS | Twilio |

---

## Project Structure

```
tutedude-final-project/
├── backend/
│   ├── server.js               # Express app entry point
│   ├── seedUsers.js            # Demo seed script
│   └── src/
│       ├── config/db.js        # MongoDB connection
│       ├── models/             # Mongoose schemas
│       │   ├── User.model.js
│       │   ├── Visitor.model.js
│       │   ├── Appointment.model.js
│       │   ├── Pass.model.js
│       │   └── CheckLog.model.js
│       ├── controllers/        # Route handlers / business logic
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── visitor.controller.js
│       │   ├── appointment.controller.js
│       │   ├── pass.controller.js
│       │   ├── checklog.controller.js
│       │   └── dashboard.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js   # JWT protect + role authorize
│       │   └── error.middleware.js  # Global error handler
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── visitor.routes.js
│       │   ├── appointment.routes.js
│       │   ├── pass.routes.js
│       │   ├── checklog.routes.js
│       │   └── dashboard.routes.js
│       └── services/
│           ├── qr.service.js    # QR code generation
│           ├── pdf.service.js   # PDF badge generation
│           ├── email.service.js # Email dispatch via SMTP
│           └── sms.service.js   # OTP SMS via Twilio
└── frontend/
    └── src/
        ├── App.jsx              # Routes
        ├── context/AuthContext.jsx
        ├── services/api.js      # Axios instance
        ├── components/layout/
        │   ├── Layout.jsx       # Sidebar + header shell
        │   └── PrivateRoute.jsx # Auth + role guard
        └── pages/
            ├── auth/Login.jsx
            ├── admin/
            │   ├── AdminDashboard.jsx
            │   ├── VisitorList.jsx    # Search + filter + CSV export
            │   ├── AddVisitor.jsx     # Photo upload
            │   ├── EditVisitor.jsx
            │   └── ManageUsers.jsx    # Create/toggle/delete staff accounts
            ├── employee/
            │   ├── EmployeeDashboard.jsx
            │   └── RequestAppointment.jsx
            ├── security/SecurityScanner.jsx  # Camera + manual + OTP
            └── visitor/VisitorStatus.jsx     # QR pass display
```

---

## Setup Guide

### Prerequisites

- Node.js v18 or higher
- MongoDB running locally on port 27017, **or** a MongoDB Atlas URI

### 1 — Clone the repo

```bash
git clone https://github.com/Inderjeet8877/tutedude_final_project.git
cd tutedude_final_project
```

### 2 — Backend environment variables

Create a file called `.env` inside the `/backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/visitor-pass-db
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Gmail SMTP (use an App Password, not your real password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_NAME=Visitor Pass System
FROM_EMAIL=your_gmail@gmail.com

# Twilio (for OTP SMS) — leave blank to skip SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail".

### 3 — Install dependencies and start

**Backend:**

```bash
cd backend
npm install
npm start
# API available at http://localhost:5000/api
```

**Frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
# UI available at http://localhost:5173
```

### 4 — Seed demo data

With the backend running and MongoDB connected:

```bash
cd backend
npm run seed
```

This creates the following test accounts:

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@system.com       | password123 |
| Employee | employee@system.com    | password123 |
| Security | security@system.com    | password123 |
| Visitor  | visitor@system.com     | password123 |

---

## How It Works — Full Flow

1. **Admin** logs in and creates Employee / Security accounts from **Manage Staff**.
2. **Admin or Employee** registers a visitor (name, email, phone, optional photo).
3. **Employee** creates an appointment for that visitor, then approves it from **My Appointments**.
4. Employee clicks **Dispatch Pass Email** — the backend generates a QR code, builds a PDF badge, and emails it to the visitor.
5. **Visitor** arrives and shows the PDF (on phone or printed). The **Security guard** scans the QR code or types the pass code.
6. An OTP is sent to the visitor's phone. The visitor tells the code to the guard who enters it → **check-in logged**.
7. On departure the guard scans again → **check-out logged**, pass marked Used.
8. **Admin dashboard** shows live counts and recent activity.

---

## API Reference

All endpoints are prefixed with `/api`.  
Protected routes require the header: `Authorization: Bearer <token>`

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Create a new account |
| POST | `/login` | Public | Login, returns JWT |
| POST | `/logout` | Protected | Clear auth cookie |
| GET | `/me` | Protected | Get current user |

### Users (Staff Management) — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Admin | List all staff accounts |
| POST | `/` | Admin | Create Employee or Security account |
| PUT | `/:id/toggle-status` | Admin | Enable / disable account |
| DELETE | `/:id` | Admin | Permanently delete account |

### Visitors — `/api/visitors`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | All logged-in | List all visitors (optional `?status=` filter) |
| POST | `/` | Admin, Employee | Register new visitor |
| GET | `/:id` | All logged-in | Get single visitor |
| PUT | `/:id` | Admin, Security | Update visitor details |
| DELETE | `/:id` | Admin | Delete visitor record |

### Appointments — `/api/appointments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | All logged-in | List appointments (Employees see only their own) |
| POST | `/` | Admin, Employee | Create appointment |
| GET | `/:id` | All logged-in | Get single appointment |
| PUT | `/:id` | Admin, Employee, Security | Update status or details |
| DELETE | `/:id` | Admin | Delete appointment |

### Passes — `/api/passes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/issue/:appointmentId` | Admin, Employee | Generate pass + email PDF to visitor |
| GET | `/verify/:passCode` | Admin, Security | Look up a pass by code |
| GET | `/my-passes` | Visitor, Admin | Get passes for the logged-in visitor |

### Check Logs — `/api/checklogs`

| Method | Path | Body | Auth | Description |
|--------|------|------|------|-------------|
| POST | `/scan` | `{ passCode }` | Admin, Security | Scan pass → triggers OTP or records check-out |
| POST | `/verify-otp` | `{ passCode, otp }` | Admin, Security | Verify OTP → records check-in |
| GET | `/` | — | Admin, Security | All check logs |

### Dashboard — `/api/dashboard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/stats` | Admin | Total/active visitors, today's appointments, recent logs |

---

## Deployment (Render)

### Backend

1. Push code to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo.
3. Set **Root Directory** to `backend`.
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add all environment variables from the `.env` section above under **Environment**.

### Frontend

1. Go to Render → **New Static Site** → connect the same repo.
2. Set **Root Directory** to `frontend`.
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`
6. Update `frontend/src/services/api.js` base URL to use `import.meta.env.VITE_API_URL`.

---

## Screenshots

| Screen | Description |
|--------|-------------|
| Login | Role-based login with glassmorphic design |
| Admin Dashboard | Live stats cards + security activity feed |
| Visitor Directory | Searchable table with status filter and CSV export |
| Add Visitor | Registration form with photo upload preview |
| Manage Staff | Create / enable / disable Employee and Security accounts |
| Employee Appointments | Card grid with approve / reject / dispatch pass actions |
| Security Scanner | Camera QR scan + manual code entry + OTP flow |
| Visitor Pass | QR code display card with pass status |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default `7d`) |
| `NODE_ENV` | No | `development` or `production` |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | Yes | SMTP port (465 for Gmail SSL) |
| `SMTP_USER` | Yes | SMTP username / email |
| `SMTP_PASS` | Yes | SMTP password / app password |
| `FROM_NAME` | No | Sender display name in emails |
| `FROM_EMAIL` | No | Sender email address |
| `TWILIO_ACCOUNT_SID` | No | Twilio account SID (SMS OTP) |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | No | Twilio phone number |

---

> Built with Node.js, Express, React, MongoDB, and TailwindCSS as a final project submission.
