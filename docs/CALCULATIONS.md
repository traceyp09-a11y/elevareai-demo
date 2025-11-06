# HR KPI Calculations Documentation

This document provides detailed formulas and calculation methods for all HR KPIs tracked in the ElevareIQ-MVP platform.

---

## 1. Employee Turnover Rate

### Purpose
Measures the percentage of employees who leave the organization over a specific period.

### Formula
```
Turnover Rate = (Number of Separations / Average Number of Employees) × 100
```

### Detailed Calculation
```
Average Number of Employees = (Beginning Headcount + Ending Headcount) / 2

Example:
- Beginning Headcount: 850
- Ending Headcount: 844
- Separations in Month: 12

Average Employees = (850 + 844) / 2 = 847
Turnover Rate = (12 / 847) × 100 = 1.42% (monthly)
Annual Turnover Rate = 1.42% × 12 = 17.04%
```

### Cost Impact Calculation
```
Cost of Turnover = Number of Separations × Average Cost per Separation

Average Cost per Separation =
  - Entry Level: 50% of annual salary
  - Mid Level: 125% of annual salary
  - Senior Level: 200% of annual salary

Example:
- 5 Entry Level @ $45,000 = $112,500
- 5 Mid Level @ $72,000 = $450,000
- 2 Senior Level @ $105,000 = $420,000
Total Monthly Cost: $982,500
```

### Industry Benchmarks
- Manufacturing: 15-20% annual
- Construction: 21-25% annual
- Logistics: 25-35% annual

---

## 2. Time to Hire

### Purpose
Measures the average number of days from job posting to candidate acceptance.

### Formula
```
Time to Hire = Σ(Acceptance Date - Job Posting Date) / Number of Hires
```

### Detailed Calculation
```
Position 1: 45 days
Position 2: 38 days
Position 3: 52 days
Position 4: 41 days
Position 5: 49 days

Average Time to Hire = (45 + 38 + 52 + 41 + 49) / 5 = 45 days
```

### Breakdown by Role
```
- Hourly/Production: 15-25 days
- Skilled Trades: 35-50 days
- Professional: 45-60 days
- Management: 60-90 days
```

### Industry Benchmarks
- Manufacturing: 42 days average
- Construction: 36 days average
- Logistics: 33 days average

---

## 3. Cost per Hire

### Purpose
Measures the total cost of recruiting and hiring a new employee.

### Formula
```
Cost per Hire = (Total Internal Costs + Total External Costs) / Number of Hires
```

### Detailed Components
```
Internal Costs:
- Recruiter Salaries (allocated): $15,000/month
- HR Team Time: $5,000/month
- Interview Time (managers): $3,000/month
- Onboarding/Training: $8,000/month

External Costs:
- Job Board Postings: $2,500/month
- Agency Fees: $12,000/month
- Background Checks: $1,800/month
- Assessment Tools: $800/month
- Relocation (if applicable): $5,000/month

Total Monthly Costs: $53,100
Number of Hires per Month: 15

Cost per Hire = $53,100 / 15 = $3,540
```

### Industry Benchmarks
- Manufacturing: $4,000-$5,500
- Construction: $3,500-$4,800
- Logistics: $3,000-$4,200

---

## 4. Employee Productivity

### Purpose
Measures output or revenue generated per employee.

### Formula (Manufacturing)
```
Productivity = Total Units Produced / Total Labor Hours

Example:
- Units Produced per Month: 125,000
- Total Labor Hours: 135,200
- Productivity = 125,000 / 135,200 = 0.924 units/hour
```

### Formula (Revenue-Based)
```
Revenue per Employee = Total Revenue / Number of Employees

Example:
- Annual Revenue: $87,500,000
- Average Headcount: 847
- Revenue per Employee = $87,500,000 / 847 = $103,307
```

### Efficiency Metrics
```
Operating Margin per Employee = Operating Income / Number of Employees

Example:
- Operating Income: $12,250,000
- Average Headcount: 847
- Operating Margin per Employee = $12,250,000 / 847 = $14,462
```

### Industry Benchmarks
- Manufacturing: $95,000-$125,000 revenue per employee
- Construction: $120,000-$180,000 revenue per employee
- Logistics: $85,000-$110,000 revenue per employee

---

## 5. Safety Incident Rate (TRIR)

### Purpose
Measures total recordable incidents per 200,000 labor hours (OSHA standard).

### Formula
```
TRIR = (Number of Recordable Incidents × 200,000) / Total Hours Worked
```

### Detailed Calculation
```
Example (Monthly):
- Recordable Incidents: 4
- Total Hours Worked: 135,200
- TRIR = (4 × 200,000) / 135,200 = 5.92

Example (Annual):
- Recordable Incidents: 42
- Total Hours Worked: 1,622,400
- TRIR = (42 × 200,000) / 1,622,400 = 5.18
```

### Cost Calculation
```
Total Safety Cost =
  Direct Costs (medical, compensation) +
  Indirect Costs (lost productivity, training replacement, investigation)

Indirect Costs typically = 4-10× Direct Costs

Example:
- Direct Costs: $125,000
- Indirect Costs (5× multiplier): $625,000
- Total Monthly Safety Cost: $750,000
```

### Severity Breakdown
```
- First Aid Only: 8 incidents
- Medical Treatment: 15 incidents
- Lost Time: 12 incidents
- Restricted Work: 7 incidents
- Fatalities: 0
```

### Industry Benchmarks
- Manufacturing: 3.5-4.2 TRIR
- Construction: 2.8-3.4 TRIR
- Logistics: 4.8-5.6 TRIR

---

## 6. Absenteeism Rate

### Purpose
Measures unplanned absences as a percentage of available work days.

### Formula
```
Absenteeism Rate = (Total Absent Days / Total Available Work Days) × 100
```

### Detailed Calculation
```
Example (Monthly):
- Total Employees: 847
- Work Days in Month: 22
- Total Available Days: 847 × 22 = 18,634 days
- Absent Days: 559 days
- Absenteeism Rate = (559 / 18,634) × 100 = 3.00%
```

### Breakdown by Type
```
Sick Leave: 320 days (57.2%)
Personal/Family Emergency: 168 days (30.1%)
No Call/No Show: 71 days (12.7%)
```

### Cost Calculation
```
Cost of Absenteeism =
  (Absent Days × Average Daily Wage) +
  Productivity Loss +
  Overtime to Cover

Example:
- Absent Days: 559
- Average Daily Wage: $185
- Direct Cost: 559 × $185 = $103,415
- Productivity Loss (20%): $20,683
- Overtime Premium: $31,025
Total Monthly Cost: $155,123
```

### Industry Benchmarks
- Manufacturing: 2.8-3.5%
- Construction: 3.0-3.8%
- Logistics: 3.2-4.0%

---

## 7. Training ROI

### Purpose
Measures the return on investment for training and development programs.

### Formula
```
Training ROI = [(Training Benefits - Training Costs) / Training Costs] × 100
```

### Detailed Calculation
```
Training Costs:
- Program Fees: $45,000
- Materials: $8,500
- Instructor/Facilitator: $22,000
- Employee Time (hourly rate × hours): $38,000
- Travel/Logistics: $6,500
Total Investment: $120,000

Training Benefits (Annual):
- Increased Productivity: $185,000
- Reduced Errors/Rework: $42,000
- Reduced Turnover: $78,000
- Improved Safety (fewer incidents): $35,000
Total Benefits: $340,000

ROI = [(340,000 - 120,000) / 120,000] × 100 = 183.3%
```

### Metrics Tracked
```
- Training Hours per Employee: 32 hours/year
- Training Cost per Employee: $1,416
- Course Completion Rate: 87%
- Skills Assessment Improvement: +23%
- Certification Pass Rate: 78%
```

### Industry Benchmarks
- High-performing companies: 150-250% ROI
- Average: 80-120% ROI
- Below average: <50% ROI

---

## 8. Employee Engagement Score

### Purpose
Measures employee satisfaction, commitment, and connection to the organization.

### Formula
```
Engagement Score = (Σ Survey Responses / Maximum Possible Score) × 100
```

### Detailed Calculation
```
Survey Structure (5-point Likert scale):
- 20 questions
- Maximum score per employee: 100 points
- Number of respondents: 723 (85% response rate)

Categories Measured:
1. Job Satisfaction (5 questions)
2. Manager Effectiveness (4 questions)
3. Career Growth (3 questions)
4. Company Culture (4 questions)
5. Work-Life Balance (4 questions)

Example Calculation:
- Total Points Earned: 51,566
- Maximum Possible: 723 × 100 = 72,300
- Engagement Score = (51,566 / 72,300) × 100 = 71.3%
```

### Category Breakdown
```
Job Satisfaction: 68%
Manager Effectiveness: 73%
Career Growth: 65%
Company Culture: 75%
Work-Life Balance: 72%
```

### Segmentation
```
By Department:
- Manufacturing: 69%
- Logistics: 71%
- Construction: 68%
- Administration: 78%

By Tenure:
- 0-1 year: 74%
- 1-3 years: 69%
- 3-5 years: 68%
- 5+ years: 73%
```

### Industry Benchmarks
- High Engagement: >75%
- Moderate Engagement: 60-75%
- Low Engagement: <60%

---

## 9. Offer Acceptance Rate

### Purpose
Measures the percentage of job offers that are accepted by candidates.

### Formula
```
Offer Acceptance Rate = (Number of Accepted Offers / Total Offers Extended) × 100
```

### Detailed Calculation
```
Example (Monthly):
- Total Offers Extended: 22
- Offers Accepted: 18
- Offers Declined: 4
- Acceptance Rate = (18 / 22) × 100 = 81.8%
```

### Decline Reasons
```
Compensation: 5 (22.7%)
Accepted Counter-Offer: 4 (18.2%)
Better Opportunity: 6 (27.3%)
Location/Commute: 3 (13.6%)
Company Reputation: 2 (9.1%)
Other: 2 (9.1%)
```

### Impact Analysis
```
Cost of Declined Offer:
- Recruiting Costs Already Spent: $3,540 per position
- Time Lost (restart search): $1,200
- Total Cost per Decline: $4,740

Monthly Cost = 4 declines × $4,740 = $18,960
```

### Benchmark by Level
```
- Entry Level: 85-92%
- Mid Level: 78-85%
- Senior Level: 70-78%
- Executive: 65-75%
```

### Industry Benchmarks
- Manufacturing: 80-85%
- Construction: 75-82%
- Logistics: 78-84%

---

## 10. Revenue per Employee

### Purpose
Measures organizational efficiency and productivity at the enterprise level.

### Formula
```
Revenue per Employee = Total Revenue / Average Number of Employees
```

### Detailed Calculation
```
Quarterly Example:
- Q1 Revenue: $21,250,000
- Q1 Average Headcount: 843
- Q1 Revenue per Employee = $21,250,000 / 843 = $25,208

Annual Example:
- Annual Revenue: $87,500,000
- Annual Average Headcount: 847
- Annual Revenue per Employee = $87,500,000 / 847 = $103,307
```

### Trend Analysis
```
Year-over-Year Comparison:
- 2023: $98,450 per employee (836 employees, $82,304,200 revenue)
- 2024: $103,307 per employee (847 employees, $87,500,000 revenue)
- Growth: +4.9%
```

### Efficiency Ratios
```
Operating Income per Employee:
- Operating Income: $12,250,000
- Headcount: 847
- OI per Employee: $14,462

Labor Cost per Revenue Dollar:
- Total Labor Costs: $46,585,000
- Total Revenue: $87,500,000
- Labor Cost Ratio: $0.532 per revenue dollar (53.2%)
```

### Industry Benchmarks
- Manufacturing: $95,000-$125,000
- Construction: $120,000-$180,000
- Logistics: $85,000-$110,000
- Best-in-Class: >$150,000

---

## Additional Metrics

### 11. Quality of Hire

```
Quality of Hire = (Performance Rating + Retention + Culture Fit + Hiring Manager Satisfaction) / 4

Example:
- Average Performance Rating (1-5 scale): 4.1
- 1-Year Retention Rate: 88%
- Culture Fit Score (1-5): 4.3
- Manager Satisfaction (1-5): 4.0

Normalized to 100 scale:
QoH = [(4.1/5 + 0.88 + 4.3/5 + 4.0/5) / 4] × 100 = 83.5%
```

### 12. Internal Promotion Rate

```
Internal Promotion Rate = (Number of Internal Promotions / Total Positions Filled) × 100

Example:
- Internal Promotions: 8
- Total Positions Filled: 15
- Promotion Rate = (8 / 15) × 100 = 53.3%
```

### 13. Span of Control

```
Average Span of Control = Total Employees / Total Managers

Example:
- Total Employees: 847
- Total Managers: 94
- Span = 847 / 94 = 9.0 employees per manager
```

### 14. HR-to-Employee Ratio

```
HR Ratio = Number of HR Staff / Total Employees × 100

Example:
- HR Staff: 12
- Total Employees: 847
- HR Ratio = (12 / 847) × 100 = 1.42 HR staff per 100 employees
```

---

## Data Sources

All calculations use data from:
1. **HRIS System** - Employee records, demographics, compensation
2. **ATS (Applicant Tracking System)** - Recruitment metrics
3. **Time & Attendance System** - Hours worked, absences
4. **LMS (Learning Management System)** - Training data
5. **Safety Management System** - Incident reports
6. **Financial System** - Revenue, costs, budget data
7. **Survey Platform** - Engagement survey results

---

## Assumptions

1. All financial calculations use USD
2. Standard work year = 2,080 hours (40 hours/week × 52 weeks)
3. Average work month = 173.33 hours (2,080 / 12)
4. Benefits load = 35% of base salary
5. OSHA standard = 200,000 hours (100 FTE working 50 weeks)

---

## Update Frequency

- Real-time: Safety incidents, absenteeism
- Daily: Time to hire, productivity
- Weekly: Offer acceptance, engagement pulse
- Monthly: All KPIs full calculation
- Quarterly: Strategic review and trending
- Annual: Comprehensive analysis and benchmarking

---

## Validation & Audit

All calculations are:
1. **Auditable** - Source data traceable
2. **Repeatable** - Consistent methodology
3. **Comparable** - Industry standard formulas
4. **Transparent** - Full formula documentation
5. **Validated** - Regular accuracy checks

Last Updated: November 2025
