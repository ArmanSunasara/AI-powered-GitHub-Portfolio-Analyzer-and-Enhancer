#  Gitfolio

> Transform your GitHub into a job-ready, recruiter-approved portfolio in under 60 seconds.

---

##  Problem

For students and early-career developers, GitHub acts as their primary portfolio.  
However, most profiles fail to communicate real skill, impact, or consistency.

Recruiters often struggle to evaluate:

- Incomplete or missing README files
- Poor repository structure
- Inconsistent commit history
- Lack of real-world project presentation
- No clear indicator of technical depth

As a result, strong developers get overlooked.

---

##  Solution

GitHub Portfolio Analyzer is an **AI-powered evaluation tool** that:

✅ Analyzes a GitHub profile  
✅ Generates a recruiter-style portfolio score  
✅ Identifies strengths & red flags  
✅ Provides actionable improvement steps  

All in **under 60 seconds**.

---

##  Key Features

- 🔗 GitHub Profile Analysis
- 🏆 Portfolio Score (out of 100) with animated ring gauge
- 📊 Recruiter-focused multi-dimensional scoring system
- 🤖 AI-generated feedback (strengths, red flags, action plan)
- ⭐ Top repositories detection with direct links
- ⚠️ Red flag identification
- 🚀 Personalized improvement roadmap
- 🎯 Profile header with avatar, bio, and stats
- 🔒 Rate limiting, helmet security, and input validation
- 📱 Fully responsive design with animations

---

## 🏗 System Architecture

```
Frontend (React + Vite + Tailwind CSS)
│
├── Framer Motion animations
├── Responsive UI components
└── Axios API client
│
Node.js API (Express.js)
│
├── Helmet security headers
├── Rate limiting
├── Compression
├── Morgan logging
├── Input validation middleware
└── GitHub REST API integration
│
Python FastAPI – AI Engine
│
├── OpenAI GPT-4o-mini
├── Pydantic validation
└── Lazy client initialization
```

---

## ⚙️ Tech Stack

### Frontend
- React 19 (Vite 7)
- Tailwind CSS 4
- Framer Motion
- React Icons
- Axios

### Backend
- Node.js + Express 5
- Helmet (security headers)
- express-rate-limit
- Compression
- Morgan (HTTP logging)
- GitHub REST API

### AI Service
- Python + FastAPI
- OpenAI API (GPT-4o-mini)
- Pydantic validation

---

## 📊 Scoring System

The GitHub Portfolio Score is calculated based on 5 dimensions (total: 100):

| Metric | Weight | Description |
|--------|--------|-------------|
| Documentation Quality | 25% | README presence across repositories |
| Active Repositories | 25% | Repos with meaningful commit history (>5 commits) |
| Language Diversity | 20% | Variety of programming languages used |
| Community Impact | 15% | Stars received across repositories |
| Commit Consistency | 15% | Average commits per repository depth |

---

## 🤖 AI Recruiter Review

The AI engine evaluates the portfolio and generates:

### ✅ Strengths
What makes the profile stand out

### ❌ Red Flags
What recruiters may reject

### 🚀 Actionable Suggestions
Clear steps to improve the score

---

## 🖥️ How to Run Locally

### Prerequisites
- Node.js 18+
- Python 3.8+
- npm package manager
- GitHub Personal Access Token (optional, for higher rate limits)
- OpenAI API Key (for AI feedback)

### 1. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
GITHUB_TOKEN=your_github_token_here
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

### 3. ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
```

Create `ml-service/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=http://localhost:5000,http://localhost:5173
```

Start the ML service:
```bash
uvicorn main:app --reload --port 8000
```

### Running All Services

1. **Terminal 1 (ML Service):** `cd ml-service && uvicorn main:app --reload --port 8000`
2. **Terminal 2 (Backend):** `cd server && npm run dev`
3. **Terminal 3 (Frontend):** `cd client && npm run dev`

Open `http://localhost:5173` in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/github/analyze` | Analyze a GitHub profile |

### Example Request
```bash
curl -X POST http://localhost:5000/api/github/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/torvalds"}'
```

---

## ⏱ Performance

- ⚡ Analysis time: < 60 seconds
- 🔍 Focused on top 5 repositories for fast results
- 📡 Real-time GitHub data with 15s timeout per request
- 🗜️ Gzip compression enabled
- 🛡️ Rate limited: 100 requests per 15 minutes

---

## 🔒 Security

- Helmet.js security headers
- CORS origin validation
- Rate limiting
- Input validation & sanitization
- Environment variable isolation
- Graceful error handling (no stack traces in production)

---

## 📁 Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   └── services/          # API client
│   └── package.json
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Error handling, validation
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   └── package.json
├── ml-service/                # Python AI service
│   ├── main.py                # FastAPI app
│   ├── analyzer.py            # OpenAI integration
│   └── requirements.txt
└── README.md
```

---

## 🌍 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend API | Render |
| ML Service | Render |



