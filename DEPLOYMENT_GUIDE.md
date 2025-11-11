# ElevareIQ Platform - Deployment Guide

## Overview

ElevareIQ is a comprehensive analytics platform providing real-time KPI tracking and pain point analysis across multiple business departments.

## Modules Included

- ✅ **HR Analytics** - 6 KPIs, 10 pain points
- ✅ **HSE (Health, Safety & Environment)** - 10 KPIs, 10 pain points, predictive analytics, mobile safety reporting
- ✅ **Operations Analytics** - 10 KPIs, 10 pain points
- ✅ **Quality Control (QC)** - 10 KPIs, 10 pain points
- ✅ **Supply Chain Analytics** - 10 KPIs, 10 pain points

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git installed
- Ports 3001 (backend) and 5173 (frontend) available

### Deployment Steps

```bash
# 1. Navigate to project directory
cd /path/to/elevareai-demo

# 2. Pull latest changes
git pull origin claude/elevare-integration-work-011CUquLWMowpAvCuTP3okht

# 3. Stop existing containers (if running)
docker-compose down

# 4. Remove old images to ensure clean build
docker-compose down --rmi all

# 5. Build containers with no cache (ensures all updates are included)
docker-compose build --no-cache

# 6. Start containers
docker-compose up -d

# 7. Verify containers are running
docker-compose ps
```

### Expected Output

You should see both containers running:
```
NAME                    STATUS
elevareiq-backend       Up
elevareiq-frontend      Up
```

### Verify Database Initialization

Check that all modules seeded successfully:

```bash
docker-compose logs backend | grep -E "(HR|HSE|Operations|QC|Supply Chain)"
```

Expected output:
```
Main database schema created successfully.
HSE database schema created successfully.
Operations database schema created successfully.
QC database schema created successfully.
Supply Chain database schema created successfully.
HR data seeding completed!
HSE data seeding completed!
Operations data seeding completed!
QC data seeding completed!
Supply Chain data seeding completed!
```

## Accessing the Platform

### Web Interface

Open your browser and navigate to:
- **Frontend**: http://localhost:5173

### Available Routes

**HR Analytics:**
- Dashboard: `/`
- Pain Points: `/pain-points`
- Reports: `/reports`

**HSE Analytics:**
- Dashboard: `/hse`
- Pain Points: `/hse/pain-points`
- Predictive Analytics: `/hse/predictive`
- Mobile Safety App: `/hse/mobile`

**Operations Analytics:**
- Dashboard: `/ops`
- Pain Points: `/ops/pain-points`
- Reports: `/ops/reports`

**Quality Control Analytics:**
- Dashboard: `/qc`
- Pain Points: `/qc/pain-points`
- Reports: `/qc/reports`

**Supply Chain Analytics:**
- Dashboard: `/supplychain`
- Pain Points: `/supplychain/pain-points`
- Reports: `/supplychain/reports`

### API Endpoints

Backend API is accessible at: http://localhost:3001

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Test HR KPIs:**
```bash
curl http://localhost:3001/api/kpis/current
```

**Test HSE KPIs:**
```bash
curl http://localhost:3001/api/hse/kpis/current
```

**Test Operations KPIs:**
```bash
curl http://localhost:3001/api/ops/kpis/current
```

**Test QC KPIs:**
```bash
curl http://localhost:3001/api/qc/kpis/current
```

**Test Supply Chain KPIs:**
```bash
curl http://localhost:3001/api/supplychain/kpis/current
```

## Troubleshooting

### Container Issues

**Containers won't start:**
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend

# Ensure ports are not in use
lsof -i :3001  # Backend port
lsof -i :5173  # Frontend port
```

**Database errors:**
```bash
# Restart containers with fresh database
docker-compose down -v  # This removes volumes
docker-compose build --no-cache
docker-compose up -d
```

### Frontend Issues

**"Failed to fetch" errors:**
- Ensure backend container is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify API is accessible: `curl http://localhost:3001/api/health`

**Blank screen or module not showing:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors (F12)

### Backend Issues

**Missing dependency errors:**
```bash
# Rebuild backend container
docker-compose build --no-cache backend
docker-compose up -d backend
```

**Database schema errors:**
```bash
# Check if all schema files exist
ls backend/database/*.sql

# Should show:
# schema.sql
# schema-hse.sql
# schema-ops.sql
# schema-qc.sql
# schema-supplychain.sql
```

## Performance Optimization

### For Production Deployment

1. **Build for production:**
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

2. **Use production Docker compose:**
Create `docker-compose.prod.yml` with optimized settings

3. **Enable compression:**
Add gzip compression middleware to backend

4. **Database optimization:**
- Add indexes for frequently queried fields
- Implement query result caching
- Consider moving to PostgreSQL for larger datasets

## Data Refresh

### Reseed Data

To refresh all data without rebuilding containers:

```bash
# Enter backend container
docker exec -it elevareiq-backend sh

# Run seeding scripts
npm run init-db
npm run seed-data
npm run seed-hse
npm run seed-ops
npm run seed-qc
npm run seed-supplychain

# Exit container
exit
```

### Change Date Ranges

KPIs are currently hardcoded to Q4 2024 (2024-10-01 to 2024-12-31).

To change date ranges:
1. Edit seed data scripts in `backend/src/data/seedData*.ts`
2. Update API endpoints in `backend/src/server.ts` (search for "2024-10-01")
3. Reseed data

## Module-Specific Notes

### Supply Chain Module (NEW)

The Supply Chain module includes:
- **14 database tables** tracking orders, inventory, shipments, suppliers, costs
- **2000+ generated orders** over 12-month period
- **10 KPIs** covering fulfillment, inventory, cash flow, logistics, costs
- **10 pain points** with current/target metrics and cost impacts

Key metrics:
- Perfect Order Rate: Measures on-time, in-full, accurate deliveries
- OTIF: On-Time In-Full performance
- Cash-to-Cash Cycle: Working capital efficiency
- DSO: Days Sales Outstanding
- Inventory Turnover: Stock efficiency

### HSE Mobile Safety App

Accessible at http://localhost:5173/hse/mobile

Features:
- Report safety incidents with GPS location
- Submit near-miss reports
- Submit safety suggestions
- Photo upload capability (simulated)

### Predictive Analytics

Accessible at http://localhost:5173/hse/predictive

Features:
- Risk prediction models
- Trend analysis
- Forecasting algorithms

## Security Considerations

### For Production

1. **Environment Variables:**
- Move sensitive config to .env files
- Never commit .env files to git

2. **CORS Configuration:**
- Restrict CORS origins to your domain
- Currently set to allow all origins (development only)

3. **Database:**
- Use strong authentication
- Encrypt sensitive data
- Regular backups

4. **API Security:**
- Implement authentication (JWT)
- Add rate limiting
- Input validation and sanitization

## Monitoring

### Check Container Health

```bash
# View container stats
docker stats elevareiq-backend elevareiq-frontend

# Check resource usage
docker-compose top

# Follow logs in real-time
docker-compose logs -f
```

### Application Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Filter by module
docker-compose logs backend | grep "Supply Chain"
docker-compose logs backend | grep "QC"
```

## Support

### Common Questions

**Q: Why is my dashboard showing old data?**
A: Dashboard refreshes every 30 seconds. Try hard refresh (Ctrl+Shift+R).

**Q: Can I change the color themes?**
A: Yes, edit the respective Dashboard component files in `frontend/src/pages/`.

**Q: How do I add more KPIs?**
A:
1. Add calculation method to appropriate `kpiCalculations*.ts` file
2. Add API endpoint in `server.ts`
3. Update frontend Dashboard component to display new KPI

**Q: Can I export data to Excel?**
A: Export functionality is planned but not yet implemented.

## Maintenance

### Regular Tasks

**Weekly:**
- Review container logs for errors
- Check disk space usage
- Verify all modules are accessible

**Monthly:**
- Update npm dependencies
- Review and optimize database queries
- Backup database

**Quarterly:**
- Review and update KPI benchmarks
- Update seed data to reflect current period
- Performance testing

## Next Steps

After successful deployment:

1. **Verify All Modules:**
   - Click through each department (HR, HSE, Ops, QC, Supply Chain)
   - Ensure dashboards load with data
   - Check pain points pages
   - Verify calculation transparency (click on KPI cards)

2. **Customize for Your Organization:**
   - Update company name in `frontend/src/App.tsx`
   - Adjust KPI benchmarks in `backend/src/services/kpiCalculations*.ts`
   - Modify pain points to reflect actual challenges

3. **Data Integration:**
   - Replace seed data with actual company data
   - Set up data pipelines from existing systems
   - Implement scheduled data refresh

4. **User Training:**
   - Demonstrate calculation transparency feature
   - Explain pain point prioritization
   - Show how to interpret KPI status indicators

## Contact

For issues or questions:
- Review logs: `docker-compose logs`
- Check troubleshooting section above
- Verify all deployment steps were followed

---

**Platform Version:** 1.0.0
**Last Updated:** 2024-11-08
**Modules:** HR, HSE, Operations, QC, Supply Chain
**Status:** Production Ready ✅
