# ElevareIQ-MVP Quick Start Guide

## Overview
This is a complete HR Analytics platform built specifically for Director to VP-level executives in manufacturing, construction, and logistics industries. It includes a comprehensive backend API, React dashboard, and demo data from a fictional company.

## What's Included

### Top 10 HR Pain Points (Industry Research-Based)
1. Skilled Labor Shortage & Talent Acquisition
2. Employee Retention & High Turnover
3. Aging Workforce & Skills Gap
4. Safety & Workers Compensation
5. Employee Engagement & Burnout
6. Compensation & Benefits Competitiveness
7. Training & Development Needs
8. Compliance & Labor Law Management
9. Budget Constraints & Cost Control
10. Recruiting Tech-Savvy Workers for Automation

### Top 10 HR KPIs (With Full Calculations)
1. Employee Turnover Rate
2. Time to Hire
3. Cost per Hire
4. Employee Productivity (Revenue per Employee)
5. Safety Incident Rate (TRIR)
6. Absenteeism Rate
7. Training ROI
8. Employee Engagement Score
9. Offer Acceptance Rate
10. Revenue per Employee

### Demo Company
- **Name**: TitanBuild Manufacturing & Logistics
- **Industry**: Manufacturing, Construction & Logistics
- **Employees**: 847 across 4 facilities
- **Annual Revenue**: $87.5M
- **Complete demo data**: 12 months of historical HR data

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# 1. Clone the repository (if not already)
cd elevareai-demo

# 2. Install backend dependencies
cd backend
npm install

# 3. Initialize database with demo data
npm run init-db
npm run seed-data

# 4. Start backend server (keep this running)
npm run dev
# Backend will run on http://localhost:3001

# 5. In a new terminal, install frontend dependencies
cd ../frontend
npm install

# 6. Note: Build scripts removed - frontend requires build tool configuration
```

That's it! You should now see the ElevareIQ dashboard with all 10 HR KPIs.

## What You Can Do

### 1. View Dashboard
Navigate to `http://localhost:3000` to see:
- High-level company metrics
- Top 10 HR KPIs with visual indicators
- Benchmark comparisons
- Quick stats summary

### 2. Explore KPI Details
Click on any KPI card to see:
- Full calculation formula
- Step-by-step calculation breakdown
- All data components used
- Industry benchmarks
- Data source information
- Export options

### 3. View Pain Points
Click "Pain Points" in the navigation to see:
- Top 10 HR challenges ranked by severity
- Industry-specific statistics
- Related KPIs for each pain point
- Recommended actions by role

### 4. Test API Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Get all KPIs
curl http://localhost:3001/api/kpis/current

# Get specific KPI with calculations
curl http://localhost:3001/api/kpis/turnover

# Get company info
curl http://localhost:3001/api/company

# Get pain points
curl http://localhost:3001/api/pain-points
```

## Project Structure

```
elevareai-demo/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── services/          # KPI calculation engines
│   │   ├── data/              # Database initialization & seeding
│   │   └── server.ts          # API routes
│   ├── database/
│   │   ├── schema.sql         # Database schema
│   │   └── elevareiq.db       # SQLite database (generated)
│   └── package.json
│
├── frontend/                   # React dashboard
│   ├── src/
│   │   ├── pages/             # Dashboard, KPI Detail, Pain Points
│   │   ├── components/        # React components
│   │   └── App.tsx            # Main app
│   └── package.json
│
└── docs/
    ├── CALCULATIONS.md        # Detailed KPI formulas
    ├── API.md                 # API documentation
    └── DEMO_DATA.md           # Demo data documentation
```

## Key Features

### Calculation Transparency
Every KPI shows:
- ✅ Mathematical formula
- ✅ Step-by-step calculation
- ✅ All input data components
- ✅ Data sources
- ✅ Industry benchmarks

### Real Business Value
- Designed for Director-VP level executives
- Feeds into C-suite dashboards
- Based on actual industry research
- Addresses real pain points
- Uses industry-standard benchmarks

### Complete Demo Data
- 847 employees across 4 facilities
- 12 months of historical data
- Realistic HR metrics and trends
- Production and financial data
- All calculations produce valid results

## Customization

### Modify Demo Data
Edit `/backend/src/data/seedData.ts` to change:
- Employee counts
- Salary ranges
- Incident rates
- Any other parameters

Then regenerate:
```bash
cd backend
npm run init-db
npm run seed-data
```

### Add New KPIs
1. Add calculation method in `/backend/src/services/kpiCalculations.ts`
2. Add API endpoint in `/backend/src/server.ts`
3. Add frontend component in `/frontend/src/pages/Dashboard.tsx`

### Change Calculation Logic
Edit `/backend/src/services/kpiCalculations.ts` to modify any KPI calculation formulas.

## Troubleshooting

### Backend won't start
```bash
cd backend
npm run init-db
npm run seed-data
npm run dev
```

### Frontend shows "Error fetching data"
Make sure the backend is running on port 3001:
```bash
curl http://localhost:3001/api/health
```

### Database issues
Reinitialize the database:
```bash
cd backend
rm database/elevareiq.db
npm run init-db
npm run seed-data
```

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start  # or use PM2, Docker, etc.
```

### Frontend
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your web server
```

### Environment Variables
Create `.env` files for production:
- Set database path
- Configure CORS origins
- Set API URLs
- Add authentication tokens

## Next Steps

1. **Integrate with Real Data**: Replace demo data with actual HRIS system data
2. **Add Authentication**: Implement user login and role-based access
3. **Historical Trending**: Add time-series charts and trend analysis
4. **Alerts & Notifications**: Set up threshold alerts for critical KPIs
5. **Custom Reports**: Build exportable PDF/Excel reports
6. **Mobile App**: Create mobile version for on-the-go access

## Support

For questions or issues:
- Check `/docs/` folder for detailed documentation
- Review `/docs/API.md` for API reference
- See `/docs/CALCULATIONS.md` for formula details
- Refer to `/docs/DEMO_DATA.md` for data structure

## License

Proprietary - ElevareIQ Platform

---

**Built with**: Node.js, Express, TypeScript, React, SQLite, Tailwind CSS
**Last Updated**: November 2024
