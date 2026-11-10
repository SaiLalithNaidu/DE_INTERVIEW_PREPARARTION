# Data Engineer Interview Preparation — React Frontend Platform

An enterprise-grade, frontend-only self-study application designed specifically for **Data Engineer Interview Preparation**, matching the pixel-perfect UX and layout from the design specifications.

![Platform Screenshot](src/assets/screenshot-preview.png)

---

## 🚀 Features & Architecture

### 1. Learner Study Area
* **Concept Infographic Viewer**:
  * High-definition visual diagrams matching the reference design (hero banner, concept definitions, cloud/big data libraries, real-time pipeline diagrams, and key interview takeaways).
  * **Zoom & Pan Controls**: Zoom In (+25%), Zoom Out (-25%), Reset (100%), and Full-Screen preview mode.
  * Preserves aspect ratios without cropping or clipping (`object-fit: contain`).
* **5-Tab Multi-Angle Question Drilldown**:
  * **Image**: High-yield infographic card or uploaded diagram.
  * **Answer**: Crisp, concise 30-second definition suitable for technical phone screens.
  * **Explanation**: Deep architectural dive explaining internals, tradeoffs, and failure modes.
  * **Example**: Real-world production code (PySpark, SQL, Boto3, Airflow DAGs) with 1-click **Copy Code** button.
  * **Key Takeaways**: High-impact bullet points interviewers look for.
* **Single-Open Accordion UX**:
  * Selecting any question expands it and collapses previous questions.
* **Filtering & Navigation**:
  * Filter chips: All, Basics, Advanced, Coding, Data Engineering.
  * Real-time search inside current section.
  * Section-level pagination (`< 1 2 3 ... 6 >`).
  * Completion tracker with subtle celebratory confetti.
  * Instant bookmarking saved across browser reloads.

### 2. Admin Content Management (Zero Backend Required)
* **Question Management Table**:
  * Filter by Section, Topic, Search, and Status (Active vs Archived).
  * Status badges, Infographic indicators, and fast actions (Edit, Archive, Delete).
* **Add / Edit Question Editor**:
  * Section & Topic selector with dynamic cascade.
  * Difficulty selector (Basics, Intermediate, Advanced, Coding).
  * Short answer definition field.
  * Detailed explanation editor with quick markdown formatting bar (`**bold**`, `*italic*`, `list`, `code`, `link`).
  * Code snippet textarea.
  * Dynamic bullet point list for Key Takeaways.
* **Client-Side Image Upload & IndexedDB**:
  * Supports PNG, JPG, JPEG, and WEBP up to **8 MB**.
  * File size and MIME type validation.
  * Direct storage in browser **IndexedDB (`dep-images`)** without compression loss.
  * Instant image preview and replace/remove actions.
* **Section & Topic Creator**:
  * Add custom sections (e.g., Kafka, DBT, Snowflake, Kubernetes) and topics on the fly.
* **Data Portability**:
  * Export entire question bank and progress to JSON backup.
  * Import JSON to restore data on another computer/browser.
  * Reset to factory seed data button.

### 3. Additional Interview Prep Tools
* **Dashboard**: Visual progress circle, total questions count, mastered count, and 1-click "Continue Preparation" launcher.
* **Mock Interview Simulator**: Timed 15-minute simulated technical screen with 3-minute pacing timer, answer scratchpad, and revealable model solutions.
* **Practice Quiz**: Interactive assessment test with instant feedback and scoring.
* **Bookmarks & Progress Center**: Targeted revision of difficult questions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 (Vite 6) |
| **Routing & Navigation** | Client-side reactive router |
| **Icons** | Lucide React |
| **Styling** | Custom CSS3 with Design Tokens & Modern Typography |
| **Structured Storage** | Browser `localStorage` (`dep_sections`, `dep_topics`, `dep_questions`, `dep_bookmarks`, `dep_progress`) |
| **Binary Image Storage** | Browser `IndexedDB` (`dep-images` store) |
| **Micro-Interactions** | Canvas Confetti |

---

## 💻 How to Run Locally

### Prerequisites
- Node.js 18+ and npm installed

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
d:\DE_INTERVIEW_PREPARARTION\
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                     # Application bootstrap
│   ├── App.jsx                      # App root, state coordinator & routing
│   ├── styles.css                   # Comprehensive styles & SaaS design tokens
│   ├── data/
│   │   └── seed.js                  # Pre-populated DE questions bank & topics
│   ├── lib/
│   │   └── store.js                 # LocalStorage & IndexedDB helpers
│   └── components/
│       ├── Sidebar.jsx              # Collapsible dark navigation sidebar
│       ├── Header.jsx               # Breadcrumb title, search bar, & profile
│       ├── InfographicViewer.jsx    # Vector diagram + IndexedDB image renderer
│       ├── QuestionAccordion.jsx    # 5-tab question detail & subsequent cards
│       ├── SectionQuestionsView.jsx # Split view with filter chips & pagination
│       ├── AdminQuestionManagement.jsx # Table view, filters, archive, export
│       ├── AdminAddEditQuestion.jsx # Form editor with 8MB image upload
│       ├── Dashboard.jsx            # Candidate progress dashboard & KPI stats
│       ├── BookmarksView.jsx        # Saved question study collection
│       ├── ProgressView.jsx         # Preparation completion breakdown
│       ├── MockInterviewView.jsx    # Timed technical mock interview simulator
│       └── QuizView.jsx             # Multiple-choice self assessment quiz
```

---

## 🔒 Storage & Data Notes
- **Local to Device**: All newly created questions, uploaded infographics, bookmarks, and completion checkmarks persist locally in your browser's `localStorage` and `IndexedDB`.
- **Zero Backend Required**: No server, API, Firebase, or external database setup is needed.
- **Backup Recommendation**: Use the **Export JSON** button in Question Management before clearing your browser site data or cookies.

