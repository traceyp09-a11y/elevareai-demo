/**
 * Finance Module Data Seeding Script
 *
 * Generates realistic financial data for Q1-Q4 2024:
 * - Income statements (quarterly)
 * - Balance sheets (monthly snapshots)
 * - Cash flow statements (quarterly)
 * - AR/AP aging
 * - Revenue streams
 * - Operating expenses
 * - Debt schedules
 * - Tax records
 */

import Database from 'better-sqlite3';
import path from 'path';

export function seedFinanceData(dbPath?: string): void {
  const finalPath = dbPath || path.join(__dirname, '../../database/elevareiq.db');
  const db = new Database(finalPath);

  console.log('🔄 Seeding Finance Module data...');

  try {
    // Helper function to generate random number in range
    const randomInRange = (min: number, max: number): number => {
      return Math.random() * (max - min) + min;
    };

    // Helper to format date
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    // Base financial metrics (annual)
    const annualRevenue = 50000000; // $50M annual revenue
    const quarterlyRevenue = annualRevenue / 4;

    // ===========================================
    // 1. INCOME STATEMENTS (Quarterly for 2024)
    // ===========================================
    console.log('  📊 Generating income statements...');

    const quarters = [
      { name: 'Q1', start: '2024-01-01', end: '2024-03-31' },
      { name: 'Q2', start: '2024-04-01', end: '2024-06-30' },
      { name: 'Q3', start: '2024-07-01', end: '2024-09-30' },
      { name: 'Q4', start: '2024-10-01', end: '2024-12-31' },
    ];

    const incomeStmt = db.prepare(`
      INSERT INTO fin_income_statement (
        period_start, period_end, revenue, cost_of_goods_sold, gross_profit,
        operating_expenses, operating_income, interest_expense, interest_income,
        tax_expense, net_income, ebitda, depreciation_amortization
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    quarters.forEach(q => {
      const revenue = quarterlyRevenue * randomInRange(0.95, 1.05);
      const cogs = revenue * randomInRange(0.55, 0.65); // 35-45% gross margin
      const grossProfit = revenue - cogs;
      const opex = revenue * randomInRange(0.25, 0.30); // 25-30% opex
      const da = revenue * 0.03; // 3% D&A
      const operatingIncome = grossProfit - opex;
      const interestExpense = revenue * 0.01;
      const interestIncome = revenue * 0.002;
      const ebitda = operatingIncome + da;
      const ebt = operatingIncome - interestExpense + interestIncome;
      const taxExpense = ebt * 0.25; // 25% tax rate
      const netIncome = ebt - taxExpense;

      incomeStmt.run(
        q.start,
        q.end,
        revenue,
        cogs,
        grossProfit,
        opex,
        operatingIncome,
        interestExpense,
        interestIncome,
        taxExpense,
        netIncome,
        ebitda,
        da
      );
    });

    // ===========================================
    // 2. BALANCE SHEETS (Monthly snapshots for 2024)
    // ===========================================
    console.log('  💰 Generating balance sheets...');

    const balanceStmt = db.prepare(`
      INSERT INTO fin_balance_sheet (
        snapshot_date, cash_and_equivalents, accounts_receivable, inventory,
        prepaid_expenses, current_assets, fixed_assets, accumulated_depreciation,
        intangible_assets, total_assets, accounts_payable, short_term_debt,
        accrued_expenses, current_liabilities, long_term_debt, total_liabilities,
        shareholders_equity, retained_earnings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let month = 0; month < 12; month++) {
      const date = new Date(2024, month, 28); // End of month
      const snapshotDate = formatDate(date);

      // Assets grow slightly over time
      const growthFactor = 1 + (month * 0.01);
      const cash = 5000000 * randomInRange(0.9, 1.1) * growthFactor;
      const ar = 4500000 * randomInRange(0.95, 1.05) * growthFactor;
      const inventory = 6000000 * randomInRange(0.9, 1.1) * growthFactor;
      const prepaid = 200000 * randomInRange(0.8, 1.2);
      const currentAssets = cash + ar + inventory + prepaid;
      const fixedAssets = 25000000 * growthFactor;
      const accumulatedDep = 8000000 + (month * 100000);
      const intangible = 2000000;
      const totalAssets = currentAssets + fixedAssets - accumulatedDep + intangible;

      // Liabilities
      const ap = 3000000 * randomInRange(0.9, 1.1);
      const shortTermDebt = 2000000;
      const accrued = 800000 * randomInRange(0.9, 1.1);
      const currentLiabilities = ap + shortTermDebt + accrued;
      const longTermDebt = 15000000;
      const totalLiabilities = currentLiabilities + longTermDebt;

      // Equity
      const equity = totalAssets - totalLiabilities;
      const retainedEarnings = equity * 0.7;

      balanceStmt.run(
        snapshotDate,
        cash,
        ar,
        inventory,
        prepaid,
        currentAssets,
        fixedAssets,
        accumulatedDep,
        intangible,
        totalAssets,
        ap,
        shortTermDebt,
        accrued,
        currentLiabilities,
        longTermDebt,
        totalLiabilities,
        equity,
        retainedEarnings
      );
    }

    // ===========================================
    // 3. CASH FLOW STATEMENTS (Quarterly)
    // ===========================================
    console.log('  💵 Generating cash flow statements...');

    const cashFlowStmt = db.prepare(`
      INSERT INTO fin_cash_flow (
        period_start, period_end, net_income, depreciation_amortization,
        changes_in_working_capital, operating_cash_flow, capex, asset_purchases,
        investing_cash_flow, debt_proceeds, debt_repayment, equity_issued,
        dividends_paid, financing_cash_flow, net_cash_flow, beginning_cash, ending_cash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let runningCash = 5000000;
    quarters.forEach(q => {
      const income = db
        .prepare('SELECT net_income FROM fin_income_statement WHERE period_start = ?')
        .get(q.start) as any;
      const netIncome = income.net_income;
      const da = quarterlyRevenue * 0.03;
      const wcChanges = randomInRange(-500000, 200000);
      const ocf = netIncome + da + wcChanges;
      const capex = -1000000;
      const assetPurchases = randomInRange(-200000, 0);
      const investingCF = capex + assetPurchases;
      const debtProceeds = 0;
      const debtRepayment = -500000;
      const equityIssued = 0;
      const dividends = -300000;
      const financingCF = debtProceeds + debtRepayment + equityIssued + dividends;
      const netCF = ocf + investingCF + financingCF;
      const beginningCash = runningCash;
      const endingCash = beginningCash + netCF;
      runningCash = endingCash;

      cashFlowStmt.run(
        q.start,
        q.end,
        netIncome,
        da,
        wcChanges,
        ocf,
        capex,
        assetPurchases,
        investingCF,
        debtProceeds,
        debtRepayment,
        equityIssued,
        dividends,
        financingCF,
        netCF,
        beginningCash,
        endingCash
      );
    });

    // ===========================================
    // 4. ACCOUNTS RECEIVABLE AGING
    // ===========================================
    console.log('  📋 Generating AR aging...');

    const arStmt = db.prepare(`
      INSERT INTO fin_ar_aging (
        invoice_number, customer_name, invoice_date, due_date, invoice_amount,
        amount_paid, amount_outstanding, days_outstanding, aging_bucket, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const customers = [
      'Acme Corp',
      'TechVision Inc',
      'Global Manufacturing',
      'Retail Solutions',
      'Enterprise Systems',
      'Innovation Labs',
      'Supply Co',
      'Digital Services',
    ];

    for (let i = 1; i <= 150; i++) {
      const invoiceDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      const today = new Date('2024-12-31');
      const daysOutstanding = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      const invoiceAmount = randomInRange(10000, 150000);
      const isPaid = Math.random() > 0.3;
      const amountPaid = isPaid ? invoiceAmount : invoiceAmount * randomInRange(0, 0.5);
      const amountOutstanding = invoiceAmount - amountPaid;

      let agingBucket = '0-30';
      if (daysOutstanding > 90) agingBucket = '90+';
      else if (daysOutstanding > 60) agingBucket = '61-90';
      else if (daysOutstanding > 30) agingBucket = '31-60';

      const status = amountOutstanding === 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Open';

      arStmt.run(
        `INV-2024-${String(i).padStart(5, '0')}`,
        customers[Math.floor(Math.random() * customers.length)],
        formatDate(invoiceDate),
        formatDate(dueDate),
        invoiceAmount,
        amountPaid,
        amountOutstanding,
        daysOutstanding,
        agingBucket,
        status
      );
    }

    // ===========================================
    // 5. ACCOUNTS PAYABLE
    // ===========================================
    console.log('  📄 Generating AP records...');

    const apStmt = db.prepare(`
      INSERT INTO fin_ap (
        invoice_number, vendor_name, invoice_date, due_date, invoice_amount,
        amount_paid, amount_outstanding, days_until_due, status, payment_terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const vendors = [
      'Supplier A',
      'Supplier B',
      'Office Supplies Co',
      'IT Services Inc',
      'Facility Management',
      'Logistics Partners',
    ];

    for (let i = 1; i <= 100; i++) {
      const invoiceDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const paymentTerms = Math.random() > 0.5 ? 'Net 30' : 'Net 60';
      const days = paymentTerms === 'Net 30' ? 30 : 60;
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + days);
      const today = new Date('2024-12-31');
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const invoiceAmount = randomInRange(5000, 100000);
      const isPaid = Math.random() > 0.4;
      const amountPaid = isPaid ? invoiceAmount : 0;
      const amountOutstanding = invoiceAmount - amountPaid;
      const status = amountOutstanding === 0 ? 'Paid' : 'Open';

      apStmt.run(
        `VINV-2024-${String(i).padStart(5, '0')}`,
        vendors[Math.floor(Math.random() * vendors.length)],
        formatDate(invoiceDate),
        formatDate(dueDate),
        invoiceAmount,
        amountPaid,
        amountOutstanding,
        daysUntilDue,
        status,
        paymentTerms
      );
    }

    // ===========================================
    // 6. REVENUE STREAMS
    // ===========================================
    console.log('  💼 Generating revenue streams...');

    const revenueStmt = db.prepare(`
      INSERT INTO fin_revenue_streams (
        period, product_category, product_name, revenue_amount,
        cost_amount, gross_margin, units_sold
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const productCategories = [
      { category: 'Products', products: ['Product A', 'Product B', 'Product C'] },
      { category: 'Services', products: ['Consulting', 'Maintenance', 'Support'] },
      { category: 'Subscriptions', products: ['Enterprise', 'Professional', 'Basic'] },
    ];

    quarters.forEach(q => {
      productCategories.forEach(cat => {
        cat.products.forEach(product => {
          const revenue = randomInRange(500000, 2500000);
          const costPct = cat.category === 'Services' ? 0.4 : cat.category === 'Subscriptions' ? 0.2 : 0.6;
          const cost = revenue * randomInRange(costPct * 0.9, costPct * 1.1);
          const margin = ((revenue - cost) / revenue) * 100;
          const units = Math.floor(randomInRange(100, 5000));

          revenueStmt.run(q.name, cat.category, product, revenue, cost, margin, units);
        });
      });
    });

    // ===========================================
    // 7. OPERATING EXPENSES
    // ===========================================
    console.log('  💸 Generating operating expenses...');

    const opexStmt = db.prepare(`
      INSERT INTO fin_operating_expenses (
        period, expense_category, expense_subcategory, amount, department, is_fixed_cost
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const expenseCategories = [
      { category: 'Salaries & Wages', subcategories: ['Engineering', 'Sales', 'Admin', 'Management'], fixed: true },
      { category: 'Marketing', subcategories: ['Digital Ads', 'Events', 'Content', 'PR'], fixed: false },
      { category: 'R&D', subcategories: ['Research', 'Prototyping', 'Testing'], fixed: false },
      { category: 'G&A', subcategories: ['Office Rent', 'Utilities', 'Insurance', 'Legal'], fixed: true },
      { category: 'IT & Software', subcategories: ['Licenses', 'Infrastructure', 'Support'], fixed: true },
    ];

    const departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR'];

    quarters.forEach(q => {
      expenseCategories.forEach(cat => {
        cat.subcategories.forEach(subcat => {
          const amount = randomInRange(50000, 500000);
          const dept = departments[Math.floor(Math.random() * departments.length)];

          opexStmt.run(q.name, cat.category, subcat, amount, dept, cat.fixed ? 1 : 0);
        });
      });
    });

    // ===========================================
    // 8. DEBT SCHEDULE
    // ===========================================
    console.log('  🏦 Generating debt schedule...');

    const debtStmt = db.prepare(`
      INSERT INTO fin_debt_schedule (
        loan_name, lender, loan_type, original_amount, current_balance,
        interest_rate, maturity_date, payment_frequency, is_current_liability
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const debts = [
      {
        name: 'Term Loan A',
        lender: 'First National Bank',
        type: 'Term Loan',
        original: 10000000,
        current: 7500000,
        rate: 5.5,
        maturity: '2027-12-31',
        frequency: 'Monthly',
        isCurrent: false,
      },
      {
        name: 'Revolver',
        lender: 'Regional Bank',
        type: 'Revolver',
        original: 5000000,
        current: 2000000,
        rate: 4.25,
        maturity: '2026-06-30',
        frequency: 'Monthly',
        isCurrent: true,
      },
      {
        name: 'Equipment Financing',
        lender: 'Equipment Finance Co',
        type: 'Term Loan',
        original: 3000000,
        current: 1800000,
        rate: 6.0,
        maturity: '2026-03-31',
        frequency: 'Quarterly',
        isCurrent: false,
      },
    ];

    debts.forEach(debt => {
      debtStmt.run(
        debt.name,
        debt.lender,
        debt.type,
        debt.original,
        debt.current,
        debt.rate,
        debt.maturity,
        debt.frequency,
        debt.isCurrent ? 1 : 0
      );
    });

    // ===========================================
    // 9. TAX RECORDS
    // ===========================================
    console.log('  📑 Generating tax records...');

    const taxStmt = db.prepare(`
      INSERT INTO fin_tax_records (
        tax_period, tax_type, taxable_amount, tax_rate, tax_amount,
        payment_due_date, payment_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    quarters.forEach(q => {
      // Income Tax
      const income = db
        .prepare('SELECT net_income FROM fin_income_statement WHERE period_start = ?')
        .get(q.start) as any;
      const taxableIncome = income.net_income * 1.25; // Reverse calculate from after-tax
      const incomeTax = taxableIncome * 0.25;
      const dueDate = new Date(q.end);
      dueDate.setDate(dueDate.getDate() + 45);
      const isPaid = new Date() > dueDate;

      taxStmt.run(
        q.name,
        'Income Tax',
        taxableIncome,
        25.0,
        incomeTax,
        formatDate(dueDate),
        isPaid ? formatDate(new Date(dueDate.getTime() - 86400000 * 5)) : null,
        isPaid ? 'Paid' : 'Pending'
      );
    });

    // ===========================================
    // 10. GENERAL LEDGER ENTRIES
    // ===========================================
    console.log('  📚 Generating general ledger entries...');

    const glStmt = db.prepare(`
      INSERT INTO fin_general_ledger (
        transaction_date, account_code, account_name, account_category,
        account_subcategory, debit_amount, credit_amount, description,
        reference_number, department
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Sample GL entries for each quarter
    quarters.forEach((q, qIndex) => {
      const qRevenue = quarterlyRevenue * randomInRange(0.95, 1.05);

      // Revenue entry
      glStmt.run(
        q.end,
        '4000',
        'Sales Revenue',
        'Revenue',
        'Product Sales',
        0,
        qRevenue,
        `${q.name} 2024 Revenue`,
        `REV-${q.name}-2024`,
        'Sales'
      );

      // AR entry
      glStmt.run(
        q.end,
        '1200',
        'Accounts Receivable',
        'Asset',
        'Current Assets',
        qRevenue,
        0,
        `${q.name} 2024 AR`,
        `AR-${q.name}-2024`,
        'Finance'
      );

      // COGS entry
      const cogs = qRevenue * 0.6;
      glStmt.run(
        q.end,
        '5000',
        'Cost of Goods Sold',
        'Expense',
        'Direct Costs',
        cogs,
        0,
        `${q.name} 2024 COGS`,
        `COGS-${q.name}-2024`,
        'Operations'
      );

      // Operating expense entry
      const opex = qRevenue * 0.28;
      glStmt.run(
        q.end,
        '6000',
        'Operating Expenses',
        'Expense',
        'Operating',
        opex,
        0,
        `${q.name} 2024 OpEx`,
        `OPEX-${q.name}-2024`,
        'Operations'
      );
    });

    console.log('✅ Finance Module data seeded successfully!');
    console.log('  - 4 Income Statements (Quarterly)');
    console.log('  - 12 Balance Sheet Snapshots (Monthly)');
    console.log('  - 4 Cash Flow Statements (Quarterly)');
    console.log('  - 150 AR Aging Records');
    console.log('  - 100 AP Records');
    console.log('  - 36 Revenue Stream Records');
    console.log('  - 80 Operating Expense Records');
    console.log('  - 3 Debt Schedule Records');
    console.log('  - 4 Tax Records');
    console.log('  - Sample GL Entries');
  } catch (error) {
    console.error('❌ Error seeding Finance data:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run if executed directly
if (require.main === module) {
  seedFinanceData();
}
