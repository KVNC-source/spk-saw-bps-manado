# SPK SAW – SIBEMI

### Decision Support System for Mitra Evaluation using Simple Additive Weighting (SAW)

**Integrated with SIBEMI (Sistem Pengisian Beban Kerja Mitra Bulanan)** **BPS Kota Manado**

---

## 📌 Overview

**SPK SAW – SIBEMI** is a web-based Decision Support System (Sistem Pendukung Keputusan) developed for **BPS Kota Manado** to evaluate and rank _mitra_ (partners) objectively.

The system pulls real, approved workload data from the SIBEMI system and applies the **Simple Additive Weighting (SAW)** method to produce:

- **Transparent Ranking:** Data-driven results based on mathematical modeling.
- **Period-based Locking:** Decision locking to ensure data integrity for each evaluation cycle.
- **Automatic SPK Metadata:** Streamlined generation of work order (SPK) details.
- **Full Traceability:** Audit trail from raw workload data → normalization → weighted scores → final ranking.

---

## 🎯 Objectives

- Provide objective and data-driven mitra evaluation.
- Replace manual and subjective ranking processes.
- Ensure auditability and traceability for institutional accountability.
- Automate the SPK generation process.
- Support academic **Tugas Akhir** research in Decision Support Systems.

---

## 🧠 Decision Method: Simple Additive Weighting (SAW)

### Criteria & Weighting

| Criterion      | Description                              | Weight | Type    |
| -------------- | ---------------------------------------- | ------ | ------- |
| ketepatanWaktu | Ketepatan waktu dalam penyelesaian tugas | 0.3    | Benefit |
| kualitas       | Kualitas hasil pekerjaan                 | 0.4    | Benefit |
| komunikasi     | Kemampuan komunikasi dan koordinasi      | 0.3    | Benefit |

### SAW Output

1.  **Raw values** per criterion.
2.  **Normalized values** (scaling data to a 0-1 range).
3.  **Weighted scores** (applying priority weights).
4.  **Final preference score** used for ranking.

---

## 🏗️ Tech Stack

**Backend:**

- NestJS (Node.js Framework)
- PostgreSQL (Database)
- Prisma (ORM)
- REST API Design

**Frontend:**

- React + TypeScript
- Tailwind CSS (Styling)
- React Router (Navigation)
- Axios (API Consumption)

---

## 📂 Project Structure

```text
spk-saw-bps-manado/
│
├── backend/
│   ├── src/
│   │   ├── saw/          # SAW Calculation Engine
│   │   ├── prisma/       # DB Connection & Client
│   │   ├── spk/          # SPK Generation Logic
│   │   └── main.ts       # Entry Point
│   ├── prisma/
│   │   ├── schema.prisma # Database Schema
│   │   └── seed.ts       # Initial Data Seeding
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── auth/         # Authentication Logic
│   │   ├── router/       # App Routing
│   │   ├── App.tsx       # Main Component
│   │   └── index.css     # Tailwind Directives
│   └── package.json
│
└── README.md
```

---

### 📋 Prerequisites

Ensure you have the following software installed on your machine:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** (v14.x or higher)
- **Git** (Latest version)

Check versions:

- node -v
- npm -v
- psql --version

---

## How to Run Locally

### 1. Clone Repository

git clone https://github.com/KVNC-source/spk-saw-bps-manado.git
cd spk-saw-bps-manado

### 2. Backend Setup

Navigate to backend directory:
cd backend
npm install
`.env` file in `backend/`: DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/spk_saw_db?schema=public"
PORT=3000

---

## 🗄️ Database Setup

### Step 1 – Create Database

Open PostgreSQL and run:
CREATE DATABASE spk_saw_db;

### Step 2 – Run Prisma Migration

npx prisma migrate dev --name init

### Step 3 – Generate Prisma Client

npx prisma generate

## ▶️ Run Backend Server

npm run start:dev

---

# 3️⃣ Frontend Setup (React + Tailwind)

### Navigate to frontend folder

cd frontend (2nd terminal)

## ▶️ Run Frontend

npm run dev

---

# 🔒 Business Rules

- SAW calculation can only be executed once per period
- Re-calculation for the same period is blocked
- Only APPROVED workload data is included
- Rankings are locked after generation
- SPK generation is based on final ranking

# 📈 Current Development Status

## ✅ Completed

- SAW calculation engine
- Normalization & weighted scoring
- Mitra ranking system
- Period-based decision locking
- SPK metadata generation
- Prisma schema finalized
- Environment configuration stabilized

# 🎓 Academic Context

This project aligns with:

- Decision Support System (SPK) theory
- Multi-Criteria Decision Making (MCDM)
- Software Engineering best practices
- Real-world institutional case study

Developed as part of an academic Final Project (Tugas Akhir).

# 📄 License

Developed for educational and institutional purposes only.  
Not intended for commercial redistribution.

# 🏁 Final Statement

From approved workload data  
→ through objective SAW calculation  
→ into transparent ranking  
→ and formal SPK generation

Fully auditable.  
Fully data-driven.  
Built for institutional accountability.
