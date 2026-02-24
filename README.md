# StudyBuddy AI (Clean Version)

This is the fresh, error-free version of StudyBuddy AI.

## Project Structure
- `src/`: Frontend React Application (Vite + standard settings).
- `server/`: Backend Node.js/Express Application (Railway ready).

## Setup Instructions

### 1. Backend
```bash
cd server
npm install
# Create .env with GEMINI_API_KEY=... and DATABASE_URL=...
npx prisma generate
npm run dev
```

### 2. Frontend
```bash
# In root directory
npm install
npm run dev
```

## Deployment
- **Backend**: Deploy `server/` subdirectory to Railway.
- **Frontend**: Deploy root to Netlify/Vercel.
