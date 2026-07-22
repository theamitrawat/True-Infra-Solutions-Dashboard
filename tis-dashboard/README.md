# True Infra Solutions Dashboard

A React business analytics dashboard for **True Infra Solutions**, a construction and fit-out company based in Delhi NCR.

The dashboard turns static project data into KPI cards, charts, filterable tables, client summaries, service analytics, and an AI chat interface for asking natural-language questions about the business data.

## Features

- Business overview with total projects, revenue, cost, and profit.
- Service and city filters for quick project exploration.
- Revenue by service and projects by city charts.
- Dedicated project table with ratings, service badges, and financial details.
- Client leaderboard with revenue, cost, profit, and project counts.
- Analytics page for margin, monthly trends, market segments, ratings, and service performance.
- Ask AI page powered by Groq's Llama model for questions about project data.
- GitHub Pages deployment workflow included.

## Pages

| Page | Purpose |
| --- | --- |
| Overview | Main dashboard with KPIs, filters, charts, and recent projects. |
| Projects | Filterable project list by service and city. |
| Clients | Client-wise revenue, cost, profit, ranking, and top clients. |
| Analytics | Deeper visual analysis of margins, trends, ratings, cities, markets, and services. |
| Ask AI | Chat interface for asking questions about the project dataset. |

### Overview
<img width="1911" height="997" alt="image" src="https://github.com/user-attachments/assets/88385493-4a6b-4897-a2c7-bb316aa66544" />

### Projects
<img width="1911" height="991" alt="image" src="https://github.com/user-attachments/assets/0bcff926-1b8b-40a8-92d9-5c2b8620bdc0" />

### Clients
<img width="1909" height="997" alt="image" src="https://github.com/user-attachments/assets/3a6d51b8-8bf9-4118-96f9-6d5fa17b91a1" />

### Analytics
<img width="1911" height="989" alt="image" src="https://github.com/user-attachments/assets/fb1a269a-f247-49b2-8283-82d7d5cf60a8" />

### Ask AI
<img width="1911" height="994" alt="image" src="https://github.com/user-attachments/assets/112e7ff7-799f-43df-a6b4-61f8a4c13796" />


## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Recharts
- Groq API
- ESLint

## Project Structure

```text
tis-dashboard/
|-- public/
|   |-- favicon.svg
|   `-- icons.svg
|-- src/
|   |-- assets/
|   |   `-- hero.png
|   |-- components/
|   |   |-- DataTable.jsx
|   |   |-- KpiCard.jsx
|   |   |-- RatingBar.jsx
|   |   |-- SectionHeader.jsx
|   |   `-- ServiceBadge.jsx
|   |-- data/
|   |   |-- electrical.json
|   |   |-- exterior_fitout.json
|   |   |-- hvac.json
|   |   |-- interior_fitout.json
|   |   |-- maintenance.json
|   |   `-- plumbing.json
|   |-- pages/
|   |   |-- Analytics.jsx
|   |   |-- AskAI.jsx
|   |   |-- Clients.jsx
|   |   `-- Projects.jsx
|   |-- services/
|   |   |-- aiService.js
|   |   `-- dataService.js
|   |-- App.jsx
|   |-- constants.js
|   |-- index.css
|   `-- main.jsx
|-- .github/workflows/deploy.yml
|-- index.html
|-- package.json
`-- vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

From the repository root:

```bash
cd tis-dashboard
npm install
```

### Environment Variables

Create a local `.env` file in the `tis-dashboard` folder:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

An `.env.example` file is included as a reference. The API key is required only for the Ask AI page.

### Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173/tis-dashboard/
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates a production build in `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint checks. |

## Data

The dashboard uses static JSON files from `src/data/`. Each file represents one service category:

- Electrical
- HVAC
- Plumbing
- Interior Fitout
- Exterior Fitout
- Maintenance

Each project record includes:

```text
Project_ID
Client_Name
City
Service
Market
Revenue
Cost
Rating
Start_Date
End_Date
```

The data aggregation logic lives in `src/services/dataService.js`, including helpers for totals, margins, averages, grouping, filtering, rating distribution, monthly trends, and top project rankings.

## AI Feature

The Ask AI page uses `src/services/aiService.js` to build a business summary from the project data and send it to the Groq chat completions API.

Current model:

```text
llama-3.3-70b-versatile
```

Example questions:

- Which city has the most projects?
- Who is the top client by revenue?
- What is the overall profit margin?
- Which service earns the most revenue?
- Which market segment is most profitable?

The chat supports streaming responses, recent message history, follow-up suggestions, copy actions, and friendly error messages for missing or invalid API keys.

## Deployment

The project includes a GitHub Actions workflow at `.github/workflows/deploy.yml` for deploying to GitHub Pages.

Deployment runs when changes are pushed to the `main` branch. The workflow:

1. Checks out the repository.
2. Sets up Node.js 20.
3. Installs dependencies with `npm ci`.
4. Builds the Vite app.
5. Uploads and deploys the `dist/` folder to GitHub Pages.

Before deploying, add this repository secret in GitHub:

```text
VITE_GROQ_API_KEY
```

Also make sure GitHub Pages is configured to use **GitHub Actions** as the source.

The app is configured for this GitHub Pages base path:

```text
/tis-dashboard/
```

If the repository name changes, update both:

- `base` in `vite.config.js`
- `basename` in `src/main.jsx`

## Brand Colors

| Name | Hex | Usage |
| --- | --- | --- |
| Navy | `#1e3a5f` | Sidebar, headings, primary chart color. |
| Gold | `#d4920a` | Accents, active navigation, revenue highlights. |
| Mid Navy | `#2e5484` | Secondary metrics and positive values. |
| Light Navy | `#7aa3cc` | Supporting labels and muted UI text. |
| Light Gray | `#f0f2f5` | Page background and soft panels. |

## Notes

- `.env` should stay local and should not be committed.
- Static project data can be updated by editing the JSON files in `src/data/`.
- The dashboard is a personal project built to visualise and analyse True Infra Solutions project data.
