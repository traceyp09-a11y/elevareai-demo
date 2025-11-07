import Database from 'better-sqlite3';
import * as path from 'path';
import { addDays, subDays, subMonths, format } from 'date-fns';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('Starting HSE data seeding for TitanBuild Manufacturing & Logistics...\n');

// Helper Functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return format(date, 'yyyy-MM-dd');
}

function randomPick<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

// Get facility and employee data
const facilities = db.prepare('SELECT id, name, type FROM facilities').all() as any[];
const employees = db.prepare("SELECT id, employee_id, department FROM employees WHERE status = 'Active' LIMIT 200").all() as any[];

console.log('1. Seeding Near Miss Reports...');
const insertNearMiss = db.prepare(`
  INSERT INTO hse_near_misses (
    near_miss_id, report_date, facility_id, department, reported_by_employee_id,
    description, potential_severity, hazard_type, corrective_action, action_completed, action_completion_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const hazardTypes = ['Slip/Trip', 'Fall from Height', 'Struck By', 'Chemical Exposure', 'Electrical',
  'Caught In/Between', 'Ergonomic', 'Material Handling', 'Vehicle/Equipment'];
const severities = ['Minor', 'Minor', 'Moderate', 'Moderate', 'Severe', 'Critical'];

for (let i = 1; i <= 150; i++) {
  const reportDate = randomDate(subMonths(new Date(), 12), new Date());
  const facility = randomPick(facilities);
  const employee = randomPick(employees);
  const hazardType = randomPick(hazardTypes);
  const severity = randomPick(severities);
  const actionCompleted = Math.random() > 0.15; // 85% completed

  const descriptions: { [key: string]: string[] } = {
    'Slip/Trip': ['Wet floor near entrance', 'Loose cable across walkway', 'Oil spill on production floor'],
    'Fall from Height': ['Unsecured ladder observed', 'Missing guardrail on platform', 'Unstable scaffolding'],
    'Struck By': ['Forklift passing too close to workers', 'Falling tools from overhead work', 'Swinging crane load'],
    'Chemical Exposure': ['Leaking chemical container', 'Missing SDS information', 'Inadequate ventilation'],
    'Electrical': ['Exposed wiring', 'Water near electrical panel', 'Damaged extension cord'],
    'Caught In/Between': ['Machine guard not in place', 'Conveyor belt pinch point', 'Rotating equipment hazard'],
    'Ergonomic': ['Improper lifting technique observed', 'Repetitive motion without breaks', 'Poor workstation setup'],
    'Material Handling': ['Overloaded pallet', 'Improperly stacked materials', 'Unsecured load on truck'],
    'Vehicle/Equipment': ['Forklift operated without seatbelt', 'Vehicle backup alarm not working', 'Equipment operated while fatigued']
  };

  insertNearMiss.run(
    `NM-2024-${String(i).padStart(4, '0')}`,
    reportDate,
    facility.id,
    employee.department,
    employee.id,
    randomPick(descriptions[hazardType]),
    severity,
    hazardType,
    'Corrective action implemented immediately',
    actionCompleted ? 1 : 0,
    actionCompleted ? randomDate(new Date(reportDate), addDays(new Date(reportDate), 14)) : null
  );
}

console.log('2. Seeding PPE Compliance Audits...');
const insertPPEAudit = db.prepare(`
  INSERT INTO hse_ppe_audits (
    audit_id, audit_date, facility_id, department, auditor_id,
    total_employees_observed, compliant_employees, non_compliant_employees,
    ppe_type, violations_noted, follow_up_required
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const ppeTypes = ['Hard Hat', 'Safety Glasses', 'Hearing Protection', 'Gloves', 'Safety Shoes',
  'Respirator', 'High-Vis Vest', 'Fall Protection'];
const departments = ['Manufacturing', 'Logistics', 'Construction', 'Maintenance', 'Quality Assurance'];

for (let i = 1; i <= 200; i++) {
  const auditDate = randomDate(subMonths(new Date(), 12), new Date());
  const facility = randomPick(facilities);
  const auditor = randomPick(employees);
  const ppeType = randomPick(ppeTypes);
  const dept = randomPick(departments);
  const totalObserved = randomInt(15, 50);
  const complianceRate = randomFloat(0.85, 0.98); // 85-98% compliance
  const compliant = Math.floor(totalObserved * complianceRate);
  const nonCompliant = totalObserved - compliant;

  insertPPEAudit.run(
    `PPE-2024-${String(i).padStart(4, '0')}`,
    auditDate,
    facility.id,
    dept,
    auditor.id,
    totalObserved,
    compliant,
    nonCompliant,
    ppeType,
    nonCompliant > 0 ? `${nonCompliant} employees not wearing required ${ppeType}` : 'No violations',
    nonCompliant > 3 ? 1 : 0
  );
}

console.log('3. Seeding Environmental Compliance Metrics...');
const insertEnvMetric = db.prepare(`
  INSERT INTO hse_environmental_metrics (
    record_date, facility_id, metric_type, metric_value, unit_of_measure,
    regulatory_limit, compliant, violation_notes, corrective_action
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const metricTypes = [
  { type: 'Air Emissions - NOx', unit: 'kg', limit: 500 },
  { type: 'Air Emissions - VOC', unit: 'kg', limit: 250 },
  { type: 'Wastewater Discharge', unit: 'gallons', limit: 50000 },
  { type: 'Hazardous Waste', unit: 'kg', limit: 1000 },
  { type: 'Energy Consumption', unit: 'kWh', limit: 150000 },
  { type: 'Water Usage', unit: 'gallons', limit: 100000 }
];

for (let m = 0; m < 12; m++) {
  const month = subMonths(new Date(), m);

  facilities.forEach(facility => {
    metricTypes.forEach(metric => {
      const value = randomFloat(metric.limit * 0.6, metric.limit * 1.05);
      const compliant = value <= metric.limit;

      insertEnvMetric.run(
        format(month, 'yyyy-MM-01'),
        facility.id,
        metric.type,
        value,
        metric.unit,
        metric.limit,
        compliant ? 1 : 0,
        !compliant ? `Exceeded limit by ${((value / metric.limit - 1) * 100).toFixed(1)}%` : null,
        !compliant ? 'Process optimization and equipment maintenance scheduled' : null
      );
    });
  });
}

console.log('4. Seeding Safety Audits...');
const insertSafetyAudit = db.prepare(`
  INSERT INTO hse_safety_audits (
    audit_id, audit_date, facility_id, audit_type, auditor_name, auditor_organization,
    areas_inspected, total_items_checked, items_passed, items_failed, critical_findings,
    overall_score, findings_summary, corrective_actions_required
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const auditTypes = ['Internal', 'Internal', 'Internal', 'External', 'Regulatory'];
const auditorNames = ['Sarah Johnson', 'Mike Chen', 'David Martinez', 'OSHA Inspector', 'Third-Party Auditor'];

for (let i = 1; i <= 60; i++) {
  const auditDate = randomDate(subMonths(new Date(), 12), new Date());
  const facility = randomPick(facilities);
  const auditType = randomPick(auditTypes);
  const totalItems = randomInt(50, 150);
  const passRate = randomFloat(0.85, 0.98);
  const itemsPassed = Math.floor(totalItems * passRate);
  const itemsFailed = totalItems - itemsPassed;
  const criticalFindings = itemsFailed > 10 ? randomInt(1, 3) : 0;
  const overallScore = (itemsPassed / totalItems) * 100;

  insertSafetyAudit.run(
    `AUDIT-2024-${String(i).padStart(4, '0')}`,
    auditDate,
    facility.id,
    auditType,
    auditType === 'Internal' ? randomPick(auditorNames.slice(0, 3)) : randomPick(auditorNames.slice(3)),
    auditType === 'Internal' ? 'TitanBuild Safety Team' : 'External Auditor',
    JSON.stringify(['Production Floor', 'Warehouse', 'Maintenance Shop', 'Loading Docks', 'Chemical Storage']),
    totalItems,
    itemsPassed,
    itemsFailed,
    criticalFindings,
    overallScore,
    itemsFailed > 0 ? `${itemsFailed} deficiencies identified, ${criticalFindings} critical` : 'All items passed inspection',
    itemsFailed
  );
}

console.log('5. Seeding Incident Investigations...');
const insertInvestigation = db.prepare(`
  INSERT INTO hse_incident_investigations (
    incident_id, investigation_opened_date, investigation_closed_date, investigation_status,
    lead_investigator_id, root_cause, contributing_factors, corrective_actions,
    target_completion_date, actual_completion_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const incidents = db.prepare('SELECT id, incident_date FROM safety_incidents ORDER BY incident_date DESC LIMIT 50').all() as any[];

incidents.forEach((incident, index) => {
  const openDate = incident.incident_date;
  const targetDays = randomInt(30, 90);
  const actualDays = Math.random() > 0.2 ? randomInt(20, targetDays) : randomInt(targetDays, targetDays + 30);
  const closed = Math.random() > 0.15; // 85% closed
  const investigator = randomPick(employees);

  const rootCauses = [
    'Inadequate training on equipment operation',
    'Failure to follow established safety procedures',
    'Equipment malfunction due to deferred maintenance',
    'Inadequate hazard assessment',
    'Communication breakdown between shifts',
    'Fatigue and long working hours',
    'Inadequate personal protective equipment'
  ];

  insertInvestigation.run(
    incident.id,
    openDate,
    closed ? format(addDays(new Date(openDate), actualDays), 'yyyy-MM-dd') : null,
    closed ? 'Closed' : 'In Progress',
    investigator.id,
    randomPick(rootCauses),
    'Multiple contributing factors including procedural gaps and environmental conditions',
    'Enhanced training program, equipment inspection schedule updated, procedure revision',
    format(addDays(new Date(openDate), targetDays), 'yyyy-MM-dd'),
    closed ? format(addDays(new Date(openDate), actualDays), 'yyyy-MM-dd') : null
  );
});

console.log('6. Seeding Hazard Reports...');
const insertHazard = db.prepare(`
  INSERT INTO hse_hazard_reports (
    hazard_id, report_date, facility_id, department, reported_by_employee_id,
    hazard_type, hazard_category, location_description, severity_level, probability,
    risk_rating, description, status, resolution_date, corrective_action
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const hazardCategories = ['Physical', 'Chemical', 'Biological', 'Ergonomic', 'Psychosocial'];
const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
const probabilities = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const locations = ['Production Floor Area A', 'Warehouse Bay 3', 'Loading Dock 2', 'Maintenance Shop',
  'Chemical Storage Room', 'Break Room', 'Parking Lot', 'Shipping Department'];

for (let i = 1; i <= 180; i++) {
  const reportDate = randomDate(subMonths(new Date(), 12), new Date());
  const facility = randomPick(facilities);
  const employee = randomPick(employees);
  const category = randomPick(hazardCategories);
  const severity = randomPick(severityLevels);
  const probability = randomPick(probabilities);
  const riskRating = (severityLevels.indexOf(severity) + 1) * (probabilities.indexOf(probability) + 1);
  const resolved = Math.random() > 0.2; // 80% resolved

  insertHazard.run(
    `HAZ-2024-${String(i).padStart(4, '0')}`,
    reportDate,
    facility.id,
    employee.department,
    employee.id,
    category,
    randomPick(hazardTypes),
    randomPick(locations),
    severity,
    probability,
    riskRating,
    `${category} hazard identified requiring attention`,
    resolved ? 'Resolved' : 'In Progress',
    resolved ? randomDate(new Date(reportDate), addDays(new Date(reportDate), 30)) : null,
    resolved ? 'Hazard eliminated through engineering controls and procedure updates' : null
  );
}

console.log('7. Seeding Emergency Drills...');
const insertDrill = db.prepare(`
  INSERT INTO hse_emergency_drills (
    drill_id, drill_date, facility_id, drill_type, planned_or_unannounced,
    participants_expected, participants_actual, duration_minutes, evacuation_time_minutes,
    target_evacuation_time, drill_coordinator_id, performance_rating, issues_identified,
    strengths_identified, corrective_actions, next_drill_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const drillTypes = ['Fire', 'Evacuation', 'Chemical Spill', 'Medical Emergency', 'Natural Disaster'];
const performanceRatings = ['Excellent', 'Good', 'Good', 'Satisfactory', 'Needs Improvement'];

for (let i = 1; i <= 48; i++) {
  const drillDate = randomDate(subMonths(new Date(), 12), new Date());
  const facility = randomPick(facilities);
  const coordinator = randomPick(employees);
  const drillType = randomPick(drillTypes);
  const expectedParticipants = randomInt(50, facility.type === 'Manufacturing' ? 300 : 150);
  const actualParticipants = Math.floor(expectedParticipants * randomFloat(0.85, 0.98));
  const targetTime = 8.0; // 8 minutes target
  const actualTime = randomFloat(5.5, 10.5);
  const rating = actualTime <= targetTime ? randomPick(['Excellent', 'Good']) : randomPick(['Satisfactory', 'Needs Improvement']);

  insertDrill.run(
    `DRILL-2024-${String(i).padStart(3, '0')}`,
    drillDate,
    facility.id,
    drillType,
    Math.random() > 0.7 ? 'Unannounced' : 'Planned',
    expectedParticipants,
    actualParticipants,
    randomInt(15, 45),
    actualTime,
    targetTime,
    coordinator.id,
    rating,
    rating === 'Needs Improvement' ? 'Some employees unclear on assembly point locations' : 'Minor communication delays',
    'Good coordination between floor supervisors and ERT members',
    rating === 'Needs Improvement' ? 'Additional signage and training scheduled' : 'Continue current procedures',
    format(addDays(new Date(drillDate), 90), 'yyyy-MM-dd')
  );
}

console.log('8. Seeding Safety Certifications...');
const insertCertification = db.prepare(`
  INSERT INTO hse_safety_certifications (
    employee_id, certification_type, certification_number, issue_date, expiration_date,
    status, issuing_organization, renewal_required, renewal_notified
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const certificationTypes = [
  { type: 'OSHA 10', duration: 36, org: 'OSHA' },
  { type: 'OSHA 30', duration: 60, org: 'OSHA' },
  { type: 'First Aid/CPR', duration: 24, org: 'American Red Cross' },
  { type: 'Forklift Certification', duration: 36, org: 'TitanBuild Training' },
  { type: 'Confined Space Entry', duration: 12, org: 'Safety Training Institute' },
  { type: 'Hazmat Handler', duration: 24, org: 'DOT' },
  { type: 'Fall Protection', duration: 24, org: 'Safety Training Institute' }
];

employees.slice(0, 150).forEach(employee => {
  const numCerts = randomInt(1, 3);
  const selectedCerts: string[] = [];

  for (let i = 0; i < numCerts; i++) {
    let cert = randomPick(certificationTypes);
    while (selectedCerts.includes(cert.type)) {
      cert = randomPick(certificationTypes);
    }
    selectedCerts.push(cert.type);

    const issueDate = randomDate(subMonths(new Date(), cert.duration + 6), subMonths(new Date(), 3));
    const expirationDate = format(addDays(new Date(issueDate), cert.duration * 30), 'yyyy-MM-dd');
    const expired = new Date(expirationDate) < new Date();
    const expiresWithin30Days = new Date(expirationDate) < addDays(new Date(), 30);

    insertCertification.run(
      employee.id,
      cert.type,
      `CERT-${employee.employee_id}-${String(i + 1).padStart(2, '0')}`,
      issueDate,
      expirationDate,
      expired ? 'Expired' : 'Active',
      cert.org,
      1,
      expiresWithin30Days ? 1 : 0
    );
  }
});

console.log('9. Seeding Safety Observations...');
const insertObservation = db.prepare(`
  INSERT INTO hse_safety_observations (
    observation_id, observation_date, facility_id, department, observer_id,
    observation_type, severity, description, employee_involved_id, immediate_action,
    follow_up_required, closed_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const observationTypes = ['Safe Behavior', 'Safe Behavior', 'Safe Behavior', 'At-Risk Behavior',
  'Safe Condition', 'Safe Condition', 'At-Risk Condition'];

for (let i = 1; i <= 300; i++) {
  const obsDate = randomDate(subMonths(new Date(), 6), new Date());
  const facility = randomPick(facilities);
  const observer = randomPick(employees);
  const employeeInvolved = randomPick(employees);
  const obsType = randomPick(observationTypes);
  const isAtRisk = obsType.includes('At-Risk');
  const severity = isAtRisk ? randomPick(['Low', 'Medium', 'High']) : 'Low';

  const descriptions: { [key: string]: string[] } = {
    'Safe Behavior': ['Employee properly using PPE', 'Correct lifting technique observed', 'Following lockout/tagout procedures'],
    'At-Risk Behavior': ['Not wearing required hearing protection', 'Bypassing machine guard', 'Operating equipment while distracted'],
    'Safe Condition': ['Work area clean and organized', 'Emergency exits clear', 'Fire extinguisher properly mounted'],
    'At-Risk Condition': ['Spill not cleaned up', 'Equipment blocking aisle', 'Missing safety signage']
  };

  insertObservation.run(
    `OBS-2024-${String(i).padStart(4, '0')}`,
    obsDate,
    facility.id,
    employeeInvolved.department,
    observer.id,
    obsType,
    severity,
    randomPick(descriptions[obsType]),
    employeeInvolved.id,
    isAtRisk ? 'Immediate correction made and employee coached' : 'Positive feedback provided',
    isAtRisk && severity !== 'Low' ? 1 : 0,
    Math.random() > 0.1 ? format(addDays(new Date(obsDate), randomInt(1, 7)), 'yyyy-MM-dd') : null
  );
}

console.log('10. Seeding Chemical Inventory...');
const insertChemical = db.prepare(`
  INSERT INTO hse_chemical_inventory (
    chemical_id, facility_id, chemical_name, cas_number, manufacturer,
    quantity_on_hand, unit_of_measure, storage_location, hazard_class,
    sds_on_file, sds_last_updated, expiration_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const chemicals = [
  { name: 'Acetone', cas: '67-64-1', hazard: 'Flammable', unit: 'gallons' },
  { name: 'Hydrochloric Acid', cas: '7647-01-0', hazard: 'Corrosive', unit: 'liters' },
  { name: 'Sodium Hydroxide', cas: '1310-73-2', hazard: 'Corrosive', unit: 'kg' },
  { name: 'Toluene', cas: '108-88-3', hazard: 'Flammable', unit: 'gallons' },
  { name: 'Ammonia', cas: '7664-41-7', hazard: 'Toxic', unit: 'liters' },
  { name: 'Methanol', cas: '67-56-1', hazard: 'Flammable', unit: 'gallons' },
  { name: 'Sulfuric Acid', cas: '7664-93-9', hazard: 'Corrosive', unit: 'liters' }
];

const storageLocations = ['Chemical Storage Room A', 'Chemical Storage Room B', 'Flammable Cabinet 1',
  'Flammable Cabinet 2', 'Corrosive Cabinet', 'Outdoor Storage Shed'];
const manufacturers = ['ChemCorp', 'Industrial Solutions Inc', 'SafeChem Industries', 'Global Chemical Supply'];

facilities.forEach(facility => {
  const numChemicals = facility.type === 'Manufacturing' ? randomInt(15, 25) : randomInt(5, 12);

  for (let i = 0; i < numChemicals; i++) {
    const chemical = randomPick(chemicals);
    const sdsDate = randomDate(subMonths(new Date(), 24), new Date());

    insertChemical.run(
      `CHEM-${facility.id}-${String(i + 1).padStart(3, '0')}`,
      facility.id,
      chemical.name,
      chemical.cas,
      randomPick(manufacturers),
      randomFloat(5, 200),
      chemical.unit,
      randomPick(storageLocations),
      chemical.hazard,
      1,
      sdsDate,
      format(addDays(new Date(), randomInt(30, 730)), 'yyyy-MM-dd')
    );
  }
});

console.log('\n✅ HSE data seeding complete!');
console.log(`   - ${150} near miss reports`);
console.log(`   - ${200} PPE compliance audits`);
console.log(`   - Environmental metrics for all facilities (12 months)`);
console.log(`   - ${60} safety audits`);
console.log(`   - ${incidents.length} incident investigations`);
console.log(`   - ${180} hazard reports`);
console.log(`   - ${48} emergency drills`);
console.log(`   - Safety certifications for ${150} employees`);
console.log(`   - ${300} safety observations`);
console.log(`   - Chemical inventory for all facilities`);

db.close();
