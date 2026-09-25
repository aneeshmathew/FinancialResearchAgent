# Production Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide provides a step-by-step walkthrough for deploying the **Autonomous Financial & Market Research Dashboard** to production.

---

## 1. Architectural Strategy: Why Split Frontend and Backend?

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│       Next.js 14 Frontend       │           │         FastAPI Backend         │
│         (Hosted on Vercel)      │           │        (Hosted on Render)       │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ • Edge CDN & Instant Assets     │    SSE    │ • Persistent ASGI Process       │
│ • Zero-Config Next.js Builds    │  Stream   │ • No 15-second Timeout Limits   │
│ • Custom Domains & Free SSL     │ ────────> │ • Long-Running Multi-Agent Lang │
│ • Connects to Backend via URL   │           │ • Hybrid SEC RAG with Qdrant    │
└─────────────────────────────────┘           └─────────────────────────────────┘
                                                               │
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │      Qdrant Cloud Cluster       │
                                              │   (Persistent Vector Storage)   │
                                              └─────────────────────────────────┘
```

### Why not deploy both on Vercel?
* **Execution Timeout:** Vercel Free has a **10–15 second maximum timeout** on serverless functions. A full multi-agent research pipeline (Supervisor $\rightarrow$ SEC Agent $\rightarrow$ Market Agent $\rightarrow$ Widget Agent $\rightarrow$ Synthesizer) takes 15–25 seconds to complete. On Vercel, serverless runs would be terminated with `504 Gateway Timeout` errors.
* **Persistent Streaming:** Render provides an always-on Linux container that maintains Server-Sent Events (SSE) streaming connections without arbitrary drops.

---

## 2. Pre-Deployment Checklist

Before deploying, ensure you have:
1. **GitHub Repository:** Your latest code pushed to GitHub (`main` branch).
2. **Google Gemini API Key:** From [Google AI Studio](https://aistudio.google.com/).
3. **Qdrant Cloud Cluster:** A running cluster and API key from [Qdrant Cloud](https://cloud.qdrant.io/).
4. **Vercel Account:** Free account at [vercel.com](https://vercel.com).
5. **Render Account:** Free account at [render.com](https://render.com).

---

## 3. Step 1: Deploy Backend to Render

### Method A: Using the 1-Click Blueprint (Fastest)

The repository already includes a [`render.yaml`](render.yaml) specification file.

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your `FinancialResearchAgent` repository.
4. Render will read `render.yaml` and prompt you for the required secret environment variables:
   * `GEMINI_API_KEY`: Your Google AI Studio API key.
   * `QDRANT_URL`: Your Qdrant Cloud cluster endpoint (e.g., `https://...cloud.qdrant.io`).
   * `QDRANT_API_KEY`: Your Qdrant Cloud API key.
5. Click **Apply**. Render will automatically build the Python environment and launch the backend with Gunicorn.

---

### Method B: Manual Web Service Setup

If you prefer setting it up manually:

1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   * **Name:** `financial-research-backend`
   * **Region:** Any region close to you (e.g., Oregon or Frankfurt)
   * **Branch:** `main`
   * **Root Directory:** `backend`
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:**
     ```bash
     gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 180
     ```
   * **Instance Type:** `Free`

4. Add the following **Environment Variables**:

| Variable Key | Value | Purpose |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Ensures a stable Python runtime |
| `GEMINI_API_KEY` | `AIzaSy...` | Powers supervisor and synthesis agents |
| `DEFAULT_LLM_MODEL`| `gemini-3.5-flash-lite`| Stable free model endpoint |
| `QDRANT_URL` | `https://your-cluster.aws.cloud.qdrant.io` | Live cloud vector database |
| `QDRANT_API_KEY` | `eyJhbGciOi...` | Qdrant access token |
| `QDRANT_COLLECTION_NAME`| `sec_filings` | Vector collection name |
| `ALLOWED_ORIGINS` | `*` *(or your Vercel URL once known)* | Allows frontend to call the API |

5. Click **Create Web Service**.
6. Once deployed, note down your live backend URL from the top of the page:
   ```
   https://financial-research-backend.onrender.com
   ```
   Verify it is live by visiting: `https://your-backend.onrender.com/health` in your browser (it should return `{"status":"healthy"}`).

---

## 4. Step 2: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your `FinancialResearchAgent` GitHub repository.
4. In the configuration window:
   * **Framework Preset:** `Next.js` (detected automatically)
   * **Root Directory:** Click **Edit** and set it to:
     ```
     frontend
     ```
   * **Build and Output Settings:** Leave default (`npm run build`).

5. Expand the **Environment Variables** section and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BACKEND_URL` | `https://financial-research-backend.onrender.com` | **Use your real Render URL from Step 1 (no trailing slash)** |

6. Click **Deploy**.

Vercel will build the Next.js app in ~45 seconds and provide a production domain:
```
https://financial-research-agent.vercel.app
```

---

## 5. Step 3: End-to-End Verification

Once both services are running:

1. Open your Vercel URL in a browser.
2. Enter a query in the search bar, for example:
   ```
   Analyze Apple supply chain risks and recent revenue performance
   ```
   or click the **AAPL** preset button.
3. Observe the real-time event pipeline:
   * **Connection Status:** Shows `Streaming...`
   * **Agent Thought Log:** Updates in real time as the Supervisor, SEC Agent, and Market Agent work.
   * **Dynamic Widgets:** KPI Metric Cards, Revenue Trend Charts, and Risk Assessment Matrices render progressively.
   * **Equity Research Report:** Streams chunk-by-chunk in Markdown.

---

## 6. Production Maintenance & Tips

### Render Free Tier Spin-Down (Cold Starts)
* On Render's **Free Plan**, web services spin down after 15 minutes of inactivity.
* If no one has visited your app recently, the first request may take 40–50 seconds while the container wakes up. Subsequent requests run instantly.
* **Tip:** To keep it warm for portfolio presentations, you can use a free pinging service like [UptimeRobot](https://uptimerobot.com) to ping `https://your-backend.onrender.com/health` every 10 minutes.

### CORS Security Hardening (Optional)
Once your Vercel domain is assigned (e.g. `https://my-dashboard.vercel.app`), update the backend environment variable on Render:
```bash
ALLOWED_ORIGINS=https://my-dashboard.vercel.app
```
This ensures that only your Vercel frontend can call your research backend.

---

## 7. Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Frontend displays "NetworkError" or "Failed to fetch"** | `NEXT_PUBLIC_BACKEND_URL` is wrong or backend is sleeping | Verify Render URL is accessible by visiting `/health` in browser. Double-check environment variables on Vercel. |
| **Stream cuts off mid-report** | Reverse proxy buffer or timeout | Ensure `gunicorn` start command includes `--timeout 180`. |
| **Backend error: `429 Too Many Requests`** | Exceeded Gemini free rate limit (15 requests/min) | Wait 60 seconds and retry. In high-traffic scenarios, consider adding a Groq key as automatic fallback. |
| **Backend error: `Index required for ticker`** | Qdrant payload index missing | Our `SECVectorStore` automatically provisions indexes on first startup. If manually reset, restart the backend once. |
