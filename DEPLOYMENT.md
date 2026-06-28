# CivicLens AI — Deployment & Production Hosting Guide

CivicLens AI uses a **Unified Server Architecture** where the React frontend is compiled and served statically directly by the Express backend. This means you only need to host **two services**:
1. **Unified Web Application** (Frontend + Express API + PostgreSQL Database)
2. **AI Diagnostics Microservice** (FastAPI + Gemini AI)

---

## 1. Deploy the AI Diagnostics Microservice (FastAPI)

Since the AI service is built with Python and FastAPI, we will host it as a standalone Python Web Service.

### Deployment Steps (via Render):
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`https://github.com/rsanatan979-creator/CivicLens-AI`).
4. Configure the service settings:
   - **Name**: `civiclens-ai-service`
   - **Environment**: `Python`
   - **Root Directory**: `ai-service`
   - **Build Command**: `pip install fastapi uvicorn google-genai pydantic requests` (or `pip install -r requirements.txt` if using a requirements file)
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Advanced** and add the following **Environment Variable**:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
6. Click **Create Web Service**.

Once deployed, copy the generated URL (e.g., `https://civiclens-ai-service.onrender.com`). You will need this for the backend.

---

## 2. Deploy the Unified Web Application (React + Node + Postgres)

We will deploy the main Node.js Express server which automatically serves the React UI and handles PostgreSQL database operations.

### Deployment Steps (via Render):
1. In your Render Dashboard, click **New +** and select **PostgreSQL** database.
2. Configure the database settings:
   - **Name**: `civiclens-db`
   - **Database**: `civic_agent`
   - Click **Create Database**.
3. Once the database is created, copy the **Internal Database URL** (e.g., `postgres://...`).
4. Now, click **New +** and select **Web Service**.
5. Connect your GitHub repository.
6. Configure the service settings:
   - **Name**: `civiclens-web-app`
   - **Environment**: `Node`
   - **Root Directory**: `.` *(Leave blank / root)*
   - **Build Command**: `npm install && npx prisma generate --schema=backend/prisma/schema.prisma && npm run build`
   - **Start Command**: `npm run start`
7. Click **Advanced** and add the following **Environment Variables**:
   - `DATABASE_URL`: *(Paste the Internal Database URL copied in Step 3)*
   - `JWT_SECRET`: *(A secure random string, e.g., generated with `openssl rand -base64 32`)*
   - `AI_SERVICE_URL`: *(Paste the URL of your deployed AI Diagnostics Service from Section 1)*
   - `NODE_ENV`: `production`
8. Click **Create Web Service**.

---

## 🚀 Deployed URLs
Once the services finish deploying, you will be able to access:
- **Live Preview UI**: `https://civiclens-web-app.onrender.com`
- **REST API Endpoint**: `https://civiclens-web-app.onrender.com/api/v1`
- **AI diagnostics Health**: `https://civiclens-ai-service.onrender.com/health`
