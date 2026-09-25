# 02 - Guide to Free Models & Tools ($0 Budget Setup)

You do **NOT** need to pay for OpenAI or Anthropic API credits to run, test, and present this project. 

The entire stack can be run **100% free of charge** using any of the following options.

---

## 1. Summary of Free Options

| Component | Free Solution | Cost | Signup Required? | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Cloud LLM (Recommended)** | **Google Gemini (AI Studio)** | **$0** | Yes (Google Account) | 1,500 free requests/day, 15 RPM. Fast & generous. |
| **Cloud LLM (Open Source)** | **Groq Cloud** | **$0** | Yes (Free account) | Ultra-fast (~300 tokens/sec) Llama 3.3 70B & 3.1 8B. |
| **Local LLM (100% Offline)**| **Ollama** (on your Mac) | **$0** | **NO** | Runs locally on your Mac's Apple Silicon chip. 100% private. |
| **Stock Market Data** | **`yfinance`** | **$0** | **NO** | Real-time prices, P/E ratios, gross margins & revenue trends. |
| **SEC Regulatory Filings** | **SEC EDGAR Public API** | **$0** | **NO** | Official US Government public disclosures. |
| **Vector Database** | **Qdrant (Embedded)** | **$0** | **NO** | Runs in RAM or local disk. No Docker or cloud bills. |
| **Offline Test Mode** | **Built-in Mock Engine** | **$0** | **NO** | Pre-bundled sample filings & deterministic templates. |

---

## 2. Setting Up Free LLM Models (Choose One)

### Option A: Google Gemini Free Tier (Recommended — Easiest Cloud Setup)
Google provides free access to **Gemini 1.5 Flash** and **Gemini 2.0 Flash** via Google AI Studio.
- **Quota:** 15 requests per minute, 1 million tokens per minute, up to 1,500 free requests per day.
- **Credit Card Required?** **No.**

**How to set up:**
1. Visit [https://aistudio.google.com/](https://aistudio.google.com/) and sign in with your Google account.
2. Click **"Get API Key"** $\rightarrow$ **"Create API key"**.
3. In `backend/.env`, set:
   ```bash
   GEMINI_API_KEY=AIzaSyYourGeneratedGeminiKeyHere
   DEFAULT_LLM_MODEL=gemini-1.5-flash
   ```

---

### Option B: Groq Cloud Free Tier (Extremely Fast Llama 3.3)
Groq uses custom LPU chips to run open-weights models like Meta Llama 3.3 70B at lightning speeds (300+ tokens/second).
- **Quota:** Generous free rate limits for developers.
- **Credit Card Required?** **No.**

**How to set up:**
1. Visit [https://console.groq.com/](https://console.groq.com/) and create a free account.
2. Click **"API Keys"** $\rightarrow$ **"Create API Key"**.
3. In `backend/.env`, set:
   ```bash
   GROQ_API_KEY=gsk_YourGroqKeyHere
   DEFAULT_LLM_MODEL=llama-3.3-70b-versatile
   ```

---

### Option C: Ollama (100% Free, Local, & Private on your Mac)
If you do not want to use any cloud API keys or internet connections, you can run open-source models directly on your Mac using **Ollama**.

**How to set up:**
1. Install Ollama via Homebrew in your terminal:
   ```bash
   brew install ollama
   ```
2. Start Ollama and pull a lightweight model (e.g., Llama 3.2 or Mistral):
   ```bash
   ollama run llama3.2
   ```
3. In `backend/.env`, set:
   ```bash
   USE_LOCAL_OLLAMA=true
   OLLAMA_BASE_URL=http://localhost:11434/v1
   OLLAMA_MODEL=llama3.2
   ```
Now all supervisor reasoning, SEC analysis, and memo drafting will execute locally on your computer with $0 cost.

---

### Option D: Built-in Offline Fallback Mode ($0, Zero Setup)
If you don't configure any API keys at all:
- The system automatically detects that no LLM is configured.
- The supervisor, SEC retriever, market agent, and widget generator still execute full LangGraph loops using our deterministic factual synthesis engine.
- You can test, develop UI components, and verify end-to-end streaming without spending anything or waiting for API keys.

---

## 3. Free Financial & SEC Data Tools (Already Included!)

### 1. `yfinance` (Stock Market Metrics)
- We use the Python `yfinance` package.
- It pulls real-time stock quotes, market capitalization, trailing/forward P/E, PEG ratios, profit margins, and quarterly revenue directly from Yahoo Finance public endpoints.
- **No API key or payment needed.**

### 2. SEC EDGAR Ingestion (Company 10-K Disclosures)
- The U.S. Securities and Exchange Commission (SEC) provides public APIs (`data.sec.gov`) for all corporate filings.
- The SEC only requires that your HTTP requests include a declared `User-Agent` identifying your application (e.g., `"FinancialResearchAgent Admin@example.com"`).
- We have pre-configured this header in `backend/app/config.py`.

### 3. Qdrant In-Memory Vector Store
- Instead of paying for Pinecone or setting up cloud clusters, we configured Qdrant to run embedded in memory:
  ```python
  client = QdrantClient(location=":memory:")
  ```
- Instant startup, zero infrastructure maintenance, zero cost.
