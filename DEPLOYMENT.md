# 🚀 Advanced RAG — Complete Deployment Guide

## Architecture

```
┌──────────────────────────────┐        ┌─────────────────────────────────────────┐
│  VERCEL  (Free)              │        │  RENDER  (Free)                          │
│                              │ HTTPS  │                                          │
│  Next.js 15 Frontend         │◄──────►│  FastAPI Backend                         │
│  • React UI                  │        │  • ChromaDB  (persistent disk)           │
│  • Tailwind / shadcn         │        │  • SentenceTransformers                  │
│  • Drag & Drop Upload        │        │  • CrossEncoder Reranker                 │
│  • Pipeline Visualizer       │        │  • BM25 + Vector Hybrid Search           │
│                              │        │  • Groq LLM                              │
└──────────────────────────────┘        └─────────────────────────────────────────┘
```

> ⚠️ **Why backend on Render, not Vercel?**
> Vercel is serverless/stateless — ChromaDB data is lost between invocations.
> SentenceTransformer + CrossEncoder models are ~180MB and would hit Vercel's
> function bundle limits. Render provides a persistent disk and long-running
> Python processes, which is exactly what this stack needs.

---

## Generated Files Summary

| File | Purpose |
|------|---------|
| `backend/requirements.txt` | All Python dependencies |
| `backend/Dockerfile` | Builds image with AI models pre-downloaded |
| `backend/render.yaml` | Render service config + persistent disk |
| `backend/.env.example` | Backend environment variable template |
| `backend/.gitignore` | Excludes venv, chroma_db, uploads |
| `frontend/vercel.json` | Vercel deployment config |
| `frontend/next.config.ts` | Standalone build + env config |
| `frontend/.env.local.example` | Frontend environment variable template |
| `frontend/.gitignore` | Excludes node_modules, .next |
| `.gitignore` | Root-level git exclusions |
| `.vercelignore` | Excludes backend from Vercel builds |

---

## Step 1 — Prepare and Push to GitHub

```bash
# In the project root (Advanced_RAG/)
git init
git add .
git commit -m "feat: Advanced RAG application"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/advanced-rag.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy Backend to Render

### 2.1 — Create a Render Account
Go to [render.com](https://render.com) → Sign up with GitHub (free, no credit card).

### 2.2 — Create New Web Service
1. Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `advanced-rag-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** `Free`

### 2.3 — Add Environment Variables
In Render dashboard → **Environment** tab → Add the following:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | `gsk_...` your Groq key |
| `LANGSMITH_API_KEY` | `lsv2_...` your LangSmith key |
| `LANGSMITH_TRACING` | `true` |
| `LANGSMITH_ENDPOINT` | `https://api.smith.langchain.com` |
| `LANGSMITH_PROJECT` | `Advanced_RAG` |
| `ALLOWED_ORIGINS` | *(leave blank for now — fill in after Step 3)* |

### 2.4 — Add Persistent Disk for ChromaDB
In Render dashboard → **Disks** tab → **Add Disk**:

| Field | Value |
|-------|-------|
| **Name** | `chroma-storage` |
| **Mount Path** | `/app/chroma_db` |
| **Size** | `1 GB` |

### 2.5 — Deploy
Click **Create Web Service**.

> ⏳ First deploy takes **8–15 minutes** — it downloads and bakes the
> SentenceTransformer and CrossEncoder models into the Docker image.
> Subsequent deploys are much faster.

### 2.6 — Verify Backend
Once deployed, visit:
```
https://advanced-rag-backend.onrender.com/health
```
Expected response:
```json
{"status": "ok", "message": "Advanced RAG API is running"}
```

Copy your Render URL — you need it for Step 3.

---

## Step 3 — Deploy Frontend to Vercel

### 3.1 — Create a Vercel Account
Go to [vercel.com](https://vercel.com) → Sign up with GitHub (free).

### 3.2 — Import Project
1. Dashboard → **Add New** → **Project**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** `Next.js` (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

### 3.3 — Add Environment Variable
In Vercel → **Settings** → **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://advanced-rag-backend.onrender.com` |

> ⚠️ Replace the URL with your actual Render URL from Step 2.6.

### 3.4 — Deploy
Click **Deploy**. ✅ Done in ~2 minutes.

Copy your Vercel URL — you need it for Step 4.

---

## Step 4 — Connect Frontend ↔ Backend (CORS)

1. Go back to **Render** → Your service → **Environment**
2. Set `ALLOWED_ORIGINS` to your Vercel URL:
   ```
   https://your-project-name.vercel.app
   ```
3. Click **Save Changes** → Render will redeploy automatically (~1 min).

---

## Step 5 — End-to-End Test

1. Open your Vercel URL
2. Drag and drop a PDF into the **Knowledge Base** upload area
3. Wait for processing (first query may be slow — Render cold start ~30s on free tier)
4. Ask a question in the chat
5. Check the **Pipeline Telemetry** panel on the right — you should see:
   - ✅ Query Optimization tab showing original vs optimized query
   - ✅ Hybrid Search tab showing semantic + BM25 result counts
   - ✅ Reranking tab showing top-3 reranked chunks with scores
6. Check [LangSmith](https://smith.langchain.com) for pipeline traces

---

## Redeployment

### Frontend (Vercel)
Any `git push` to `main` triggers automatic redeployment.

### Backend (Render)
Any `git push` to `main` triggers automatic redeployment.

> ⚠️ **ChromaDB data is NOT lost on redeployment** because it lives on the persistent disk at `/app/chroma_db`.

---

## Troubleshooting

### ❌ CORS error in browser
- Check `ALLOWED_ORIGINS` in Render matches your exact Vercel URL (no trailing slash)
- Trigger a manual redeploy on Render after changing env vars

### ❌ 503 / no response from backend
- Render free tier **spins down after 15 min of inactivity**
- First request after spin-down takes 30–60s (cold start + model load)
- Upgrade to Render Starter ($7/mo) for always-on service

### ❌ Upload fails
- Check browser Network tab for the actual error from `/upload`
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel and does not have a trailing slash

### ❌ Docker build fails on Render
- Check Render build logs for the failing step
- Most common cause: model download timeout — retry the deploy

### ❌ ChromaDB data is gone after redeploy
- Make sure the disk is mounted at `/app/chroma_db` in Render
- Verify `render.yaml` disk config matches the actual mount path

---

## Environment Variable Reference

### Backend (Render)
```env
GROQ_API_KEY=gsk_...
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_PROJECT=Advanced_RAG
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://advanced-rag-backend.onrender.com
```
