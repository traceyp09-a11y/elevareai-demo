# ElevareIQ Platform: Enterprise Analytics Suite

<div align="center">

![ElevareIQ](https://img.shields.io/badge/ElevareIQ-Analytics%20Platform-0891b2?style=for-the-badge)
![Modules](https://img.shields.io/badge/Modules-5-06b6d4?style=for-the-badge)
![KPIs](https://img.shields.io/badge/KPIs-46-3b82f6?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-10b981?style=for-the-badge)

</div>

## 📊 Overview

ElevareIQ is a comprehensive enterprise analytics platform designed for C-Suite executives in manufacturing, construction, and logistics industries. The platform provides real-time KPI tracking, pain point analysis, and transparent calculation methodologies across five critical business departments.

### 🎯 Target Audience
- **CEO/CFO**: Strategic oversight across all departments
- **VP of Operations**: Production efficiency and quality metrics
- **VP of Supply Chain**: End-to-end supply chain visibility
- **VP of HR**: Workforce analytics and talent management
- **VP of Safety**: HSE compliance and risk management

## 🏢 Demo Company Profile

**TitanBuild Manufacturing & Logistics**
- **Industry**: Manufacturing, Construction & Logistics
- **Employee Count**: 847 employees
- **Locations**: 4 facilities across the US
- **Annual Revenue**: $127M
- **Fiscal Year**: Q4 2024

## 🚀 Platform Modules

### 1. 👥 HR Analytics
**6 Core KPIs** | **10 Pain Points**

Key Metrics:
- Employee Turnover Rate (with cost impact)
- Time to Hire (recruitment efficiency)
- Cost per Hire
- Employee Productivity
- Absenteeism Rate
- Revenue per Employee

**Top Pain Points:**
- Skilled Labor Shortage & Talent Acquisition
- High Turnover & Retention Issues
- Aging Workforce & Skills Gap
- Compensation Competitiveness
- Training & Development Needs

---

### 2. 🦺 HSE (Health, Safety & Environment) Analytics
**10 Core KPIs** | **10 Pain Points** | **Predictive Analytics** | **Mobile Safety App**

Key Metrics:
- TRIR (Total Recordable Incident Rate)
- LTIFR (Lost Time Injury Frequency Rate)
- DART Rate
- Near Miss Reporting Rate
- Safety Training Completion
- PPE Compliance Rate
- Environmental Incident Rate
- Safety Audit Score
- Workers' Comp Costs
- Days Since Last LTI

**Special Features:**
- 🔮 **Predictive Analytics**: AI-powered risk prediction
- 📱 **Mobile Safety App**: Real-time incident reporting with GPS
- 📈 **Trend Analysis**: Historical safety performance tracking

**Top Pain Points:**
- High Injury Rates Impacting Workers' Comp Costs
- Poor Near Miss Reporting Culture
- Aging Workforce with Increased Injury Risk
- Environmental Compliance Violations
- Inadequate Safety Training Programs

---

### 3. ⚙️ Operations Analytics
**10 Core KPIs** | **10 Pain Points**

Key Metrics:
- OEE (Overall Equipment Effectiveness)
- Production Volume (units/shift)
- Cycle Time (minutes/unit)
- Downtime Percentage
- Capacity Utilization
- On-Time Delivery Rate
- Yield Rate
- Setup Time
- Changeover Efficiency
- Maintenance Cost per Unit

**Top Pain Points:**
- Low OEE Driving Up Production Costs
- Unplanned Downtime Disrupting Production
- Long Cycle Times Reducing Throughput
- Poor On-Time Delivery Performance
- Excessive Setup and Changeover Times

---

### 4. ✓ Quality Control Analytics
**10 Core KPIs** | **10 Pain Points**

Key Metrics:
- Defect Rate (PPM)
- First Pass Yield
- Scrap Rate
- Rework Rate
- Customer Return Rate
- Supplier Quality Index
- NCR (Non-Conformance Report) Rate
- CAPA Effectiveness
- Cost of Poor Quality (COPQ)
- Quality Audit Score

**Top Pain Points:**
- High Defect Rates Impacting Customer Satisfaction
- Customer Return Rate Exceeding Limits
- Excessive Scrap Costs Reducing Profitability
- High NCR Rate Indicating Systemic Issues
- Cost of Poor Quality Above Target

---

### 5. 🚚 Supply Chain Analytics **(NEW)**
**10 Core KPIs** | **10 Pain Points**

Key Metrics:
- Perfect Order Rate (on-time, in-full, accurate)
- OTIF (On-Time In-Full) Delivery
- Inventory Turnover
- Days Sales Outstanding (DSO)
- Cash-to-Cash Cycle Time
- Supplier Lead Time
- Freight Cost % of Sales
- Warehouse Capacity Utilization
- Order Accuracy Rate
- Supply Chain Cost % of Revenue

**Top Pain Points:**
- Low Perfect Order Rate Impacting Customer Satisfaction
- OTIF Performance Below Target
- Slow Inventory Turnover Tying Up Capital
- Extended DSO Straining Cash Flow
- Long Cash-to-Cash Cycle Reducing Liquidity
- High Freight Costs Reducing Margins
- Warehouse Space Inefficiencies
- Elevated Supply Chain Costs

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20 (Alpine Linux)
- **Framework**: Express.js with TypeScript
- **Database**: SQLite (production-ready for PostgreSQL/MySQL)
- **Data Generation**: Comprehensive seed scripts with realistic data

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Webpack 5
- **Styling**: Tailwind CSS (dark theme with glassmorphism)
- **Charts**: Recharts for data visualization
- **Routing**: React Router v6
- **Icons**: Lucide React
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker & Docker Compose
- **Hot Reload**: Volume mounts for development
- **Deployment**: Single-command deployment

## 📁 Project Structure

```
elevareai-demo/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── kpiCalculations.ts           # HR KPIs
│   │   │   ├── kpiCalculationsHSE.ts        # HSE KPIs
│   │   │   ├── kpiCalculationsOps.ts        # Operations KPIs
│   │   │   ├── kpiCalculationsQC.ts         # QC KPIs
│   │   │   ├── kpiCalculationsSupplyChain.ts # Supply Chain KPIs
│   │   │   └── predictiveAnalytics.ts       # AI/ML models
│   │   ├── data/
│   │   │   ├── seedData.ts                  # HR seed data
│   │   │   ├── seedDataHSE.ts               # HSE seed data
│   │   │   ├── seedDataOps.ts               # Operations seed data
│   │   │   ├── seedDataQC.ts                # QC seed data
│   │   │   ├── seedDataSupplyChain.ts       # Supply Chain seed data
│   │   │   └── initDatabase.ts              # DB initialization
│   │   └── server.ts                        # Express server (1500+ lines)
│   ├── database/
│   │   ├── schema.sql                       # HR schema
│   │   ├── schema-hse.sql                   # HSE schema
│   │   ├── schema-ops.sql                   # Operations schema
│   │   ├── schema-qc.sql                    # QC schema
│   │   └── schema-supplychain.sql           # Supply Chain schema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx                # HR Dashboard
│   │   │   ├── DashboardHSE.tsx             # HSE Dashboard
│   │   │   ├── DashboardOps.tsx             # Operations Dashboard
│   │   │   ├── DashboardQC.tsx              # QC Dashboard
│   │   │   ├── DashboardSupplyChain.tsx     # Supply Chain Dashboard
│   │   │   ├── PainPoints*.tsx              # Pain Points pages (5)
│   │   │   ├── PredictiveAnalytics.tsx      # AI predictions
│   │   │   └── MobileSafetyApp.tsx          # Mobile app
│   │   ├── components/
│   │   │   └── ElevareLogo.tsx              # Brand logo
│   │   ├── App.tsx                          # Main app with routing
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── DEPLOYMENT_GUIDE.md                      # Comprehensive deployment guide
├── verify-deployment.sh                     # Automated testing script
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git installed
- Ports 3001 (backend) and 5173 (frontend) available

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd elevareai-demo

# 2. Build and start containers
docker-compose build --no-cache
docker-compose up -d

# 3. Verify deployment
./verify-deployment.sh

# 4. Access the platform
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

### Manual Build (without Docker)

```bash
# Backend
cd backend
npm install
npm run init-db     # Initialize database
npm run seed-data   # Seed HR data
npm run seed-hse    # Seed HSE data
npm run seed-ops    # Seed Operations data
npm run seed-qc     # Seed QC data
npm run seed-supplychain  # Seed Supply Chain data
npm run dev         # Start server on port 3001

# Frontend (in new terminal)
cd frontend
npm install
npm run dev         # Start Webpack dev server on port 5173
```

## 📱 Platform Usage

### Accessing Modules

**Department Switcher**: Top navigation bar allows instant switching between modules

**HR Analytics**
- Dashboard: `/`
- Pain Points: `/pain-points`

**HSE Analytics**
- Dashboard: `/hse`
- Predictive Analytics: `/hse/predictive`
- Mobile Safety: `/hse/mobile`
- Pain Points: `/hse/pain-points`

**Operations Analytics**
- Dashboard: `/ops`
- Pain Points: `/ops/pain-points`

**Quality Control**
- Dashboard: `/qc`
- Pain Points: `/qc/pain-points`

**Supply Chain**
- Dashboard: `/supplychain`
- Pain Points: `/supplychain/pain-points`

### Key Features

**🔍 Calculation Transparency**
- Click any KPI card to view detailed calculation
- Shows formula, data components, and step-by-step breakdown
- Industry benchmarks with status indicators

**📊 Real-Time Data**
- Dashboards auto-refresh every 30 seconds
- Live KPI status updates (Excellent/Good/Warning/Critical)

**💼 C-Suite Pain Points**
- Actionable recommendations
- Cost impact analysis
- Implementation timelines
- Responsible departments

**🎨 Department Themes**
- HR: Cyan
- HSE: Cyan/Purple (predictive)
- Operations: Blue
- QC: Teal/Green
- Supply Chain: Orange/Amber

## 📊 Data & Statistics

### Total Platform Metrics
- **46 KPIs** tracked across 5 departments
- **50 Pain Points** with actionable recommendations
- **2,000+ database records** generated per module
- **25+ API endpoints** for data access

### Database Tables
- **HR**: 6 tables (employees, departments, hires, terminations, etc.)
- **HSE**: 8 tables (incidents, near-misses, training, audits, etc.)
- **Operations**: 10 tables (production, downtime, maintenance, etc.)
- **QC**: 7 tables (inspections, defects, NCRs, CAPAs, etc.)
- **Supply Chain**: 14 tables (orders, inventory, suppliers, shipments, etc.)

## 🔒 Security Considerations

**For Production Deployment:**
- ✅ Implement authentication (JWT recommended)
- ✅ Enable HTTPS/TLS encryption
- ✅ Add rate limiting to APIs
- ✅ Sanitize and validate all inputs
- ✅ Use environment variables for sensitive config
- ✅ Implement RBAC (Role-Based Access Control)
- ✅ Regular security audits
- ✅ Database backups and disaster recovery

## 🧪 Testing

Run automated verification:
```bash
./verify-deployment.sh
```

This script tests:
- Container health
- API health check
- All 46 KPI endpoints
- Pain points endpoints
- Mobile safety endpoints

## 📈 Performance

**Optimizations Implemented:**
- Database indexes on frequently queried fields
- Prepared SQL statements
- Component-level code splitting
- Lazy loading for routes
- Memoization for expensive calculations
- Auto-refresh with debouncing

**Expected Performance:**
- API response time: < 100ms (local)
- Dashboard load time: < 2s
- KPI calculation: < 50ms
- Database queries: < 20ms

## 🎯 Calculation Methodology

All KPI calculations follow this pattern:

1. **Formula Definition**: Clear mathematical formula
2. **Data Components**: Breakdown of all inputs
3. **Calculation Steps**: Step-by-step execution
4. **Industry Benchmarks**: Comparison to standards
5. **Status Assessment**: Excellent/Good/Warning/Critical

Example: **OEE (Overall Equipment Effectiveness)**
```
Formula: OEE = Availability × Performance × Quality

Components:
- Availability = (Planned Production Time - Downtime) / Planned Production Time
- Performance = (Actual Output / Expected Output)
- Quality = (Good Units / Total Units)

Benchmark: 85% (World Class)
Status: Above 85% = Excellent, 75-85% = Good, 60-75% = Warning, <60% = Critical
```

## 🛣️ Roadmap

### Phase 1 (Current - Completed ✅)
- [x] HR Analytics Module
- [x] HSE Analytics Module
- [x] Predictive Analytics Engine
- [x] Mobile Safety Reporting
- [x] Operations Analytics Module
- [x] Quality Control Analytics Module
- [x] Supply Chain Analytics Module

### Phase 2 (Planned)
- [ ] Executive Dashboard (unified view)
- [ ] Finance Analytics Module
- [ ] Sales & Marketing Analytics
- [ ] PDF Report Generation
- [ ] Excel/CSV Export
- [ ] Email Alerts & Notifications
- [ ] Custom KPI Builder

### Phase 3 (Future)
- [ ] Machine Learning Models
- [ ] Advanced Forecasting
- [ ] Multi-tenant Architecture
- [ ] Mobile Apps (iOS/Android)
- [ ] API Webhooks
- [ ] Third-party Integrations (SAP, Oracle, etc.)

## 📝 Documentation

- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **API Documentation**: Available at `/api/health` endpoint
- **Verification Script**: `./verify-deployment.sh`
- **Code Comments**: Inline documentation in all services

## 🤝 Contributing

This is a proprietary platform developed for ElevareIQ. For feature requests or bug reports, contact the development team.

## 📄 License

Proprietary - ElevareIQ Platform © 2024

All rights reserved. Unauthorized copying, distribution, or modification is prohibited.

## 🆘 Support & Troubleshooting

**Common Issues:**

1. **Containers won't start**: Check Docker is running, ports are free
2. **API returns errors**: Check backend logs with `docker-compose logs backend`
3. **Blank dashboard**: Clear browser cache, hard refresh (Ctrl+Shift+R)
4. **Missing data**: Verify seeding completed in backend logs

**Get Help:**
```bash
# Check logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**For detailed troubleshooting**, see `DEPLOYMENT_GUIDE.md`.

---

<div align="center">

**Built with ❤️ for C-Suite Excellence**

ElevareIQ Platform | Version 1.0.0 | 2024

</div>
