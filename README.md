# ETF Recommendation Platform

This repository is composed of three layers:

- **Scrapy + Selenium** (`etf_scraper/`): scrapes ETF data from Yahoo Finance and stores it in MySQL.
- **Node/Express API** (`backend/`): exposes REST endpoints for the questionnaire, ETF catalog, and recommendation engine.
- **React client (Create React App)** (`frontend/`): questionnaire + investor dashboard.
- **Python model helper** (`ml/`): loads `etf_predictor.pkl` to estimate 30‑day upside probability.

---

## Prerequisites

- Node.js >= 18 (22.x recommended)
- Local MySQL instance with database `etf_db`
- ChromeDriver installed locally (used by Scrapy)

---

## Database bootstrap

1. Create the database if it does not exist:
   ```sql
   CREATE DATABASE IF NOT EXISTS etf_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Load schema and questionnaire seed:
   ```bash
   mysql -u root -p etf_db < database/schema.sql
   mysql -u root -p etf_db < database/questionnaire_seed.sql
   ```
3. Run the scraper to populate table `etfs`:
   ```bash
   cd etf_scraper
   scrapy crawl etf
   ```

---

## Backend (Express)

```bash
cd backend
cp .env.example .env   # adjust DB credentials if needed
npm install            # already executed once in this repo
npm run dev            # service on http://localhost:4000
```

Main routes under `/api`:

- `GET /questionnaire` – fetches the questionnaire.
- `POST /clients` – stores client profile, computes recommendations.
- `GET /clients/:id` – retrieves stored client profile.
- `GET /clients/:id/recommendations` – returns recommended ETFs.
- `POST /clients/:id/recommendations/refresh` – recomputes recommendations.
- `GET /etfs` – lists scraped ETFs.
- `GET /predictions?symbols=SPY,QQQ` – calls the Python helper to score the requested tickers.

---

## Frontend (React / CRA)

```bash
cd frontend
cp .env.example .env          # set REACT_APP_API_URL if backend is elsewhere
npm install                   # already executed once in this repo
npm start                     # dev server on http://localhost:3000
```

User flow:

1. Landing page with a call-to-action to start the questionnaire.
2. Investor questionnaire (risk, horizon, sector preferences, etc.).
3. Dashboard view:
   - Client summary card.
   - Recommendation block (with manual refresh).
   - Full ETF table for reference.

Questionnaire answers are normalized (e.g. `risk_tolerance: "medium"`) and persisted both in `clients` and `answers` tables.

---

## Quick checks

- **Backend**: `curl http://localhost:4000/health` should return `{ "status": "ok" }`.
- **Frontend**: run through questionnaire; dashboard should display recommendations.
- **Database**: `SELECT COUNT(*) FROM etfs;` confirms the scraper populated the table.
- **Model**: make sure Python dependencies (`yfinance`, `ta`, `joblib`, `xgboost`) are installed before hitting `/predictions`.

---

## Possible enhancements

- Add authentication so a client can revisit recommendations later.
- Store recommendation history and scoring metrics for audit.
- Integrate charts (e.g. Recharts) in the dashboard for sector/risk visuals.
