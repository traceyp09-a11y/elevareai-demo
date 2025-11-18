# Vercel Deployment Guide for Elevare Platform

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (already done ✓)
   ```bash
   git push origin claude/elevare-executive-redesign-01LLtEB9rbEbZUbjuqgpNTMf
   ```

2. **Go to Vercel**
   - Visit https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository: `traceyp09-a11y/elevareai-demo`

3. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as monorepo root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

4. **Environment Variables** (add these in Vercel dashboard)
   ```
   NODE_ENV=production
   DATABASE_URL=<your-database-url-if-using-external-db>
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a URL like: `https://elevareai-demo.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your Mac**
   ```bash
   cd ~/Desktop/elevareai-demo
   vercel
   ```

4. **Follow the prompts**
   - Select your scope
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

## Project Structure

```
elevareai-demo/
├── frontend/          # React + Webpack + Tailwind
│   ├── dist/         # Build output (auto-generated)
│   └── src/          # Source code
├── backend/           # Node.js + Express + SQLite
│   └── src/          # Source code
├── vercel.json       # Vercel configuration
└── .vercelignore     # Files to exclude from deployment
```

## Important Notes

### Frontend Configuration
- ✅ Webpack configured for production builds
- ✅ Tailwind CSS properly configured (CommonJS)
- ✅ All routes use React Router (SPA)
- ✅ Build output: `frontend/dist/`

### Backend Considerations
- The backend uses SQLite which **doesn't work well** with serverless
- **Recommended**: Use a cloud database (PostgreSQL, MySQL, or MongoDB)
- **Alternative**: Deploy backend separately on a platform that supports SQLite (Heroku, Railway, Render)

### Environment Variables Needed
Add these in Vercel dashboard under "Settings > Environment Variables":

```
# Required for production
NODE_ENV=production

# If using external database
DATABASE_URL=your-database-connection-string

# API endpoints (if backend deployed separately)
VITE_API_URL=https://your-backend-url.com
```

## Deployment Checklist

- [x] `vercel.json` created with build configuration
- [x] `.vercelignore` created to exclude unnecessary files
- [x] Frontend build script added (`vercel-build`)
- [x] All code committed to GitHub
- [ ] Push code to GitHub repository
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Deploy and test

## URLs After Deployment

Once deployed, you'll have:
- **Production URL**: `https://elevareai-demo.vercel.app`
- **Preview URLs**: Automatic for each git push
- **Executive Dashboard**: `https://elevareai-demo.vercel.app/executive`
- **Board Reports**: `https://elevareai-demo.vercel.app/executive/board-reports`
- **Login**: `https://elevareai-demo.vercel.app/login`

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json` (not just devDependencies for build tools)
- Verify `vercel-build` script runs locally: `cd frontend && npm run vercel-build`

### API Calls Fail
- Update frontend to use relative paths `/api/*` (already configured)
- Or set `VITE_API_URL` environment variable if backend is external

### Database Issues
- SQLite doesn't work on Vercel serverless
- Migrate to PostgreSQL, MySQL, or MongoDB for production
- Or deploy backend separately on a server-based platform

## Alternative: Frontend-Only Deployment

If you want to deploy just the frontend:

1. Update `vercel.json`:
   ```json
   {
     "buildCommand": "cd frontend && npm install && npm run build",
     "outputDirectory": "frontend/dist",
     "framework": null
   }
   ```

2. Deploy backend separately (recommended platforms):
   - Railway (supports SQLite)
   - Render (supports SQLite)
   - Heroku
   - DigitalOcean App Platform

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
