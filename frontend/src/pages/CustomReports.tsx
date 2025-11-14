import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import ElevareLogo from '../components/ElevareLogo';

type ReportType = 'executive' | 'operational' | 'compliance' | 'custom';
type TimeRange = '1m' | '3m' | '6m' | '1y' | '2y';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ReportType;
  metrics: string[];
}

const getReportTemplates = (department: string): ReportTemplate[] => {
  switch (department) {
    case 'HR':
      return [
        {
          id: 'executive-summary',
          name: 'Executive Summary',
          description: 'High-level overview of all key HR metrics for C-suite presentations',
          icon: '📊',
          type: 'executive',
          metrics: ['turnover', 'engagement', 'productivity', 'revenue-per-employee']
        },
        {
          id: 'workforce-analytics',
          name: 'Workforce Analytics',
          description: 'Detailed workforce composition, turnover, and productivity analysis',
          icon: '👥',
          type: 'operational',
          metrics: ['headcount', 'turnover', 'absenteeism', 'demographics']
        },
        {
          id: 'recruitment-performance',
          name: 'Recruitment Performance',
          description: 'Hiring efficiency, time-to-hire, and candidate quality metrics',
          icon: '🎯',
          type: 'operational',
          metrics: ['time-to-hire', 'cost-per-hire', 'offer-acceptance', 'quality-of-hire']
        }
      ];

    case 'HSE':
      return [
        {
          id: 'safety-overview',
          name: 'Safety Performance Overview',
          description: 'Comprehensive safety metrics including TRIR, LTIFR, and incident trends',
          icon: '🦺',
          type: 'executive',
          metrics: ['trir', 'ltifr', 'dart-rate', 'near-miss-rate']
        },
        {
          id: 'incident-analysis',
          name: 'Incident Analysis Report',
          description: 'Detailed breakdown of safety incidents, root causes, and corrective actions',
          icon: '🚨',
          type: 'operational',
          metrics: ['incident-types', 'severity', 'departments', 'trends']
        },
        {
          id: 'safety-compliance',
          name: 'Safety Compliance Audit',
          description: 'OSHA compliance status, training completion, and PPE compliance tracking',
          icon: '✅',
          type: 'compliance',
          metrics: ['training-completion', 'ppe-compliance', 'audit-scores', 'violations']
        }
      ];

    case 'Operations':
      return [
        {
          id: 'production-overview',
          name: 'Production Performance',
          description: 'OEE, production volume, cycle time, and capacity utilization metrics',
          icon: '⚙️',
          type: 'executive',
          metrics: ['oee', 'production-volume', 'cycle-time', 'capacity-util']
        },
        {
          id: 'downtime-analysis',
          name: 'Downtime Analysis',
          description: 'Detailed analysis of unplanned downtime, causes, and impact on production',
          icon: '⏱️',
          type: 'operational',
          metrics: ['downtime-percentage', 'downtime-causes', 'mttr', 'mtbf']
        },
        {
          id: 'efficiency-report',
          name: 'Operational Efficiency',
          description: 'Setup times, changeover efficiency, and on-time delivery performance',
          icon: '📈',
          type: 'operational',
          metrics: ['setup-time', 'changeover-eff', 'otd-rate', 'yield-rate']
        }
      ];

    case 'Quality Control':
      return [
        {
          id: 'quality-overview',
          name: 'Quality Performance Dashboard',
          description: 'Defect rates, first pass yield, scrap, and rework metrics overview',
          icon: '✓',
          type: 'executive',
          metrics: ['defect-rate', 'first-pass-yield', 'scrap-rate', 'rework-rate']
        },
        {
          id: 'customer-quality',
          name: 'Customer Quality Report',
          description: 'Customer returns, complaints, and satisfaction with product quality',
          icon: '🎯',
          type: 'operational',
          metrics: ['return-rate', 'complaints', 'csat', 'warranty-claims']
        },
        {
          id: 'supplier-quality',
          name: 'Supplier Quality Index',
          description: 'Incoming material quality, supplier performance, and corrective actions',
          icon: '📦',
          type: 'operational',
          metrics: ['supplier-defects', 'supplier-rating', 'ncr-rate', 'capa-effectiveness']
        }
      ];

    case 'Supply Chain':
      return [
        {
          id: 'sc-overview',
          name: 'Supply Chain Performance',
          description: 'Perfect order rate, OTIF delivery, inventory turnover, and DSO metrics',
          icon: '🚚',
          type: 'executive',
          metrics: ['perfect-order-rate', 'otif', 'inventory-turnover', 'dso']
        },
        {
          id: 'logistics-performance',
          name: 'Logistics & Distribution',
          description: 'Freight costs, delivery performance, and warehouse utilization analysis',
          icon: '📦',
          type: 'operational',
          metrics: ['freight-cost', 'warehouse-util', 'order-accuracy', 'lead-time']
        },
        {
          id: 'cash-flow',
          name: 'Cash-to-Cash Cycle',
          description: 'Working capital efficiency, payment terms, and cash flow optimization',
          icon: '💰',
          type: 'operational',
          metrics: ['cash-cycle', 'dso', 'dpo', 'working-capital']
        }
      ];

    case 'Finance':
      return [
        {
          id: 'financial-overview',
          name: 'Financial Performance Summary',
          description: 'Revenue growth, profit margins, EBITDA, and key financial ratios',
          icon: '💰',
          type: 'executive',
          metrics: ['revenue-growth', 'gross-margin', 'ebitda', 'roe']
        },
        {
          id: 'cash-flow-analysis',
          name: 'Cash Flow Analysis',
          description: 'Operating cash flow, liquidity ratios, and working capital management',
          icon: '💵',
          type: 'operational',
          metrics: ['cash-from-ops', 'current-ratio', 'quick-ratio', 'cash-conversion']
        },
        {
          id: 'profitability',
          name: 'Profitability Analysis',
          description: 'Margin analysis, cost structure, and return on assets performance',
          icon: '📊',
          type: 'operational',
          metrics: ['operating-margin', 'net-margin', 'roa', 'cost-structure']
        }
      ];

    case 'IT & Administration':
      return [
        {
          id: 'it-overview',
          name: 'IT Operations Dashboard',
          description: 'System uptime, help desk performance, and IT project delivery metrics',
          icon: '💻',
          type: 'executive',
          metrics: ['uptime', 'ticket-resolution', 'project-delivery', 'user-satisfaction']
        },
        {
          id: 'cybersecurity',
          name: 'Cybersecurity Report',
          description: 'Security incidents, vulnerabilities, backup success, and compliance status',
          icon: '🔒',
          type: 'compliance',
          metrics: ['security-incidents', 'vulnerabilities', 'backup-success', 'compliance']
        },
        {
          id: 'it-costs',
          name: 'IT Cost Analysis',
          description: 'IT spending per employee, license utilization, and budget variance',
          icon: '💰',
          type: 'operational',
          metrics: ['cost-per-employee', 'license-util', 'budget-variance', 'project-costs']
        }
      ];

    case 'Sales':
      return [
        {
          id: 'sales-overview',
          name: 'Sales Performance Dashboard',
          description: 'Revenue growth, pipeline value, win rates, and quota attainment',
          icon: '💰',
          type: 'executive',
          metrics: ['revenue', 'pipeline-value', 'win-rate', 'quota-attainment']
        },
        {
          id: 'pipeline-analysis',
          name: 'Sales Pipeline Analysis',
          description: 'Deal progression, sales cycle length, and conversion rates by stage',
          icon: '📊',
          type: 'operational',
          metrics: ['pipeline-stages', 'cycle-length', 'conversion-rates', 'deal-size']
        },
        {
          id: 'rep-performance',
          name: 'Sales Rep Performance',
          description: 'Individual and team performance, revenue per rep, and activity metrics',
          icon: '👥',
          type: 'operational',
          metrics: ['revenue-per-rep', 'activities', 'deals-closed', 'performance-ranking']
        }
      ];

    case 'Customer Success':
      return [
        {
          id: 'cs-overview',
          name: 'Customer Success Dashboard',
          description: 'CSAT, NPS, retention rate, churn analysis, and customer lifetime value',
          icon: '❤️',
          type: 'executive',
          metrics: ['csat', 'nps', 'retention-rate', 'churn-rate']
        },
        {
          id: 'support-performance',
          name: 'Support Performance Report',
          description: 'Ticket volume, response times, resolution rates, and customer effort score',
          icon: '🎧',
          type: 'operational',
          metrics: ['ticket-volume', 'response-time', 'resolution-rate', 'ces']
        },
        {
          id: 'customer-health',
          name: 'Customer Health Analysis',
          description: 'Customer lifecycle, renewal rates, expansion revenue, and at-risk customers',
          icon: '📊',
          type: 'operational',
          metrics: ['renewal-rate', 'expansion-revenue', 'at-risk-customers', 'clv']
        }
      ];

    case 'Marketing':
      return [
        {
          id: 'marketing-overview',
          name: 'Marketing Performance Dashboard',
          description: 'Marketing ROI, lead generation, conversion rates, and campaign effectiveness',
          icon: '📢',
          type: 'executive',
          metrics: ['marketing-roi', 'leads-generated', 'conversion-rate', 'cpl']
        },
        {
          id: 'campaign-analysis',
          name: 'Campaign Performance Report',
          description: 'Campaign metrics, click-through rates, engagement, and attribution analysis',
          icon: '🎯',
          type: 'operational',
          metrics: ['campaign-roi', 'ctr', 'engagement', 'attribution']
        },
        {
          id: 'digital-marketing',
          name: 'Digital Marketing Analytics',
          description: 'Website traffic, social media engagement, content performance, and SEO metrics',
          icon: '💻',
          type: 'operational',
          metrics: ['website-traffic', 'social-engagement', 'content-performance', 'seo-ranking']
        }
      ];

    default:
      return [];
  }
};

// Department-specific data generators based on actual KPIs
const getDepartmentData = (department: string, templateId: string) => {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (department) {
    case 'HR':
      if (templateId === 'executive-summary') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            turnover: 13.5 + (Math.random() - 0.5) * 2,
            timeToHire: 42 + (Math.random() - 0.5) * 8,
            costPerHire: 4200 + (Math.random() - 0.5) * 500,
            absenteeism: 3.8 + (Math.random() - 0.5) * 0.8
          })),
          metrics: [
            { label: 'Employee Turnover', value: '13.5%', target: '< 12%', status: 'warning' },
            { label: 'Time to Hire', value: '42 days', target: '< 30 days', status: 'critical' },
            { label: 'Cost per Hire', value: '$4,200', target: '< $3,500', status: 'warning' },
            { label: 'Absenteeism Rate', value: '3.8%', target: '< 3%', status: 'warning' }
          ]
        };
      } else if (templateId === 'workforce-analytics') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            headcount: 1850 + Math.floor(Math.random() * 100),
            turnover: 13.5 + (Math.random() - 0.5) * 2,
            absenteeism: 3.8 + (Math.random() - 0.5) * 0.8,
            productivity: 98 + (Math.random() - 0.5) * 6
          })),
          metrics: [
            { label: 'Total Headcount', value: '1,892', target: '1,850', status: 'good' },
            { label: 'Turnover Rate', value: '13.5%', target: '< 12%', status: 'warning' },
            { label: 'Absenteeism', value: '3.8%', target: '< 3%', status: 'warning' },
            { label: 'Productivity Index', value: '98', target: '> 100', status: 'warning' }
          ]
        };
      } else if (templateId === 'recruitment-performance') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            timeToHire: 42 + (Math.random() - 0.5) * 8,
            costPerHire: 4200 + (Math.random() - 0.5) * 500,
            offerAcceptance: 72 + (Math.random() - 0.5) * 8,
            qualityOfHire: 3.6 + (Math.random() - 0.5) * 0.6
          })),
          metrics: [
            { label: 'Time to Hire', value: '42 days', target: '< 30 days', status: 'critical' },
            { label: 'Cost per Hire', value: '$4,200', target: '< $3,500', status: 'warning' },
            { label: 'Offer Acceptance', value: '72%', target: '> 85%', status: 'warning' },
            { label: 'Quality of Hire', value: '3.6/5', target: '> 4.0/5', status: 'warning' }
          ]
        };
      }
      break;

    case 'HSE':
      if (templateId === 'safety-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            trir: 4.2 + (Math.random() - 0.5) * 1,
            ltifr: 2.1 + (Math.random() - 0.5) * 0.5,
            dartRate: 3.1 + (Math.random() - 0.5) * 0.6,
            nearMiss: 12 + Math.floor(Math.random() * 6)
          })),
          metrics: [
            { label: 'TRIR', value: '4.2', target: '< 3.0', status: 'critical' },
            { label: 'LTIFR', value: '2.1', target: '< 1.0', status: 'critical' },
            { label: 'DART Rate', value: '3.1', target: '< 2.0', status: 'warning' },
            { label: 'Near Miss Rate', value: '14.2/month', target: '> 20/month', status: 'warning' }
          ]
        };
      } else if (templateId === 'incident-analysis') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            incidents: 8 + Math.floor(Math.random() * 6),
            severity: 2.5 + (Math.random() - 0.5) * 1,
            lostTime: 120 + Math.floor(Math.random() * 80),
            resolved: 85 + (Math.random() - 0.5) * 10
          })),
          metrics: [
            { label: 'Total Incidents', value: '94/year', target: '< 50/year', status: 'critical' },
            { label: 'Average Severity', value: '2.5/5', target: '< 2.0/5', status: 'warning' },
            { label: 'Lost Time Hours', value: '1,440 hrs', target: '< 500 hrs', status: 'critical' },
            { label: 'Resolution Rate', value: '85%', target: '> 95%', status: 'warning' }
          ]
        };
      } else if (templateId === 'safety-compliance') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            training: 78 + (Math.random() - 0.5) * 8,
            ppeCompliance: 92 + (Math.random() - 0.5) * 6,
            auditScore: 82 + (Math.random() - 0.5) * 8,
            violations: 3 + Math.floor(Math.random() * 4)
          })),
          metrics: [
            { label: 'Training Completion', value: '78%', target: '> 95%', status: 'critical' },
            { label: 'PPE Compliance', value: '92%', target: '> 98%', status: 'warning' },
            { label: 'Audit Score', value: '82%', target: '> 90%', status: 'warning' },
            { label: 'OSHA Violations', value: '5/year', target: '0/year', status: 'critical' }
          ]
        };
      }
      break;

    case 'Operations':
      if (templateId === 'production-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            oee: 72 + (Math.random() - 0.5) * 8,
            production: 42000 + Math.floor(Math.random() * 5000),
            downtime: 12 + (Math.random() - 0.5) * 4,
            capacity: 78 + (Math.random() - 0.5) * 6
          })),
          metrics: [
            { label: 'OEE', value: '72%', target: '> 85%', status: 'warning' },
            { label: 'Production Volume', value: '44,200 units', target: '50,000 units', status: 'warning' },
            { label: 'Downtime', value: '12.3%', target: '< 5%', status: 'critical' },
            { label: 'Capacity Utilization', value: '78%', target: '> 90%', status: 'warning' }
          ]
        };
      } else if (templateId === 'downtime-analysis') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            plannedDowntime: 3.2 + (Math.random() - 0.5) * 1,
            unplannedDowntime: 9.1 + (Math.random() - 0.5) * 3,
            mttr: 4.5 + (Math.random() - 0.5) * 2,
            mtbf: 180 + Math.floor(Math.random() * 60)
          })),
          metrics: [
            { label: 'Unplanned Downtime', value: '9.1%', target: '< 3%', status: 'critical' },
            { label: 'Planned Downtime', value: '3.2%', target: '< 5%', status: 'good' },
            { label: 'MTTR', value: '4.5 hrs', target: '< 2 hrs', status: 'critical' },
            { label: 'MTBF', value: '180 hrs', target: '> 300 hrs', status: 'warning' }
          ]
        };
      } else if (templateId === 'efficiency-report') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            setupTime: 45 + Math.floor(Math.random() * 20),
            changeoverEff: 68 + (Math.random() - 0.5) * 12,
            otdRate: 87 + (Math.random() - 0.5) * 8,
            yieldRate: 94 + (Math.random() - 0.5) * 4
          })),
          metrics: [
            { label: 'Setup Time', value: '45 mins', target: '< 30 mins', status: 'warning' },
            { label: 'Changeover Efficiency', value: '68%', target: '> 85%', status: 'warning' },
            { label: 'On-Time Delivery', value: '87%', target: '> 95%', status: 'warning' },
            { label: 'Yield Rate', value: '94%', target: '> 97%', status: 'warning' }
          ]
        };
      }
      break;

    case 'Quality Control':
      if (templateId === 'quality-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            defectRate: 3200 + Math.floor(Math.random() * 600),
            firstPassYield: 91 + (Math.random() - 0.5) * 4,
            scrapRate: 2.8 + (Math.random() - 0.5) * 0.6,
            reworkRate: 4.2 + (Math.random() - 0.5) * 0.8
          })),
          metrics: [
            { label: 'Defect Rate', value: '3,450 PPM', target: '< 2,000 PPM', status: 'critical' },
            { label: 'First Pass Yield', value: '91.2%', target: '> 95%', status: 'warning' },
            { label: 'Scrap Rate', value: '2.8%', target: '< 2%', status: 'warning' },
            { label: 'Rework Rate', value: '4.2%', target: '< 3%', status: 'warning' }
          ]
        };
      } else if (templateId === 'customer-quality') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            returnRate: 1.8 + (Math.random() - 0.5) * 0.6,
            complaints: 45 + Math.floor(Math.random() * 20),
            csat: 7.2 + (Math.random() - 0.5) * 1,
            warrantyClaims: 28 + Math.floor(Math.random() * 12)
          })),
          metrics: [
            { label: 'Return Rate', value: '1.8%', target: '< 1%', status: 'warning' },
            { label: 'Customer Complaints', value: '52/month', target: '< 30/month', status: 'warning' },
            { label: 'Quality CSAT', value: '7.2/10', target: '> 8.5/10', status: 'warning' },
            { label: 'Warranty Claims', value: '32/month', target: '< 20/month', status: 'warning' }
          ]
        };
      } else if (templateId === 'supplier-quality') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            supplierDefects: 4200 + Math.floor(Math.random() * 800),
            supplierRating: 3.4 + (Math.random() - 0.5) * 0.8,
            ncrRate: 6.2 + (Math.random() - 0.5) * 2,
            capaEff: 72 + (Math.random() - 0.5) * 12
          })),
          metrics: [
            { label: 'Supplier Defects', value: '4,650 PPM', target: '< 2,000 PPM', status: 'critical' },
            { label: 'Supplier Rating', value: '3.4/5', target: '> 4.0/5', status: 'warning' },
            { label: 'NCR Rate', value: '6.2%', target: '< 3%', status: 'critical' },
            { label: 'CAPA Effectiveness', value: '72%', target: '> 90%', status: 'warning' }
          ]
        };
      }
      break;

    case 'Supply Chain':
      if (templateId === 'sc-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            perfectOrder: 87 + (Math.random() - 0.5) * 6,
            otif: 82 + (Math.random() - 0.5) * 8,
            inventoryTurn: 4.2 + (Math.random() - 0.5) * 0.8,
            dso: 52 + Math.floor(Math.random() * 10)
          })),
          metrics: [
            { label: 'Perfect Order Rate', value: '87.5%', target: '> 95%', status: 'warning' },
            { label: 'OTIF Delivery', value: '82.3%', target: '> 95%', status: 'critical' },
            { label: 'Inventory Turnover', value: '4.2x', target: '> 6x', status: 'warning' },
            { label: 'DSO', value: '52 days', target: '< 45 days', status: 'warning' }
          ]
        };
      } else if (templateId === 'logistics-performance') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            freightCost: 8.2 + (Math.random() - 0.5) * 1.5,
            warehouseUtil: 78 + (Math.random() - 0.5) * 8,
            orderAccuracy: 96 + (Math.random() - 0.5) * 3,
            leadTime: 14 + Math.floor(Math.random() * 6)
          })),
          metrics: [
            { label: 'Freight Cost/Unit', value: '$8.20', target: '< $6.50', status: 'warning' },
            { label: 'Warehouse Utilization', value: '78%', target: '75-85%', status: 'good' },
            { label: 'Order Accuracy', value: '96%', target: '> 99%', status: 'warning' },
            { label: 'Lead Time', value: '14 days', target: '< 10 days', status: 'warning' }
          ]
        };
      } else if (templateId === 'cash-flow') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            cashCycle: 62 + Math.floor(Math.random() * 12),
            dso: 52 + Math.floor(Math.random() * 10),
            dpo: 38 + Math.floor(Math.random() * 8),
            workingCapital: 18.5 + (Math.random() - 0.5) * 4
          })),
          metrics: [
            { label: 'Cash-to-Cash Cycle', value: '62 days', target: '< 45 days', status: 'warning' },
            { label: 'DSO', value: '52 days', target: '< 45 days', status: 'warning' },
            { label: 'DPO', value: '38 days', target: '> 45 days', status: 'warning' },
            { label: 'Working Capital %', value: '18.5%', target: '< 15%', status: 'warning' }
          ]
        };
      }
      break;

    case 'Finance':
      if (templateId === 'financial-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            revenue: 10.5 + (Math.random() - 0.5) * 1.5,
            grossMargin: 28 + (Math.random() - 0.5) * 3,
            ebitda: 12 + (Math.random() - 0.5) * 2,
            roe: 14 + (Math.random() - 0.5) * 2
          })),
          metrics: [
            { label: 'Revenue Growth', value: '5.2%', target: '> 10%', status: 'warning' },
            { label: 'Gross Margin', value: '28.4%', target: '> 35%', status: 'warning' },
            { label: 'EBITDA Margin', value: '12.1%', target: '> 15%', status: 'warning' },
            { label: 'ROE', value: '14.2%', target: '> 18%', status: 'warning' }
          ]
        };
      } else if (templateId === 'cash-flow-analysis') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            cashFromOps: 2.8 + (Math.random() - 0.5) * 0.8,
            currentRatio: 1.65 + (Math.random() - 0.5) * 0.3,
            quickRatio: 1.15 + (Math.random() - 0.5) * 0.2,
            cashConversion: 78 + (Math.random() - 0.5) * 12
          })),
          metrics: [
            { label: 'Operating Cash Flow', value: '$2.8M', target: '> $4M', status: 'warning' },
            { label: 'Current Ratio', value: '1.65', target: '> 2.0', status: 'warning' },
            { label: 'Quick Ratio', value: '1.15', target: '> 1.5', status: 'warning' },
            { label: 'Cash Conversion', value: '78%', target: '> 90%', status: 'warning' }
          ]
        };
      } else if (templateId === 'profitability') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            operatingMargin: 14.5 + (Math.random() - 0.5) * 2,
            netMargin: 8.2 + (Math.random() - 0.5) * 1.5,
            roa: 9.8 + (Math.random() - 0.5) * 2,
            costStructure: 72 + (Math.random() - 0.5) * 4
          })),
          metrics: [
            { label: 'Operating Margin', value: '14.5%', target: '> 18%', status: 'warning' },
            { label: 'Net Margin', value: '8.2%', target: '> 12%', status: 'warning' },
            { label: 'Return on Assets', value: '9.8%', target: '> 12%', status: 'warning' },
            { label: 'OpEx % Revenue', value: '72%', target: '< 65%', status: 'warning' }
          ]
        };
      }
      break;

    case 'IT & Administration':
      if (templateId === 'it-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            uptime: 97 + (Math.random() - 0.5) * 2,
            ticketResolution: 18 + Math.floor(Math.random() * 8),
            projectDelivery: 72 + (Math.random() - 0.5) * 12,
            userSat: 3.8 + (Math.random() - 0.5) * 0.4
          })),
          metrics: [
            { label: 'System Uptime', value: '97.8%', target: '> 99.5%', status: 'warning' },
            { label: 'Ticket Resolution', value: '18 hrs', target: '< 8 hrs', status: 'critical' },
            { label: 'Project On-Time', value: '72%', target: '> 90%', status: 'warning' },
            { label: 'User Satisfaction', value: '3.8/5', target: '> 4.5/5', status: 'warning' }
          ]
        };
      } else if (templateId === 'cybersecurity') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            incidents: 8 + Math.floor(Math.random() * 6),
            vulnerabilities: 42 + Math.floor(Math.random() * 20),
            backupSuccess: 94 + (Math.random() - 0.5) * 4,
            compliance: 88 + (Math.random() - 0.5) * 6
          })),
          metrics: [
            { label: 'Security Incidents', value: '11/month', target: '< 5/month', status: 'warning' },
            { label: 'Critical Vulnerabilities', value: '52', target: '< 10', status: 'critical' },
            { label: 'Backup Success Rate', value: '94%', target: '> 99%', status: 'warning' },
            { label: 'Compliance Score', value: '88%', target: '> 95%', status: 'warning' }
          ]
        };
      } else if (templateId === 'it-costs') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            costPerEmployee: 4200 + Math.floor(Math.random() * 800),
            licenseUtil: 72 + (Math.random() - 0.5) * 12,
            budgetVariance: 8 + (Math.random() - 0.5) * 6,
            projectCosts: 185000 + Math.floor(Math.random() * 50000)
          })),
          metrics: [
            { label: 'IT Cost/Employee', value: '$4,600', target: '< $3,500', status: 'warning' },
            { label: 'License Utilization', value: '72%', target: '> 85%', status: 'warning' },
            { label: 'Budget Variance', value: '+8%', target: '< 5%', status: 'warning' },
            { label: 'Project Spend', value: '$210K', target: '< $180K', status: 'warning' }
          ]
        };
      }
      break;

    case 'Sales':
      if (templateId === 'sales-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            revenue: 8.5 + (Math.random() - 0.5) * 2,
            pipeline: 45 + Math.floor(Math.random() * 15),
            winRate: 28 + (Math.random() - 0.5) * 8,
            quota: 78 + (Math.random() - 0.5) * 12
          })),
          metrics: [
            { label: 'Monthly Revenue', value: '$8.5M', target: '$12M', status: 'warning' },
            { label: 'Pipeline Value', value: '$45M', target: '$60M', status: 'warning' },
            { label: 'Win Rate', value: '28%', target: '> 35%', status: 'warning' },
            { label: 'Quota Attainment', value: '78%', target: '> 100%', status: 'critical' }
          ]
        };
      } else if (templateId === 'pipeline-analysis') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            prospects: 120 + Math.floor(Math.random() * 40),
            qualified: 65 + Math.floor(Math.random() * 20),
            proposal: 28 + Math.floor(Math.random() * 12),
            closed: 18 + Math.floor(Math.random() * 8)
          })),
          metrics: [
            { label: 'Sales Cycle Length', value: '87 days', target: '< 60 days', status: 'warning' },
            { label: 'Lead-to-Opp Conv.', value: '54%', target: '> 65%', status: 'warning' },
            { label: 'Avg Deal Size', value: '$472K', target: '> $600K', status: 'warning' },
            { label: 'Pipeline Coverage', value: '2.8x', target: '> 3.5x', status: 'warning' }
          ]
        };
      } else if (templateId === 'rep-performance') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            revenuePerRep: 425 + Math.floor(Math.random() * 100),
            activities: 85 + Math.floor(Math.random() * 30),
            dealsClosed: 3.2 + (Math.random() - 0.5) * 1.5,
            avgDealSize: 470 + Math.floor(Math.random() * 120)
          })),
          metrics: [
            { label: 'Revenue/Rep', value: '$475K', target: '> $600K', status: 'warning' },
            { label: 'Activities/Week', value: '95', target: '> 120', status: 'warning' },
            { label: 'Deals Closed/Month', value: '3.2', target: '> 5', status: 'warning' },
            { label: 'Top Rep Performance', value: '$1.2M', target: '$1.5M', status: 'warning' }
          ]
        };
      }
      break;

    case 'Customer Success':
      if (templateId === 'cs-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            csat: 7.2 + (Math.random() - 0.5) * 1,
            nps: 32 + Math.floor(Math.random() * 12),
            retention: 88 + (Math.random() - 0.5) * 4,
            churn: 3.2 + (Math.random() - 0.5) * 0.8
          })),
          metrics: [
            { label: 'CSAT Score', value: '7.2/10', target: '> 8.5/10', status: 'warning' },
            { label: 'NPS', value: '32', target: '> 50', status: 'critical' },
            { label: 'Retention Rate', value: '88%', target: '> 95%', status: 'warning' },
            { label: 'Churn Rate', value: '3.2%', target: '< 2%', status: 'warning' }
          ]
        };
      } else if (templateId === 'support-performance') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            tickets: 420 + Math.floor(Math.random() * 120),
            responseTime: 4.2 + (Math.random() - 0.5) * 2,
            resolutionRate: 82 + (Math.random() - 0.5) * 8,
            ces: 3.1 + (Math.random() - 0.5) * 0.8
          })),
          metrics: [
            { label: 'Ticket Volume', value: '485/month', target: '< 350/month', status: 'warning' },
            { label: 'Avg Response Time', value: '4.2 hrs', target: '< 2 hrs', status: 'warning' },
            { label: 'First Contact Resolution', value: '82%', target: '> 90%', status: 'warning' },
            { label: 'Customer Effort Score', value: '3.1/5', target: '< 2.5/5', status: 'warning' }
          ]
        };
      } else if (templateId === 'customer-health') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            renewalRate: 88 + (Math.random() - 0.5) * 4,
            expansion: 12 + (Math.random() - 0.5) * 4,
            atRisk: 18 + Math.floor(Math.random() * 8),
            clv: 245000 + Math.floor(Math.random() * 60000)
          })),
          metrics: [
            { label: 'Renewal Rate', value: '88%', target: '> 95%', status: 'warning' },
            { label: 'Expansion Revenue', value: '12%', target: '> 20%', status: 'warning' },
            { label: 'At-Risk Customers', value: '22', target: '< 10', status: 'critical' },
            { label: 'Customer LTV', value: '$275K', target: '> $350K', status: 'warning' }
          ]
        };
      }
      break;

    case 'Marketing':
      if (templateId === 'marketing-overview') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            roi: 2.8 + (Math.random() - 0.5) * 0.8,
            leads: 420 + Math.floor(Math.random() * 120),
            conversion: 12 + (Math.random() - 0.5) * 4,
            cpl: 185 + Math.floor(Math.random() * 50)
          })),
          metrics: [
            { label: 'Marketing ROI', value: '2.8x', target: '> 4x', status: 'warning' },
            { label: 'Leads Generated', value: '420/month', target: '> 600/month', status: 'warning' },
            { label: 'Conversion Rate', value: '12%', target: '> 18%', status: 'warning' },
            { label: 'Cost per Lead', value: '$185', target: '< $150', status: 'warning' }
          ]
        };
      } else if (templateId === 'campaign-analysis') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            campaignROI: 3.2 + (Math.random() - 0.5) * 1,
            ctr: 2.4 + (Math.random() - 0.5) * 0.8,
            engagement: 4.5 + (Math.random() - 0.5) * 1.5,
            mqls: 185 + Math.floor(Math.random() * 60)
          })),
          metrics: [
            { label: 'Campaign ROI', value: '3.2x', target: '> 5x', status: 'warning' },
            { label: 'Click-Through Rate', value: '2.4%', target: '> 3.5%', status: 'warning' },
            { label: 'Engagement Rate', value: '4.5%', target: '> 6%', status: 'warning' },
            { label: 'MQLs Generated', value: '215/month', target: '> 300/month', status: 'warning' }
          ]
        };
      } else if (templateId === 'digital-marketing') {
        return {
          chartData: monthLabels.map((month, i) => ({
            month,
            websiteTraffic: 42000 + Math.floor(Math.random() * 10000),
            socialEngagement: 3.2 + (Math.random() - 0.5) * 1,
            contentPerf: 8500 + Math.floor(Math.random() * 2000),
            seoRanking: 18 + Math.floor(Math.random() * 8)
          })),
          metrics: [
            { label: 'Website Traffic', value: '47K/month', target: '> 60K/month', status: 'warning' },
            { label: 'Social Engagement', value: '3.2%', target: '> 5%', status: 'warning' },
            { label: 'Content Views', value: '9.5K/month', target: '> 12K/month', status: 'warning' },
            { label: 'Avg SEO Ranking', value: '#22', target: '< #10', status: 'warning' }
          ]
        };
      }
      break;

    default:
      return {
        chartData: [],
        metrics: []
      };
  }

  return {
    chartData: [],
    metrics: []
  };
};

export default function CustomReports() {
  const location = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Determine department from URL path
  const isHSE = location.pathname.startsWith('/hse');
  const isOps = location.pathname.startsWith('/ops');
  const isQC = location.pathname.startsWith('/qc');
  const isSC = location.pathname.startsWith('/supplychain');
  const isFinance = location.pathname.startsWith('/finance');
  const isAdmin = location.pathname.startsWith('/administration');
  const isSales = location.pathname.startsWith('/sales');
  const isCustomerSuccess = location.pathname.startsWith('/customer-success');
  const isMarketing = location.pathname.startsWith('/marketing');

  const department = isHSE ? 'HSE' : isOps ? 'Operations' : isQC ? 'Quality Control' : isSC ? 'Supply Chain' :
                     isFinance ? 'Finance' : isAdmin ? 'IT & Administration' : isSales ? 'Sales' :
                     isCustomerSuccess ? 'Customer Success' : isMarketing ? 'Marketing' : 'HR';

  const dashboardPath = isHSE ? '/hse' : isOps ? '/ops' : isQC ? '/qc' : isSC ? '/supplychain' :
                        isFinance ? '/finance' : isAdmin ? '/administration' : isSales ? '/sales' :
                        isCustomerSuccess ? '/customer-success' : isMarketing ? '/marketing' : '/';

  // Get department-specific report templates
  const REPORT_TEMPLATES = getReportTemplates(department);

  // Mock data for charts
  const executiveSummaryData = [
    { month: 'Jan', turnover: 12, engagement: 72, productivity: 95 },
    { month: 'Feb', turnover: 11, engagement: 74, productivity: 97 },
    { month: 'Mar', turnover: 13, engagement: 73, productivity: 96 },
    { month: 'Apr', turnover: 14, engagement: 71, productivity: 94 },
    { month: 'May', turnover: 15, engagement: 69, productivity: 93 },
    { month: 'Jun', turnover: 13, engagement: 75, productivity: 98 },
    { month: 'Jul', turnover: 12, engagement: 76, productivity: 99 },
    { month: 'Aug', turnover: 11, engagement: 77, productivity: 101 },
    { month: 'Sep', turnover: 10, engagement: 78, productivity: 102 },
    { month: 'Oct', turnover: 12, engagement: 76, productivity: 103 },
    { month: 'Nov', turnover: 13, engagement: 75, productivity: 101 },
    { month: 'Dec', turnover: 14, engagement: 74, productivity: 103 }
  ];

  const handleGenerateReport = (templateId: string) => {
    setGeneratingReport(true);
    setSelectedTemplate(templateId);

    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
    }, 1500);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'word') => {
    const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    const reportData = getDepartmentData(department, selectedTemplate || '');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${department}_${template.name.replace(/ /g, '_')}_${timestamp}`;

    if (format === 'excel') {
      // Generate CSV content (simplified Excel)
      let csvContent = `${department} - ${template.name}\nTitanBuild Manufacturing & Logistics\nQ4 2025 Performance Report\nGenerated: ${new Date().toLocaleString()}\n\n`;

      csvContent += 'Key Metrics\n';
      csvContent += 'Metric,Current Value,Target,Status\n';
      reportData.metrics.forEach((metric: any) => {
        csvContent += `${metric.label},${metric.value},${metric.target},${metric.status}\n`;
      });

      csvContent += '\n\nMonthly Trend Data\n';
      const headers = Object.keys(reportData.chartData[0] || {}).join(',');
      csvContent += headers + '\n';
      reportData.chartData.forEach((row: any) => {
        csvContent += Object.values(row).join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'word') {
      // Generate HTML content for Word
      let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
          <head><meta charset='utf-8'><title>${department} Report</title></head>
          <body>
            <div style='font-family: Arial, sans-serif; padding: 40px;'>
              <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #06b6d4; font-size: 28px;'>ElevareIQ</h1>
                <h2>${department} - ${template.name}</h2>
                <p>TitanBuild Manufacturing & Logistics</p>
                <p>Q4 2025 Performance Report</p>
                <p>Generated: ${new Date().toLocaleString()}</p>
              </div>

              <div style='margin: 30px 0;'>
                <h3 style='color: #06b6d4;'>Executive Summary</h3>
                <table border='1' cellpadding='10' cellspacing='0' style='width: 100%; border-collapse: collapse;'>
                  <tr style='background-color: #f3f4f6;'>
                    <th>Metric</th>
                    <th>Current Value</th>
                    <th>Target</th>
                    <th>Status</th>
                  </tr>`;

      reportData.metrics.forEach((metric: any) => {
        const statusColor = metric.status === 'critical' ? '#ef4444' : metric.status === 'warning' ? '#f59e0b' : '#10b981';
        htmlContent += `
                  <tr>
                    <td>${metric.label}</td>
                    <td><strong>${metric.value}</strong></td>
                    <td>${metric.target}</td>
                    <td style='color: ${statusColor}; font-weight: bold;'>${metric.status.toUpperCase()}</td>
                  </tr>`;
      });

      htmlContent += `
                </table>
              </div>

              <div style='margin: 30px 0;'>
                <h3 style='color: #06b6d4;'>Key Insights</h3>
                <ul>
                  <li>Performance trends show ${department.toLowerCase()} metrics require focused attention</li>
                  <li>Several KPIs are below industry benchmarks</li>
                  <li>Improvement initiatives recommended for critical areas</li>
                  <li>Monthly tracking shows seasonal variations in performance</li>
                </ul>
              </div>

              <div style='margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666;'>
                <p>© 2025 ElevareIQ Platform | All Rights Reserved</p>
              </div>
            </div>
          </body>
        </html>`;

      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.doc`;
      link.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Generate HTML for PDF (browser print)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${department} Report - ${template.name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #06b6d4; padding-bottom: 20px; }
                .logo { color: #06b6d4; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                h1 { color: #333; font-size: 24px; margin: 10px 0; }
                h2 { color: #06b6d4; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f3f4f6; font-weight: bold; }
                .critical { color: #ef4444; font-weight: bold; }
                .warning { color: #f59e0b; font-weight: bold; }
                .good { color: #10b981; font-weight: bold; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
                @media print {
                  body { padding: 20px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">ElevareIQ</div>
                <h1>${department} - ${template.name}</h1>
                <p>TitanBuild Manufacturing & Logistics</p>
                <p>Q4 2025 Performance Report</p>
                <p>Generated: ${new Date().toLocaleString()}</p>
              </div>

              <h2>Executive Summary</h2>
              <table>
                <tr>
                  <th>Metric</th>
                  <th>Current Value</th>
                  <th>Target</th>
                  <th>Status</th>
                </tr>
                ${reportData.metrics.map((metric: any) => `
                  <tr>
                    <td>${metric.label}</td>
                    <td><strong>${metric.value}</strong></td>
                    <td>${metric.target}</td>
                    <td class="${metric.status}">${metric.status.toUpperCase()}</td>
                  </tr>
                `).join('')}
              </table>

              <h2>Key Insights</h2>
              <ul>
                <li>Performance trends show ${department.toLowerCase()} metrics require focused attention</li>
                <li>Several KPIs are below industry benchmarks</li>
                <li>Improvement initiatives recommended for critical areas</li>
                <li>Monthly tracking shows seasonal variations in performance</li>
              </ul>

              <div class="footer">
                <p>© 2025 ElevareIQ Platform | All Rights Reserved</p>
              </div>

              <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print();" style="padding: 10px 20px; background: #06b6d4; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Print to PDF</button>
                <button onclick="window.close();" style="margin-left: 10px; padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Close</button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header with Logo */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <ElevareLogo size="lg" variant="dark" />
            <div className="text-right text-sm text-gray-400">
              <div className="font-semibold text-white">TitanBuild M&L</div>
              <div>Q4 2025 Performance Report</div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {department} Reports
                </h1>
                <p className="text-gray-400 text-lg">Generate comprehensive {department} analytics reports with TitanBuild data</p>
              </div>
              <Link
                to={dashboardPath}
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Report Templates Grid */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📑</span> Report Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPORT_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`bg-gradient-to-br from-gray-900/80 to-gray-800/80 border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  selectedTemplate === template.id
                    ? 'border-cyan-500 shadow-cyan-500/20'
                    : 'border-gray-700 hover:border-cyan-500/50'
                }`}
                onClick={() => handleGenerateReport(template.id)}
              >
                <div className="text-5xl mb-4">{template.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-3 py-1 bg-gray-700/50 rounded-full text-gray-300 capitalize">
                    {template.type}
                  </span>
                  <button className="text-cyan-400 hover:text-cyan-300 font-medium text-sm">
                    Generate →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Report View */}
        {selectedTemplate && (
          <div className="space-y-6 animate-fade-in">
            {generatingReport ? (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p className="text-cyan-400 text-lg">Generating your report...</p>
              </div>
            ) : (
              <>
                {/* Report Header */}
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 animate-gradient-x"></div>
                  <div className="absolute inset-0 backdrop-blur-3xl"></div>

                  <div className="relative p-8 border border-cyan-500/30 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          {REPORT_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                        </h2>
                        <p className="text-gray-400">
                          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleExport('pdf')}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 font-medium transition-all duration-200 shadow-lg"
                        >
                          📄 PDF
                        </button>
                        <button
                          onClick={() => handleExport('excel')}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 font-medium transition-all duration-200 shadow-lg"
                        >
                          📊 Excel
                        </button>
                        <button
                          onClick={() => handleExport('word')}
                          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 font-medium transition-all duration-200 shadow-lg"
                        >
                          📝 Word
                        </button>
                      </div>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex gap-2">
                      {[
                        { value: '1m', label: '1 Month' },
                        { value: '3m', label: '3 Months' },
                        { value: '6m', label: '6 Months' },
                        { value: '1y', label: '1 Year' },
                        { value: '2y', label: '2 Years' }
                      ].map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setTimeRange(range.value as TimeRange)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            timeRange === range.value
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Report Content - All Templates */}
                {(() => {
                  const reportData = getDepartmentData(department, selectedTemplate || '');
                  const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);

                  if (!reportData.metrics.length || !template) {
                    return (
                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
                        <div className="text-6xl mb-4">{template?.icon || '📊'}</div>
                        <h3 className="text-2xl font-bold text-white mb-4">{template?.name}</h3>
                        <p className="text-gray-400 mb-6">
                          Detailed report content for {template?.name.toLowerCase()} with TitanBuild data
                          would appear here with comprehensive analytics, charts, and insights.
                        </p>
                        <div className="inline-flex items-center gap-2 text-cyan-400">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                          <span>Full report visualization coming soon</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Key Metrics Overview */}
                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                          <span>📊</span> Key Performance Metrics - TitanBuild M&L
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {reportData.metrics.map((metric: any, idx: number) => (
                            <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                              <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
                              <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                              <div className="text-xs text-gray-500 mb-2">Target: {metric.target}</div>
                              <div className={`text-sm font-semibold inline-block px-3 py-1 rounded-full ${
                                metric.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                                metric.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {metric.status.toUpperCase()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trend Chart */}
                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">📈 12-Month Performance Trend</h3>
                        <ResponsiveContainer width="100%" height={350}>
                          <ComposedChart data={reportData.chartData}>
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            />
                            <Legend />
                            {Object.keys(reportData.chartData[0] || {}).filter(key => key !== 'month').slice(0, 3).map((key, idx) => (
                              idx === 0 ? (
                                <Area key={key} type="monotone" dataKey={key} stroke="#06b6d4" fill="url(#colorGradient)" />
                              ) : (
                                <Line key={key} type="monotone" dataKey={key} stroke={idx === 1 ? '#3b82f6' : '#10b981'} strokeWidth={2} />
                              )
                            ))}
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Key Insights */}
                      <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <span>💡</span> Key Insights & Recommendations
                        </h3>
                        <div className="space-y-3">
                          {[
                            { icon: '📊', text: `${department} performance metrics show areas requiring focused attention and improvement` },
                            { icon: '⚠️', text: 'Several KPIs are currently below industry benchmark targets' },
                            { icon: '🎯', text: 'Immediate action recommended for metrics flagged as CRITICAL status' },
                            { icon: '📈', text: 'Monthly trend analysis reveals seasonal variations and opportunities for optimization' },
                            { icon: '✅', text: 'Implementation of recommended initiatives could improve overall department performance by 15-25%' }
                          ].map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-gray-900/50 p-4 rounded-lg">
                              <span className="text-2xl">{insight.icon}</span>
                              <p className="text-gray-200 text-sm">{insight.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {!selectedTemplate && (
          <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-8 text-center backdrop-blur-sm">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-2">Select a Report Template</h3>
            <p className="text-gray-400">
              Choose a report template above to generate comprehensive {department} analytics reports
              with customizable time ranges and export options.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
