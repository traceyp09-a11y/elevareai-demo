import Database from 'better-sqlite3';

export function seedCustomerSuccessData(dbPath: string) {
  const db = new Database(dbPath);

  console.log('🔄 Seeding Customer Success & Experience Module data...');

  // Helper function to generate random date
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
    // 1. Seed Customer Success Managers
    console.log('  👥 Generating CSMs...');
    const csms = [
      { csm_id: 'CSM-001', name: 'Emma Davis', email: 'emma.davis@company.com', region: 'West', max_accounts: 25, current_accounts: 22, is_active: 1 },
      { csm_id: 'CSM-002', name: 'Marcus Johnson', email: 'marcus.johnson@company.com', region: 'East', max_accounts: 25, current_accounts: 24, is_active: 1 },
      { csm_id: 'CSM-003', name: 'Sophia Lee', email: 'sophia.lee@company.com', region: 'Central', max_accounts: 25, current_accounts: 20, is_active: 1 },
      { csm_id: 'CSM-004', name: 'Alex Thompson', email: 'alex.thompson@company.com', region: 'West', max_accounts: 25, current_accounts: 19, is_active: 1 },
      { csm_id: 'CSM-005', name: 'Rachel Martinez', email: 'rachel.martinez@company.com', region: 'East', max_accounts: 25, current_accounts: 15, is_active: 1 }
    ];

    const insertCSM = db.prepare(`
      INSERT INTO cs_managers (csm_id, name, email, region, max_accounts, current_accounts, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    csms.forEach(csm => insertCSM.run(Object.values(csm)));

    // 2. Seed Customers (100 customers)
    console.log('  🏢 Generating customers...');
    const statuses = ['Active', 'Active', 'Active', 'At Risk', 'Churned']; // Weighted toward Active
    const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education'];
    const sizes = ['SMB', 'Mid-Market', 'Enterprise'];

    const insertCustomer = db.prepare(`
      INSERT INTO cs_customers (customer_id, company_name, industry, company_size, signup_date, contract_start_date, contract_end_date, contract_value_annual, mrr, arr, account_status, csm_id, health_score, last_health_update)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const customers = [];
    for (let i = 1; i <= 100; i++) {
      const signupDate = randomDate(new Date('2023-01-01'), new Date('2024-06-30'));
      const contractStart = addDays(signupDate, 5);
      const contractEnd = addDays(contractStart, 365);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const arrValue = size === 'Enterprise' ? Math.floor(Math.random() * 150000) + 100000 :
                       size === 'Mid-Market' ? Math.floor(Math.random() * 60000) + 40000 :
                       Math.floor(Math.random() * 30000) + 10000;
      const mrrValue = arrValue / 12;
      const healthScore = status === 'Churned' ? 0 :
                          status === 'At Risk' ? Math.floor(Math.random() * 20) + 40 :
                          Math.floor(Math.random() * 30) + 70;

      const customer = {
        customer_id: `CUST-${String(i).padStart(4, '0')}`,
        company_name: `${['Acme', 'Global', 'Tech', 'Innovation', 'Solutions', 'Digital'][Math.floor(Math.random() * 6)]} ${['Corp', 'Inc', 'LLC', 'Ltd', 'Co'][Math.floor(Math.random() * 5)]}`,
        industry: industries[Math.floor(Math.random() * industries.length)],
        company_size: size,
        signup_date: signupDate,
        contract_start_date: contractStart,
        contract_end_date: contractEnd,
        contract_value_annual: arrValue,
        mrr: mrrValue,
        arr: arrValue,
        account_status: status,
        csm_id: csms[Math.floor(Math.random() * csms.length)].csm_id,
        health_score: healthScore,
        last_health_update: '2024-12-01'
      };

      customers.push(customer);
      insertCustomer.run(Object.values(customer));
    }

    // 3. Seed NPS Surveys (150 surveys)
    console.log('  📊 Generating NPS surveys...');
    const insertNPS = db.prepare(`
      INSERT INTO cs_nps_surveys (customer_id, survey_date, nps_score, nps_category, feedback_text, follow_up_completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < 150; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const surveyDate = randomDate(new Date('2024-10-01'), new Date('2024-12-15'));
      const npsScore = Math.floor(Math.random() * 11); // 0-10
      const category = npsScore >= 9 ? 'Promoter' : npsScore >= 7 ? 'Passive' : 'Detractor';

      insertNPS.run(customer.customer_id, surveyDate, npsScore, category, 'Survey feedback', Math.random() > 0.5 ? 1 : 0);
    }

    // 4. Seed CSAT Surveys (200 surveys)
    console.log('  ⭐ Generating CSAT surveys...');
    const interactionTypes = ['Support Ticket', 'Onboarding', 'QBR', 'Feature Release'];

    const insertCSAT = db.prepare(`
      INSERT INTO cs_csat_surveys (customer_id, survey_date, interaction_type, csat_score, feedback_text)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < 200; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const surveyDate = randomDate(new Date('2024-10-01'), new Date('2024-12-15'));
      const csatScore = Math.floor(Math.random() * 3) + 3; // 3-5 (weighted toward higher scores)

      insertCSAT.run(customer.customer_id, surveyDate, interactionTypes[Math.floor(Math.random() * interactionTypes.length)], csatScore, 'Feedback text');
    }

    // 5. Seed CES Surveys (100 surveys)
    console.log('  🎯 Generating CES surveys...');
    const insertCES = db.prepare(`
      INSERT INTO cs_ces_surveys (customer_id, survey_date, interaction_type, ces_score, feedback_text)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < 100; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const surveyDate = randomDate(new Date('2024-10-01'), new Date('2024-12-15'));
      const cesScore = Math.floor(Math.random() * 3) + 5; // 5-7 (easier experiences)

      insertCES.run(customer.customer_id, surveyDate, 'Support', cesScore, 'CES feedback');
    }

    // 6. Seed Support Tickets (250 tickets)
    console.log('  🎫 Generating support tickets...');
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const ticketCategories = ['Bug', 'Feature Request', 'Question', 'Training'];
    const ticketStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

    const insertTicket = db.prepare(`
      INSERT INTO cs_support_tickets (ticket_id, customer_id, created_date, resolved_date, priority, category, status, first_response_time_hours, resolution_time_hours, csat_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i <= 250; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const createdDate = randomDate(new Date('2024-10-01'), new Date('2024-12-10'));
      const status = ticketStatuses[Math.floor(Math.random() * ticketStatuses.length)];
      const resolvedDate = (status === 'Resolved' || status === 'Closed') ? addDays(createdDate, Math.floor(Math.random() * 5) + 1) : null;
      const firstResponseHours = Math.random() * 8 + 1; // 1-9 hours
      const resolutionHours = resolvedDate ? Math.random() * 48 + 4 : null; // 4-52 hours

      insertTicket.run(
        `TICKET-${String(i).padStart(4, '0')}`,
        customer.customer_id,
        createdDate,
        resolvedDate,
        priorities[Math.floor(Math.random() * priorities.length)],
        ticketCategories[Math.floor(Math.random() * ticketCategories.length)],
        status,
        firstResponseHours,
        resolutionHours,
        resolvedDate ? Math.floor(Math.random() * 2) + 4 : null // 4-5 CSAT
      );
    }

    // 7. Seed Product Usage (90 days × 50 active customers)
    console.log('  💻 Generating product usage data...');
    const insertUsage = db.prepare(`
      INSERT INTO cs_product_usage (customer_id, usage_date, daily_active_users, weekly_active_users, monthly_active_users, feature_adoption_score, login_frequency, time_in_product_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const activeCustomers = customers.filter(c => c.account_status === 'Active').slice(0, 50);
    for (let day = 0; day < 90; day++) {
      const usageDate = addDays('2024-09-15', day);
      activeCustomers.forEach(customer => {
        const size = customer.company_size;
        const userCount = size === 'Enterprise' ? 100 : size === 'Mid-Market' ? 30 : 8;
        const adoptionScore = Math.random() * 30 + 60; // 60-90%

        insertUsage.run(
          customer.customer_id,
          usageDate,
          Math.floor(userCount * 0.6),
          Math.floor(userCount * 0.75),
          userCount,
          adoptionScore,
          Math.random() * 3 + 2, // 2-5 logins per week
          Math.random() * 120 + 30 // 30-150 minutes
        );
      });
    }

    // 8. Seed Onboarding (100 records)
    console.log('  🚀 Generating onboarding data...');
    const insertOnboarding = db.prepare(`
      INSERT INTO cs_onboarding (onboarding_id, customer_id, start_date, target_completion_date, actual_completion_date, time_to_first_value_days, onboarding_status, completion_percentage, kickoff_completed, training_completed, first_use_case_live)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    customers.forEach((customer, idx) => {
      const startDate = customer.signup_date;
      const targetDays = 30;
      const targetDate = addDays(startDate, targetDays);
      const actualDays = Math.floor(Math.random() * 20) + 10; // 10-30 days
      const actualDate = addDays(startDate, actualDays);
      const ttfv = Math.floor(Math.random() * 14) + 7; // 7-21 days
      const status = actualDays <= targetDays ? 'Completed' : 'In Progress';

      insertOnboarding.run(
        `ONBOARD-${String(idx + 1).padStart(4, '0')}`,
        customer.customer_id,
        startDate,
        targetDate,
        status === 'Completed' ? actualDate : null,
        ttfv,
        status,
        status === 'Completed' ? 100 : Math.floor(Math.random() * 40) + 50,
        1, 1, status === 'Completed' ? 1 : 0
      );
    });

    // 9. Seed Expansion Opportunities (30 opportunities)
    console.log('  📈 Generating expansion opportunities...');
    const expansionTypes = ['Upsell', 'Cross-sell', 'Additional Users'];
    const expansionStages = ['Identified', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'];

    const insertExpansion = db.prepare(`
      INSERT INTO cs_expansion_opps (expansion_id, customer_id, identified_date, expansion_type, estimated_arr_increase, stage, probability, expected_close_date, actual_close_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i <= 30; i++) {
      const customer = activeCustomers[Math.floor(Math.random() * activeCustomers.length)];
      const identifiedDate = randomDate(new Date('2024-09-01'), new Date('2024-11-30'));
      const stage = expansionStages[Math.floor(Math.random() * expansionStages.length)];
      const arrIncrease = Math.floor(Math.random() * 30000) + 10000;
      const probability = stage === 'Closed Won' ? 100 : stage === 'Closed Lost' ? 0 :
                         stage === 'Proposal' ? 60 : stage === 'Qualified' ? 40 : 20;
      const expectedClose = addDays(identifiedDate, 60);
      const actualClose = stage.includes('Closed') ? addDays(identifiedDate, Math.floor(Math.random() * 60) + 30) : null;

      insertExpansion.run(
        `EXP-${String(i).padStart(4, '0')}`,
        customer.customer_id,
        identifiedDate,
        expansionTypes[Math.floor(Math.random() * expansionTypes.length)],
        arrIncrease,
        stage,
        probability,
        expectedClose,
        actualClose
      );
    }

    // 10. Seed Churn Events (15 churns)
    console.log('  ❌ Generating churn events...');
    const churnReasons = ['Price', 'Product Fit', 'Support Quality', 'Competition', 'Business Closure'];

    const insertChurn = db.prepare(`
      INSERT INTO cs_churn_events (customer_id, churn_date, churn_reason, churn_category, arr_lost, mrr_lost, preventable, exit_interview_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const churnedCustomers = customers.filter(c => c.account_status === 'Churned').slice(0, 15);
    churnedCustomers.forEach(customer => {
      const churnDate = randomDate(new Date('2024-10-01'), new Date('2024-12-10'));
      const category = churnReasons[Math.floor(Math.random() * churnReasons.length)];

      insertChurn.run(
        customer.customer_id,
        churnDate,
        'Customer explanation',
        category,
        customer.arr,
        customer.mrr,
        category !== 'Business Closure' ? 1 : 0,
        Math.random() > 0.3 ? 1 : 0
      );
    });

    // 11. Seed Health History
    console.log('  💚 Generating health score history...');
    const insertHealth = db.prepare(`
      INSERT INTO cs_health_history (customer_id, assessment_date, health_score, usage_score, engagement_score, support_score, adoption_score, risk_factors)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    activeCustomers.slice(0, 30).forEach(customer => {
      for (let month = 0; month < 3; month++) {
        const assessmentDate = addDays('2024-10-01', month * 30);
        const healthScore = customer.health_score + (Math.random() * 10 - 5);

        insertHealth.run(
          customer.customer_id,
          assessmentDate,
          Math.round(healthScore),
          Math.floor(Math.random() * 30) + 70,
          Math.floor(Math.random() * 30) + 70,
          Math.floor(Math.random() * 30) + 70,
          Math.floor(Math.random() * 30) + 60,
          JSON.stringify([])
        );
      }
    });

    // 12. Seed QBRs
    console.log('  📅 Generating QBRs...');
    const insertQBR = db.prepare(`
      INSERT INTO cs_qbrs (qbr_id, customer_id, qbr_date, quarter, attendees_count, executive_sponsor_present, success_plan_created, action_items_count, satisfaction_rating, renewal_risk_discussed, expansion_discussed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    activeCustomers.slice(0, 25).forEach((customer, idx) => {
      const qbrDate = randomDate(new Date('2024-10-01'), new Date('2024-11-30'));

      insertQBR.run(
        `QBR-${String(idx + 1).padStart(4, '0')}`,
        customer.customer_id,
        qbrDate,
        'Q4 2024',
        Math.floor(Math.random() * 5) + 3,
        Math.random() > 0.5 ? 1 : 0,
        1,
        Math.floor(Math.random() * 5) + 2,
        Math.floor(Math.random() * 2) + 4, // 4-5
        Math.random() > 0.7 ? 1 : 0,
        Math.random() > 0.5 ? 1 : 0
      );
    });

    console.log('✅ Customer Success & Experience Module data seeded successfully!');
    console.log('  - 5 Customer Success Managers');
    console.log('  - 100 customers (Active, At Risk, Churned)');
    console.log('  - 150 NPS surveys');
    console.log('  - 200 CSAT surveys');
    console.log('  - 100 CES surveys');
    console.log('  - 250 support tickets');
    console.log('  - 90 days of product usage data (50 customers)');
    console.log('  - 100 onboarding records');
    console.log('  - 30 expansion opportunities');
    console.log('  - 15 churn events');
    console.log('  - Health score history (30 customers × 3 months)');
    console.log('  - 25 QBRs');

  } catch (error) {
    console.error('Error seeding Customer Success data:', error);
    throw error;
  } finally {
    db.close();
  }
}
