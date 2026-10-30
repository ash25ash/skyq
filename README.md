# ✈️ SkyQ.com — In-Flight Web App & Aviation Rewards Challenge

A modern, responsive, bilingual web application designed for the domain **SkyQ.com**, accessed via QR code on boarding passes or in-flight seatbacks. Passengers verify their flight credentials, complete an interactive 10-question aviation quiz, and unlock the **SkyQ Lucky Roulette** to win luxury travel gifts with automated email delivery and airport pickup instructions.

---

## 🌟 Key Features & Requirements Met

| Requirement | Implementation Details |
| :--- | :--- |
| **Domain & QR Access** | Built for `SkyQ.com`. Interactive built-in QR Code generator & boarding pass scanner simulation (`/api/qr`). |
| **Step 1: Welcoming Message** | Dedicated welcoming screen introducing the SkyQ in-flight experience and challenge before clicking. |
| **Step 2: Passenger Verification** | Requires **First Name**, **Last Name**, **Flight Number**, **Flight Date**, and **Email Address**. Strict client-side and server-side validation blocks invalid entries. |
| **Step 3: The 10-Question Quiz** | **All 10 questions listed at once** on the screen. Questions are **randomly selected** from the database question bank. Questions & their 4 choices are **randomly shuffled** on each attempt. |
| **Styling Specifications** | Soothing **Baby Blue background** (`#BAE6FD` / `#A5D8F7`), **Dark Blue font** (`#0A2540`), **White Rectangle** card containing the questions/answers, and **airplane figures** floating in the background outside the rectangle. |
| **Step 4: Results & Scoring** | Tells how many answers were correct out of 10. **A perfect 10/10 score is strictly required** to proceed to the Roulette. If score < 10, provides detailed explanations and retry option. |
| **Step 5: Lucky Roulette Wheel** | Interactive 8-segment canvas roulette wheel with realistic physics, deceleration, Web Audio ticking sounds, and confetti blast. |
| **Gift Award & Email Delivery** | Generates a unique claim code (e.g., `SKYQ-GIFT-4819`) and displays airport pickup location (Terminal 1 Gate B4). Dispatches an email notification to the passenger with full voucher details. |
| **3 Separate Databases** | 3 independent SQLite databases: `clients.db`, `questions.db`, and `quiz_awards.db` with SQL schema files in `sql/`. |
| **Bilingual Support** | Complete dual-language system: **English (🇬🇧 EN)** and **Romanian (🇷🇴 RO)** for all screens, questions, options, roulette, and email templates. |

---

## 🗄️ Architecture of the 3 Databases

The system utilizes **three distinct, isolated database files** in the `data/` directory, managed via Node.js native `node:sqlite`:

```
data/
├── clients.db          # Database 1: Passenger registration & flight verification
├── questions.db        # Database 2: Aviation questions bank & answer keys (EN & RO)
└── quiz_awards.db      # Database 3: Quiz submissions, scoring audit, & awards won
```

### 1. Database 1: `clients.db` (`sql/01_clients.sql`)
Stores passenger flight credentials and registration metadata:
- `id` (INTEGER PRIMARY KEY)
- `uuid` (TEXT UNIQUE) — Secure client session identifier
- `first_name` (TEXT)
- `last_name` (TEXT)
- `email` (TEXT) — Recipient address for prize voucher
- `flight_number` (TEXT) — e.g., `SQ 402`, `RO 302`, `LH 1420`
- `flight_date` (TEXT) — Flight departure date
- `language` (TEXT) — Preferred language (`en` or `ro`)
- `created_at` (TEXT)

### 2. Database 2: `questions.db` (`sql/02_questions.sql`)
Stores bilingual aviation trivia questions, answer choices, and correct options:
- `id` (INTEGER PRIMARY KEY)
- `code` (TEXT UNIQUE) — e.g., `Q01`, `Q02`, ...
- `question_en`, `question_ro` (TEXT) — Question text in both languages
- `option_a_en`, `option_a_ro` (TEXT)
- `option_b_en`, `option_b_ro` (TEXT)
- `option_c_en`, `option_c_ro` (TEXT)
- `option_d_en`, `option_d_ro` (TEXT)
- `correct_option` (TEXT: 'A', 'B', 'C', or 'D')
- `explanation_en`, `explanation_ro` (TEXT) — Educational explanations
- `category` (TEXT) — aerodynamics, navigation, safety, etc.

### 3. Database 3: `quiz_awards.db` (`sql/03_quiz_awards.sql`)
Stores quiz attempts, answer audit logs, and roulette prizes won:
- **Table `quiz_submissions`**:
  - `id` (INTEGER PRIMARY KEY)
  - `client_uuid` (TEXT)
  - `total_questions` (INTEGER, 10)
  - `correct_count` (INTEGER)
  - `score_percent` (REAL)
  - `is_perfect` (INTEGER, 1 or 0)
  - `answers_json` (TEXT) — Audit log of client selections
  - `submitted_at` (TEXT)
- **Table `client_awards`**:
  - `id` (INTEGER PRIMARY KEY)
  - `client_uuid` (TEXT)
  - `submission_id` (INTEGER)
  - `prize_id` (TEXT) — e.g., `PRZ_LOUNGE`, `PRZ_DUTYFREE`
  - `prize_title_en`, `prize_title_ro` (TEXT)
  - `claim_code` (TEXT UNIQUE) — e.g., `SKYQ-GIFT-8392`
  - `pickup_location_en`, `pickup_location_ro` (TEXT) — Airport pickup desk
  - `email_recipient` (TEXT)
  - `email_status` (TEXT)
  - `email_sent_at` (TEXT)
- **Table `prizes_catalog`**:
  - Catalog of 8 prizes featured on the roulette wheel with color hex codes and probability weights.

---

## 📁 Project Directory Structure

```
skyq-webapp/
├── data/                         # The 3 separate SQLite database files
│   ├── clients.db
│   ├── questions.db
│   └── quiz_awards.db
├── sql/                          # Clean SQL DDL and seed scripts
│   ├── 01_clients.sql
│   ├── 02_questions.sql
│   └── 03_quiz_awards.sql
├── src/
│   ├── config.js                 # Configuration (Port, Domain, SMTP, Paths)
│   ├── db/
│   │   ├── clientsDb.js          # Database 1 driver
│   │   ├── questionsDb.js        # Database 2 driver (Randomizer & Verifier)
│   │   └── quizAwardsDb.js       # Database 3 driver (Submissions & Awards)
│   ├── services/
│   │   ├── emailService.js       # HTML email generator & dispatcher
│   │   └── qrService.js          # Pure JS SVG QR Code generator
│   └── server.js                 # HTTP REST API & static file server
├── public/
│   ├── index.html                # Single-page application markup
│   ├── css/
│   │   └── styles.css            # Baby blue sky, dark blue font, airplane figures, white quiz box
│   ├── js/
│   │   ├── app.js                # Form validation, quiz coordinator, step router
│   │   ├── i18n.js               # Bilingual English & Romanian translation dictionary
│   │   ├── roulette.js           # HTML5 Canvas 3D wheel with Web Audio ticks
│   │   └── confetti.js           # Victory celebration particles
│   └── assets/
│       ├── logo.svg              # SkyQ aviation logo
│       └── airplanes.svg         # Airplane silhouette graphics
├── scripts/
│   ├── seed.js                   # Database initialization and seeding script
│   └── start.bat                 # Windows one-click startup batch script
├── package.json
└── README.md
```

---

## 🚀 Quick Start & How to Run

### Prerequisites
- Node.js (v18, v20, v22, or v24+). Built-in `node:sqlite` is used, requiring **zero external npm compilation**.

### Option 1: Direct Command Line
From the project folder:
```powershell
# 1. Seed all three databases
node scripts/seed.js

# 2. Launch the application server
node src/server.js
```

### Option 2: Windows Batch Script
Simply double-click:
```
scripts\start.bat
```

Open your browser at:
👉 **`http://localhost:3000`**

---

## 📱 Testing the QR Code Flow for SkyQ.com

1. In the top navigation bar, click the **"📱 Boarding Pass QR"** button.
2. An official boarding pass QR code is generated on screen pointing to `SkyQ.com` (or your local IP address for mobile testing).
3. Scanning the QR code with any mobile camera immediately opens the SkyQ welcome screen.

---

## 🛠️ Testing the Step-by-Step Flow

1. **Step 1 (Welcome)**: Click **"Start Experience ➔"**.
2. **Step 2 (Passenger Info Form)**:
   - Try submitting with empty fields: notice the red highlight and error messages.
   - Enter valid details:
     - First Name: `Alexander`
     - Last Name: `Vancea`
     - Email: `alexander.vancea@example.com`
     - Flight Number: `SQ 402` or `RO 302`
     - Flight Date: Select today's date
   - Click **"Proceed to Quiz ➔"**. (Data is committed to `data/clients.db`).
3. **Step 3 (Quiz)**:
   - All 10 questions are rendered at once inside the **white rectangle**.
   - Notice the **airplane figures** floating in the background baby blue sky outside the rectangle.
   - Answer all 10 questions (use the hints in explanations if you want to achieve 10/10).
   - Click **"Submit Answers ➔"**. (Data is audited and stored in `data/quiz_awards.db`).
4. **Step 4 (Results)**:
   - View your score (e.g. `10 / 10`).
   - If 10/10: Confetti blasts and the **"Proceed to Lucky Roulette ➔"** button is unlocked.
5. **Step 5 (Roulette)**:
   - Click **"SPIN THE WHEEL ✈️"**.
   - Watch the wheel spin with tick sound effects and land on a luxury prize.
   - The winning voucher card displays your claim code (e.g. `SKYQ-GIFT-5829`) and exact airport pickup desk (e.g. `Airport Terminal 1, SkyQ Lounge Reception, Gate B4`).
   - Click **"Preview Sent Email ✉️"** to inspect the confirmation email.
6. **3 Databases Live Inspector**:
   - Click **"🗄️ 3 Databases Inspector"** in the top bar to inspect records in `clients.db`, `questions.db`, and `quiz_awards.db` in real time!
