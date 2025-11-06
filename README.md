# ElevareIQ-MVP: HR Analytics Platform

## Overview
ElevareIQ-MVP is an enterprise-level HR analytics platform designed for Director to VP-level executives in manufacturing, construction, and logistics industries. This platform provides comprehensive metrics and insights that feed into executive dashboards for CEO and CFO decision-making.

## Features

### Top 10 HR Pain Points Addressed
1. **Skilled Labor Shortage & Talent Acquisition** - Track sourcing effectiveness and pipeline health
2. **Employee Retention & High Turnover** - Monitor turnover rates and retention strategies
3. **Aging Workforce & Skills Gap** - Analyze workforce demographics and succession planning
4. **Safety & Workers Compensation** - Track incident rates and associated costs
5. **Employee Engagement & Burnout** - Measure engagement scores and burnout indicators
6. **Compensation & Benefits Competitiveness** - Compare market rates and total rewards
7. **Training & Development Needs** - Track training completion and skill development
8. **Compliance & Labor Law Management** - Monitor compliance rates and violations
9. **Budget Constraints & Cost Control** - Analyze HR costs and budget utilization
10. **Recruiting Tech-Savvy Workers** - Track technical skill acquisition for automation

### Top 10 HR KPIs Tracked
1. **Employee Turnover Rate** - Monthly/annual turnover with cost impact
2. **Time to Hire** - Average days from job posting to acceptance
3. **Cost per Hire** - Total recruitment costs divided by number of hires
4. **Employee Productivity** - Revenue/output per employee
5. **Safety Incident Rate (TRIR)** - Total Recordable Incident Rate per 200,000 hours
6. **Absenteeism Rate** - Percentage of unplanned absences
7. **Training ROI** - Return on investment for training programs
8. **Employee Engagement Score** - Quarterly engagement survey results
9. **Offer Acceptance Rate** - Percentage of accepted job offers
10. **Revenue per Employee** - Total revenue divided by employee count

## Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **SQLite** for demo database (easily upgradable to PostgreSQL/MySQL)

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation

### Demo Data
- **Fake Company**: TitanBuild Manufacturing & Logistics
- **Industry**: Manufacturing, Construction & Logistics
- **Employee Count**: 847 employees
- **Locations**: 4 facilities across the US
- **Fiscal Year**: 2024-2025

## Project Structure

```
elevareai-demo/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API route handlers
│   │   ├── models/           # Data models
│   │   ├── services/         # Business logic & calculations
│   │   ├── data/             # Demo data generators
│   │   └── server.ts         # Express server
│   ├── database/
│   │   └── schema.sql        # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API clients
│   │   ├── utils/           # Calculation utilities
│   │   └── App.tsx          # Main app component
│   └── package.json
├── docs/
│   ├── CALCULATIONS.md       # All KPI calculation formulas
│   ├── API.md               # API documentation
│   └── DEMO_DATA.md         # Demo data documentation
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Initialize database with demo data
cd ../backend
npm run init-db

# Start backend server (port 3001)
npm run dev

# In a new terminal, start frontend (port 3000)
cd ../frontend
npm start
```

## Usage

1. Access the platform at `http://localhost:3000`
2. Navigate through different HR metric dashboards
3. View detailed calculations by clicking on any metric
4. Export reports for C-suite presentations
5. Filter data by time period, department, or location

## Key Reports

1. **Executive Summary Dashboard** - High-level metrics for C-suite
2. **Talent Acquisition Report** - Hiring efficiency and pipeline health
3. **Retention Analysis** - Turnover trends and retention strategies
4. **Safety & Compliance Report** - Incident tracking and compliance status
5. **Workforce Analytics** - Demographics, skills, and productivity
6. **Financial Impact Report** - HR costs and ROI metrics

## Calculation Transparency

All calculations are fully documented in `/docs/CALCULATIONS.md`. Each metric shows:
- Formula used
- Data sources
- Assumptions made
- Industry benchmarks
- Historical trends

## License

Proprietary - ElevareIQ Platform

## Support

For questions or support, contact your system administrator.
