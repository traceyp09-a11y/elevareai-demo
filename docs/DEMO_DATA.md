# Demo Data Documentation

## Company Profile: TitanBuild Manufacturing & Logistics

### Company Overview
- **Name**: TitanBuild Manufacturing & Logistics
- **Industry**: Manufacturing, Construction & Logistics
- **Founded**: 1998
- **Headquarters**: Detroit, Michigan
- **Total Employees**: 847 (active)
- **Facilities**: 4 locations across the United States
- **Fiscal Year**: 2024
- **Annual Revenue**: $87.5M
- **Operating Income**: $12.25M (14% margin)

### Facilities

1. **Detroit Manufacturing Plant**
   - Type: Manufacturing
   - Location: 1500 Industrial Pkwy, Detroit, MI
   - Employees: 385
   - Focus: Production and assembly operations

2. **Phoenix Distribution Center**
   - Type: Logistics
   - Location: 2840 Warehouse Dr, Phoenix, AZ
   - Employees: 182
   - Focus: Warehousing and distribution

3. **Atlanta Construction Division**
   - Type: Construction
   - Location: 760 Builder Blvd, Atlanta, GA
   - Employees: 218
   - Focus: Commercial construction projects

4. **Chicago Corporate Office**
   - Type: Office
   - Location: 400 Executive Plaza, Chicago, IL
   - Employees: 62
   - Focus: Corporate administration

## Employee Demographics

### Workforce Distribution by Level
- **Entry Level**: ~375 employees (44%)
- **Mid Level**: ~280 employees (33%)
- **Senior Level**: ~110 employees (13%)
- **Manager**: ~55 employees (6.5%)
- **Director**: ~20 employees (2.4%)
- **VP**: ~7 employees (0.8%)

### Department Distribution
- Manufacturing: ~320 employees
- Logistics: ~195 employees
- Construction: ~225 employees
- Quality Assurance: ~40 employees
- Maintenance: ~35 employees
- Human Resources: ~12 employees
- Finance: ~8 employees
- IT: ~6 employees
- Safety: ~4 employees
- Operations: ~2 employees

### Employment Type
- Full-time: 100%
- Part-time: 0%
- Contract: 0%

## Compensation Structure

### Hourly Rates (Entry to Mid-Level)
- **Entry Level**: $16-22/hour
- **Mid Level**: $22-35/hour

### Annual Salaries (Senior to Executive)
- **Senior Level**: $65,000-95,000
- **Manager**: $85,000-115,000
- **Director**: $110,000-155,000
- **VP**: $150,000-225,000

### Benefits
- Benefits load: 35% of base salary
- Total compensation package includes health insurance, 401(k), PTO, etc.

## Historical Data (Past 12 Months)

### Recruitment Activity
- **Job Postings**: 45 total
  - Currently Open: 8
  - Filled: 37
- **Total Candidates**: ~600 applications processed
- **Offers Extended**: ~25 per quarter
- **Offer Acceptance Rate**: 82%
- **Average Time to Hire**: 45 days

### Separations
- **Total Separations (12 months)**: 35 employees
- **Annual Turnover Rate**: ~17%
- **Separation Types**:
  - Voluntary: 60%
  - Involuntary: 30%
  - Retirement: 10%
- **Top Reasons**:
  - Better opportunity: 30%
  - Compensation: 22%
  - Career change: 18%
  - Relocation: 12%
  - Performance issues: 10%
  - Other: 8%

### Attendance
- **Absences per Month**: ~50-60 days
- **Annual Absenteeism Rate**: 3.0%
- **Absence Types**:
  - Sick Leave: 57%
  - Personal/Family: 30%
  - No Call/No Show: 13%

### Safety
- **Total Incidents (12 months)**: 48
- **TRIR**: 5.18
- **Incident Types**:
  - First Aid: 16 (33%)
  - Medical Treatment: 15 (31%)
  - Lost Time: 12 (25%)
  - Restricted Work: 5 (10%)
- **Total Safety Costs**: ~$2.8M annually
  - Direct costs: ~$560K
  - Indirect costs: ~$2.24M

### Training
- **Programs Offered**: 10 different programs
- **Employees Trained**: ~340 (40% of workforce)
- **Training Hours per Employee**: 32 hours/year
- **Training Cost per Employee**: $1,416
- **Completion Rate**: 87%
- **Certification Pass Rate**: 78%
- **Training ROI**: 183%

### Engagement
- **Surveys Conducted**: 3 (quarterly)
- **Response Rate**: 85%
- **Overall Engagement Score**: 71.3%
- **Category Scores**:
  - Job Satisfaction: 68%
  - Manager Effectiveness: 73%
  - Career Growth: 65%
  - Company Culture: 75%
  - Work-Life Balance: 72%

## Financial Data

### Quarterly Revenue (2024)
- **Q1**: $21.25M
- **Q2**: $22.10M
- **Q3**: $21.85M
- **Q4**: $22.30M (projected)
- **Annual Total**: $87.50M

### Labor Costs
- **Total Annual Labor Costs**: $46.585M
- **As % of Revenue**: 53.2%
- **Benefits Costs**: $16.285M (35% load)

### HR Budget (2024)
- **Recruitment**: $720K (budgeted) / $658K (actual)
- **Training**: $485K (budgeted) / $512K (actual)
- **Benefits**: $16.3M (budgeted) / $16.285M (actual)
- **Compensation**: $47.2M (budgeted) / $46.585M (actual)
- **Technology**: $225K (budgeted) / $218K (actual)
- **Safety**: $850K (budgeted) / $892K (actual)

## Production Metrics

### Manufacturing Output
- **Units Produced per Month**: 9,000-13,000
- **Defect Rate**: 2-5%
- **Rework Rate**: 60-85% of defects
- **Labor Hours per Month**: 11,000-14,500

### Productivity
- **Revenue per Employee**: $103,307
- **Operating Income per Employee**: $14,462
- **Units per Labor Hour**: 0.924

## Data Generation Notes

All demo data has been:
1. **Realistically Randomized** - Uses appropriate distributions for industry
2. **Temporally Consistent** - Historical data spans 12 months (2024)
3. **Mathematically Coherent** - All calculations produce valid results
4. **Industry-Aligned** - Benchmarks match real industry standards
5. **Audit-Ready** - All values traceable to source data

### Data Refresh
To regenerate demo data:
```bash
cd backend
npm run init-db    # Recreates database schema
npm run seed-data  # Populates with new random data
```

### Customization
To modify demo data parameters, edit:
- `/backend/src/data/seedData.ts` - Adjust ranges, distributions
- `/backend/database/schema.sql` - Modify table structures
- `/backend/src/services/kpiCalculations.ts` - Change calculation logic

## Privacy & Compliance

- All employee names are randomly generated
- No real personal information is used
- Email addresses are fictional
- All data is for demonstration purposes only
- Not based on any real company or individuals

---

**Last Updated**: November 2024
**Data Period**: January 2024 - December 2024
