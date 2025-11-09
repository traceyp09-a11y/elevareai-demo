/**
 * Finance KPI Calculation Service
 *
 * Calculates 10 critical finance KPIs with full transparency:
 * 1. Gross Profit Margin
 * 2. Net Profit Margin
 * 3. Operating Cash Flow Ratio
 * 4. Current Ratio
 * 5. Quick Ratio
 * 6. Return on Assets (ROA)
 * 7. Return on Equity (ROE)
 * 8. Debt-to-Equity Ratio
 * 9. Working Capital Ratio
 * 10. EBITDA Margin
 */

import Database from 'better-sqlite3';
import path from 'path';

export interface KPIResult {
  kpiName: string;
  value: number;
  unit: string;
  formula: string;
  components: Record<string, number>;
  calculationSteps: string[];
  benchmark: number;
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  industryContext: string;
}

export class FinanceKPICalculationService {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.join(__dirname, '../../database/elevareiq.db');
    this.db = new Database(finalPath);
  }

  /**
   * Get all Finance KPIs for a specific period
   */
  getAllKPIs(startDate: string, endDate: string): Record<string, KPIResult> {
    return {
      grossProfitMargin: this.calculateGrossProfitMargin(startDate, endDate),
      netProfitMargin: this.calculateNetProfitMargin(startDate, endDate),
      operatingCashFlowRatio: this.calculateOperatingCashFlowRatio(startDate, endDate),
      currentRatio: this.calculateCurrentRatio(endDate),
      quickRatio: this.calculateQuickRatio(endDate),
      returnOnAssets: this.calculateReturnOnAssets(startDate, endDate, endDate),
      returnOnEquity: this.calculateReturnOnEquity(startDate, endDate, endDate),
      debtToEquityRatio: this.calculateDebtToEquityRatio(endDate),
      workingCapitalRatio: this.calculateWorkingCapitalRatio(endDate),
      ebitdaMargin: this.calculateEBITDAMargin(startDate, endDate),
    };
  }

  /**
   * KPI 1: Gross Profit Margin
   * Formula: (Revenue - COGS) / Revenue × 100
   * Benchmark: 40% (varies by industry)
   */
  calculateGrossProfitMargin(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        SUM(revenue) as total_revenue,
        SUM(cost_of_goods_sold) as total_cogs,
        SUM(gross_profit) as total_gross_profit
      FROM fin_income_statement
      WHERE period_start >= ? AND period_end <= ?
    `);

    const result = stmt.get(startDate, endDate) as any;
    const revenue = result.total_revenue || 0;
    const cogs = result.total_cogs || 0;
    const grossProfit = result.total_gross_profit || 0;

    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const benchmark = 40;

    return {
      kpiName: 'Gross Profit Margin',
      value: parseFloat(margin.toFixed(2)),
      unit: '%',
      formula: '(Revenue - COGS) / Revenue × 100',
      components: {
        revenue,
        cogs,
        grossProfit,
      },
      calculationSteps: [
        `1. Total Revenue: $${revenue.toLocaleString()}`,
        `2. Cost of Goods Sold: $${cogs.toLocaleString()}`,
        `3. Gross Profit: $${grossProfit.toLocaleString()}`,
        `4. Gross Profit Margin: ${margin.toFixed(2)}%`,
      ],
      benchmark,
      status: this.getMarginStatus(margin, benchmark),
      industryContext: 'Manufacturing: 25-35%, Software: 70-85%, Retail: 20-40%',
    };
  }

  /**
   * KPI 2: Net Profit Margin
   * Formula: Net Income / Revenue × 100
   * Benchmark: 10% (healthy margin)
   */
  calculateNetProfitMargin(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        SUM(revenue) as total_revenue,
        SUM(net_income) as total_net_income,
        SUM(operating_expenses) as total_opex,
        SUM(tax_expense) as total_tax
      FROM fin_income_statement
      WHERE period_start >= ? AND period_end <= ?
    `);

    const result = stmt.get(startDate, endDate) as any;
    const revenue = result.total_revenue || 0;
    const netIncome = result.total_net_income || 0;

    const margin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
    const benchmark = 10;

    return {
      kpiName: 'Net Profit Margin',
      value: parseFloat(margin.toFixed(2)),
      unit: '%',
      formula: 'Net Income / Revenue × 100',
      components: {
        revenue,
        netIncome,
        operatingExpenses: result.total_opex || 0,
        taxExpense: result.total_tax || 0,
      },
      calculationSteps: [
        `1. Total Revenue: $${revenue.toLocaleString()}`,
        `2. Net Income: $${netIncome.toLocaleString()}`,
        `3. Net Profit Margin: ${margin.toFixed(2)}%`,
      ],
      benchmark,
      status: this.getMarginStatus(margin, benchmark),
      industryContext: 'Average: 8-10%, Excellent: 15%+, Poor: <5%',
    };
  }

  /**
   * KPI 3: Operating Cash Flow Ratio
   * Formula: Operating Cash Flow / Current Liabilities
   * Benchmark: 1.0 (able to cover short-term obligations)
   */
  calculateOperatingCashFlowRatio(startDate: string, endDate: string): KPIResult {
    const cfStmt = this.db.prepare(`
      SELECT SUM(operating_cash_flow) as total_ocf
      FROM fin_cash_flow
      WHERE period_start >= ? AND period_end <= ?
    `);

    const bsStmt = this.db.prepare(`
      SELECT current_liabilities
      FROM fin_balance_sheet
      WHERE snapshot_date = ?
      ORDER BY snapshot_date DESC
      LIMIT 1
    `);

    const cfResult = cfStmt.get(startDate, endDate) as any;
    const bsResult = bsStmt.get(endDate) as any;

    const operatingCashFlow = cfResult?.total_ocf || 0;
    const currentLiabilities = bsResult?.current_liabilities || 1;

    const ratio = operatingCashFlow / currentLiabilities;
    const benchmark = 1.0;

    return {
      kpiName: 'Operating Cash Flow Ratio',
      value: parseFloat(ratio.toFixed(2)),
      unit: 'ratio',
      formula: 'Operating Cash Flow / Current Liabilities',
      components: {
        operatingCashFlow,
        currentLiabilities,
      },
      calculationSteps: [
        `1. Operating Cash Flow: $${operatingCashFlow.toLocaleString()}`,
        `2. Current Liabilities: $${currentLiabilities.toLocaleString()}`,
        `3. OCF Ratio: ${ratio.toFixed(2)}`,
      ],
      benchmark,
      status: this.getRatioStatus(ratio, benchmark, 'higher'),
      industryContext: '>1.0 = Strong liquidity, <0.5 = Cash flow concerns',
    };
  }

  /**
   * KPI 4: Current Ratio
   * Formula: Current Assets / Current Liabilities
   * Benchmark: 2.0 (comfortable liquidity cushion)
   */
  calculateCurrentRatio(snapshotDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        current_assets,
        current_liabilities
      FROM fin_balance_sheet
      WHERE snapshot_date = ?
      ORDER BY snapshot_date DESC
      LIMIT 1
    `);

    const result = stmt.get(snapshotDate) as any;
    const currentAssets = result?.current_assets || 0;
    const currentLiabilities = result?.current_liabilities || 1;

    const ratio = currentAssets / currentLiabilities;
    const benchmark = 2.0;

    return {
      kpiName: 'Current Ratio',
      value: parseFloat(ratio.toFixed(2)),
      unit: 'ratio',
      formula: 'Current Assets / Current Liabilities',
      components: {
        currentAssets,
        currentLiabilities,
      },
      calculationSteps: [
        `1. Current Assets: $${currentAssets.toLocaleString()}`,
        `2. Current Liabilities: $${currentLiabilities.toLocaleString()}`,
        `3. Current Ratio: ${ratio.toFixed(2)}`,
      ],
      benchmark,
      status: this.getRatioStatus(ratio, benchmark, 'higher'),
      industryContext: '>2.0 = Strong liquidity, 1.5-2.0 = Good, <1.0 = Liquidity risk',
    };
  }

  /**
   * KPI 5: Quick Ratio (Acid Test)
   * Formula: (Current Assets - Inventory) / Current Liabilities
   * Benchmark: 1.0 (can cover liabilities without selling inventory)
   */
  calculateQuickRatio(snapshotDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        current_assets,
        inventory,
        current_liabilities
      FROM fin_balance_sheet
      WHERE snapshot_date = ?
      ORDER BY snapshot_date DESC
      LIMIT 1
    `);

    const result = stmt.get(snapshotDate) as any;
    const currentAssets = result?.current_assets || 0;
    const inventory = result?.inventory || 0;
    const currentLiabilities = result?.current_liabilities || 1;

    const quickAssets = currentAssets - inventory;
    const ratio = quickAssets / currentLiabilities;
    const benchmark = 1.0;

    return {
      kpiName: 'Quick Ratio',
      value: parseFloat(ratio.toFixed(2)),
      unit: 'ratio',
      formula: '(Current Assets - Inventory) / Current Liabilities',
      components: {
        currentAssets,
        inventory,
        quickAssets,
        currentLiabilities,
      },
      calculationSteps: [
        `1. Current Assets: $${currentAssets.toLocaleString()}`,
        `2. Inventory: $${inventory.toLocaleString()}`,
        `3. Quick Assets: $${quickAssets.toLocaleString()}`,
        `4. Current Liabilities: $${currentLiabilities.toLocaleString()}`,
        `5. Quick Ratio: ${ratio.toFixed(2)}`,
      ],
      benchmark,
      status: this.getRatioStatus(ratio, benchmark, 'higher'),
      industryContext: '>1.0 = Can meet short-term obligations, <1.0 = May need to sell inventory',
    };
  }

  /**
   * KPI 6: Return on Assets (ROA)
   * Formula: Net Income / Total Assets × 100
   * Benchmark: 5% (efficient use of assets)
   */
  calculateReturnOnAssets(startDate: string, endDate: string, snapshotDate: string): KPIResult {
    const incomeStmt = this.db.prepare(`
      SELECT SUM(net_income) as total_net_income
      FROM fin_income_statement
      WHERE period_start >= ? AND period_end <= ?
    `);

    const balanceStmt = this.db.prepare(`
      SELECT total_assets
      FROM fin_balance_sheet
      WHERE snapshot_date = ?
      ORDER BY snapshot_date DESC
      LIMIT 1
    `);

    const incomeResult = incomeStmt.get(startDate, endDate) as any;
    const balanceResult = balanceStmt.get(snapshotDate) as any;

    const netIncome = incomeResult?.total_net_income || 0;
    const totalAssets = balanceResult?.total_assets || 1;

    const roa = (netIncome / totalAssets) * 100;
    const benchmark = 5;

    return {
      kpiName: 'Return on Assets (ROA)',
      value: parseFloat(roa.toFixed(2)),
      unit: '%',
      formula: 'Net Income / Total Assets × 100',
      components: {
        netIncome,
        totalAssets,
      },
      calculationSteps: [
        `1. Net Income: $${netIncome.toLocaleString()}`,
        `2. Total Assets: $${totalAssets.toLocaleString()}`,
        `3. ROA: ${roa.toFixed(2)}%`,
      ],
      benchmark,
      status: this.getMarginStatus(roa, benchmark),
      industryContext: 'Asset-heavy: 2-3%, Asset-light: 10%+, Average: 5%',
    };
  }

  /**
   * KPI 7: Return on Equity (ROE)
   * Formula: Net Income / Shareholders' Equity × 100
   * Benchmark: 15% (strong return to shareholders)
   */
  calculateReturnOnEquity(startDate: string, endDate: string, snapshotDate: string): KPIResult {
    const incomeStmt = this.db.prepare(`
      SELECT SUM(net_income) as total_net_income
      FROM fin_income_statement
      WHERE period_start >= ? AND period_end <= ?
    `);

    const balanceStmt = this.db.prepare(`
      SELECT shareholders_equity
      FROM fin_balance_sheet
      WHERE snapshot_date = ?
      ORDER BY snapshot_date DESC
      LIMIT 1
    `);

    const incomeResult = incomeStmt.get(startDate, endDate) as any;
    const balanceResult = balanceStmt.get(snapshotDate) as any;

    const netIncome = incomeResult?.total_net_income || 0;
    const equity = balanceResult?.shareholders_equity || 1;

    const roe = (netIncome / equity) * 100;
    const benchmark = 15;

    return {
      kpiName: 'Return on Equity (ROE)',
      value: parseFloat(roe.toFixed(2)),
      unit: '%',
      formula: 'Net Income / Shareholders\' Equity × 100',
      components: {
        netIncome,
        shareholdersEquity: equity,
      },
      calculationSteps: [
        `1. Net Income: $${netIncome.toLocaleString()}`,
        `2. Shareholders' Equity: $${equity.toLocaleString()}`,
        `3. ROE: ${roe.toFixed(2)}%`,
      ],
      benchmark,
      status: this.getMarginStatus(roe, benchmark),
      industryContext: '>20% = Excellent, 15-20% = Good, 10-15% = Average, <10% = Poor',
    };
  }

  /**
   * KPI 8: Debt-to-Equity Ratio
   * Formula: Total Liabilities / Shareholders' Equity
   * Benchmark: 1.5 (moderate leverage)
   */
  calculateDebtToEquityRatio(snapshotDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        total_liabilities,
        shareholders_equity
      FROM fin_balance_sheet
      WHERE snapshot_date = ?
      ORDER BY snapshot_date DESC
      LIMIT 1
    `);

    const result = stmt.get(snapshotDate) as any;
    const totalLiabilities = result?.total_liabilities || 0;
    const equity = result?.shareholders_equity || 1;

    const ratio = totalLiabilities / equity;
    const benchmark = 1.5;

    return {
      kpiName: 'Debt-to-Equity Ratio',
      value: parseFloat(ratio.toFixed(2)),
      unit: 'ratio',
      formula: 'Total Liabilities / Shareholders\' Equity',
      components: {
        totalLiabilities,
        shareholdersEquity: equity,
      },
      calculationSteps: [
        `1. Total Liabilities: $${totalLiabilities.toLocaleString()}`,
        `2. Shareholders' Equity: $${equity.toLocaleString()}`,
        `3. Debt-to-Equity Ratio: ${ratio.toFixed(2)}`,
      ],
      benchmark,
      status: this.getRatioStatus(ratio, benchmark, 'lower'),
      industryContext: '<1.0 = Conservative, 1.0-2.0 = Moderate, >2.0 = Aggressive leverage',
    };
  }

  /**
   * KPI 9: Working Capital Ratio
   * Formula: (Current Assets - Current Liabilities) / Total Assets × 100
   * Benchmark: 15% (adequate working capital)
   */
  calculateWorkingCapitalRatio(snapshotDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        current_assets,
        current_liabilities,
        total_assets
      FROM fin_balance_sheet
      WHERE snapshot_date = ?
      ORDER BY snapshot_date DESC
      LIMIT 1
    `);

    const result = stmt.get(snapshotDate) as any;
    const currentAssets = result?.current_assets || 0;
    const currentLiabilities = result?.current_liabilities || 0;
    const totalAssets = result?.total_assets || 1;

    const workingCapital = currentAssets - currentLiabilities;
    const ratio = (workingCapital / totalAssets) * 100;
    const benchmark = 15;

    return {
      kpiName: 'Working Capital Ratio',
      value: parseFloat(ratio.toFixed(2)),
      unit: '%',
      formula: '(Current Assets - Current Liabilities) / Total Assets × 100',
      components: {
        currentAssets,
        currentLiabilities,
        workingCapital,
        totalAssets,
      },
      calculationSteps: [
        `1. Current Assets: $${currentAssets.toLocaleString()}`,
        `2. Current Liabilities: $${currentLiabilities.toLocaleString()}`,
        `3. Working Capital: $${workingCapital.toLocaleString()}`,
        `4. Total Assets: $${totalAssets.toLocaleString()}`,
        `5. Working Capital Ratio: ${ratio.toFixed(2)}%`,
      ],
      benchmark,
      status: this.getMarginStatus(ratio, benchmark),
      industryContext: '>15% = Strong, 10-15% = Adequate, <10% = Tight working capital',
    };
  }

  /**
   * KPI 10: EBITDA Margin
   * Formula: EBITDA / Revenue × 100
   * Benchmark: 20% (strong operating performance)
   */
  calculateEBITDAMargin(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        SUM(revenue) as total_revenue,
        SUM(ebitda) as total_ebitda,
        SUM(operating_income) as total_operating_income,
        SUM(depreciation_amortization) as total_da
      FROM fin_income_statement
      WHERE period_start >= ? AND period_end <= ?
    `);

    const result = stmt.get(startDate, endDate) as any;
    const revenue = result.total_revenue || 0;
    const ebitda = result.total_ebitda || 0;

    const margin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
    const benchmark = 20;

    return {
      kpiName: 'EBITDA Margin',
      value: parseFloat(margin.toFixed(2)),
      unit: '%',
      formula: 'EBITDA / Revenue × 100',
      components: {
        revenue,
        ebitda,
        operatingIncome: result.total_operating_income || 0,
        depreciationAmortization: result.total_da || 0,
      },
      calculationSteps: [
        `1. Total Revenue: $${revenue.toLocaleString()}`,
        `2. EBITDA: $${ebitda.toLocaleString()}`,
        `3. EBITDA Margin: ${margin.toFixed(2)}%`,
      ],
      benchmark,
      status: this.getMarginStatus(margin, benchmark),
      industryContext: '>25% = Excellent, 15-25% = Good, 10-15% = Fair, <10% = Poor',
    };
  }

  /**
   * Helper: Determine status for margin/percentage KPIs
   */
  private getMarginStatus(
    value: number,
    benchmark: number
  ): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value >= benchmark * 1.1) return 'Excellent';
    if (value >= benchmark) return 'Good';
    if (value >= benchmark * 0.8) return 'Warning';
    return 'Critical';
  }

  /**
   * Helper: Determine status for ratio KPIs
   */
  private getRatioStatus(
    value: number,
    benchmark: number,
    direction: 'higher' | 'lower'
  ): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (direction === 'higher') {
      if (value >= benchmark * 1.1) return 'Excellent';
      if (value >= benchmark) return 'Good';
      if (value >= benchmark * 0.8) return 'Warning';
      return 'Critical';
    } else {
      if (value <= benchmark * 0.9) return 'Excellent';
      if (value <= benchmark) return 'Good';
      if (value <= benchmark * 1.2) return 'Warning';
      return 'Critical';
    }
  }

  close(): void {
    this.db.close();
  }
}
