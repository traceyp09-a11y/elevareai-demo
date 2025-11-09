import Database from 'better-sqlite3';

export function seedSalesData(dbPath: string) {
  const db = new Database(dbPath);

  console.log('🔄 Seeding Sales & Revenue Module data...');

  // Helper function to generate random date within range
  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
      .toISOString().split('T')[0];
  };

  // Helper to add days to date
  const addDays = (date: string, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  try {
    // 1. Seed Sales Reps (12 reps)
    console.log('  👥 Generating sales reps...');
    const reps = [
      { rep_id: 'REP-001', name: 'Sarah Chen', email: 'sarah.chen@company.com', territory: 'West', role: 'Sales Manager', hire_date: '2022-03-15', quota_annual: 3000000, is_active: 1 },
      { rep_id: 'REP-002', name: 'Michael Torres', email: 'michael.torres@company.com', territory: 'East', role: 'Senior AE', hire_date: '2021-06-20', quota_annual: 2500000, is_active: 1 },
      { rep_id: 'REP-003', name: 'Jessica Wu', email: 'jessica.wu@company.com', territory: 'Central', role: 'Account Executive', hire_date: '2023-01-10', quota_annual: 2000000, is_active: 1 },
      { rep_id: 'REP-004', name: 'David Rodriguez', email: 'david.rodriguez@company.com', territory: 'West', role: 'Account Executive', hire_date: '2022-09-05', quota_annual: 2000000, is_active: 1 },
      { rep_id: 'REP-005', name: 'Emily Johnson', email: 'emily.johnson@company.com', territory: 'East', role: 'Account Executive', hire_date: '2023-03-22', quota_annual: 2000000, is_active: 1 },
      { rep_id: 'REP-006', name: 'Ryan Martinez', email: 'ryan.martinez@company.com', territory: 'Central', role: 'Account Executive', hire_date: '2022-11-14', quota_annual: 2000000, is_active: 1 },
      { rep_id: 'REP-007', name: 'Amanda Taylor', email: 'amanda.taylor@company.com', territory: 'West', role: 'SDR', hire_date: '2023-07-01', quota_annual: 800000, is_active: 1 },
      { rep_id: 'REP-008', name: 'Chris Anderson', email: 'chris.anderson@company.com', territory: 'East', role: 'SDR', hire_date: '2023-08-15', quota_annual: 800000, is_active: 1 },
      { rep_id: 'REP-009', name: 'Lauren Kim', email: 'lauren.kim@company.com', territory: 'Central', role: 'SDR', hire_date: '2024-01-05', quota_annual: 800000, is_active: 1 },
      { rep_id: 'REP-010', name: 'James Wilson', email: 'james.wilson@company.com', territory: 'West', role: 'Senior AE', hire_date: '2020-04-12', quota_annual: 2500000, is_active: 1 },
      { rep_id: 'REP-011', name: 'Maria Garcia', email: 'maria.garcia@company.com', territory: 'East', role: 'Account Executive', hire_date: '2023-05-20', quota_annual: 2000000, is_active: 1 },
      { rep_id: 'REP-012', name: 'Kevin Brown', email: 'kevin.brown@company.com', territory: 'Central', role: 'VP Sales', hire_date: '2019-01-15', quota_annual: 4000000, is_active: 1 }
    ];

    const insertRep = db.prepare(`
      INSERT INTO sales_reps (rep_id, name, email, territory, role, hire_date, quota_annual, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    reps.forEach(rep => insertRep.run(Object.values(rep)));

    // 2. Seed Sales Opportunities (100 opportunities across various stages)
    console.log('  💼 Generating sales opportunities...');
    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const leadSources = ['Inbound', 'Outbound', 'Referral', 'Marketing', 'Partner'];
    const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education'];

    const insertOpportunity = db.prepare(`
      INSERT INTO sales_opportunities (opportunity_id, opportunity_name, account_name, rep_id, stage, probability, amount, expected_close_date, created_date, last_activity_date, lead_source, industry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i <= 100; i++) {
      const repId = reps[Math.floor(Math.random() * reps.length)].rep_id;
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const probability = stage === 'Closed Won' ? 100 : stage === 'Closed Lost' ? 0 :
                         stage === 'Negotiation' ? 70 : stage === 'Proposal' ? 50 :
                         stage === 'Qualification' ? 30 : 10;

      const amount = Math.floor(Math.random() * 150000) + 20000; // $20k - $170k
      const createdDate = randomDate(new Date('2024-07-01'), new Date('2024-11-30'));
      const daysToClose = stage.includes('Closed') ? Math.floor(Math.random() * 60) + 20 : Math.floor(Math.random() * 30) + 30;
      const expectedCloseDate = addDays(createdDate, daysToClose);
      const lastActivityDate = stage.includes('Closed') ? expectedCloseDate : randomDate(new Date(createdDate), new Date('2024-12-15'));

      insertOpportunity.run(
        `OPP-${String(i).padStart(4, '0')}`,
        `Deal with ${['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Enterprise Co'][Math.floor(Math.random() * 5)]}`,
        `Account-${String(i).padStart(3, '0')}`,
        repId,
        stage,
        probability,
        amount,
        expectedCloseDate,
        createdDate,
        lastActivityDate,
        leadSources[Math.floor(Math.random() * leadSources.length)],
        industries[Math.floor(Math.random() * industries.length)]
      );
    }

    // 3. Seed Closed Deals (40 deals from Closed Won opportunities)
    console.log('  💰 Generating closed deals...');
    const closedWonOpps = db.prepare(`
      SELECT opportunity_id, rep_id, account_name, amount, last_activity_date
      FROM sales_opportunities
      WHERE stage = 'Closed Won'
    `).all() as Array<{ opportunity_id: string, rep_id: string, account_name: string, amount: number, last_activity_date: string }>;

    const dealTypes = ['New Business', 'Upsell', 'Renewal', 'Cross-sell'];
    const paymentTerms = ['Annual', 'Monthly', 'Quarterly'];

    const insertDeal = db.prepare(`
      INSERT INTO sales_deals (deal_id, opportunity_id, rep_id, account_name, deal_value, close_date, contract_term_months, deal_type, payment_terms, mrr, arr)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    closedWonOpps.forEach((opp, idx) => {
      const contractTermMonths = [12, 24, 36][Math.floor(Math.random() * 3)];
      const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];
      const paymentTerm = paymentTerms[Math.floor(Math.random() * paymentTerms.length)];
      const arr = opp.amount;
      const mrr = arr / 12;

      insertDeal.run(
        `DEAL-${String(idx + 1).padStart(4, '0')}`,
        opp.opportunity_id,
        opp.rep_id,
        opp.account_name,
        opp.amount,
        opp.last_activity_date,
        contractTermMonths,
        dealType,
        paymentTerm,
        mrr,
        arr
      );
    });

    // 4. Seed Sales Quotas (Q4 2024)
    console.log('  🎯 Generating sales quotas...');
    const insertQuota = db.prepare(`
      INSERT INTO sales_quotas (rep_id, quarter, quota_amount, quota_type)
      VALUES (?, ?, ?, ?)
    `);

    reps.forEach(rep => {
      const quarterlyQuota = rep.quota_annual / 4;
      insertQuota.run(rep.rep_id, 'Q4 2024', quarterlyQuota, 'Revenue');
    });

    // 5. Seed Sales Forecasts (Oct, Nov, Dec 2024)
    console.log('  📊 Generating sales forecasts...');
    const months = ['2024-10', '2024-11', '2024-12'];
    const forecastCategories = ['Commit', 'Best Case', 'Pipeline'];

    const insertForecast = db.prepare(`
      INSERT INTO sales_forecasts (rep_id, forecast_period, forecast_amount, forecast_category, submitted_date)
      VALUES (?, ?, ?, ?, ?)
    `);

    reps.forEach(rep => {
      months.forEach(month => {
        const baseAmount = rep.quota_annual / 12;
        insertForecast.run(rep.rep_id, month, baseAmount * 0.85, 'Commit', `${month}-01`);
        insertForecast.run(rep.rep_id, month, baseAmount * 1.05, 'Best Case', `${month}-01`);
        insertForecast.run(rep.rep_id, month, baseAmount * 1.25, 'Pipeline', `${month}-01`);
      });
    });

    // 6. Seed Sales Activities (500 activities)
    console.log('  📞 Generating sales activities...');
    const activityTypes = ['Call', 'Meeting', 'Email', 'Demo'];
    const outcomes = ['Completed', 'No Show', 'Rescheduled'];

    const insertActivity = db.prepare(`
      INSERT INTO sales_activities (rep_id, opportunity_id, activity_type, activity_date, duration_minutes, outcome)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const allOpportunities = db.prepare('SELECT opportunity_id FROM sales_opportunities').all() as Array<{ opportunity_id: string }>;

    for (let i = 0; i < 500; i++) {
      const repId = reps[Math.floor(Math.random() * reps.length)].rep_id;
      const opportunityId = allOpportunities[Math.floor(Math.random() * allOpportunities.length)].opportunity_id;
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const activityDate = randomDate(new Date('2024-10-01'), new Date('2024-12-15'));
      const duration = activityType === 'Demo' ? 60 : activityType === 'Meeting' ? 45 : activityType === 'Call' ? 30 : 5;
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

      insertActivity.run(repId, opportunityId, activityType, activityDate, duration, outcome);
    }

    // 7. Seed Leads (200 leads)
    console.log('  🎣 Generating leads...');
    const leadStatuses = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'];
    const companySizes = ['SMB', 'Mid-Market', 'Enterprise'];

    const insertLead = db.prepare(`
      INSERT INTO sales_leads (lead_id, lead_source, lead_status, created_date, converted_date, converted_to_opportunity_id, assigned_rep_id, industry, company_size, estimated_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i <= 200; i++) {
      const leadStatus = leadStatuses[Math.floor(Math.random() * leadStatuses.length)];
      const createdDate = randomDate(new Date('2024-08-01'), new Date('2024-12-01'));
      const convertedDate = leadStatus === 'Converted' ? addDays(createdDate, Math.floor(Math.random() * 30) + 5) : null;
      const convertedToOppId = leadStatus === 'Converted' && i <= 50 ? allOpportunities[i - 1].opportunity_id : null;
      const assignedRepId = reps[Math.floor(Math.random() * reps.length)].rep_id;
      const estimatedValue = Math.floor(Math.random() * 100000) + 15000;

      insertLead.run(
        `LEAD-${String(i).padStart(4, '0')}`,
        leadSources[Math.floor(Math.random() * leadSources.length)],
        leadStatus,
        createdDate,
        convertedDate,
        convertedToOppId,
        assignedRepId,
        industries[Math.floor(Math.random() * industries.length)],
        companySizes[Math.floor(Math.random() * companySizes.length)],
        estimatedValue
      );
    }

    // 8. Seed Marketing Campaigns (8 campaigns)
    console.log('  📢 Generating marketing campaigns...');
    const campaigns = [
      { campaign_id: 'CAMP-001', campaign_name: 'Q4 Product Launch Webinar', campaign_type: 'Webinar', start_date: '2024-10-01', end_date: '2024-10-31', budget: 25000, leads_generated: 45, opportunities_created: 12, pipeline_value: 480000, revenue_attributed: 120000 },
      { campaign_id: 'CAMP-002', campaign_name: 'Enterprise Email Campaign', campaign_type: 'Email', start_date: '2024-10-15', end_date: '2024-11-15', budget: 15000, leads_generated: 62, opportunities_created: 18, pipeline_value: 720000, revenue_attributed: 180000 },
      { campaign_id: 'CAMP-003', campaign_name: 'Industry Trade Show', campaign_type: 'Event', start_date: '2024-11-05', end_date: '2024-11-07', budget: 75000, leads_generated: 38, opportunities_created: 15, pipeline_value: 900000, revenue_attributed: 225000 },
      { campaign_id: 'CAMP-004', campaign_name: 'LinkedIn Paid Ads - Tech Decision Makers', campaign_type: 'Paid Ads', start_date: '2024-10-01', end_date: '2024-12-31', budget: 40000, leads_generated: 88, opportunities_created: 22, pipeline_value: 660000, revenue_attributed: 165000 },
      { campaign_id: 'CAMP-005', campaign_name: 'Content Marketing - ROI Calculator', campaign_type: 'Content', start_date: '2024-09-15', end_date: '2024-12-31', budget: 20000, leads_generated: 125, opportunities_created: 28, pipeline_value: 840000, revenue_attributed: 210000 },
      { campaign_id: 'CAMP-006', campaign_name: 'Customer Referral Program', campaign_type: 'Referral', start_date: '2024-10-01', end_date: '2024-12-31', budget: 30000, leads_generated: 34, opportunities_created: 20, pipeline_value: 1200000, revenue_attributed: 400000 },
      { campaign_id: 'CAMP-007', campaign_name: 'Google Search Ads - High Intent Keywords', campaign_type: 'Paid Ads', start_date: '2024-10-01', end_date: '2024-12-31', budget: 50000, leads_generated: 72, opportunities_created: 19, pipeline_value: 570000, revenue_attributed: 142500 },
      { campaign_id: 'CAMP-008', campaign_name: 'Partner Co-Marketing Initiative', campaign_type: 'Partner', start_date: '2024-11-01', end_date: '2024-12-31', budget: 35000, leads_generated: 41, opportunities_created: 14, pipeline_value: 560000, revenue_attributed: 140000 }
    ];

    const insertCampaign = db.prepare(`
      INSERT INTO marketing_campaigns (campaign_id, campaign_name, campaign_type, start_date, end_date, budget, leads_generated, opportunities_created, pipeline_value, revenue_attributed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    campaigns.forEach(campaign => insertCampaign.run(Object.values(campaign)));

    // 9. Seed Revenue Bookings
    console.log('  💵 Generating revenue bookings...');
    const dealsForBookings = db.prepare(`
      SELECT deal_id, close_date, deal_value, contract_term_months
      FROM sales_deals
    `).all() as Array<{ deal_id: string, close_date: string, deal_value: number, contract_term_months: number }>;

    const insertBooking = db.prepare(`
      INSERT INTO revenue_bookings (deal_id, booking_date, booking_amount, revenue_type, recognition_start_date, recognition_end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    dealsForBookings.forEach(deal => {
      const revenueType = ['New', 'Expansion', 'Renewal'][Math.floor(Math.random() * 3)];
      const recognitionEndDate = addDays(deal.close_date, deal.contract_term_months * 30);

      insertBooking.run(
        deal.deal_id,
        deal.close_date,
        deal.deal_value,
        revenueType,
        deal.close_date,
        recognitionEndDate
      );
    });

    // 10. Seed Customer Contracts
    console.log('  📝 Generating customer contracts...');
    const insertContract = db.prepare(`
      INSERT INTO customer_contracts (contract_id, account_name, contract_value, start_date, end_date, renewal_date, contract_status, payment_terms, auto_renew)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    dealsForBookings.forEach((deal, idx) => {
      const accountName = db.prepare('SELECT account_name FROM sales_deals WHERE deal_id = ?').get(deal.deal_id) as { account_name: string };
      const endDate = addDays(deal.close_date, deal.contract_term_months * 30);
      const renewalDate = addDays(endDate, -30); // 30 days before end
      const status = new Date(endDate) > new Date() ? 'Active' : 'Expired';
      const autoRenew = Math.random() > 0.5 ? 1 : 0;

      insertContract.run(
        `CONTRACT-${String(idx + 1).padStart(4, '0')}`,
        accountName.account_name,
        deal.deal_value,
        deal.close_date,
        endDate,
        renewalDate,
        status,
        ['Annual', 'Monthly', 'Quarterly'][Math.floor(Math.random() * 3)],
        autoRenew
      );
    });

    console.log('✅ Sales & Revenue Module data seeded successfully!');
    console.log('  - 12 sales reps');
    console.log('  - 100 sales opportunities (various stages)');
    console.log(`  - ${closedWonOpps.length} closed deals`);
    console.log('  - Quarterly quotas for all reps');
    console.log('  - Monthly forecasts (Oct-Dec 2024)');
    console.log('  - 500 sales activities');
    console.log('  - 200 leads (various statuses)');
    console.log('  - 8 marketing campaigns');
    console.log(`  - ${dealsForBookings.length} revenue bookings`);
    console.log(`  - ${dealsForBookings.length} customer contracts`);

  } catch (error) {
    console.error('Error seeding Sales data:', error);
    throw error;
  } finally {
    db.close();
  }
}
