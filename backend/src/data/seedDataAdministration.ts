/**
 * Administration Module Data Seeding Script
 * Generates realistic IT/Admin data for Q1-Q4 2024
 */

import Database from 'better-sqlite3';
import path from 'path';

export function seedAdministrationData(dbPath?: string): void {
  const finalPath = dbPath || path.join(__dirname, '../../database/elevareiq.db');
  const db = new Database(finalPath);

  console.log('🔄 Seeding Administration Module data...');

  try {
    const randomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;
    const formatDate = (date: Date): string => date.toISOString().split('T')[0];

    // 1. EMPLOYEE COUNT
    console.log('  👥 Generating employee count...');
    const empCountStmt = db.prepare('INSERT INTO admin_employee_count (period, total_employees) VALUES (?, ?)');
    ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'].forEach(q => empCountStmt.run(q, 500));

    // 2. SYSTEM UPTIME
    console.log('  💻 Generating system uptime records...');
    const systems = [
      { name: 'ERP System', criticality: 'Critical' },
      { name: 'Email Server', criticality: 'Critical' },
      { name: 'File Server', criticality: 'High' },
      { name: 'CRM System', criticality: 'High' },
      { name: 'HR Portal', criticality: 'Medium' },
    ];

    const uptimeStmt = db.prepare(`
      INSERT INTO admin_system_uptime
      (system_name, date, total_minutes, downtime_minutes, uptime_percentage, incidents, category, criticality)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let day = 0; day < 90; day++) {
      const date = new Date(2024, 9, 1);
      date.setDate(date.getDate() + day);
      systems.forEach(sys => {
        const totalMinutes = 1440;
        const downtime = Math.random() < 0.95 ? 0 : randomInRange(5, 60);
        const uptime = ((totalMinutes - downtime) / totalMinutes) * 100;
        uptimeStmt.run(sys.name, formatDate(date), totalMinutes, downtime, uptime, downtime > 0 ? 1 : 0, 'Infrastructure', sys.criticality);
      });
    }

    // 3. HELPDESK TICKETS
    console.log('  🎫 Generating helpdesk tickets...');
    const ticketStmt = db.prepare(`
      INSERT INTO admin_helpdesk_tickets
      (ticket_number, created_date, resolved_date, category, priority, status, resolution_time_minutes,
       first_response_time_minutes, employee_id, department, assigned_to, satisfaction_rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const categories = ['Hardware', 'Software', 'Network', 'Access', 'Other'];
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    const departments = ['Sales', 'Engineering', 'Finance', 'HR', 'Operations'];

    for (let i = 1; i <= 300; i++) {
      const createdDate = new Date(2024, 9, Math.floor(Math.random() * 90) + 1);
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const responseTime = priority === 'Critical' ? randomInRange(10, 30) : randomInRange(20, 120);
      const resolutionTime = priority === 'Critical' ? randomInRange(60, 240) : randomInRange(120, 480);
      const resolvedDate = new Date(createdDate);
      resolvedDate.setMinutes(resolvedDate.getMinutes() + resolutionTime);
      const status = Math.random() > 0.1 ? 'Resolved' : 'Open';

      ticketStmt.run(
        `TKT-${String(i).padStart(6, '0')}`,
        formatDate(createdDate),
        status === 'Resolved' ? formatDate(resolvedDate) : null,
        categories[Math.floor(Math.random() * categories.length)],
        priority,
        status,
        status === 'Resolved' ? resolutionTime : null,
        responseTime,
        `EMP${String(i).padStart(4, '0')}`,
        departments[Math.floor(Math.random() * departments.length)],
        'IT Support',
        status === 'Resolved' ? Math.floor(randomInRange(3, 5)) : null
      );
    }

    // 4. IT COSTS
    console.log('  💰 Generating IT costs...');
    const costStmt = db.prepare('INSERT INTO admin_it_costs (period, cost_category, cost_subcategory, amount, vendor, is_recurring, department) VALUES (?, ?, ?, ?, ?, ?, ?)');

    const costCategories = [
      { cat: 'Hardware', sub: 'Laptops', amount: 120000, vendor: 'Dell', recurring: 0 },
      { cat: 'Software', sub: 'Microsoft 365', amount: 150000, vendor: 'Microsoft', recurring: 1 },
      { cat: 'Cloud', sub: 'AWS', amount: 80000, vendor: 'AWS', recurring: 1 },
      { cat: 'Personnel', sub: 'IT Staff', amount: 300000, vendor: null, recurring: 1 },
      { cat: 'Network', sub: 'Internet', amount: 12000, vendor: 'ISP Co', recurring: 1 },
      { cat: 'Security', sub: 'Cybersecurity Tools', amount: 45000, vendor: 'CrowdStrike', recurring: 1 },
    ];

    ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'].forEach(period => {
      costCategories.forEach(cost => {
        const amount = cost.amount * (cost.recurring ? 0.25 : 1) * randomInRange(0.9, 1.1);
        costStmt.run(period, cost.cat, cost.sub, amount, cost.vendor, cost.recurring ? 1 : 0, 'IT');
      });
    });

    // 5. SECURITY INCIDENTS
    console.log('  🔒 Generating security incidents...');
    const securityStmt = db.prepare('INSERT INTO admin_security_incidents (incident_date, incident_type, severity, status, affected_systems, affected_users, resolution_time_hours, cost_impact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    const incidentTypes = ['Malware', 'Phishing', 'Unauthorized Access', 'Other'];
    for (let i = 0; i < 15; i++) {
      const incidentDate = new Date(2024, 9, Math.floor(Math.random() * 90) + 1);
      const severity = priorities[Math.floor(Math.random() * priorities.length)];
      securityStmt.run(formatDate(incidentDate), incidentTypes[Math.floor(Math.random() * incidentTypes.length)], severity, 'Resolved',
        Math.floor(randomInRange(1, 5)), Math.floor(randomInRange(5, 50)), severity === 'Critical' ? randomInRange(2, 8) : randomInRange(4, 24),
        severity === 'Critical' ? randomInRange(10000, 50000) : randomInRange(1000, 10000));
    }

    // 6. SOFTWARE LICENSES
    console.log('  📀 Generating software licenses...');
    const licenseStmt = db.prepare('INSERT INTO admin_software_licenses (software_name, vendor, license_type, total_licenses, licenses_in_use, cost_per_license, annual_cost, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    [
      { name: 'Microsoft 365', vendor: 'Microsoft', type: 'Per User', licenses: 500, inUse: 450, cost: 300, cat: 'Productivity' },
      { name: 'Adobe Creative Cloud', vendor: 'Adobe', type: 'Per User', licenses: 50, inUse: 35, cost: 600, cat: 'Design' },
      { name: 'Salesforce', vendor: 'Salesforce', type: 'Per User', licenses: 100, inUse: 95, cost: 1200, cat: 'CRM' },
      { name: 'Zoom', vendor: 'Zoom', type: 'Per User', licenses: 500, inUse: 420, cost: 150, cat: 'Communication' },
      { name: 'Slack', vendor: 'Slack', type: 'Per User', licenses: 500, inUse: 380, cost: 80, cat: 'Communication' },
    ].forEach(sw => licenseStmt.run(sw.name, sw.vendor, sw.type, sw.licenses, sw.inUse, sw.cost, sw.licenses * sw.cost, sw.cat));

    // 7. DATA BACKUPS
    console.log('  💾 Generating backup records...');
    const backupStmt = db.prepare('INSERT INTO admin_data_backups (backup_date, backup_type, system_name, data_size_gb, duration_minutes, status, retention_days) VALUES (?, ?, ?, ?, ?, ?, ?)');

    for (let day = 0; day < 90; day++) {
      const date = new Date(2024, 9, 1);
      date.setDate(date.getDate() + day);
      ['ERP System', 'File Server', 'Database'].forEach(system => {
        backupStmt.run(formatDate(date), day % 7 === 0 ? 'Full' : 'Incremental', system,
          randomInRange(100, 500), randomInRange(30, 120), Math.random() > 0.02 ? 'Success' : 'Failed', 30);
      });
    }

    // 8. IT PROJECTS
    console.log('  📊 Generating IT projects...');
    const projectStmt = db.prepare('INSERT INTO admin_it_projects (project_name, start_date, planned_end_date, actual_end_date, status, budget, actual_cost, project_manager, priority, completion_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

    [
      { name: 'ERP Upgrade', start: '2024-07-01', planned: '2024-09-30', actual: '2024-10-15', status: 'Completed', budget: 200000, cost: 210000 },
      { name: 'Cloud Migration', start: '2024-08-01', planned: '2024-12-31', actual: null, status: 'In Progress', budget: 300000, cost: 180000 },
      { name: 'Security Audit', start: '2024-09-01', planned: '2024-10-31', actual: '2024-10-25', status: 'Completed', budget: 50000, cost: 48000 },
      { name: 'Website Redesign', start: '2024-10-01', planned: '2024-12-15', actual: null, status: 'In Progress', budget: 80000, cost: 45000 },
    ].forEach(proj => projectStmt.run(proj.name, proj.start, proj.planned, proj.actual, proj.status, proj.budget, proj.cost, 'IT Manager', 'High', proj.status === 'Completed' ? 100 : 60));

    // 9. EMPLOYEE SATISFACTION
    console.log('  ⭐ Generating satisfaction surveys...');
    const satisfactionStmt = db.prepare('INSERT INTO admin_employee_satisfaction (survey_date, employee_id, department, overall_satisfaction, system_performance_rating, support_quality_rating, tool_availability_rating) VALUES (?, ?, ?, ?, ?, ?, ?)');

    for (let i = 1; i <= 100; i++) {
      const surveyDate = new Date(2024, 9, Math.floor(Math.random() * 30) + 1);
      satisfactionStmt.run(formatDate(surveyDate), `EMP${String(i).padStart(4, '0')}`, departments[Math.floor(Math.random() * departments.length)],
        Math.floor(randomInRange(3, 5)), Math.floor(randomInRange(3, 5)), Math.floor(randomInRange(3, 5)), Math.floor(randomInRange(3, 5)));
    }

    // 10. INFRASTRUCTURE CAPACITY
    console.log('  🖥️  Generating infrastructure capacity data...');
    const capacityStmt = db.prepare('INSERT INTO admin_infrastructure_capacity (measurement_date, resource_type, resource_name, total_capacity, used_capacity, utilization_percentage, unit) VALUES (?, ?, ?, ?, ?, ?, ?)');

    const endDate = new Date(2024, 11, 31);
    [
      { type: 'Server CPU', name: 'App Server 1', total: 100, used: 72, unit: '%' },
      { type: 'Memory', name: 'App Server 1', total: 64, used: 48, unit: 'GB' },
      { type: 'Storage', name: 'File Server', total: 10000, used: 7200, unit: 'GB' },
      { type: 'Network Bandwidth', name: 'WAN Link', total: 1000, used: 650, unit: 'Mbps' },
    ].forEach(res => {
      const util = (res.used / res.total) * 100;
      capacityStmt.run(formatDate(endDate), res.type, res.name, res.total, res.used, util, res.unit);
    });

    // 11. IT ASSETS
    console.log('  💼 Generating IT assets...');
    const assetStmt = db.prepare('INSERT INTO admin_it_assets (asset_tag, asset_type, make, model, purchase_date, purchase_cost, assigned_to, department, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

    for (let i = 1; i <= 50; i++) {
      assetStmt.run(`ASSET-${String(i).padStart(5, '0')}`, 'Laptop', 'Dell', 'Latitude 7420', '2023-06-01', 1200,
        `EMP${String(i).padStart(4, '0')}`, departments[Math.floor(Math.random() * departments.length)], 'In Use');
    }

    console.log('✅ Administration Module data seeded successfully!');
    console.log('  - 90 days of system uptime data (5 systems)');
    console.log('  - 300 helpdesk tickets');
    console.log('  - Quarterly IT costs (6 categories)');
    console.log('  - 15 security incidents');
    console.log('  - 5 software license records');
    console.log('  - 270 backup records (3 systems, 90 days)');
    console.log('  - 4 IT projects');
    console.log('  - 100 satisfaction surveys');
    console.log('  - Infrastructure capacity metrics (4 resources)');
    console.log('  - 50 IT assets');

  } catch (error) {
    console.error('❌ Error seeding Administration data:', error);
    throw error;
  } finally {
    db.close();
  }
}

if (require.main === module) {
  seedAdministrationData();
}
