# TIS Dashboard

A business analytics dashboard built during my internship at **True Infra Solutions** — a construction and fit-out company based in Delhi NCR.

The dashboard visualizes project data across 6 service categories and includes an AI-powered chat feature to query the data in natural language.

---

## Live Demo

🚀 [View on GitHub Pages](https://YOUR-USERNAME.github.io/tis-dashboard/)

---

## Pages

| Page | Description |
|---|---|
| Overview | KPI cards, revenue/city charts, recent projects table with filters |
| Projects | Filter by service & city, project list with ratings |
| Clients | Client-wise revenue breakdown, top 3 podium, full table with profit |
| Analytics | Deeper data visualisations across services and cities |
| Ask AI | Chat with Groq (Llama 3.3) to ask questions about the data |

---

## Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS v4** for styling
- **Recharts** for bar and donut charts
- **React Router DOM v7** for navigation
- **Groq API** (Llama 3.3 70B) for AI chat

---

## Project Structure

```
src/
├── App.jsx              # main layout, sidebar, dashboard route
├── main.jsx             # entry point
├── constants.js         # shared colors, formatCurrency helper
├── index.css            # tailwind import
├── data/                # static JSON files (6 services)
│   ├── electrical.json
│   ├── hvac.json
│   ├── plumbing.json
│   ├── interior_fitout.json
│   ├── exterior_fitout.json
│   └── maintenance.json
├── components/          # reusable UI components
│   ├── KpiCard.jsx
│   ├── DataTable.jsx
│   ├── RatingBar.jsx
│   ├── SectionHeader.jsx
│   └── ServiceBadge.jsx
├── pages/
│   ├── Projects.jsx     # filterable project table
│   ├── Clients.jsx      # client aggregation + top 3
│   ├── Analytics.jsx    # charts and trends
│   └── AskAI.jsx        # Groq chat interface
└── services/
    ├── dataService.js   # data aggregation helpers
    └── aiService.js     # Groq API + prompt builder
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR-USERNAME/tis-dashboard.git
cd tis-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your key:

```bash
copy .env.example .env
```

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key from [console.groq.com](https://console.groq.com)

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deploying to GitHub Pages

The project deploys automatically via GitHub Actions on every push to `main`.

### One-time setup

1. **Create a GitHub repository** named `tis-dashboard` and push this project to it.

2. **Add your API key as a GitHub secret:**
   - Go to your repo → `Settings → Secrets and variables → Actions`
   - Click **New repository secret**
   - Name: `VITE_GROQ_API_KEY`
   - Value: your actual Groq API key

3. **Enable GitHub Pages:**
   - Go to your repo → `Settings → Pages`
   - Under **Source**, select **GitHub Actions**

4. Push to `main` — the workflow in `.github/workflows/deploy.yml` will build and deploy automatically.

Your live URL will be:
```
https://<your-github-username>.github.io/tis-dashboard/
```

> **Different repo name?** Update `base` in `vite.config.js` and `basename` in `src/main.jsx` to match.

---

## Data

The dashboard uses static JSON data in `src/data/`. Each file represents one service category:

- **Electrical** — electrical installation projects
- **HVAC** — heating, ventilation & AC projects
- **Plumbing** — plumbing work
- **Interior Fitout** — interior fit-out projects
- **Exterior Fitout** — exterior fit-out projects
- **Maintenance** — maintenance contracts

Each record contains: `Project_ID`, `Client_Name`, `City`, `Service`, `Market`, `Revenue`, `Cost`, `Rating`, `Start_Date`, `End_Date`

---

## AI Feature

The Ask AI page sends a summarized version of the project data as context to the Groq API. The model (Llama 3.3 70B) can answer questions like:

- *"Which city has the most projects?"*
- *"Who is the top client by revenue?"*
- *"What is the total profit?"*
- *"Which service earns the most?"*

The last 6 messages are included in each request so the conversation has memory.

> **Note:** The Groq API key is never bundled into the git history. It is injected at build time via a GitHub Actions secret.

---

## Brand Colors

| Color | Hex | Usage |
|---|---|---|
| Navy | `#1e3a5f` | Sidebar, headings, table borders |
| Gold | `#d4920a` | Accents, revenue numbers, active nav |
| Light Gray | `#f0f2f5` | Page background |

---

*Built as part of frontend engineering internship at True Infra Solutions, 2024.*
