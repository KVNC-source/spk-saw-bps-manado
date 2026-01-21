# SPK SAW – SIBEMI  
**Decision Support System for Mitra Evaluation using Simple Additive Weighting (SAW)**  
**Integrated with SIBEMI (Sistem Pengisian Beban Kerja Mitra Bulanan)**  
**BPS Kota Manado**

---

## 📌 Overview

This project is a **web-based Decision Support System (SPK)** developed to support **BPS Kota Manado** in evaluating and selecting mitra (partners) objectively and transparently.

The system implements the **Simple Additive Weighting (SAW)** method using **real workload data** from SIBEMI.  
Decisions are **data-driven, auditable, and period-based**, with the final output being the **automatic generation of SPK (Surat Perjanjian Kerja)**.

---

## 🎯 Objectives

- Provide objective and transparent mitra evaluation  
- Replace manual and subjective decision-making  
- Ensure traceability from workload data to final decision  
- Automate SPK generation based on decision results  
- Support academic research and Tugas Akhir requirements  

---

## ⚙️ Tech Stack

### Backend
- **NestJS** (REST API)
- **PostgreSQL**
- **Prisma ORM**
- Modular architecture (SAW, SPK, Mitra, Prisma)

### Frontend
- **React + TypeScript**
- **Tailwind CSS**
- (Frontend integration in progress)

---

## 🧠 Decision Method: Simple Additive Weighting (SAW)

The SAW method is implemented using the following criteria:

| Criterion | Description | Weight | Type |
|---------|------------|--------|------|
| totalVolume | Total workload volume | 0.3 | Benefit |
| totalNilai | Total honorarium value | 0.5 | Benefit |
| jumlahKegiatan | Number of activities | 0.2 | Benefit |

Only workload data with status **APPROVED** is included in the calculation.

Each SAW result provides:
- Original criterion values  
- Normalized values  
- Weighted contributions  
- Final preference score  
- Ranking position  

---


### Notes:
- SAW calculation can only be executed **once per period**
- Re-running SAW for the same period is prevented
- All decisions are based on real, approved data


---

## 📌 Current Status

### ✅ Completed
- SAW calculation logic
- Mitra ranking based on real data
- Automatic SPK metadata generation
- Period-based decision locking
- Database schema finalized
- Environment configuration stabilized

### 🚧 In Progress
- SPK document (PDF) generation
- BAST document module
- Frontend dashboard integration

---

## 🎓 Academic Context

This project is developed as part of an **academic final project (Tugas Akhir)** and aligns with:

- Decision Support System (SPK) theory  
- Multi-Criteria Decision Making (MCDM)  
- Software Engineering best practices  
- Real-world institutional case study (BPS Kota Manado)  

---

## 📄 License

This project is developed for **educational and institutional purposes**.  
All workflows and data structures are adapted to BPS operational needs.

---

> *From approved workload data to formal SPK documents — transparently and objectively.*
, ensuring separation of concerns and scalability.



The overall decision-making flow of the system is as follows:

