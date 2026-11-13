# Modern Village (Morden Village) 🏛️🌱

> **AI-Powered Gram Panchayat Complaint Management System**  
> *"Your Village. Your Voice. Our Responsibility."*

Modern Village is a full-featured, production-ready civic technology platform built to empower villagers to report public infrastructure issues effortlessly and assist Gram Panchayat officials in prioritizing, tracking, and resolving complaints transparently.

---

## 🌟 Key Features & Workflows

### 1. 👥 Dual Role-Based Portals

- **Villager Portal**:
  - Secure registration and login with Indian mobile number validation (`+91` / 10 digits) and strict password rules.
  - Personalized Dashboard with summary counters (Total, Pending, In Progress, Resolved).
  - Multi-step complaint submission with camera capture, GPS geolocation tagging, and category selection.
  - Visual 4-stage complaint resolution progress tracker (`Submitted` ➔ `Acknowledged` ➔ `In Progress` ➔ `Resolved`).
  - In-app notification center with real-time alerts.

- **Panchayat Admin Portal**:
  - Secure official login for Sarpanch, Panchayat Secretary, and Ward Engineers.
  - Triage management table automatically sorted: **HIGH Priority first, then MEDIUM, then LOW. Within each priority, oldest unresolved requests first.**
  - One-click **"Acknowledged"** workflow: logs timestamp, official name, audit trail, and notifies the villager.
  - **"Work Done"** completion workflow: confirmation modal with resolution notes and automated citizen notification.
  - Official priority override with recorded audit justification.
  - Comprehensive reports and analytics dashboard with resolution metrics.

---

### 2. ⚡ AI-Based Priority Classification

Every reported problem automatically receives one of three priority levels (**HIGH**, **MEDIUM**, **LOW**) along with a concise justification:

- **HIGH Priority**:
  - Exposed live electrical wiring or sparking transformers.
  - Severe drinking water contamination or sewage flooding into homes.
  - Collapsed roads, major cave-ins, or fatal public transit hazards.
  - Imminent structural collapse threats or public animal hazards.
- **MEDIUM Priority**:
  - Non-working streetlights in busy areas or nocturnal security risks.
  - Water pipeline leaks and supply disruptions without immediate toxic contamination.
  - Significant potholes and road wear.
  - Overflowing municipal garbage bins and blocked drains.
- **LOW Priority**:
  - Minor cosmetic repairs (faded paint, park bench aesthetics).
  - Non-hazardous routine maintenance and beautification suggestions.

*Dual Engine*: Integrated with Gemini AI (`VITE_GEMINI_API_KEY`) with an automatic, resilient contextual heuristic rule-based fallback.

---

### 3. 🛠️ 10 Major Civic Categories

1. **Electrical Problems** — Damaged streetlights, power faults, exposed public wiring.
2. **Water Supply** — Pipeline leakage, water shortages, contaminated drinking water, broken taps.
3. **Roads and Transportation** — Potholes, damaged roads, blocked public paths.
4. **Waste Management and Sanitation** — Overflowing bins, garbage accumulation, sanitation issues.
5. **Public Property Damage** — Broken benches, damaged bus shelters, government building wear.
6. **Drainage and Sewage** — Clogged drainage, sewage leakage, overflowing channels.
7. **Streetlights and Public Lighting** — Non-working luminaires, dark public roads.
8. **Parks and Public Spaces** — Damaged playground equipment, neglected green areas.
9. **Animal-Related Public Issues** — Stray animal hazards, public animal concerns.
10. **Other** — Any village problem that does not fit the standard categories.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open in your browser
http://localhost:5173/
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔑 Demo Accounts for Instant Testing

The application includes built-in quick demo accounts accessible from the header:

| Role | Email | Password | Details |
|---|---|---|---|
| **Villager** | `rameshwar@villager.in` | `Villager@2026!` | Rameshwar Patel (Ward 3, Kandavara) |
| **Panchayat Official** | `official@panchayat.gov.in` | `Panchayat@2026!` | Satish Sharma (Panchayat Secretary) |

*You can also register a new villager account anytime or track any complaint number (e.g. `MV-2026-00001`) from the Quick Tracker on the landing page.*

---

## 🗄️ Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Open and run the migration script located at:
   `supabase/migrations/20261021_init_modern_village.sql`
4. Copy your project URL and Anon key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. *Note: If Supabase keys are not provided, Modern Village automatically runs in persistent local mode with pre-seeded data, ensuring 100% functionality out of the box.*

---

## 📁 Project Structure

```
proj_morden_village/
├── index.html                   # HTML5 shell and Google Fonts
├── vite.config.js               # Vite configuration with React & Tailwind CSS
├── package.json                 # Dependencies (React 19, Tailwind v4, Lucide, Supabase)
├── .env.example                 # Environment configuration template
├── README.md                    # System documentation
├── supabase/
│   └── migrations/
│       └── 20261021_init_modern_village.sql # Full PostgreSQL schema, triggers & RLS
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main router, providers & modals
│   ├── index.css                # Tailwind CSS v4 design system
│   ├── types.js                 # Categories, status definitions & priority constants
│   ├── context/
│   │   ├── AuthContext.jsx      # Role-based authentication & demo switches
│   │   └── ComplaintContext.jsx # Complaint mutations, lifecycle & notifications
│   ├── services/
│   │   ├── supabase.js          # Supabase client + resilient local data repository
│   │   └── aiClassifier.js      # AI Priority Triage (Gemini + contextual rules)
│   ├── components/
│   │   ├── Navbar.jsx           # Government header with role badge & demo toggles
│   │   ├── Footer.jsx           # Civic emergency helplines & citizen guides
│   │   ├── PriorityBadge.jsx    # HIGH / MEDIUM / LOW badge with AI indicator
│   │   ├── StatusBadge.jsx      # Lifecycle badge (Pending, Ack, In Progress, Done)
│   │   ├── NotificationDropdown.jsx # Real-time in-app notification center
│   │   ├── ComplaintDetailModal.jsx # Full modal with 4-stage progress tracker
│   │   └── QuickTrackerModal.jsx    # Public ticket tracking dialog
│   └── pages/
│       ├── LandingPage.jsx      # Government-grade landing with 2 prominent role cards
│       ├── VillagerAuthPage.jsx # Registration & Login with Indian mobile validation
│       ├── VillagerDashboard.jsx# Citizen overview & reported problems list
│       ├── ReportProblemPage.jsx# 4-Step complaint form (Camera, GPS, Category, AI Review)
│       ├── PanchayatLoginPage.jsx# Official login with administrative security
│       ├── PanchayatDashboard.jsx# Priority triage table (HIGH first, Ack & Done actions)
│       └── PanchayatReports.jsx # Category breakdowns, resolution time & CSV export
└── dist/                        # Production build bundle
```

---

## 🧪 Acceptance Test Verification

- [x] Landing page displays prominent **"Continue as Villager"** and **"Continue as Panchayat"** options.
- [x] Villager registration validates Indian mobile numbers, email, and password strength.
- [x] 4-step complaint workflow with camera capture / file upload and browser GPS location tagging.
- [x] AI priority classification assigns HIGH, MEDIUM, or LOW with clear safety explanations.
- [x] Panchayat Dashboard sorts complaints: **HIGH first, then MEDIUM, then LOW. Within each priority, oldest unresolved complaints first.**
- [x] Officials can acknowledge complaints, changing status from PENDING to ACKNOWLEDGED.
- [x] Officials can mark work completed with a resolution summary note.
- [x] Villagers receive automatic in-app notifications upon acknowledgement and completion.
- [x] Reports & Analytics calculates actual average resolution time in hours and displays category distributions.
- [x] Public ticket tracking dialog allows quick search by complaint ID (e.g. `MV-2026-00001`).
