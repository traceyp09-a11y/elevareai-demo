# ElevareIQ-MVP API Documentation

Base URL: `http://localhost:3001/api`

## Overview

The ElevareIQ-MVP API provides access to HR analytics, KPIs, and pain point data for the TitanBuild Manufacturing & Logistics demo company. All calculations are transparent and include detailed breakdowns.

---

## Endpoints

### Health Check

#### `GET /api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "ElevareIQ-MVP API is running"
}
```

---

### Company Information

#### `GET /api/company`

Get company profile and facility information.

**Response:**
```json
{
  "success": true,
  "company": {
    "name": "TitanBuild Manufacturing & Logistics",
    "industry": "Manufacturing, Construction & Logistics",
    "founded": 1998,
    "headquarters": "Detroit, Michigan",
    "facilities": 4,
    "employees": 847,
    "fiscalYear": 2024,
    "locations": [
      {
        "name": "Detroit Manufacturing Plant",
        "type": "Manufacturing",
        "employees": 385
      }
      // ... more locations
    ]
  }
}
```

---

### Pain Points

#### `GET /api/pain-points`

Get the top 10 HR pain points for manufacturing, construction, and logistics industries.

**Response:**
```json
{
  "success": true,
  "painPoints": [
    {
      "rank": 1,
      "title": "Skilled Labor Shortage & Talent Acquisition",
      "description": "94% of construction firms struggle to fill craft positions...",
      "relatedKPIs": ["Time to Hire", "Cost per Hire", "Offer Acceptance Rate"],
      "severity": "Critical"
    }
    // ... more pain points
  ]
}
```

---

### KPI Endpoints

#### `GET /api/kpis/current`

Get all KPIs for the current period (Q4 2024).

**Response:**
```json
{
  "success": true,
  "period": {
    "startDate": "2024-10-01",
    "endDate": "2024-12-31",
    "label": "Q4 2024"
  },
  "kpis": {
    "turnoverRate": { /* KPI data */ },
    "timeToHire": { /* KPI data */ },
    // ... all 10 KPIs
  }
}
```

---

#### `GET /api/kpis/period`

Get all KPIs for a custom date range.

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Example:**
```
GET /api/kpis/period?startDate=2024-01-01&endDate=2024-03-31
```

**Response:**
```json
{
  "success": true,
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-03-31"
  },
  "kpis": {
    // ... all KPIs for the specified period
  }
}
```

---

### Individual KPI Endpoints

All individual KPI endpoints return detailed calculation breakdowns.

**Response Structure:**
```typescript
{
  success: boolean;
  kpi: string;
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  benchmark?: {
    value: number;
    status: 'above' | 'at' | 'below';
  };
  trend?: {
    previous: number;
    change: number;
    changePercent: number;
  };
}
```

#### `GET /api/kpis/turnover`

Employee turnover rate with cost impact.

**Query Parameters:**
- `startDate` (optional): Default 2024-10-01
- `endDate` (optional): Default 2024-12-31

**Example Response:**
```json
{
  "success": true,
  "kpi": "Employee Turnover Rate",
  "value": 1.42,
  "displayValue": "1.42%",
  "calculation": {
    "formula": "Turnover Rate = (Number of Separations / Average Number of Employees) × 100",
    "components": {
      "beginningHeadcount": 850,
      "endingHeadcount": 844,
      "averageEmployees": 847,
      "separations": 12,
      "period": "2024-10-01 to 2024-12-31",
      "turnoverCost": 982500
    },
    "steps": [
      "Step 1: Calculate average employees = (850 + 844) / 2 = 847.00",
      "Step 2: Count separations in period = 12",
      "Step 3: Calculate turnover rate = (12 / 847.00) × 100 = 1.42%",
      "Step 4: Calculate cost impact = $982,500"
    ]
  },
  "benchmark": {
    "value": 20,
    "status": "below"
  }
}
```

---

#### `GET /api/kpis/time-to-hire`

Average time to fill positions.

**Query Parameters:**
- `startDate` (optional): Default 2024-10-01
- `endDate` (optional): Default 2024-12-31

---

#### `GET /api/kpis/cost-per-hire`

Average cost to recruit and hire a new employee.

**Query Parameters:**
- `startDate` (optional): Default 2024-10-01
- `endDate` (optional): Default 2024-12-31

---

#### `GET /api/kpis/productivity`

Revenue per employee (productivity measure).

**Query Parameters:**
- `startDate` (optional): Default 2024-10-01
- `endDate` (optional): Default 2024-12-31

---

#### `GET /api/kpis/safety`

Total Recordable Incident Rate (TRIR) per 200,000 hours.

**Query Parameters:**
- `startDate` (optional): Default 2024-10-01
- `endDate` (optional): Default 2024-12-31

**Calculation Breakdown:**
```json
{
  "components": {
    "recordableIncidents": 12,
    "totalHours": 405600,
    "trir": 5.92,
    "byType": {
      "First Aid": 3,
      "Medical Treatment": 5,
      "Lost Time": 3,
      "Restricted Work": 1
    },
    "directCosts": 125000,
    "indirectCosts": 625000,
    "totalCost": 750000
  }
}
```

---

#### `GET /api/kpis/absenteeism`

Unplanned absence rate.

**Query Parameters:**
- `startDate` (optional): Default 2024-10-01
- `endDate` (optional): Default 2024-12-31

---

#### `GET /api/kpis/training-roi`

Return on investment for training programs.

**Query Parameters:**
- `fiscalYear` (optional): Default 2024

**Example Response:**
```json
{
  "components": {
    "totalInvestment": 512300,
    "employeesTrained": 340,
    "avgImprovement": 23.4,
    "benefits": {
      "productivityGain": 748000,
      "reducedTurnover": 221000,
      "improvedSafety": 136000,
      "reducedErrors": 170000,
      "totalBenefits": 1275000
    },
    "roi": 148.9
  }
}
```

---

#### `GET /api/kpis/engagement`

Employee engagement survey results.

**Query Parameters:**
- `surveyId` (optional): Specific survey ID, defaults to most recent

**Calculation Breakdown:**
```json
{
  "components": {
    "surveyName": "Q3 2024 Employee Engagement",
    "surveyDate": "2024-09-15",
    "totalEmployees": 845,
    "responsesReceived": 723,
    "responseRate": "85.5",
    "averageTotalScore": "71.3",
    "maximumScore": 100,
    "engagementScore": 71.3,
    "categoryBreakdown": {
      "jobSatisfaction": "68.0",
      "managerEffectiveness": "73.0",
      "careerGrowth": "65.0",
      "companyCulture": "75.0",
      "workLifeBalance": "72.0"
    }
  }
}
```

---

#### `GET /api/kpis/offer-acceptance`

Percentage of job offers accepted.

**Query Parameters:**
- `startDate` (optional): Default 2024-10-01
- `endDate` (optional): Default 2024-12-31

**Decline Reasons Breakdown:**
```json
{
  "components": {
    "totalOffers": 22,
    "acceptedOffers": 18,
    "declinedOffers": 4,
    "acceptanceRate": 81.8,
    "declineReasons": {
      "Compensation": { "count": 1, "percentage": "25.0" },
      "Better Opportunity": { "count": 2, "percentage": "50.0" },
      "Location/Commute": { "count": 1, "percentage": "25.0" }
    },
    "costPerDecline": 4740,
    "totalCost": 18960
  }
}
```

---

#### `GET /api/kpis/revenue-per-employee`

Revenue generated per employee (same as productivity endpoint).

**Query Parameters:**
- `startDate` (optional): Default 2024-10-01
- `endDate` (optional): Default 2024-12-31

---

## Error Responses

All endpoints may return error responses in the following format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "startDate and endDate query parameters are required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## Data Sources

All KPI calculations pull from:
- **HRIS System**: Employee records, demographics, compensation
- **ATS (Applicant Tracking)**: Recruitment metrics
- **Time & Attendance**: Hours worked, absences
- **LMS (Learning Management)**: Training data
- **Safety Management**: Incident reports
- **Financial System**: Revenue, costs, budget data
- **Survey Platform**: Engagement survey results

---

## Rate Limiting

Currently no rate limiting is implemented. This is a demo/MVP system.

---

## Authentication

Currently no authentication is required. In production, implement:
- API key authentication
- OAuth 2.0 for user-based access
- Role-based access control (RBAC)

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

---

## Calculation Transparency

Every KPI endpoint provides:
1. **Formula**: The mathematical formula used
2. **Components**: All input values with labels
3. **Steps**: Step-by-step calculation breakdown
4. **Benchmarks**: Industry standard comparisons
5. **Trends**: Historical comparison (when available)

This transparency ensures all metrics are auditable and trustworthy for C-suite decision-making.

---

## Example Integration

### JavaScript/TypeScript
```typescript
import axios from 'axios';

// Get all current KPIs
const response = await axios.get('http://localhost:3001/api/kpis/current');
const { kpis, period } = response.data;

console.log(`Turnover Rate: ${kpis.turnoverRate.displayValue}`);
console.log(`Benchmark: ${kpis.turnoverRate.benchmark.value}%`);

// Get detailed calculation
const detailResponse = await axios.get('http://localhost:3001/api/kpis/turnover');
console.log('Calculation Steps:', detailResponse.data.calculation.steps);
```

### Python
```python
import requests

# Get company info
response = requests.get('http://localhost:3001/api/company')
company = response.json()['company']
print(f"Company: {company['name']}")

# Get specific KPI
response = requests.get('http://localhost:3001/api/kpis/safety')
safety = response.json()
print(f"TRIR: {safety['displayValue']}")
```

---

## Future Enhancements

Planned API improvements:
- Historical trend data endpoints
- Comparative analysis (period-over-period)
- Predictive analytics
- Custom report generation
- Webhook notifications for threshold alerts
- GraphQL API option
- Real-time data streaming

---

**Last Updated**: November 2024
**API Version**: 1.0.0
