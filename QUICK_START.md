# 🚀 ElevareAI Quick Start Guide

## First Time Setup (One-Time)

### 1. Initialize Complete Database

Run this **ONCE** to set up all departments and authentication:

```bash
cd backend
npm run init-all
```

This initializes:
- ✅ HR Analytics
- ✅ HSE Analytics
- ✅ Operations
- ✅ Quality Control
- ✅ Supply Chain
- ✅ Finance
- ✅ Sales
- ✅ Marketing
- ✅ Customer Success
- ✅ Administration/IT
- ✅ Authentication System

**Default Admin Credentials:**
- Email: `admin@elevareai.com`
- Password: `Admin123!`

---

## Daily Development

### Start Backend (Auto-Restart)

```bash
cd backend
npm run dev
```

**Benefits:**
- ✅ Auto-restarts on file changes
- ✅ Auto-restarts on crashes
- ✅ No manual restarts needed!

### Start Frontend

```bash
cd frontend
npm run dev
```

### Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

---

## If Database Gets Corrupted

If you ever need to reset everything:

```bash
cd backend
npm run init-all
```

Then clear browser storage and re-login.

---

## Production Deployment

### Build Backend

```bash
cd backend
npm run build
npm start
```

### Build Frontend

```bash
cd frontend
npm run build
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 3001 is in use
lsof -ti:3001

# Kill process if needed
lsof -ti:3001 | xargs kill -9

# Restart
npm run dev
```

### Database Issues
```bash
# Reinitialize everything
npm run init-all

# Clear browser storage (in browser console):
localStorage.clear()
location.reload()

# Re-login
```

### Frontend Not Loading
```bash
# Check if port 5173 is in use
lsof -ti:5173

# Restart frontend
npm run dev
```

---

## Available npm Scripts

### Backend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | **Start with auto-restart** (recommended for development) |
| `npm start` | Start production server |
| `npm run build` | Build TypeScript to JavaScript |
| `npm run init-all` | **Initialize ALL modules** (use this!) |
| `npm run init-db` | Initialize core modules only |
| `npm run init:finance` | Initialize Finance module only |
| `npm run init:sales` | Initialize Sales module only |
| `npm run init:marketing` | Initialize Marketing module only |
| `npm run init:customer-success` | Initialize Customer Success module only |
| `npm run init:administration` | Initialize Administration/IT module only |

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Key Features

### Auto-Restart Backend (npm run dev)

The `dev` script uses `ts-node-dev` which:
- ✅ Automatically restarts on file changes
- ✅ Automatically restarts on crashes
- ✅ Fast recompilation (transpile-only mode)
- ✅ No need to manually restart!

### One-Command Database Setup (npm run init-all)

No more running 7+ separate scripts! Just:
```bash
npm run init-all
```

And everything is set up!

---

## Quick Reference

**Most Common Commands:**

```bash
# First time setup
cd backend && npm run init-all

# Daily development
cd backend && npm run dev          # Terminal 1
cd frontend && npm run dev         # Terminal 2

# Visit: http://localhost:5173
# Login: admin@elevareai.com / Admin123!
```

**That's it!** 🎉

---

## Need Help?

- Backend logs show in the terminal where you ran `npm run dev`
- Frontend errors show in browser console (F12)
- Check `AUTHENTICATION_TESTING_COMPLETE.md` for detailed auth info
- Check `PHASE1_PROGRESS_REPORT.md` for project status
