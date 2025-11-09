import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const db = new Database(dbPath);

export function seedMarketingData() {
  console.log('🔄 Seeding Marketing Module data...');

  // Marketing channels and types
  const channels = ['Google Ads', 'LinkedIn', 'Facebook', 'Email', 'Organic Search', 'Direct', 'Referral', 'Trade Shows'];
  const campaignTypes = ['Email', 'Social Media', 'Paid Search', 'Display Ads', 'Content Marketing', 'Events', 'Webinar', 'Trade Show'];
  const leadSources = ['Website', 'Social Media', 'Email', 'Event', 'Referral', 'Paid Ad', 'Organic Search'];
  const industries = ['Manufacturing', 'Logistics', 'Construction', 'Aerospace', 'Automotive', 'Energy', 'Technology'];
  const companySizes = ['1-50', '51-200', '201-1000', '1001+'];

  // 1. Generate Marketing Campaigns (15 campaigns for Q4 2024)
  console.log('  📢 Generating marketing campaigns...');
  const campaigns = [];
  const campaignNames = [
    'Q4 Industrial Equipment Promo',
    'LinkedIn Thought Leadership',
    'Google Ads - Manufacturing Solutions',
    'Email Nurture Campaign',
    'Trade Show - Industrial Expo',
    'Content Marketing - White Papers',
    'Facebook Manufacturing Community',
    'Webinar Series - Supply Chain Optimization',
    'Referral Partner Program',
    'Holiday Season Special Offers',
    'New Product Launch Campaign',
    'Case Study Promotion',
    'Industry Event Sponsorship',
    'SEO Content Campaign',
    'Retargeting Campaign'
  ];

  for (let i = 0; i < campaignNames.length; i++) {
    const startDate = new Date(2024, 9, Math.floor(Math.random() * 30) + 1); // October
    const endDate = new Date(2024, 11, Math.floor(Math.random() * 31) + 1); // December
    const budget = Math.floor(Math.random() * 40000) + 10000; // $10k-$50k
    const actualSpend = budget * (0.7 + Math.random() * 0.4); // 70%-110% of budget

    const stmt = db.prepare(`
      INSERT INTO mkt_campaigns (campaign_name, campaign_type, channel, start_date, end_date, status, budget, actual_spend, target_leads, target_revenue, campaign_manager)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      campaignNames[i],
      campaignTypes[Math.floor(Math.random() * campaignTypes.length)],
      channels[Math.floor(Math.random() * channels.length)],
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      i < 12 ? 'Completed' : 'Active',
      budget,
      actualSpend,
      Math.floor(Math.random() * 50) + 20, // 20-70 target leads
      Math.floor(Math.random() * 500000) + 100000, // $100k-$600k target revenue
      i % 2 === 0 ? 'Sarah Johnson' : 'Michael Chen'
    );

    campaigns.push(result.lastInsertRowid);
  }

  // 2. Generate Marketing Leads (300 leads)
  console.log('  🎯 Generating marketing leads...');
  const leadStages = ['Raw Lead', 'MQL', 'SQL', 'Opportunity', 'Customer', 'Lost'];
  const companies = ['TechManufacturing Inc', 'Global Logistics Ltd', 'Precision Parts Co', 'Industrial Solutions Group', 'Advanced Materials Inc'];

  for (let i = 0; i < 300; i++) {
    const createdDate = new Date(2024, 9 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1);
    const leadStage = leadStages[Math.floor(Math.random() * leadStages.length)];
    const campaign_id = campaigns[Math.floor(Math.random() * campaigns.length)];

    let mql_date = null, sql_date = null, opportunity_date = null, customer_date = null, lost_date = null;
    let actual_revenue = null;

    // Progressive dates based on stage
    if (leadStage !== 'Raw Lead') {
      mql_date = new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    if (leadStage === 'SQL' || leadStage === 'Opportunity' || leadStage === 'Customer') {
      sql_date = new Date(new Date(mql_date!).getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    if (leadStage === 'Opportunity' || leadStage === 'Customer') {
      opportunity_date = new Date(new Date(sql_date!).getTime() + Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    if (leadStage === 'Customer') {
      customer_date = new Date(new Date(opportunity_date!).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      actual_revenue = Math.floor(Math.random() * 150000) + 25000; // $25k-$175k
    }
    if (leadStage === 'Lost') {
      lost_date = new Date(createdDate.getTime() + Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    db.prepare(`
      INSERT INTO mkt_leads (campaign_id, lead_source, channel, company_name, contact_name, email, phone, industry, company_size, lead_score, lead_stage, mql_date, sql_date, opportunity_date, customer_date, lost_date, estimated_value, actual_revenue, lead_owner, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      campaign_id,
      leadSources[Math.floor(Math.random() * leadSources.length)],
      channels[Math.floor(Math.random() * channels.length)],
      companies[Math.floor(Math.random() * companies.length)] + ' ' + (i + 1),
      `Contact ${i + 1}`,
      `contact${i + 1}@company.com`,
      `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      industries[Math.floor(Math.random() * industries.length)],
      companySizes[Math.floor(Math.random() * companySizes.length)],
      Math.floor(Math.random() * 100), // Lead score 0-100
      leadStage,
      mql_date,
      sql_date,
      opportunity_date,
      customer_date,
      lost_date,
      Math.floor(Math.random() * 200000) + 50000, // $50k-$250k estimated
      actual_revenue,
      i % 2 === 0 ? 'Sales Rep A' : 'Sales Rep B',
      createdDate.toISOString()
    );
  }

  // 3. Generate Marketing Spend (3 months × 8 channels × 3 categories)
  console.log('  💰 Generating marketing spend data...');
  const categories = ['Paid Media', 'Content Creation', 'Events', 'Software/Tools', 'Agency Fees', 'Personnel'];

  for (let month = 0; month < 3; month++) {
    const periodMonth = new Date(2024, 9 + month, 1).toISOString().split('T')[0];

    for (const channel of channels) {
      for (const category of categories) {
        const amount = Math.floor(Math.random() * 15000) + 2000; // $2k-$17k
        const budget = amount * (0.9 + Math.random() * 0.2); // 90%-110% of actual

        db.prepare(`
          INSERT INTO mkt_spend (period_month, channel, category, amount, budget, description)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          periodMonth,
          channel,
          category,
          amount,
          budget,
          `${category} spend for ${channel}`
        );
      }
    }
  }

  // 4. Generate Campaign Performance Metrics
  console.log('  📊 Generating campaign performance metrics...');
  for (const campaign_id of campaigns) {
    // Generate weekly metrics for each campaign
    for (let week = 0; week < 12; week++) {
      const metricDate = new Date(2024, 9, week * 7 + 1).toISOString().split('T')[0];
      const impressions = Math.floor(Math.random() * 50000) + 10000;
      const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.03)); // 2-5% CTR
      const conversions = Math.floor(clicks * (0.1 + Math.random() * 0.15)); // 10-25% conversion
      const leads = Math.floor(conversions * 0.8);
      const mqls = Math.floor(leads * 0.6);
      const sqls = Math.floor(mqls * 0.5);
      const opportunities = Math.floor(sqls * 0.7);
      const customers = Math.floor(opportunities * 0.3);
      const revenue = customers * (Math.floor(Math.random() * 100000) + 30000);
      const cost = Math.floor(Math.random() * 5000) + 1000;

      db.prepare(`
        INSERT INTO mkt_campaign_metrics (campaign_id, metric_date, impressions, clicks, conversions, leads_generated, mqls_generated, sqls_generated, opportunities_generated, customers_won, revenue_generated, cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        campaign_id,
        metricDate,
        impressions,
        clicks,
        conversions,
        leads,
        mqls,
        sqls,
        opportunities,
        customers,
        revenue,
        cost
      );
    }
  }

  // 5. Generate Email Campaign Metrics
  console.log('  📧 Generating email campaign metrics...');
  for (let i = 0; i < 25; i++) {
    const sendDate = new Date(2024, 9 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    const emailsSent = Math.floor(Math.random() * 10000) + 5000;
    const delivered = Math.floor(emailsSent * 0.98);
    const opened = Math.floor(delivered * (0.15 + Math.random() * 0.15)); // 15-30% open rate
    const clicked = Math.floor(opened * (0.1 + Math.random() * 0.15)); // 10-25% click rate
    const campaign_id = i < campaigns.length ? campaigns[i] : null;

    db.prepare(`
      INSERT INTO mkt_email_campaigns (campaign_id, campaign_name, send_date, emails_sent, emails_delivered, emails_opened, emails_clicked, unsubscribes, bounces, spam_complaints, leads_generated, revenue_attributed, subject_line)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      campaign_id,
      `Email Campaign ${i + 1}`,
      sendDate,
      emailsSent,
      delivered,
      opened,
      clicked,
      Math.floor(delivered * 0.005), // 0.5% unsubscribe
      emailsSent - delivered,
      Math.floor(delivered * 0.001), // 0.1% spam
      Math.floor(clicked * 0.2), // 20% of clicks convert to leads
      Math.floor(Math.random() * 50000),
      `Subject Line ${i + 1}`
    );
  }

  // 6. Generate Social Media Performance
  console.log('  📱 Generating social media performance...');
  const platforms = ['LinkedIn', 'Facebook', 'Twitter', 'Instagram', 'YouTube'];
  const contentTypes = ['Article', 'Video', 'Image', 'Infographic', 'Poll'];

  for (let i = 0; i < 100; i++) {
    const postDate = new Date(2024, 9 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    const impressions = Math.floor(Math.random() * 20000) + 2000;
    const reach = Math.floor(impressions * 0.7);
    const engagement = Math.floor(reach * (0.03 + Math.random() * 0.07)); // 3-10% engagement
    const clicks = Math.floor(engagement * 0.3);

    db.prepare(`
      INSERT INTO mkt_social_media (platform, post_date, post_type, campaign_id, content_type, impressions, reach, engagement, clicks, leads_generated, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      platforms[Math.floor(Math.random() * platforms.length)],
      postDate,
      Math.random() > 0.7 ? 'Paid' : 'Organic',
      campaigns[Math.floor(Math.random() * campaigns.length)],
      contentTypes[Math.floor(Math.random() * contentTypes.length)],
      impressions,
      reach,
      engagement,
      clicks,
      Math.floor(clicks * 0.1), // 10% of clicks convert to leads
      Math.random() > 0.7 ? Math.floor(Math.random() * 1000) + 100 : 0
    );
  }

  // 7. Generate Content Marketing Performance
  console.log('  📝 Generating content marketing performance...');
  const contentTitles = [
    'Manufacturing Best Practices Guide',
    'Supply Chain Optimization White Paper',
    'Quality Control Case Study',
    'Industrial Equipment Buying Guide',
    'Logistics Efficiency eBook'
  ];

  for (let i = 0; i < 30; i++) {
    const publishDate = new Date(2024, 9 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    const uniqueVisitors = Math.floor(Math.random() * 5000) + 500;
    const pageViews = Math.floor(uniqueVisitors * (1.2 + Math.random() * 0.8)); // 1.2-2x views per visitor

    db.prepare(`
      INSERT INTO mkt_content (content_title, content_type, publish_date, channel, campaign_id, page_views, unique_visitors, time_on_page, downloads, shares, leads_generated, author)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      contentTitles[Math.floor(Math.random() * contentTitles.length)] + ` ${i + 1}`,
      contentTypes[Math.floor(Math.random() * contentTypes.length)],
      publishDate,
      channels[Math.floor(Math.random() * channels.length)],
      campaigns[Math.floor(Math.random() * campaigns.length)],
      pageViews,
      uniqueVisitors,
      Math.floor(Math.random() * 300) + 60, // 60-360 seconds
      Math.floor(uniqueVisitors * (0.1 + Math.random() * 0.2)), // 10-30% download rate
      Math.floor(uniqueVisitors * 0.05), // 5% share rate
      Math.floor(uniqueVisitors * 0.15), // 15% convert to leads
      i % 2 === 0 ? 'Content Writer A' : 'Content Writer B'
    );
  }

  // 8. Generate Website Traffic
  console.log('  🌐 Generating website traffic data...');
  const sources = ['Organic Search', 'Paid Search', 'Social', 'Direct', 'Referral', 'Email'];

  for (let day = 0; day < 90; day++) {
    const trafficDate = new Date(2024, 9, day + 1).toISOString().split('T')[0];

    for (const source of sources) {
      const sessions = Math.floor(Math.random() * 1000) + 200;
      const uniqueVisitors = Math.floor(sessions * 0.85);
      const pageviews = Math.floor(sessions * (2 + Math.random() * 2)); // 2-4 pages per session

      db.prepare(`
        INSERT INTO mkt_website_traffic (traffic_date, source, sessions, unique_visitors, pageviews, bounce_rate, avg_session_duration, conversions, conversion_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        trafficDate,
        source,
        sessions,
        uniqueVisitors,
        pageviews,
        30 + Math.random() * 30, // 30-60% bounce rate
        Math.floor(Math.random() * 300) + 60, // 60-360 seconds
        Math.floor(sessions * (0.02 + Math.random() * 0.03)), // 2-5% conversion
        2 + Math.random() * 3 // 2-5% conversion rate
      );
    }
  }

  // 9. Generate Marketing Budget
  console.log('  💼 Generating marketing budget data...');
  const quarters = ['Q4 2024'];

  for (const quarter of quarters) {
    for (const channel of channels) {
      const budgeted = Math.floor(Math.random() * 150000) + 50000; // $50k-$200k
      const actual = budgeted * (0.8 + Math.random() * 0.4); // 80%-120% of budget
      const variance = actual - budgeted;
      const variancePercent = (variance / budgeted) * 100;

      db.prepare(`
        INSERT INTO mkt_budget (fiscal_quarter, channel, budgeted_amount, actual_spend, variance, variance_percent)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        quarter,
        channel,
        budgeted,
        actual,
        variance,
        variancePercent
      );
    }
  }

  console.log('✅ Marketing Module data seeded successfully!');
  console.log('  - 15 marketing campaigns');
  console.log('  - 300 leads (Raw Lead → Customer journey)');
  console.log('  - 3 months of marketing spend data');
  console.log('  - 180 campaign performance snapshots');
  console.log('  - 25 email campaigns');
  console.log('  - 100 social media posts');
  console.log('  - 30 content pieces');
  console.log('  - 90 days of website traffic');
  console.log('  - Quarterly budget data');
}

// Run if called directly
if (require.main === module) {
  seedMarketingData();
  process.exit(0);
}
