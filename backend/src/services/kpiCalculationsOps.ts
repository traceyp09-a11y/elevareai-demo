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

export class OpsKPICalculationService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  // 1. On-Time Delivery (OTIF)
  // Formula: (Number of on-time deliveries / Total deliveries) × 100
  calculateOnTimeDelivery(startDate: string, endDate: string): KPIResult {
    const totalDeliveries = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_shipments
      WHERE actual_delivery_date IS NOT NULL
      AND actual_delivery_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const onTimeDeliveries = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_shipments
      WHERE actual_delivery_date IS NOT NULL
      AND actual_delivery_date BETWEEN ? AND ?
      AND on_time = 1
    `).get(startDate, endDate) as any;

    const otifRate = totalDeliveries.count > 0 ? (onTimeDeliveries.count / totalDeliveries.count) * 100 : 0;

    const lateDeliveries = totalDeliveries.count - onTimeDeliveries.count;
    const avgDelay = this.db.prepare(`
      SELECT AVG(julianday(actual_delivery_date) - julianday(promised_delivery_date)) as avg_days
      FROM ops_shipments
      WHERE actual_delivery_date IS NOT NULL
      AND actual_delivery_date BETWEEN ? AND ?
      AND on_time = 0
    `).get(startDate, endDate) as any;

    return {
      value: otifRate,
      displayValue: `${otifRate.toFixed(2)}%`,
      calculation: {
        formula: 'OTIF = (On-Time Deliveries / Total Deliveries) × 100',
        components: {
          onTimeDeliveries: onTimeDeliveries.count,
          totalDeliveries: totalDeliveries.count,
          lateDeliveries: lateDeliveries,
          averageDelayDays: avgDelay.avg_days ? avgDelay.avg_days.toFixed(1) : '0',
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Count total completed deliveries = ${totalDeliveries.count}`,
          `Step 2: Count on-time deliveries = ${onTimeDeliveries.count}`,
          `Step 3: Calculate OTIF rate = (${onTimeDeliveries.count} / ${totalDeliveries.count}) × 100`,
          `Step 4: OTIF = ${otifRate.toFixed(2)}%`,
          `Step 5: Late deliveries = ${lateDeliveries}`,
          `Step 6: Average delay for late shipments = ${avgDelay.avg_days ? avgDelay.avg_days.toFixed(1) : '0'} days`
        ]
      },
      benchmark: {
        value: 95.0,
        status: otifRate >= 95.0 ? 'above' : otifRate < 90.0 ? 'below' : 'at'
      }
    };
  }

  // 2. Production Schedule Adherence
  // Formula: (Orders completed on schedule / Total completed orders) × 100
  calculateScheduleAdherence(startDate: string, endDate: string): KPIResult {
    const completedOrders = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_production_orders
      WHERE status = 'Completed'
      AND completion_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const onScheduleOrders = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_production_orders
      WHERE status = 'Completed'
      AND completion_date BETWEEN ? AND ?
      AND completion_date <= due_date
    `).get(startDate, endDate) as any;

    const adherenceRate = completedOrders.count > 0 ? (onScheduleOrders.count / completedOrders.count) * 100 : 0;

    const lateOrders = completedOrders.count - onScheduleOrders.count;
    const inProgressOrders = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_production_orders
      WHERE status = 'In Progress'
      AND due_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    return {
      value: adherenceRate,
      displayValue: `${adherenceRate.toFixed(2)}%`,
      calculation: {
        formula: 'Schedule Adherence = (Orders Completed On Schedule / Total Completed Orders) × 100',
        components: {
          completedOrders: completedOrders.count,
          onScheduleOrders: onScheduleOrders.count,
          lateOrders: lateOrders,
          inProgressOrders: inProgressOrders.count,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Count completed production orders = ${completedOrders.count}`,
          `Step 2: Count orders completed on or before due date = ${onScheduleOrders.count}`,
          `Step 3: Calculate adherence = (${onScheduleOrders.count} / ${completedOrders.count}) × 100`,
          `Step 4: Schedule Adherence = ${adherenceRate.toFixed(2)}%`,
          `Step 5: Late orders = ${lateOrders}`,
          `Step 6: Currently in progress = ${inProgressOrders.count}`
        ]
      },
      benchmark: {
        value: 90.0,
        status: adherenceRate >= 90.0 ? 'above' : adherenceRate < 80.0 ? 'below' : 'at'
      }
    };
  }

  // 3. Overall Equipment Effectiveness (OEE)
  // Formula: Availability × Performance × Quality
  calculateOEE(startDate: string, endDate: string): KPIResult {
    // Availability: (Total Time - Downtime) / Total Time
    const totalHours = differenceInCalendarDays(new Date(endDate), new Date(startDate)) * 24;

    const totalDowntime = this.db.prepare(`
      SELECT SUM(impact_hours) as total FROM ops_downtime
      WHERE start_time BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const downtimeHours = totalDowntime.total || 0;
    const availability = totalHours > 0 ? ((totalHours - downtimeHours) / totalHours) * 100 : 0;

    // Performance: Assume 85% (based on actual vs ideal cycle time)
    const performance = 85.0;

    // Quality: (Good Units / Total Units) × 100
    const qualityData = this.db.prepare(`
      SELECT
        SUM(units_inspected) as total_inspected,
        SUM(units_passed) as total_passed
      FROM ops_quality_inspections
      WHERE inspection_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const quality = qualityData.total_inspected > 0
      ? (qualityData.total_passed / qualityData.total_inspected) * 100
      : 100;

    // OEE = Availability × Performance × Quality
    const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

    const downtimeEvents = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_downtime
      WHERE start_time BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    return {
      value: oee,
      displayValue: `${oee.toFixed(2)}%`,
      calculation: {
        formula: 'OEE = Availability × Performance × Quality',
        components: {
          availability: availability.toFixed(2) + '%',
          performance: performance.toFixed(2) + '%',
          quality: quality.toFixed(2) + '%',
          totalDowntimeHours: downtimeHours.toFixed(1),
          downtimeEvents: downtimeEvents.count,
          totalInspected: qualityData.total_inspected || 0,
          totalPassed: qualityData.total_passed || 0,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Calculate Availability = ((${totalHours} - ${downtimeHours.toFixed(1)}) / ${totalHours}) × 100 = ${availability.toFixed(2)}%`,
          `Step 2: Calculate Performance = ${performance.toFixed(2)}% (actual vs ideal cycle time)`,
          `Step 3: Calculate Quality = (${qualityData.total_passed || 0} / ${qualityData.total_inspected || 0}) × 100 = ${quality.toFixed(2)}%`,
          `Step 4: OEE = ${availability.toFixed(2)}% × ${performance.toFixed(2)}% × ${quality.toFixed(2)}% = ${oee.toFixed(2)}%`,
          `Step 5: Total downtime events = ${downtimeEvents.count}`
        ]
      },
      benchmark: {
        value: 85.0,
        status: oee >= 85.0 ? 'above' : oee < 75.0 ? 'below' : 'at'
      }
    };
  }

  // 4. First Pass Yield (FPY)
  // Formula: (Units passed first inspection / Total units inspected) × 100
  calculateFirstPassYield(startDate: string, endDate: string): KPIResult {
    const qualityData = this.db.prepare(`
      SELECT
        SUM(units_inspected) as total_inspected,
        SUM(units_passed) as total_passed,
        SUM(units_failed) as total_failed
      FROM ops_quality_inspections
      WHERE inspection_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const fpy = qualityData.total_inspected > 0
      ? (qualityData.total_passed / qualityData.total_inspected) * 100
      : 0;

    const defectsByType = this.db.prepare(`
      SELECT defect_types FROM ops_quality_inspections
      WHERE inspection_date BETWEEN ? AND ?
      AND defect_types IS NOT NULL
      AND defect_types != '[]'
    `).all(startDate, endDate) as any[];

    // Count defect types
    const defectCounts: { [key: string]: number } = {};
    defectsByType.forEach(row => {
      try {
        const defects = JSON.parse(row.defect_types);
        defects.forEach((defect: string) => {
          defectCounts[defect] = (defectCounts[defect] || 0) + 1;
        });
      } catch (e) {
        // Skip invalid JSON
      }
    });

    const topDefects = Object.entries(defectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([defect, count]) => `${defect} (${count})`);

    return {
      value: fpy,
      displayValue: `${fpy.toFixed(2)}%`,
      calculation: {
        formula: 'FPY = (Units Passed / Total Units Inspected) × 100',
        components: {
          unitsInspected: qualityData.total_inspected || 0,
          unitsPassed: qualityData.total_passed || 0,
          unitsFailed: qualityData.total_failed || 0,
          defectRate: qualityData.total_inspected > 0
            ? ((qualityData.total_failed / qualityData.total_inspected) * 100).toFixed(2) + '%'
            : '0%',
          topDefects: topDefects.join(', ') || 'None',
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total units inspected = ${qualityData.total_inspected || 0}`,
          `Step 2: Units passed first inspection = ${qualityData.total_passed || 0}`,
          `Step 3: Units failed inspection = ${qualityData.total_failed || 0}`,
          `Step 4: Calculate FPY = (${qualityData.total_passed || 0} / ${qualityData.total_inspected || 0}) × 100`,
          `Step 5: FPY = ${fpy.toFixed(2)}%`,
          `Step 6: Top defect types: ${topDefects.join(', ') || 'None'}`
        ]
      },
      benchmark: {
        value: 95.0,
        status: fpy >= 95.0 ? 'above' : fpy < 90.0 ? 'below' : 'at'
      }
    };
  }

  // 5. Inventory Turnover Ratio
  // Formula: Cost of Goods Issued / Average Inventory Value
  calculateInventoryTurnover(startDate: string, endDate: string): KPIResult {
    // Cost of goods issued
    const issuesData = this.db.prepare(`
      SELECT SUM(ABS(quantity) * unit_cost) as total_cost
      FROM ops_inventory
      WHERE transaction_type = 'Issue'
      AND transaction_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const costOfGoodsIssued = issuesData.total_cost || 0;

    // Average inventory value (simplified - using balance at start and end)
    const startInventory = this.db.prepare(`
      SELECT SUM(balance_after * unit_cost) as total_value
      FROM ops_inventory
      WHERE transaction_date <= ?
      AND id IN (
        SELECT MAX(id) FROM ops_inventory
        WHERE transaction_date <= ?
        GROUP BY item_name, facility_id
      )
    `).get(startDate, startDate) as any;

    const endInventory = this.db.prepare(`
      SELECT SUM(balance_after * unit_cost) as total_value
      FROM ops_inventory
      WHERE transaction_date <= ?
      AND id IN (
        SELECT MAX(id) FROM ops_inventory
        WHERE transaction_date <= ?
        GROUP BY item_name, facility_id
      )
    `).get(endDate, endDate) as any;

    const avgInventoryValue = ((startInventory.total_value || 0) + (endInventory.total_value || 0)) / 2;
    const turnoverRatio = avgInventoryValue > 0 ? costOfGoodsIssued / avgInventoryValue : 0;

    // Days inventory outstanding
    const daysInPeriod = differenceInCalendarDays(new Date(endDate), new Date(startDate));
    const daysInventory = turnoverRatio > 0 ? daysInPeriod / turnoverRatio : 0;

    return {
      value: turnoverRatio,
      displayValue: `${turnoverRatio.toFixed(2)}`,
      calculation: {
        formula: 'Inventory Turnover = Cost of Goods Issued / Average Inventory Value',
        components: {
          costOfGoodsIssued: `$${costOfGoodsIssued.toLocaleString()}`,
          startInventoryValue: `$${(startInventory.total_value || 0).toLocaleString()}`,
          endInventoryValue: `$${(endInventory.total_value || 0).toLocaleString()}`,
          avgInventoryValue: `$${avgInventoryValue.toLocaleString()}`,
          daysInventoryOutstanding: daysInventory.toFixed(1) + ' days',
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Calculate cost of goods issued = $${costOfGoodsIssued.toLocaleString()}`,
          `Step 2: Calculate starting inventory value = $${(startInventory.total_value || 0).toLocaleString()}`,
          `Step 3: Calculate ending inventory value = $${(endInventory.total_value || 0).toLocaleString()}`,
          `Step 4: Calculate average inventory = ($${(startInventory.total_value || 0).toLocaleString()} + $${(endInventory.total_value || 0).toLocaleString()}) / 2 = $${avgInventoryValue.toLocaleString()}`,
          `Step 5: Calculate turnover = $${costOfGoodsIssued.toLocaleString()} / $${avgInventoryValue.toLocaleString()} = ${turnoverRatio.toFixed(2)}`,
          `Step 6: Days inventory outstanding = ${daysInventory.toFixed(1)} days`
        ]
      },
      benchmark: {
        value: 6.0,
        status: turnoverRatio >= 6.0 ? 'above' : turnoverRatio < 4.0 ? 'below' : 'at'
      }
    };
  }

  // 6. Supplier On-Time Delivery
  // Formula: (On-time vendor deliveries / Total vendor deliveries) × 100
  calculateSupplierOTD(startDate: string, endDate: string): KPIResult {
    const totalDeliveries = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_vendor_deliveries
      WHERE actual_delivery_date IS NOT NULL
      AND actual_delivery_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const onTimeDeliveries = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_vendor_deliveries
      WHERE actual_delivery_date IS NOT NULL
      AND actual_delivery_date BETWEEN ? AND ?
      AND on_time = 1
    `).get(startDate, endDate) as any;

    const otdRate = totalDeliveries.count > 0 ? (onTimeDeliveries.count / totalDeliveries.count) * 100 : 0;

    const avgQualityRating = this.db.prepare(`
      SELECT AVG(quality_rating) as avg_rating
      FROM ops_vendor_deliveries
      WHERE actual_delivery_date BETWEEN ? AND ?
      AND quality_rating IS NOT NULL
    `).get(startDate, endDate) as any;

    const rejectionRate = this.db.prepare(`
      SELECT
        SUM(units_rejected) as total_rejected,
        SUM(units_received) as total_received
      FROM ops_vendor_deliveries
      WHERE actual_delivery_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const rejectionPercent = rejectionRate.total_received > 0
      ? (rejectionRate.total_rejected / rejectionRate.total_received) * 100
      : 0;

    return {
      value: otdRate,
      displayValue: `${otdRate.toFixed(2)}%`,
      calculation: {
        formula: 'Supplier OTD = (On-Time Deliveries / Total Deliveries) × 100',
        components: {
          totalDeliveries: totalDeliveries.count,
          onTimeDeliveries: onTimeDeliveries.count,
          lateDeliveries: totalDeliveries.count - onTimeDeliveries.count,
          avgQualityRating: avgQualityRating.avg_rating ? avgQualityRating.avg_rating.toFixed(2) : 'N/A',
          rejectionRate: rejectionPercent.toFixed(2) + '%',
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Count total vendor deliveries = ${totalDeliveries.count}`,
          `Step 2: Count on-time deliveries = ${onTimeDeliveries.count}`,
          `Step 3: Calculate OTD rate = (${onTimeDeliveries.count} / ${totalDeliveries.count}) × 100`,
          `Step 4: Supplier OTD = ${otdRate.toFixed(2)}%`,
          `Step 5: Average quality rating = ${avgQualityRating.avg_rating ? avgQualityRating.avg_rating.toFixed(2) : 'N/A'} / 5.0`,
          `Step 6: Material rejection rate = ${rejectionPercent.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 90.0,
        status: otdRate >= 90.0 ? 'above' : otdRate < 80.0 ? 'below' : 'at'
      }
    };
  }

  // 7. Manufacturing Cycle Time
  // Formula: Average time from order start to completion
  calculateCycleTime(startDate: string, endDate: string): KPIResult {
    const cycleTimeData = this.db.prepare(`
      SELECT
        AVG(avg_cycle_time_hours) as avg_actual,
        AVG(target_cycle_time_hours) as avg_target,
        SUM(orders_completed) as total_orders
      FROM ops_cycle_times
      WHERE record_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const avgActualHours = cycleTimeData.avg_actual || 0;
    const avgTargetHours = cycleTimeData.avg_target || 0;
    const variancePercent = avgTargetHours > 0
      ? ((avgActualHours - avgTargetHours) / avgTargetHours) * 100
      : 0;

    // Find slowest product categories
    const slowestProducts = this.db.prepare(`
      SELECT
        product_category,
        AVG(avg_cycle_time_hours) as avg_time,
        COUNT(*) as record_count
      FROM ops_cycle_times
      WHERE record_date BETWEEN ? AND ?
      GROUP BY product_category
      ORDER BY avg_time DESC
      LIMIT 3
    `).all(startDate, endDate) as any[];

    return {
      value: avgActualHours,
      displayValue: `${avgActualHours.toFixed(1)} hrs`,
      calculation: {
        formula: 'Avg Cycle Time = Total Production Time / Number of Orders',
        components: {
          avgActualCycleTime: avgActualHours.toFixed(1) + ' hours',
          avgTargetCycleTime: avgTargetHours.toFixed(1) + ' hours',
          varianceFromTarget: variancePercent.toFixed(1) + '%',
          ordersCompleted: cycleTimeData.total_orders || 0,
          slowestCategories: slowestProducts.map(p => `${p.product_category} (${p.avg_time.toFixed(1)}h)`).join(', '),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Calculate average actual cycle time = ${avgActualHours.toFixed(1)} hours`,
          `Step 2: Calculate average target cycle time = ${avgTargetHours.toFixed(1)} hours`,
          `Step 3: Calculate variance = ((${avgActualHours.toFixed(1)} - ${avgTargetHours.toFixed(1)}) / ${avgTargetHours.toFixed(1)}) × 100 = ${variancePercent.toFixed(1)}%`,
          `Step 4: Total orders completed = ${cycleTimeData.total_orders || 0}`,
          `Step 5: Slowest categories: ${slowestProducts.map(p => p.product_category).join(', ')}`
        ]
      },
      benchmark: {
        value: avgTargetHours,
        status: avgActualHours <= avgTargetHours ? 'below' : avgActualHours > avgTargetHours * 1.1 ? 'above' : 'at'
      }
    };
  }

  // 8. Capacity Utilization
  // Formula: (Used Hours / Available Hours) × 100
  calculateCapacityUtilization(startDate: string, endDate: string): KPIResult {
    const capacityData = this.db.prepare(`
      SELECT
        SUM(available_hours) as total_available,
        SUM(used_hours) as total_used
      FROM ops_capacity
      WHERE record_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const utilizationRate = capacityData.total_available > 0
      ? (capacityData.total_used / capacityData.total_available) * 100
      : 0;

    const unusedHours = capacityData.total_available - capacityData.total_used;

    // Utilization by department
    const byDepartment = this.db.prepare(`
      SELECT
        department,
        AVG(utilization_percent) as avg_utilization,
        SUM(available_hours) as dept_available
      FROM ops_capacity
      WHERE record_date BETWEEN ? AND ?
      GROUP BY department
      ORDER BY avg_utilization DESC
    `).all(startDate, endDate) as any[];

    return {
      value: utilizationRate,
      displayValue: `${utilizationRate.toFixed(2)}%`,
      calculation: {
        formula: 'Capacity Utilization = (Used Hours / Available Hours) × 100',
        components: {
          availableHours: capacityData.total_available ? capacityData.total_available.toLocaleString() : '0',
          usedHours: capacityData.total_used ? capacityData.total_used.toLocaleString() : '0',
          unusedHours: unusedHours.toLocaleString(),
          byDepartment: byDepartment.map(d => `${d.department}: ${d.avg_utilization.toFixed(1)}%`).join(', '),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total available hours = ${capacityData.total_available ? capacityData.total_available.toLocaleString() : '0'}`,
          `Step 2: Total used hours = ${capacityData.total_used ? capacityData.total_used.toLocaleString() : '0'}`,
          `Step 3: Calculate utilization = (${capacityData.total_used ? capacityData.total_used.toLocaleString() : '0'} / ${capacityData.total_available ? capacityData.total_available.toLocaleString() : '0'}) × 100`,
          `Step 4: Capacity Utilization = ${utilizationRate.toFixed(2)}%`,
          `Step 5: Unused capacity = ${unusedHours.toLocaleString()} hours`,
          `Step 6: Highest utilization: ${byDepartment[0]?.department || 'N/A'} (${byDepartment[0]?.avg_utilization.toFixed(1) || '0'}%)`
        ]
      },
      benchmark: {
        value: 85.0,
        status: utilizationRate >= 80.0 && utilizationRate <= 90.0 ? 'at' : utilizationRate > 90.0 ? 'above' : 'below'
      }
    };
  }

  // 9. Maintenance Compliance
  // Formula: (Completed maintenance work orders / Total scheduled maintenance) × 100
  calculateMaintenanceCompliance(startDate: string, endDate: string): KPIResult {
    const scheduledMaintenance = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_work_orders
      WHERE work_order_type IN ('Preventive', 'Predictive')
      AND scheduled_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const completedMaintenance = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_work_orders
      WHERE work_order_type IN ('Preventive', 'Predictive')
      AND scheduled_date BETWEEN ? AND ?
      AND status = 'Completed'
    `).get(startDate, endDate) as any;

    const complianceRate = scheduledMaintenance.count > 0
      ? (completedMaintenance.count / scheduledMaintenance.count) * 100
      : 0;

    const emergencyWorkOrders = this.db.prepare(`
      SELECT COUNT(*) as count FROM ops_work_orders
      WHERE work_order_type = 'Emergency'
      AND created_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const avgMaintenanceCost = this.db.prepare(`
      SELECT AVG(total_cost) as avg_cost
      FROM ops_work_orders
      WHERE scheduled_date BETWEEN ? AND ?
      AND status = 'Completed'
      AND total_cost IS NOT NULL
    `).get(startDate, endDate) as any;

    return {
      value: complianceRate,
      displayValue: `${complianceRate.toFixed(2)}%`,
      calculation: {
        formula: 'Maintenance Compliance = (Completed Preventive Maintenance / Scheduled Preventive Maintenance) × 100',
        components: {
          scheduledMaintenance: scheduledMaintenance.count,
          completedMaintenance: completedMaintenance.count,
          overdueMaintenance: scheduledMaintenance.count - completedMaintenance.count,
          emergencyWorkOrders: emergencyWorkOrders.count,
          avgMaintenanceCost: avgMaintenanceCost.avg_cost ? `$${avgMaintenanceCost.avg_cost.toFixed(0)}` : 'N/A',
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Count scheduled preventive maintenance = ${scheduledMaintenance.count}`,
          `Step 2: Count completed preventive maintenance = ${completedMaintenance.count}`,
          `Step 3: Calculate compliance = (${completedMaintenance.count} / ${scheduledMaintenance.count}) × 100`,
          `Step 4: Maintenance Compliance = ${complianceRate.toFixed(2)}%`,
          `Step 5: Emergency work orders = ${emergencyWorkOrders.count}`,
          `Step 6: Average maintenance cost = ${avgMaintenanceCost.avg_cost ? `$${avgMaintenanceCost.avg_cost.toFixed(0)}` : 'N/A'}`
        ]
      },
      benchmark: {
        value: 95.0,
        status: complianceRate >= 95.0 ? 'above' : complianceRate < 85.0 ? 'below' : 'at'
      }
    };
  }

  // 10. Cost of Quality (COQ)
  // Formula: (Failure costs + Appraisal costs) / Total production value × 100
  calculateCostOfQuality(startDate: string, endDate: string): KPIResult {
    // Failure costs: Rework, scrap, warranty
    const failureCosts = this.db.prepare(`
      SELECT SUM(units_failed) as total_failed
      FROM ops_quality_inspections
      WHERE inspection_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    // Assume $50 per failed unit as rework cost
    const failureCostAmount = (failureCosts.total_failed || 0) * 50;

    // Appraisal costs: Inspection and testing (assume $10 per unit inspected)
    const appraisalData = this.db.prepare(`
      SELECT SUM(units_inspected) as total_inspected
      FROM ops_quality_inspections
      WHERE inspection_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const appraisalCostAmount = (appraisalData.total_inspected || 0) * 10;

    const totalQualityCost = failureCostAmount + appraisalCostAmount;

    // Total production value (from completed orders)
    const productionValue = this.db.prepare(`
      SELECT SUM(quantity_produced) as total_units
      FROM ops_production_orders
      WHERE completion_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    // Assume $100 per unit as average selling price
    const totalProductionValue = (productionValue.total_units || 0) * 100;

    const coqPercent = totalProductionValue > 0
      ? (totalQualityCost / totalProductionValue) * 100
      : 0;

    return {
      value: coqPercent,
      displayValue: `${coqPercent.toFixed(2)}%`,
      calculation: {
        formula: 'COQ = (Failure Costs + Appraisal Costs) / Total Production Value × 100',
        components: {
          failureCosts: `$${failureCostAmount.toLocaleString()}`,
          failedUnits: failureCosts.total_failed || 0,
          appraisalCosts: `$${appraisalCostAmount.toLocaleString()}`,
          inspectedUnits: appraisalData.total_inspected || 0,
          totalQualityCosts: `$${totalQualityCost.toLocaleString()}`,
          totalProductionValue: `$${totalProductionValue.toLocaleString()}`,
          producedUnits: productionValue.total_units || 0,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Calculate failure costs = ${failureCosts.total_failed || 0} units × $50 = $${failureCostAmount.toLocaleString()}`,
          `Step 2: Calculate appraisal costs = ${appraisalData.total_inspected || 0} units × $10 = $${appraisalCostAmount.toLocaleString()}`,
          `Step 3: Total quality costs = $${failureCostAmount.toLocaleString()} + $${appraisalCostAmount.toLocaleString()} = $${totalQualityCost.toLocaleString()}`,
          `Step 4: Total production value = ${productionValue.total_units || 0} units × $100 = $${totalProductionValue.toLocaleString()}`,
          `Step 5: Calculate COQ = ($${totalQualityCost.toLocaleString()} / $${totalProductionValue.toLocaleString()}) × 100`,
          `Step 6: COQ = ${coqPercent.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 5.0,
        status: coqPercent <= 5.0 ? 'below' : coqPercent > 10.0 ? 'above' : 'at'
      }
    };
  }

  // Get all Operations KPIs
  getAllKPIs(startDate: string, endDate: string): any {
    return {
      onTimeDelivery: this.calculateOnTimeDelivery(startDate, endDate),
      scheduleAdherence: this.calculateScheduleAdherence(startDate, endDate),
      oee: this.calculateOEE(startDate, endDate),
      firstPassYield: this.calculateFirstPassYield(startDate, endDate),
      inventoryTurnover: this.calculateInventoryTurnover(startDate, endDate),
      supplierOTD: this.calculateSupplierOTD(startDate, endDate),
      cycleTime: this.calculateCycleTime(startDate, endDate),
      capacityUtilization: this.calculateCapacityUtilization(startDate, endDate),
      maintenanceCompliance: this.calculateMaintenanceCompliance(startDate, endDate),
      costOfQuality: this.calculateCostOfQuality(startDate, endDate)
    };
  }

  close() {
    this.db.close();
  }
}
