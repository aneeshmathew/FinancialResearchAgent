# Two-Repository Production Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide provides a comprehensive walkthrough for deploying the decoupled **Autonomous Market & Financial Research Dashboard** to production across **Vercel** and **Render**.

---

## 1. Architectural Strategy: Two Dedicated Repositories

To simplify CI/CD pipelines, eliminate path configuration headaches, and optimize build caching, the codebase is split into two specialized repositories:

```
┌───────────────────────────────────────────────┐           ┌───────────────────────────────────────────────┐
│       FinancialResearchAgent (Frontend)       │           │   FinancialResearchAgent_Backend (Backend)    │
│            Hosted on Vercel (Edge)            │           │          Hosted on Render (Container)         │
├───────────────────────────────────────────────┤           ├───────────────────────────────────────────────┤
│ • Next.js 14 App Router, React 18, Tailwind   │    SSE    │ • FastAPI, Python 3.11/3.14, Gunicorn ASGI    │
│ • Root `package.json` (Zero-Config Vercel)    │  Stream   │ • Root `render.yaml` & `requirements.txt`     │
│ • Recharts & dynamic widget rendering         │ ────────> │ • Multi-agent LangGraph orchestration         │
│ • Connects to backend via NEXT_PUBLIC_... URL │           │ • SEC 10-K/10-Q RAG over Qdrant Cloud         │
└───────────────────────────────────────────────┘           └───────────────────────────────────────────────┘
                                                                            │
                                                                            ▼
                                                           ┌─────────────────────────────────┐
                                                           │      Qdrant Cloud Cluster       │
                                                           │   (Persistent Vector Storage)   │
                                                           └─────────────────────────────────┘
```

### Why Split into Two Separate Git Repositories?
* **Zero-Config Root Deployments:** Vercel automatically detects Next.js at the root of `FinancialResearchAgent` with no folder-override settings. Likewise, Render automatically reads `render.yaml` and `requirements.txt` at the root of `FinancialResearchAgent_Backend`.
* **Independent Versioning & Deployment:** Frontend UI tweaks (styling, themes, layout) deploy instantly on Vercel without triggering backend builds or risking Python dependencies. Backend agent logic, SEC ingestion, or prompt updates rebuild on Render without touching the frontend CDN.
* **Overcoming Serverless Timeouts:** Vercel Free has a **10–15 second timeout** on serverless functions. Because multi-agent equity research loops take 15–25 seconds, running FastAPI on Render's persistent container ensures Server-Sent Events (SSE) connections never drop.

---

## 2. Pre-Deployment Checklist

Before deploying, ensure you have:
1. **GitHub Accounts & Repositories:**
   - Frontend repo: `https://github.com/aneeshmathew/FinancialResearchAgent`
   - Backend repo: `https://github.com/aneeshmathew/FinancialResearchAgent_Backend`
2. **Google Gemini API Key:** From [Google AI Studio](https://aistudio.google.com/).
3. **Qdrant Cloud Cluster:** Cluster URL and API key from [Qdrant Cloud](https://cloud.qdrant.io/).
4. **Vercel Account:** Free account at [vercel.com](https://vercel.com).
5. **Render Account:** Free account at [render.com](https://render.com).

---

## 3. Step 1: Deploy Backend to Render

> **Order of operations:** Always deploy the backend first so you have its live URL ready to provide to the frontend.

### Method A: Using 1-Click Render Blueprint (Recommended)

The backend repo contains a root [`render.yaml`](file:///Users/aneesh/AI%20Projects/FinancialResearchAgent_Backend/render.yaml) blueprint specification.

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your **`FinancialResearchAgent_Backend`** repository.
4. Render will detect `render.yaml` and prompt you for secrets:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `QDRANT_URL`: Your Qdrant Cloud cluster endpoint (e.g. `https://xxxx.aws.cloud.qdrant.io`).
   - `QDRANT_API_KEY`: Your Qdrant Cloud API key.
5. Click **Apply**. Render will install requirements, provision the container, and launch Gunicorn.

---

### Method B: Manual Web Service Setup on Render

If you prefer configuring the Web Service manually:

1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your **`FinancialResearchAgent_Backend`** repository.
3. Configure the settings:
   - **Name:** `financial-research-backend`
   - **Region:** Any region (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** Leave blank (defaults to root `.`)
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:**
     ```bash
     gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 180
     ```
   - **Instance Type:** `Free`

4. Add the following **Environment Variables**:

| Variable Key | Value | Purpose |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Ensures a stable Python runtime |
| `GEMINI_API_KEY` | `AIzaSy...` | Powers supervisor and synthesis agents |
| `DEFAULT_LLM_MODEL`| `gemini-3.5-flash-lite`| Stable, fast free model endpoint |
| `QDRANT_URL` | `https://your-cluster.aws.cloud.qdrant.io` | Live cloud vector database |
| `QDRANT_API_KEY` | `eyJhbGciOi...` | Qdrant access token |
| `QDRANT_COLLECTION_NAME`| `sec_filings` | Vector collection name |
| `ALLOWED_ORIGINS` | `*` *(or your Vercel URL once deployed)* | Allows frontend to stream data |
| `LANGCHAIN_TRACING_V2` | `true` | Enables real-time LangSmith agent tracing |
| `LANGCHAIN_API_KEY` | `lsv2_pt_...` | LangSmith API key |
| `LANGCHAIN_PROJECT` | `financial-research-agent` | LangSmith project board name |

5. Click **Create Web Service**.
6. Once deployment finishes, note down your live backend URL from the top of the service page:
   ```
   https://financial-research-backend.onrender.com
   ```
7. Verify it is live by visiting `https://your-backend.onrender.com/health` in your browser. It should return:
   ```json
   {"status":"healthy","default_model":"gemini-3.5-flash-lite"}
   ```

---

## 4. Step 2: Deploy Frontend to Vercel

With the backend live, deploying the Next.js frontend takes less than 60 seconds:

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your **`FinancialResearchAgent`** GitHub repository.
4. Vercel automatically detects Next.js:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./` (Leave as default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Expand the **Environment Variables** section and configure:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BACKEND_URL` | `https://financial-research-backend.onrender.com` | **Use your live Render URL from Step 1 (no trailing slash)** |

6. Click **Deploy**.
7. Vercel will build the frontend and provide your production URL:
   ```
   https://financial-research-agent.vercel.app
   ```

---

## 5. Step 3: End-to-End Verification

1. Open your Vercel application URL in your web browser.
2. Enter a research prompt (e.g. click **AAPL**, **MSFT**, **NVDA**, or type `Analyze Apple supply chain risks and recent revenue performance`).
3. Verify live stream:
   - Status badge shows `Streaming...`.
   - **Agent Thought Log** displays live thoughts from Supervisor, SEC Agent, and Market Metrics Agent.
   - **Interactive Visual Widgets** (Metric Cards, Revenue Trend Bar Charts, Risk Assessment badges) mount progressively as data arrives.
   - **Equity Research Report** streams token-by-token in formatted Markdown.

---

## 6. Local Multi-Repo Development Workflow

To work on both repositories locally:

```bash
# Terminal 1: Backend
cd FinancialResearchAgent_Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
PYTHONPATH=. uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd FinancialResearchAgent
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The frontend automatically routes API requests to `http://localhost:8000`.

---

## 7. Troubleshooting & Production Tips

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Frontend displays "NetworkError" or "Failed to fetch"** | Backend container sleeping or `NEXT_PUBLIC_BACKEND_URL` incorrect | Render Free tier puts instances to sleep after 15 mins. Visit `/health` to wake it up. Check environment variable on Vercel. |
| **Stream terminates prematurely** | Gunicorn timeout threshold too low | Ensure start command includes `--timeout 180`. |
| **CORS block in browser console** | `ALLOWED_ORIGINS` on Render does not include Vercel domain | Set `ALLOWED_ORIGINS=*` on Render, or add `https://your-app.vercel.app`. |
| **Render cold starts (40–50s)** | Free tier spin-down after inactivity | Set up a free ping check (e.g. [UptimeRobot](https://uptimerobot.com)) to ping `https://your-backend.onrender.com/health` every 10 minutes. |
