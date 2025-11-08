import Database from 'better-sqlite3';

interface KPIResult {
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  benchmark?: {
    value: number;
    status: 'below' | 'at' | 'above';
    description: string;
  };
}

export class SupplyChainKPICalculationService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  /**
   * KPI 1: Perfect Order Rate
   * Measures the percentage of orders delivered on-time, in-full, and accurately
   * Industry benchmark: 90-95%
   */
  calculatePerfectOrderRate(startDate: string, endDate: string): KPIResult {
    const query = `
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN on_time = 1 AND in_full = 1 AND accurate = 1 THEN 1 ELSE 0 END) as perfect_orders,
        SUM(on_time) as on_time_orders,
        SUM(in_full) as in_full_orders,
        SUM(accurate) as accurate_orders
      FROM sc_orders
      WHERE order_date BETWEEN ? AND ?
        AND status = 'Delivered'
        AND order_type = 'Sales Order'
    `;

    const result = this.db.prepare(query).get(startDate, endDate) as any;

    const totalOrders = result.total_orders || 0;
    const perfectOrders = result.perfect_orders || 0;
    const perfectOrderRate = totalOrders > 0 ? (perfectOrders / totalOrders) * 100 : 0;

    const benchmark = 92.5; // Industry standard
    let status: 'below' | 'at' | 'above';
    if (perfectOrderRate >= benchmark + 2) status = 'above';
    else if (perfectOrderRate >= benchmark - 2) status = 'at';
    else status = 'below';

    return {
      value: perfectOrderRate,
      displayValue: `${perfectOrderRate.toFixed(2)}%`,
      calculation: {
        formula: 'Perfect Order Rate = (Perfect Orders / Total Orders) × 100',
        components: {
          perfectOrders: perfectOrders,
          totalOrders: totalOrders,
          onTimeOrders: result.on_time_orders,
          inFullOrders: result.in_full_orders,
          accurateOrders: result.accurate_orders,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Count total delivered sales orders: ${totalOrders}`,
          `2. Count orders meeting ALL criteria (on-time AND in-full AND accurate): ${perfectOrders}`,
          `3. Calculate rate: (${perfectOrders} / ${totalOrders}) × 100 = ${perfectOrderRate.toFixed(2)}%`,
          `4. Compare to benchmark: ${benchmark}%`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark}% (World-class: 95%+)`
      }
    };
  }

  /**
   * KPI 2: OTIF (On-Time In-Full) Delivery Rate
   * Measures orders delivered both on-time AND in-full
   * Industry benchmark: 85-90%
   */
  calculateOTIF(startDate: string, endDate: string): KPIResult {
    const query = `
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN on_time = 1 AND in_full = 1 THEN 1 ELSE 0 END) as otif_orders
      FROM sc_orders
      WHERE order_date BETWEEN ? AND ?
        AND status = 'Delivered'
        AND order_type = 'Sales Order'
    `;

    const result = this.db.prepare(query).get(startDate, endDate) as any;

    const totalOrders = result.total_orders || 0;
    const otifOrders = result.otif_orders || 0;
    const otifRate = totalOrders > 0 ? (otifOrders / totalOrders) * 100 : 0;

    const benchmark = 87.5;
    let status: 'below' | 'at' | 'above';
    if (otifRate >= benchmark + 2) status = 'above';
    else if (otifRate >= benchmark - 2) status = 'at';
    else status = 'below';

    return {
      value: otifRate,
      displayValue: `${otifRate.toFixed(2)}%`,
      calculation: {
        formula: 'OTIF = (On-Time AND In-Full Orders / Total Orders) × 100',
        components: {
          otifOrders: otifOrders,
          totalOrders: totalOrders,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Count total delivered sales orders: ${totalOrders}`,
          `2. Count orders delivered on-time AND in-full: ${otifOrders}`,
          `3. Calculate OTIF rate: (${otifOrders} / ${totalOrders}) × 100 = ${otifRate.toFixed(2)}%`,
          `4. Compare to benchmark: ${benchmark}%`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark}% (Best-in-class: 90%+)`
      }
    };
  }

  /**
   * KPI 3: Inventory Turnover Ratio
   * Measures how efficiently inventory is managed
   * Industry benchmark: 8-12 turns/year (varies by industry)
   */
  calculateInventoryTurnover(startDate: string, endDate: string): KPIResult {
    // Calculate COGS (approximation using order values)
    const cogsQuery = `
      SELECT SUM(total_value) as cogs
      FROM sc_orders
      WHERE order_date BETWEEN ? AND ?
        AND status = 'Delivered'
        AND order_type = 'Sales Order'
    `;

    const cogsResult = this.db.prepare(cogsQuery).get(startDate, endDate) as any;
    const cogs = cogsResult.cogs || 0;

    // Calculate average inventory value
    const inventoryQuery = `
      SELECT AVG(total_inventory_value) as avg_inventory
      FROM (
        SELECT snapshot_date, SUM(inventory_value) as total_inventory_value
        FROM sc_inventory
        WHERE snapshot_date BETWEEN ? AND ?
        GROUP BY snapshot_date
      )
    `;

    const inventoryResult = this.db.prepare(inventoryQuery).get(startDate, endDate) as any;
    const avgInventory = inventoryResult.avg_inventory || 1;

    const inventoryTurnover = avgInventory > 0 ? cogs / avgInventory : 0;

    const benchmark = 10;
    let status: 'below' | 'at' | 'above';
    if (inventoryTurnover >= benchmark + 1) status = 'above';
    else if (inventoryTurnover >= benchmark - 1) status = 'at';
    else status = 'below';

    return {
      value: inventoryTurnover,
      displayValue: `${inventoryTurnover.toFixed(2)}x`,
      calculation: {
        formula: 'Inventory Turnover = Cost of Goods Sold / Average Inventory Value',
        components: {
          cogs: cogs,
          averageInventoryValue: avgInventory,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Calculate COGS (delivered sales orders): $${cogs.toFixed(2)}`,
          `2. Calculate average inventory value: $${avgInventory.toFixed(2)}`,
          `3. Calculate turnover: ${cogs.toFixed(2)} / ${avgInventory.toFixed(2)} = ${inventoryTurnover.toFixed(2)}x`,
          `4. Compare to benchmark: ${benchmark}x`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark}x (Higher is better for most industries)`
      }
    };
  }

  /**
   * KPI 4: Days Sales Outstanding (DSO)
   * Measures average days to collect payment
   * Industry benchmark: 30-45 days
   */
  calculateDSO(startDate: string, endDate: string): KPIResult {
    const query = `
      SELECT
        SUM(amount_outstanding) as total_ar,
        SUM(invoice_amount) as total_sales
      FROM sc_accounts_receivable
      WHERE invoice_date BETWEEN ? AND ?
    `;

    const result = this.db.prepare(query).get(startDate, endDate) as any;
    const totalAR = result.total_ar || 0;
    const totalSales = result.total_sales || 1;

    // Calculate days in period
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const dso = totalSales > 0 ? (totalAR / totalSales) * daysInPeriod : 0;

    const benchmark = 38;
    let status: 'below' | 'at' | 'above';
    if (dso <= benchmark - 5) status = 'above'; // Lower is better for DSO
    else if (dso <= benchmark + 5) status = 'at';
    else status = 'below';

    return {
      value: dso,
      displayValue: `${dso.toFixed(1)} days`,
      calculation: {
        formula: 'DSO = (Accounts Receivable / Total Credit Sales) × Days in Period',
        components: {
          accountsReceivable: totalAR,
          totalSales: totalSales,
          daysInPeriod: daysInPeriod,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Sum accounts receivable: $${totalAR.toFixed(2)}`,
          `2. Sum total credit sales: $${totalSales.toFixed(2)}`,
          `3. Calculate days in period: ${daysInPeriod} days`,
          `4. Calculate DSO: (${totalAR.toFixed(2)} / ${totalSales.toFixed(2)}) × ${daysInPeriod} = ${dso.toFixed(1)} days`,
          `5. Compare to benchmark: ${benchmark} days`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark} days (Lower is better)`
      }
    };
  }

  /**
   * KPI 5: Cash-to-Cash Cycle Time
   * Measures total time cash is tied up in operations
   * Industry benchmark: 30-60 days
   */
  calculateCashToCashCycle(startDate: string, endDate: string): KPIResult {
    // DIO (Days Inventory Outstanding)
    const inventoryQuery = `
      SELECT AVG(total_inventory_value) as avg_inventory
      FROM (
        SELECT snapshot_date, SUM(inventory_value) as total_inventory_value
        FROM sc_inventory
        WHERE snapshot_date BETWEEN ? AND ?
        GROUP BY snapshot_date
      )
    `;

    const inventoryResult = this.db.prepare(inventoryQuery).get(startDate, endDate) as any;
    const avgInventory = inventoryResult.avg_inventory || 0;

    const cogsQuery = `
      SELECT SUM(total_value) as cogs
      FROM sc_orders
      WHERE order_date BETWEEN ? AND ?
        AND status = 'Delivered'
        AND order_type = 'Sales Order'
    `;

    const cogsResult = this.db.prepare(cogsQuery).get(startDate, endDate) as any;
    const cogs = cogsResult.cogs || 1;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const dio = (avgInventory / cogs) * daysInPeriod;

    // DSO (from previous calculation)
    const arQuery = `
      SELECT
        SUM(amount_outstanding) as total_ar,
        SUM(invoice_amount) as total_sales
      FROM sc_accounts_receivable
      WHERE invoice_date BETWEEN ? AND ?
    `;

    const arResult = this.db.prepare(arQuery).get(startDate, endDate) as any;
    const totalAR = arResult.total_ar || 0;
    const totalSales = arResult.total_sales || 1;
    const dso = (totalAR / totalSales) * daysInPeriod;

    // DPO (Days Payable Outstanding) - approximation
    const poQuery = `
      SELECT AVG(lead_time_days) as avg_dpo
      FROM sc_purchase_orders
      WHERE po_date BETWEEN ? AND ?
    `;

    const poResult = this.db.prepare(poQuery).get(startDate, endDate) as any;
    const dpo = poResult.avg_dpo || 30;

    const cashToCashCycle = dio + dso - dpo;

    const benchmark = 45;
    let status: 'below' | 'at' | 'above';
    if (cashToCashCycle <= benchmark - 10) status = 'above'; // Lower is better
    else if (cashToCashCycle <= benchmark + 10) status = 'at';
    else status = 'below';

    return {
      value: cashToCashCycle,
      displayValue: `${cashToCashCycle.toFixed(1)} days`,
      calculation: {
        formula: 'Cash-to-Cash Cycle = DIO + DSO - DPO',
        components: {
          dio: dio,
          dso: dso,
          dpo: dpo,
          averageInventory: avgInventory,
          cogs: cogs,
          accountsReceivable: totalAR,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Calculate DIO (Days Inventory Outstanding): ${dio.toFixed(1)} days`,
          `2. Calculate DSO (Days Sales Outstanding): ${dso.toFixed(1)} days`,
          `3. Calculate DPO (Days Payable Outstanding): ${dpo.toFixed(1)} days`,
          `4. Calculate C2C: ${dio.toFixed(1)} + ${dso.toFixed(1)} - ${dpo.toFixed(1)} = ${cashToCashCycle.toFixed(1)} days`,
          `5. Compare to benchmark: ${benchmark} days`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark} days (Lower is better)`
      }
    };
  }

  /**
   * KPI 6: Supplier Lead Time
   * Measures average time from PO to delivery
   * Industry benchmark: 15-30 days (varies by industry)
   */
  calculateSupplierLeadTime(startDate: string, endDate: string): KPIResult {
    const query = `
      SELECT
        COUNT(*) as total_pos,
        AVG(lead_time_days) as avg_lead_time,
        MIN(lead_time_days) as min_lead_time,
        MAX(lead_time_days) as max_lead_time
      FROM sc_purchase_orders
      WHERE po_date BETWEEN ? AND ?
        AND delivery_date IS NOT NULL
    `;

    const result = this.db.prepare(query).get(startDate, endDate) as any;

    const avgLeadTime = result.avg_lead_time || 0;
    const totalPOs = result.total_pos || 0;

    const benchmark = 21;
    let status: 'below' | 'at' | 'above';
    if (avgLeadTime <= benchmark - 5) status = 'above'; // Lower is better
    else if (avgLeadTime <= benchmark + 5) status = 'at';
    else status = 'below';

    return {
      value: avgLeadTime,
      displayValue: `${avgLeadTime.toFixed(1)} days`,
      calculation: {
        formula: 'Supplier Lead Time = Average(Delivery Date - PO Date)',
        components: {
          totalPurchaseOrders: totalPOs,
          averageLeadTime: avgLeadTime,
          minLeadTime: result.min_lead_time || 0,
          maxLeadTime: result.max_lead_time || 0,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Count completed purchase orders: ${totalPOs}`,
          `2. Calculate average lead time: ${avgLeadTime.toFixed(1)} days`,
          `3. Lead time range: ${result.min_lead_time || 0} - ${result.max_lead_time || 0} days`,
          `4. Compare to benchmark: ${benchmark} days`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark} days (Lower is better for agility)`
      }
    };
  }

  /**
   * KPI 7: Freight Cost as % of Sales
   * Measures transportation efficiency
   * Industry benchmark: 3-6%
   */
  calculateFreightCostPercentage(startDate: string, endDate: string): KPIResult {
    const freightQuery = `
      SELECT SUM(freight_cost) as total_freight
      FROM sc_shipments
      WHERE ship_date BETWEEN ? AND ?
    `;

    const freightResult = this.db.prepare(freightQuery).get(startDate, endDate) as any;
    const totalFreight = freightResult.total_freight || 0;

    const salesQuery = `
      SELECT SUM(total_value) as total_sales
      FROM sc_orders
      WHERE order_date BETWEEN ? AND ?
        AND status = 'Delivered'
        AND order_type = 'Sales Order'
    `;

    const salesResult = this.db.prepare(salesQuery).get(startDate, endDate) as any;
    const totalSales = salesResult.total_sales || 1;

    const freightPercentage = (totalFreight / totalSales) * 100;

    const benchmark = 4.5;
    let status: 'below' | 'at' | 'above';
    if (freightPercentage <= benchmark - 0.5) status = 'above'; // Lower is better
    else if (freightPercentage <= benchmark + 0.5) status = 'at';
    else status = 'below';

    return {
      value: freightPercentage,
      displayValue: `${freightPercentage.toFixed(2)}%`,
      calculation: {
        formula: 'Freight Cost % = (Total Freight Cost / Total Sales) × 100',
        components: {
          totalFreightCost: totalFreight,
          totalSales: totalSales,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Sum total freight costs: $${totalFreight.toFixed(2)}`,
          `2. Sum total sales: $${totalSales.toFixed(2)}`,
          `3. Calculate percentage: (${totalFreight.toFixed(2)} / ${totalSales.toFixed(2)}) × 100 = ${freightPercentage.toFixed(2)}%`,
          `4. Compare to benchmark: ${benchmark}%`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark}% (Lower is better for cost efficiency)`
      }
    };
  }

  /**
   * KPI 8: Warehouse Capacity Utilization
   * Measures warehouse space efficiency
   * Industry benchmark: 80-85%
   */
  calculateWarehouseUtilization(startDate: string, endDate: string): KPIResult {
    const query = `
      SELECT
        SUM(total_capacity_sqm) as total_capacity,
        SUM(used_capacity_sqm) as total_used,
        COUNT(*) as warehouse_count,
        AVG(capacity_utilization_pct) as avg_utilization
      FROM sc_warehouses
    `;

    const result = this.db.prepare(query).get() as any;

    const totalCapacity = result.total_capacity || 1;
    const totalUsed = result.total_used || 0;
    const utilization = (totalUsed / totalCapacity) * 100;

    const benchmark = 82.5;
    let status: 'below' | 'at' | 'above';
    if (utilization >= benchmark - 2 && utilization <= 90) status = 'above'; // Sweet spot: not too low, not too high
    else if (utilization >= benchmark - 5 && utilization <= 95) status = 'at';
    else status = 'below';

    return {
      value: utilization,
      displayValue: `${utilization.toFixed(2)}%`,
      calculation: {
        formula: 'Warehouse Utilization = (Used Capacity / Total Capacity) × 100',
        components: {
          totalCapacitySqm: totalCapacity,
          usedCapacitySqm: totalUsed,
          warehouseCount: result.warehouse_count || 0,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Sum total warehouse capacity: ${totalCapacity.toFixed(2)} sqm`,
          `2. Sum used capacity: ${totalUsed.toFixed(2)} sqm`,
          `3. Calculate utilization: (${totalUsed.toFixed(2)} / ${totalCapacity.toFixed(2)}) × 100 = ${utilization.toFixed(2)}%`,
          `4. Compare to benchmark: ${benchmark}% (Target: 80-85%)`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark}% (Sweet spot: 80-85%, >90% risky)`
      }
    };
  }

  /**
   * KPI 9: Order Accuracy Rate
   * Measures percentage of orders delivered without errors
   * Industry benchmark: 95-98%
   */
  calculateOrderAccuracy(startDate: string, endDate: string): KPIResult {
    const query = `
      SELECT
        COUNT(*) as total_orders,
        SUM(accurate) as accurate_orders
      FROM sc_orders
      WHERE order_date BETWEEN ? AND ?
        AND status = 'Delivered'
        AND order_type = 'Sales Order'
    `;

    const result = this.db.prepare(query).get(startDate, endDate) as any;

    const totalOrders = result.total_orders || 0;
    const accurateOrders = result.accurate_orders || 0;
    const accuracyRate = totalOrders > 0 ? (accurateOrders / totalOrders) * 100 : 0;

    const benchmark = 96.5;
    let status: 'below' | 'at' | 'above';
    if (accuracyRate >= benchmark + 1) status = 'above';
    else if (accuracyRate >= benchmark - 1) status = 'at';
    else status = 'below';

    return {
      value: accuracyRate,
      displayValue: `${accuracyRate.toFixed(2)}%`,
      calculation: {
        formula: 'Order Accuracy = (Accurate Orders / Total Orders) × 100',
        components: {
          accurateOrders: accurateOrders,
          totalOrders: totalOrders,
          inaccurateOrders: totalOrders - accurateOrders,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Count total delivered orders: ${totalOrders}`,
          `2. Count accurate orders (no errors): ${accurateOrders}`,
          `3. Calculate accuracy: (${accurateOrders} / ${totalOrders}) × 100 = ${accuracyRate.toFixed(2)}%`,
          `4. Compare to benchmark: ${benchmark}%`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark}% (World-class: 98%+)`
      }
    };
  }

  /**
   * KPI 10: Supply Chain Cost as % of Revenue
   * Measures total supply chain cost efficiency
   * Industry benchmark: 5-8%
   */
  calculateSCCostPercentage(startDate: string, endDate: string): KPIResult {
    const costQuery = `
      SELECT SUM(amount) as total_sc_costs
      FROM sc_costs
      WHERE cost_date BETWEEN ? AND ?
    `;

    const costResult = this.db.prepare(costQuery).get(startDate, endDate) as any;
    const totalSCCosts = costResult.total_sc_costs || 0;

    const revenueQuery = `
      SELECT SUM(total_value) as total_revenue
      FROM sc_orders
      WHERE order_date BETWEEN ? AND ?
        AND status = 'Delivered'
        AND order_type = 'Sales Order'
    `;

    const revenueResult = this.db.prepare(revenueQuery).get(startDate, endDate) as any;
    const totalRevenue = revenueResult.total_revenue || 1;

    const scCostPercentage = (totalSCCosts / totalRevenue) * 100;

    const benchmark = 6.5;
    let status: 'below' | 'at' | 'above';
    if (scCostPercentage <= benchmark - 0.5) status = 'above'; // Lower is better
    else if (scCostPercentage <= benchmark + 0.5) status = 'at';
    else status = 'below';

    // Breakdown by category
    const breakdownQuery = `
      SELECT
        cost_category,
        SUM(amount) as category_total
      FROM sc_costs
      WHERE cost_date BETWEEN ? AND ?
      GROUP BY cost_category
      ORDER BY category_total DESC
    `;

    const breakdown = this.db.prepare(breakdownQuery).all(startDate, endDate) as any[];

    return {
      value: scCostPercentage,
      displayValue: `${scCostPercentage.toFixed(2)}%`,
      calculation: {
        formula: 'SC Cost % = (Total Supply Chain Costs / Total Revenue) × 100',
        components: {
          totalSCCosts: totalSCCosts,
          totalRevenue: totalRevenue,
          costBreakdown: breakdown.reduce((acc: any, item: any) => {
            acc[item.cost_category] = item.category_total;
            return acc;
          }, {}),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `1. Sum all supply chain costs: $${totalSCCosts.toFixed(2)}`,
          `2. Sum total revenue: $${totalRevenue.toFixed(2)}`,
          `3. Calculate percentage: (${totalSCCosts.toFixed(2)} / ${totalRevenue.toFixed(2)}) × 100 = ${scCostPercentage.toFixed(2)}%`,
          `4. Compare to benchmark: ${benchmark}%`,
          `5. Cost breakdown: ${breakdown.map((b: any) => `${b.cost_category}: $${b.category_total.toFixed(2)}`).join(', ')}`
        ]
      },
      benchmark: {
        value: benchmark,
        status: status,
        description: `Industry benchmark: ${benchmark}% (Lower is better for profitability)`
      }
    };
  }

  /**
   * Get all Supply Chain KPIs at once
   */
  getAllKPIs(startDate: string, endDate: string): any {
    return {
      perfectOrderRate: this.calculatePerfectOrderRate(startDate, endDate),
      otif: this.calculateOTIF(startDate, endDate),
      inventoryTurnover: this.calculateInventoryTurnover(startDate, endDate),
      dso: this.calculateDSO(startDate, endDate),
      cashToCashCycle: this.calculateCashToCashCycle(startDate, endDate),
      supplierLeadTime: this.calculateSupplierLeadTime(startDate, endDate),
      freightCostPct: this.calculateFreightCostPercentage(startDate, endDate),
      warehouseUtilization: this.calculateWarehouseUtilization(startDate, endDate),
      orderAccuracy: this.calculateOrderAccuracy(startDate, endDate),
      scCostPct: this.calculateSCCostPercentage(startDate, endDate)
    };
  }
}
