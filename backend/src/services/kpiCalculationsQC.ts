import Database from 'better-sqlite3';
import { subMonths, format, differenceInCalendarDays } from 'date-fns';

export interface KPIResult {
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  trend?: {
    previous: number;
    change: number;
    changePercent: number;
  };
  benchmark?: {
    value: number;
    status: 'above' | 'at' | 'below';
  };
}

export class QCKPICalculationService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  // 1. Defect Rate (PPM - Parts Per Million)
  // Formula: (Total Defects / Total Units Inspected) × 1,000,000
  calculateDefectRatePPM(startDate: string, endDate: string): KPIResult {
    const inspectionData = this.db.prepare(`
      SELECT
        SUM(units_inspected) as total_inspected,
        SUM(units_failed) as total_failed
      FROM qc_inspections
      WHERE inspection_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const ppm = inspectionData.total_inspected > 0
      ? (inspectionData.total_failed / inspectionData.total_inspected) * 1000000
      : 0;

    const defectData = this.db.prepare(`
      SELECT COUNT(DISTINCT defect_type) as defect_types
      FROM qc_defects
      WHERE defect_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    return {
      value: ppm,
      displayValue: `${Math.round(ppm).toLocaleString()} PPM`,
      calculation: {
        formula: 'Defect Rate PPM = (Total Defects / Total Units Inspected) × 1,000,000',
        components: {
          totalInspected: inspectionData.total_inspected || 0,
          totalFailed: inspectionData.total_failed || 0,
          defectTypes: defect_types.defect_types || 0,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total units inspected = ${(inspectionData.total_inspected || 0).toLocaleString()}`,
          `Step 2: Total units failed = ${(inspectionData.total_failed || 0).toLocaleString()}`,
          `Step 3: Calculate defect rate = (${inspectionData.total_failed || 0} / ${inspectionData.total_inspected || 0}) × 1,000,000`,
          `Step 4: Defect Rate = ${Math.round(ppm).toLocaleString()} PPM`,
          `Step 5: Unique defect types found = ${defectData.defect_types || 0}`
        ]
      },
      benchmark: {
        value: 5000,
        status: ppm <= 5000 ? 'below' : ppm > 10000 ? 'above' : 'at'
      }
    };
  }

  // 2. First Pass Yield (FPY)
  // Formula: (Units Passed First Inspection / Total Units Inspected) × 100
  calculateFirstPassYield(startDate: string, endDate: string): KPIResult {
    const yieldData = this.db.prepare(`
      SELECT
        SUM(units_inspected) as total_inspected,
        SUM(units_passed) as total_passed,
        SUM(units_failed) as total_failed
      FROM qc_inspections
      WHERE inspection_date BETWEEN ? AND ?
      AND inspection_type IN ('Final', 'In-Process')
    `).get(startDate, endDate) as any;

    const fpy = yieldData.total_inspected > 0
      ? (yieldData.total_passed / yieldData.total_inspected) * 100
      : 0;

    const passRateByType = this.db.prepare(`
      SELECT
        inspection_type,
        AVG((units_passed * 1.0 / units_inspected) * 100) as avg_pass_rate
      FROM qc_inspections
      WHERE inspection_date BETWEEN ? AND ?
      GROUP BY inspection_type
      ORDER BY avg_pass_rate DESC
    `).all(startDate, endDate) as any[];

    return {
      value: fpy,
      displayValue: `${fpy.toFixed(2)}%`,
      calculation: {
        formula: 'FPY = (Units Passed First Inspection / Total Units Inspected) × 100',
        components: {
          unitsInspected: yieldData.total_inspected || 0,
          unitsPassed: yieldData.total_passed || 0,
          unitsFailed: yieldData.total_failed || 0,
          yieldLoss: ((yieldData.total_failed || 0) / (yieldData.total_inspected || 1) * 100).toFixed(2) + '%',
          passRateByType: passRateByType.map(t => `${t.inspection_type}: ${t.avg_pass_rate.toFixed(1)}%`).join(', '),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total units inspected = ${(yieldData.total_inspected || 0).toLocaleString()}`,
          `Step 2: Units passed first inspection = ${(yieldData.total_passed || 0).toLocaleString()}`,
          `Step 3: Units failed = ${(yieldData.total_failed || 0).toLocaleString()}`,
          `Step 4: Calculate FPY = (${yieldData.total_passed || 0} / ${yieldData.total_inspected || 0}) × 100`,
          `Step 5: First Pass Yield = ${fpy.toFixed(2)}%`,
          `Step 6: Yield loss = ${((yieldData.total_failed || 0) / (yieldData.total_inspected || 1) * 100).toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 95.0,
        status: fpy >= 95.0 ? 'above' : fpy < 90.0 ? 'below' : 'at'
      }
    };
  }

  // 3. Scrap Rate
  // Formula: (Total Scrap Cost / Total Production Value) × 100
  calculateScrapRate(startDate: string, endDate: string): KPIResult {
    const scrapData = this.db.prepare(`
      SELECT
        SUM(quantity_scrapped) as total_quantity,
        SUM(total_scrap_cost) as total_cost,
        COUNT(*) as scrap_events
      FROM qc_scrap
      WHERE scrap_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    // Estimate production value (simplified)
    const estimatedProductionValue = (scrapData.total_quantity || 0) * 150 + (scrapData.total_cost || 0) * 5;
    const scrapRate = estimatedProductionValue > 0
      ? ((scrapData.total_cost || 0) / estimatedProductionValue) * 100
      : 0;

    const topScrapReasons = this.db.prepare(`
      SELECT scrap_reason, COUNT(*) as count
      FROM qc_scrap
      WHERE scrap_date BETWEEN ? AND ?
      GROUP BY scrap_reason
      ORDER BY count DESC
      LIMIT 3
    `).all(startDate, endDate) as any[];

    return {
      value: scrapRate,
      displayValue: `${scrapRate.toFixed(2)}%`,
      calculation: {
        formula: 'Scrap Rate = (Total Scrap Cost / Total Production Value) × 100',
        components: {
          totalScrapCost: `$${(scrapData.total_cost || 0).toLocaleString()}`,
          quantityScrapped: scrapData.total_quantity || 0,
          scrapEvents: scrapData.scrap_events || 0,
          estimatedProductionValue: `$${estimatedProductionValue.toLocaleString()}`,
          topScrapReasons: topScrapReasons.map(r => `${r.scrap_reason} (${r.count})`).join(', '),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total quantity scrapped = ${(scrapData.total_quantity || 0).toLocaleString()} units`,
          `Step 2: Total scrap cost = $${(scrapData.total_cost || 0).toLocaleString()}`,
          `Step 3: Scrap events = ${scrapData.scrap_events || 0}`,
          `Step 4: Estimated production value = $${estimatedProductionValue.toLocaleString()}`,
          `Step 5: Calculate scrap rate = ($${scrapData.total_cost || 0} / $${estimatedProductionValue}) × 100`,
          `Step 6: Scrap Rate = ${scrapRate.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 3.0,
        status: scrapRate <= 3.0 ? 'below' : scrapRate > 5.0 ? 'above' : 'at'
      }
    };
  }

  // 4. Rework Rate
  // Formula: (Units Reworked / Total Units Produced) × 100
  calculateReworkRate(startDate: string, endDate: string): KPIResult {
    const reworkData = this.db.prepare(`
      SELECT
        SUM(quantity_reworked) as total_reworked,
        SUM(total_rework_cost) as total_cost,
        SUM(rework_hours) as total_hours,
        COUNT(*) as rework_events
      FROM qc_rework
      WHERE rework_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const inspectionData = this.db.prepare(`
      SELECT SUM(units_inspected) as total_produced
      FROM qc_inspections
      WHERE inspection_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const reworkRate = inspectionData.total_produced > 0
      ? ((reworkData.total_reworked || 0) / inspectionData.total_produced) * 100
      : 0;

    return {
      value: reworkRate,
      displayValue: `${reworkRate.toFixed(2)}%`,
      calculation: {
        formula: 'Rework Rate = (Units Reworked / Total Units Produced) × 100',
        components: {
          unitsReworked: reworkData.total_reworked || 0,
          totalProduced: inspectionData.total_produced || 0,
          reworkCost: `$${(reworkData.total_cost || 0).toLocaleString()}`,
          reworkHours: (reworkData.total_hours || 0).toFixed(1),
          reworkEvents: reworkData.rework_events || 0,
          avgCostPerUnit: reworkData.total_reworked > 0
            ? `$${((reworkData.total_cost || 0) / reworkData.total_reworked).toFixed(2)}`
            : '$0',
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total units reworked = ${(reworkData.total_reworked || 0).toLocaleString()}`,
          `Step 2: Total units produced = ${(inspectionData.total_produced || 0).toLocaleString()}`,
          `Step 3: Calculate rework rate = (${reworkData.total_reworked || 0} / ${inspectionData.total_produced || 0}) × 100`,
          `Step 4: Rework Rate = ${reworkRate.toFixed(2)}%`,
          `Step 5: Total rework cost = $${(reworkData.total_cost || 0).toLocaleString()}`,
          `Step 6: Total rework hours = ${(reworkData.total_hours || 0).toFixed(1)} hours`
        ]
      },
      benchmark: {
        value: 5.0,
        status: reworkRate <= 5.0 ? 'below' : reworkRate > 10.0 ? 'above' : 'at'
      }
    };
  }

  // 5. Customer Return Rate
  // Formula: (Customer Returns / Total Shipments) × 100
  calculateCustomerReturnRate(startDate: string, endDate: string): KPIResult {
    const returnData = this.db.prepare(`
      SELECT
        COUNT(*) as total_returns,
        SUM(quantity_returned) as total_quantity,
        SUM(credit_amount) as total_credits
      FROM qc_customer_returns
      WHERE return_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const shipmentData = this.db.prepare(`
      SELECT COUNT(*) as total_shipments
      FROM ops_shipments
      WHERE actual_delivery_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const returnRate = shipmentData.total_shipments > 0
      ? (returnData.total_returns / shipmentData.total_shipments) * 100
      : 0;

    const topReturnReasons = this.db.prepare(`
      SELECT return_reason, COUNT(*) as count
      FROM qc_customer_returns
      WHERE return_date BETWEEN ? AND ?
      GROUP BY return_reason
      ORDER BY count DESC
      LIMIT 3
    `).all(startDate, endDate) as any[];

    return {
      value: returnRate,
      displayValue: `${returnRate.toFixed(2)}%`,
      calculation: {
        formula: 'Customer Return Rate = (Customer Returns / Total Shipments) × 100',
        components: {
          customerReturns: returnData.total_returns || 0,
          totalShipments: shipmentData.total_shipments || 0,
          quantityReturned: returnData.total_quantity || 0,
          creditAmount: `$${(returnData.total_credits || 0).toLocaleString()}`,
          topReturnReasons: topReturnReasons.map(r => r.return_reason).join(', '),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total customer returns = ${returnData.total_returns || 0}`,
          `Step 2: Total shipments = ${shipmentData.total_shipments || 0}`,
          `Step 3: Calculate return rate = (${returnData.total_returns || 0} / ${shipmentData.total_shipments || 0}) × 100`,
          `Step 4: Customer Return Rate = ${returnRate.toFixed(2)}%`,
          `Step 5: Quantity returned = ${returnData.total_quantity || 0} units`,
          `Step 6: Total credits issued = $${(returnData.total_credits || 0).toLocaleString()}`
        ]
      },
      benchmark: {
        value: 2.0,
        status: returnRate <= 2.0 ? 'below' : returnRate > 5.0 ? 'above' : 'at'
      }
    };
  }

  // 6. Supplier Quality Index
  // Formula: (Accepted Parts / Total Parts Received) × 100
  calculateSupplierQualityIndex(startDate: string, endDate: string): KPIResult {
    const supplierData = this.db.prepare(`
      SELECT
        SUM(quantity_received) as total_received,
        SUM(quantity_inspected) as total_inspected,
        SUM(quantity_accepted) as total_accepted,
        SUM(quantity_rejected) as total_rejected,
        AVG(ppb_defects) as avg_ppb
      FROM qc_supplier_quality
      WHERE record_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const sqiRate = supplierData.total_inspected > 0
      ? (supplierData.total_accepted / supplierData.total_inspected) * 100
      : 0;

    const suppliersRequiringCA = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM qc_supplier_quality
      WHERE record_date BETWEEN ? AND ?
      AND corrective_action_required = 1
    `).get(startDate, endDate) as any;

    return {
      value: sqiRate,
      displayValue: `${sqiRate.toFixed(2)}%`,
      calculation: {
        formula: 'Supplier Quality Index = (Accepted Parts / Total Parts Inspected) × 100',
        components: {
          totalReceived: (supplierData.total_received || 0).toLocaleString(),
          totalInspected: (supplierData.total_inspected || 0).toLocaleString(),
          totalAccepted: (supplierData.total_accepted || 0).toLocaleString(),
          totalRejected: (supplierData.total_rejected || 0).toLocaleString(),
          avgPPB: Math.round(supplierData.avg_ppb || 0).toLocaleString(),
          suppliersRequiringCA: suppliersRequiringCA.count || 0,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total parts received = ${(supplierData.total_received || 0).toLocaleString()}`,
          `Step 2: Total parts inspected = ${(supplierData.total_inspected || 0).toLocaleString()}`,
          `Step 3: Parts accepted = ${(supplierData.total_accepted || 0).toLocaleString()}`,
          `Step 4: Parts rejected = ${(supplierData.total_rejected || 0).toLocaleString()}`,
          `Step 5: Calculate SQI = (${supplierData.total_accepted || 0} / ${supplierData.total_inspected || 0}) × 100`,
          `Step 6: Supplier Quality Index = ${sqiRate.toFixed(2)}%`,
          `Step 7: Average defects = ${Math.round(supplierData.avg_ppb || 0).toLocaleString()} PPB`
        ]
      },
      benchmark: {
        value: 97.0,
        status: sqiRate >= 97.0 ? 'above' : sqiRate < 95.0 ? 'below' : 'at'
      }
    };
  }

  // 7. Non-Conformance Report (NCR) Rate
  // Formula: (Number of NCRs / Total Inspections) × 100
  calculateNCRRate(startDate: string, endDate: string): KPIResult {
    const ncrData = this.db.prepare(`
      SELECT
        COUNT(*) as total_ncrs,
        SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'Major' THEN 1 ELSE 0 END) as major,
        SUM(CASE WHEN severity = 'Minor' THEN 1 ELSE 0 END) as minor
      FROM qc_ncr
      WHERE ncr_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const inspectionData = this.db.prepare(`
      SELECT COUNT(*) as total_inspections
      FROM qc_inspections
      WHERE inspection_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const ncrRate = inspectionData.total_inspections > 0
      ? (ncrData.total_ncrs / inspectionData.total_inspections) * 100
      : 0;

    const ncrByType = this.db.prepare(`
      SELECT ncr_type, COUNT(*) as count
      FROM qc_ncr
      WHERE ncr_date BETWEEN ? AND ?
      GROUP BY ncr_type
      ORDER BY count DESC
    `).all(startDate, endDate) as any[];

    return {
      value: ncrRate,
      displayValue: `${ncrRate.toFixed(2)}%`,
      calculation: {
        formula: 'NCR Rate = (Number of NCRs / Total Inspections) × 100',
        components: {
          totalNCRs: ncrData.total_ncrs || 0,
          criticalNCRs: ncrData.critical || 0,
          majorNCRs: ncrData.major || 0,
          minorNCRs: ncrData.minor || 0,
          totalInspections: inspectionData.total_inspections || 0,
          ncrByType: ncrByType.map(t => `${t.ncr_type}: ${t.count}`).join(', '),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total NCRs = ${ncrData.total_ncrs || 0}`,
          `Step 2: Critical NCRs = ${ncrData.critical || 0}`,
          `Step 3: Major NCRs = ${ncrData.major || 0}`,
          `Step 4: Minor NCRs = ${ncrData.minor || 0}`,
          `Step 5: Total inspections = ${inspectionData.total_inspections || 0}`,
          `Step 6: Calculate NCR rate = (${ncrData.total_ncrs || 0} / ${inspectionData.total_inspections || 0}) × 100`,
          `Step 7: NCR Rate = ${ncrRate.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 5.0,
        status: ncrRate <= 5.0 ? 'below' : ncrRate > 10.0 ? 'above' : 'at'
      }
    };
  }

  // 8. Corrective Action Effectiveness
  // Formula: (Completed CAPAs on time / Total CAPAs) × 100
  calculateCAPAEffectiveness(startDate: string, endDate: string): KPIResult {
    const capaData = this.db.prepare(`
      SELECT
        COUNT(*) as total_capas,
        SUM(CASE WHEN status = 'Completed' AND completion_date <= due_date THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        AVG(CASE WHEN effectiveness_rating IS NOT NULL THEN effectiveness_rating ELSE 0 END) as avg_rating
      FROM qc_capa
      WHERE capa_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const effectiveness = capaData.total_capas > 0
      ? (capaData.on_time / capaData.total_capas) * 100
      : 0;

    const avgClosureTime = this.db.prepare(`
      SELECT AVG(julianday(completion_date) - julianday(capa_date)) as avg_days
      FROM qc_capa
      WHERE capa_date BETWEEN ? AND ?
      AND status = 'Completed'
    `).get(startDate, endDate) as any;

    return {
      value: effectiveness,
      displayValue: `${effectiveness.toFixed(2)}%`,
      calculation: {
        formula: 'CAPA Effectiveness = (Completed CAPAs On Time / Total CAPAs) × 100',
        components: {
          totalCAPAs: capaData.total_capas || 0,
          completedOnTime: capaData.on_time || 0,
          totalCompleted: capaData.completed || 0,
          overdue: (capaData.total_capas || 0) - (capaData.completed || 0),
          avgEffectivenessRating: (capaData.avg_rating || 0).toFixed(1) + '/5.0',
          avgClosureTime: (avgClosureTime.avg_days || 0).toFixed(1) + ' days',
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total CAPAs initiated = ${capaData.total_capas || 0}`,
          `Step 2: CAPAs completed on time = ${capaData.on_time || 0}`,
          `Step 3: Total completed = ${capaData.completed || 0}`,
          `Step 4: Calculate effectiveness = (${capaData.on_time || 0} / ${capaData.total_capas || 0}) × 100`,
          `Step 5: CAPA Effectiveness = ${effectiveness.toFixed(2)}%`,
          `Step 6: Average closure time = ${(avgClosureTime.avg_days || 0).toFixed(1)} days`,
          `Step 7: Average effectiveness rating = ${(capaData.avg_rating || 0).toFixed(1)}/5.0`
        ]
      },
      benchmark: {
        value: 85.0,
        status: effectiveness >= 85.0 ? 'above' : effectiveness < 70.0 ? 'below' : 'at'
      }
    };
  }

  // 9. Cost of Poor Quality (COPQ)
  // Formula: (Failure Costs / Total Sales) × 100
  calculateCOPQ(startDate: string, endDate: string): KPIResult {
    const coqData = this.db.prepare(`
      SELECT
        cost_category,
        SUM(amount) as total_amount
      FROM qc_cost_of_quality
      WHERE record_date BETWEEN ? AND ?
      GROUP BY cost_category
    `).all(startDate, endDate) as any[];

    const coqByCategory: any = {};
    let totalCOQ = 0;
    let totalSales = 0;

    coqData.forEach(row => {
      coqByCategory[row.cost_category] = row.total_amount;
      totalCOQ += row.total_amount;
    });

    // Get sales data
    const salesData = this.db.prepare(`
      SELECT AVG(sales_period) as avg_sales
      FROM qc_cost_of_quality
      WHERE record_date BETWEEN ? AND ?
      AND sales_period IS NOT NULL
    `).get(startDate, endDate) as any;

    totalSales = (salesData.avg_sales || 0) * differenceInCalendarDays(new Date(endDate), new Date(startDate)) / 30;

    const copqPercent = totalSales > 0 ? (totalCOQ / totalSales) * 100 : 0;

    const failureCosts = (coqByCategory['Internal Failure'] || 0) + (coqByCategory['External Failure'] || 0);
    const copqFailurePercent = totalSales > 0 ? (failureCosts / totalSales) * 100 : 0;

    return {
      value: copqPercent,
      displayValue: `${copqPercent.toFixed(2)}%`,
      calculation: {
        formula: 'COPQ = (Total Quality Costs / Total Sales) × 100',
        components: {
          preventionCosts: `$${((coqByCategory['Prevention'] || 0)).toLocaleString()}`,
          appraisalCosts: `$${((coqByCategory['Appraisal'] || 0)).toLocaleString()}`,
          internalFailureCosts: `$${((coqByCategory['Internal Failure'] || 0)).toLocaleString()}`,
          externalFailureCosts: `$${((coqByCategory['External Failure'] || 0)).toLocaleString()}`,
          totalCOQ: `$${totalCOQ.toLocaleString()}`,
          totalSales: `$${totalSales.toLocaleString()}`,
          copqFailureOnly: copqFailurePercent.toFixed(2) + '%',
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Prevention costs = $${((coqByCategory['Prevention'] || 0)).toLocaleString()}`,
          `Step 2: Appraisal costs = $${((coqByCategory['Appraisal'] || 0)).toLocaleString()}`,
          `Step 3: Internal failure costs = $${((coqByCategory['Internal Failure'] || 0)).toLocaleString()}`,
          `Step 4: External failure costs = $${((coqByCategory['External Failure'] || 0)).toLocaleString()}`,
          `Step 5: Total COQ = $${totalCOQ.toLocaleString()}`,
          `Step 6: Total sales = $${totalSales.toLocaleString()}`,
          `Step 7: Calculate COPQ = ($${totalCOQ.toLocaleString()} / $${totalSales.toLocaleString()}) × 100`,
          `Step 8: COPQ = ${copqPercent.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 5.0,
        status: copqPercent <= 5.0 ? 'below' : copqPercent > 10.0 ? 'above' : 'at'
      }
    };
  }

  // 10. Quality Audit Score
  // Formula: Average audit score across all audits
  calculateQualityAuditScore(startDate: string, endDate: string): KPIResult {
    const auditData = this.db.prepare(`
      SELECT
        COUNT(*) as total_audits,
        AVG(overall_score) as avg_score,
        SUM(critical_findings) as total_critical,
        SUM(major_findings) as total_major,
        SUM(minor_findings) as total_minor,
        SUM(observations) as total_observations
      FROM qc_audits
      WHERE audit_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const avgScore = auditData.avg_score || 0;

    const auditsByType = this.db.prepare(`
      SELECT audit_type, AVG(overall_score) as avg_score, COUNT(*) as count
      FROM qc_audits
      WHERE audit_date BETWEEN ? AND ?
      GROUP BY audit_type
      ORDER BY avg_score DESC
    `).all(startDate, endDate) as any[];

    const passRate = this.db.prepare(`
      SELECT
        SUM(CASE WHEN pass_fail = 'Pass' THEN 1 ELSE 0 END) as passed,
        COUNT(*) as total
      FROM qc_audits
      WHERE audit_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const auditPassRate = passRate.total > 0 ? (passRate.passed / passRate.total) * 100 : 0;

    return {
      value: avgScore,
      displayValue: `${avgScore.toFixed(1)}/100`,
      calculation: {
        formula: 'Quality Audit Score = Average of All Audit Scores',
        components: {
          totalAudits: auditData.total_audits || 0,
          averageScore: avgScore.toFixed(1),
          auditPassRate: auditPassRate.toFixed(1) + '%',
          criticalFindings: auditData.total_critical || 0,
          majorFindings: auditData.total_major || 0,
          minorFindings: auditData.total_minor || 0,
          observations: auditData.total_observations || 0,
          auditsByType: auditsByType.map(a => `${a.audit_type}: ${a.avg_score.toFixed(1)} (${a.count})`).join(', '),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total audits conducted = ${auditData.total_audits || 0}`,
          `Step 2: Calculate average audit score = ${avgScore.toFixed(1)}/100`,
          `Step 3: Audit pass rate = ${auditPassRate.toFixed(1)}%`,
          `Step 4: Critical findings = ${auditData.total_critical || 0}`,
          `Step 5: Major findings = ${auditData.total_major || 0}`,
          `Step 6: Minor findings = ${auditData.total_minor || 0}`,
          `Step 7: Observations = ${auditData.total_observations || 0}`
        ]
      },
      benchmark: {
        value: 85.0,
        status: avgScore >= 85.0 ? 'above' : avgScore < 75.0 ? 'below' : 'at'
      }
    };
  }

  // Get all QC KPIs
  getAllKPIs(startDate: string, endDate: string): any {
    return {
      defectRatePPM: this.calculateDefectRatePPM(startDate, endDate),
      firstPassYield: this.calculateFirstPassYield(startDate, endDate),
      scrapRate: this.calculateScrapRate(startDate, endDate),
      reworkRate: this.calculateReworkRate(startDate, endDate),
      customerReturnRate: this.calculateCustomerReturnRate(startDate, endDate),
      supplierQualityIndex: this.calculateSupplierQualityIndex(startDate, endDate),
      ncrRate: this.calculateNCRRate(startDate, endDate),
      capaEffectiveness: this.calculateCAPAEffectiveness(startDate, endDate),
      copq: this.calculateCOPQ(startDate, endDate),
      qualityAuditScore: this.calculateQualityAuditScore(startDate, endDate)
    };
  }

  close() {
    this.db.close();
  }
}
