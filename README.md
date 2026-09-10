# AAROGYA — Complete End-to-End SIH Prototype

**Technology for Better Health**

AAROGYA is a Smart India Hackathon (SIH) prototype. It listens to the patient, verifies their health history, structures clinical information through an interactive AI conversation, performs preliminary triage assessment, and provides doctors with a comprehensive, actionable clinical summary.

---

## 🚀 Architectural Overview

The application is architected as a clean, full-stack solution:
- **Frontend**: Vite + React 19 + TypeScript + TailwindCSS 4 + Framer Motion + Lucide React.
- **Backend**: Node.js + Express.js REST API with Helmet security, CORS, and centralized error handling.
- **Database**: MongoDB with Mongoose ODM (supports both MongoDB Atlas and zero-setup MongoDB Memory Server fallback).
- **Authentication**: JWT authentication, bcryptjs password hashing, role-based access control (Patient / Doctor).
- **AI Intelligence**: Integrated AI Clinical Intelligence Service (Gemini API supported via `AI_API_KEY`, with intelligent rule-assisted triage fallback).

---

## 📑 Core User Journey

```
Patient Intake Page
       ↓
Demographics & ABHA Profile
       ↓
AI Conversation & Symptom Questionnaire (Text / Touch / Voice)
       ↓
Verification & Document OCR Attachment (Prescriptions / Lab Reports)
       ↓
AI Triage Assessment & Clinical Summary Generation
       ↓
Submit to Doctor Queue
       ↓
Doctor Review Dashboard (Patient Queue, Timeline, AI Summary, Verification & Notes)
```

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI** | Vanilla CSS, TailwindCSS 4, Framer Motion, Lucide React |
| **Backend Framework** | Node.js, Express.js |
| **Database & ODM** | MongoDB, Mongoose, MongoDB Memory Server |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js, Helmet, CORS |
| **AI Integration** | Google Gemini API / AAROGYA AI Clinical Intelligence Service |

---

## 📂 Project Structure

```
aarogya-frontend-main/
├── backend/                  # Node.js + Express REST Backend
│   ├── src/
│   │   ├── config/           # MongoDB Atlas & Memory Server connection
│   │   ├── controllers/      # Auth, Patient, Conversation, Summary, Doctor controllers
│   │   ├── middleware/       # JWT Auth & Centralized Error Handler
│   │   ├── models/           # User, PatientProfile, ClinicalRecord, Conversation, Document schemas
│   │   ├── routes/           # REST API routes (/api/auth, /api/patients, /api/conversations, etc.)
│   │   ├── services/         # AI Clinical Intelligence Service
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # HTTP server entry point
│   ├── .env.example          # Environment variables template
│   └── package.json
├── src/                      # Vite + React Frontend
│   ├── components/           # Reusable UI components & AuthModal
│   ├── data/                 # Demo data & Translations (EN / HI)
│   ├── hooks/                # AppContext & Step Guard
│   ├── layouts/              # Patient & Doctor layouts
│   ├── pages/                # Patient workflow & Doctor pages
│   ├── services/             # Connected REST API services (api.ts, patientService.ts, etc.)
│   ├── types/                # TypeScript interface definitions
│   ├── App.tsx
│   └── index.css
├── package.json
└── README.md
```

---

## ⚙️ Running Locally

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
*The backend server will run on `http://localhost:5000` and automatically initialize MongoDB.*

### 2. Start the Frontend Development Server
In a separate terminal window:
```bash
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

---

## 🔑 Environment Variables (`backend/.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=aarogya_sih_prototype_super_secret_jwt_key_2026
AI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

---

## 📡 REST API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user (Patient or Doctor) |
| `POST` | `/api/auth/login` | Sign in & receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user details |
| `GET` | `/api/patients` | Retrieve patient list / queue |
| `GET` | `/api/patients/:id` | Get patient record by ID |
| `PUT` | `/api/patients/profile` | Update demographic & profile details |
| `GET` | `/api/conversations/questions` | Fetch AI intake questions |
| `POST` | `/api/conversations` | Save patient answers & chat history |
| `POST` | `/api/summary/generate` | Generate AI clinical summary & triage assessment |
| `POST` | `/api/summary/confirm` | Doctor verification & approval |
| `GET` | `/api/doctor/queue` | Doctor patient queue |
| `POST` | `/api/documents/upload` | Upload & OCR process clinical documents |

---

## 🏥 Medical Safety Disclaimer

AAROGYA generates **preliminary structured information for physician review**. It does not make autonomous clinical diagnoses. Attention indicators and triage flags serve as decision-support alerts for qualified healthcare professionals. Final clinical judgments remain with the physician.
