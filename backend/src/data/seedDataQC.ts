// Seed data for Quality Control (QC) Analytics Module
import Database from 'better-sqlite3';
import path from 'path';
import { subDays, format, addDays } from 'date-fns';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return format(date, 'yyyy-MM-dd');
}

function randomDecimal(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

export function seedDataQC() {
  console.log('Starting QC data seeding...');

  try {
    // Get facilities and employees
    const facilities = db.prepare('SELECT id, name, type FROM facilities').all() as any[];
    console.log(`Found ${facilities.length} facilities`);

    const employees = db.prepare("SELECT id, employee_id, department FROM employees WHERE status = 'Active' LIMIT 200").all() as any[];
    console.log(`Found ${employees.length} employees`);

    // Get vendors for supplier quality
    const vendors = db.prepare('SELECT id FROM ops_vendors LIMIT 15').all() as any[];

    const now = new Date();
    const startDate = subDays(now, 365);

    // Product part numbers
    const partNumbers: string[] = [
      'PN-1001-A', 'PN-1002-B', 'PN-1003-C', 'PN-1004-D', 'PN-1005-E',
      'PN-2001-A', 'PN-2002-B', 'PN-2003-C', 'PN-3001-A', 'PN-3002-B'
    ];

    // Customer names
    const customers: string[] = [
      'BuildRight Construction', 'MegaProject Developers', 'Urban Renovations Inc',
      'SkyHigh Builders', 'Foundation First LLC', 'Premier Construction Co',
      'Apex Building Solutions', 'TowerBuild Enterprises'
    ];

    console.log('Seeding quality inspections...');
    const inspectionTypes = ['Incoming', 'In-Process', 'Final', 'Source'];
    const inspectionIds: number[] = [];

    // Generate 1000 inspections over the past year
    for (let i = 0; i < 1000; i++) {
      const inspectionId = `QI-${format(now, 'yyyy')}-${String(i + 1).padStart(5, '0')}`;
      const inspectionDate = randomDate(startDate, now);
      const facility = randomPick(facilities);
      const inspector = randomPick(employees);
      const inspectionType = randomPick(inspectionTypes);

      const unitsInspected = randomInt(50, 500);

      // Quality varies by inspection type
      let passRate: number;
      if (inspectionType === 'Incoming') passRate = randomDecimal(0.92, 0.98);
      else if (inspectionType === 'In-Process') passRate = randomDecimal(0.94, 0.99);
      else passRate = randomDecimal(0.96, 0.995);

      const unitsPassed = Math.floor(unitsInspected * passRate);
      const unitsFailed = unitsInspected - unitsPassed;

      const actualDefectRate = (unitsFailed / unitsInspected) * 100;
      const passFailStatus = actualDefectRate < 2.5 ? 'Pass' : actualDefectRate < 5 ? 'Conditional' : 'Fail';

      const insert = db.prepare(`
        INSERT INTO qc_inspections (
          inspection_id, inspection_date, facility_id, inspector_id,
          inspection_type, lot_number, units_inspected, units_passed, units_failed,
          sample_size, inspection_level, aql_target, actual_defect_rate, pass_fail_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insert.run(
        inspectionId, inspectionDate, facility.id, inspector.id,
        inspectionType, `LOT-${randomInt(1000, 9999)}`, unitsInspected, unitsPassed, unitsFailed,
        Math.min(unitsInspected, randomInt(32, 125)), randomPick(['Normal', 'Tightened', 'Reduced']),
        randomDecimal(1.0, 4.0), actualDefectRate, passFailStatus
      );

      inspectionIds.push(result.lastInsertRowid as number);
    }
    console.log(`Created ${inspectionIds.length} quality inspections`);

    console.log('Seeding defects and non-conformances...');
    const defectTypes = ['Critical', 'Major', 'Minor'];
    const defectCategories = ['Dimensional', 'Visual', 'Functional', 'Material', 'Assembly', 'Coating'];
    const dispositions = ['Scrap', 'Rework', 'Use-As-Is', 'Return to Supplier'];

    // Generate defects for failed inspections
    const failedInspections = db.prepare(`
      SELECT id, inspection_id, facility_id, units_failed
      FROM qc_inspections
      WHERE units_failed > 0
    `).all() as any[];

    let defectCount = 0;
    failedInspections.forEach(inspection => {
      // 1-3 defect records per failed inspection
      const numDefects = randomInt(1, Math.min(3, inspection.units_failed));

      for (let i = 0; i < numDefects; i++) {
        const defectId = `DEF-${inspection.inspection_id}-${String(i + 1).padStart(2, '0')}`;
        const defectType = randomPick(defectTypes);
        const defectCategory = randomPick(defectCategories);
        const disposition = randomPick(dispositions);

        const quantityAffected = randomInt(1, Math.ceil(inspection.units_failed / numDefects));
        const costImpact = disposition === 'Scrap' ? quantityAffected * randomDecimal(50, 200) :
                           disposition === 'Rework' ? quantityAffected * randomDecimal(20, 80) :
                           quantityAffected * randomDecimal(5, 30);

        const defectDescriptions: { [key: string]: string[] } = {
          'Dimensional': ['Out of tolerance', 'Oversize condition', 'Undersize condition', 'Hole misalignment'],
          'Visual': ['Surface scratches', 'Paint defect', 'Discoloration', 'Cosmetic damage'],
          'Functional': ['Does not operate', 'Performance issue', 'Leakage detected', 'Electrical failure'],
          'Material': ['Wrong material', 'Material contamination', 'Cracks in material', 'Porosity'],
          'Assembly': ['Missing component', 'Incorrect assembly', 'Loose fasteners', 'Misaligned parts'],
          'Coating': ['Coating thickness', 'Coating adhesion', 'Coverage issue', 'Finish roughness']
        };

        const description = randomPick(defectDescriptions[defectCategory]);

        const insert = db.prepare(`
          INSERT INTO qc_defects (
            defect_id, inspection_id, defect_date, facility_id,
            part_number, lot_number, defect_type, defect_category,
            defect_description, quantity_affected, disposition, cost_impact, detected_by_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const detectedBy = randomPick(employees);
        const defectDate = randomDate(subDays(now, 365), now);

        insert.run(
          defectId, inspection.id, defectDate, inspection.facility_id,
          randomPick(partNumbers), `LOT-${randomInt(1000, 9999)}`, defectType, defectCategory,
          description, quantityAffected, disposition, costImpact, detectedBy.id
        );

        defectCount++;
      }
    });
    console.log(`Created ${defectCount} defect records`);

    console.log('Seeding Non-Conformance Reports (NCRs)...');
    const ncrTypes = ['Supplier', 'Internal', 'Customer'];
    const severities = ['Critical', 'Major', 'Minor'];
    const ncrStatuses = ['Open', 'Investigation', 'CAPA Required', 'Closed'];
    const ncrIds: number[] = [];

    // Generate 200 NCRs
    for (let i = 0; i < 200; i++) {
      const ncrId = `NCR-${format(now, 'yyyy')}-${String(i + 1).padStart(4, '0')}`;
      const ncrDate = randomDate(startDate, now);
      const facility = randomPick(facilities);
      const reportedBy = randomPick(employees);
      const ncrType = randomPick(ncrTypes);
      const severity = randomPick(severities);

      const ncrDateObj = new Date(ncrDate);
      const daysAgo = Math.floor((now.getTime() - ncrDateObj.getTime()) / (1000 * 60 * 60 * 24));

      let status: string;
      let closureDate = null;
      let daysToClose = null;

      if (daysAgo > 90) {
        status = 'Closed';
        closureDate = randomDate(ncrDateObj, addDays(ncrDateObj, randomInt(15, 60)));
        daysToClose = randomInt(15, 60);
      } else if (daysAgo > 30) {
        status = randomPick(['CAPA Required', 'Investigation', 'Closed']);
        if (status === 'Closed') {
          closureDate = randomDate(ncrDateObj, now);
          daysToClose = randomInt(15, daysAgo);
        }
      } else {
        status = randomPick(['Open', 'Investigation']);
      }

      const insert = db.prepare(`
        INSERT INTO qc_ncr (
          ncr_id, ncr_date, facility_id, reported_by_id, ncr_type,
          severity, product_affected, quantity_affected, description,
          status, closure_date, days_to_closure, effectiveness_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insert.run(
        ncrId, ncrDate, facility.id, reportedBy.id, ncrType,
        severity, randomPick(partNumbers), randomInt(10, 500),
        `${ncrType} quality issue requiring investigation and corrective action`,
        status, closureDate, daysToClose,
        status === 'Closed' ? (Math.random() > 0.2 ? 1 : 0) : 0
      );

      ncrIds.push(result.lastInsertRowid as number);
    }
    console.log(`Created ${ncrIds.length} NCRs`);

    console.log('Seeding Corrective and Preventive Actions (CAPAs)...');
    // Create CAPAs for NCRs that require them
    const ncrRequiringCapa = db.prepare(`
      SELECT id, ncr_id, facility_id, ncr_date
      FROM qc_ncr
      WHERE status IN ('CAPA Required', 'Closed') AND severity IN ('Critical', 'Major')
    `).all() as any[];

    let capaCount = 0;
    ncrRequiringCapa.forEach(ncr => {
      const capaId = `CAPA-${ncr.ncr_id}`;
      const capaDate = ncr.ncr_date;
      const capaType = Math.random() > 0.3 ? 'Corrective' : 'Preventive';
      const priority = Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low';
      const assignedTo = randomPick(employees);
      const dueDate = format(addDays(new Date(capaDate), randomInt(30, 90)), 'yyyy-MM-dd');

      const capaDateObj = new Date(capaDate);
      const dueDateObj = new Date(dueDate);
      const daysFromNow = Math.floor((now.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24));

      let status: string;
      let completionDate = null;
      let effectivenessRating = null;

      if (daysFromNow > 0) {
        // Past due date
        if (Math.random() > 0.15) {
          status = 'Completed';
          completionDate = randomDate(capaDateObj, dueDateObj);
          effectivenessRating = randomInt(3, 5);
        } else {
          status = randomPick(['In Progress', 'Open']);
        }
      } else {
        status = randomPick(['Open', 'In Progress']);
      }

      const insert = db.prepare(`
        INSERT INTO qc_capa (
          capa_id, ncr_id, capa_date, facility_id, capa_type, priority,
          description, root_cause, corrective_action, assigned_to_id,
          due_date, completion_date, status, effectiveness_rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        capaId, ncr.id, capaDate, ncr.facility_id, capaType, priority,
        'Corrective action to address root cause and prevent recurrence',
        'Process variation and inadequate controls',
        'Implement process controls, update procedures, train personnel',
        assignedTo.id, dueDate, completionDate, status, effectivenessRating
      );

      capaCount++;
    });
    console.log(`Created ${capaCount} CAPAs`);

    console.log('Seeding customer returns and RMAs...');
    const returnReasons = [
      'Dimensional non-conformance', 'Visual defect', 'Functional failure',
      'Wrong part shipped', 'Damaged in transit', 'Performance issue',
      'Material defect', 'Assembly error'
    ];

    // Generate 80 customer returns
    for (let i = 0; i < 80; i++) {
      const rmaNumber = `RMA-${format(now, 'yyyy')}-${String(i + 1).padStart(4, '0')}`;
      const returnDate = randomDate(startDate, now);
      const facility = randomPick(facilities);
      const customer = randomPick(customers);
      const quantityReturned = randomInt(1, 50);
      const returnReason = randomPick(returnReasons);

      const disposition = randomPick(['Credit', 'Replace', 'Repair', 'Reject']);
      const creditAmount = disposition === 'Credit' ? quantityReturned * randomDecimal(50, 300) : 0;

      const insert = db.prepare(`
        INSERT INTO qc_customer_returns (
          rma_number, return_date, facility_id, customer_name, product_name,
          lot_number, quantity_returned, return_reason, disposition,
          credit_amount, warranty_claim, processed_by_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const processedBy = randomPick(employees);

      insert.run(
        rmaNumber, returnDate, facility.id, customer, randomPick(partNumbers),
        `LOT-${randomInt(1000, 9999)}`, quantityReturned, returnReason, disposition,
        creditAmount, Math.random() > 0.7 ? 1 : 0, processedBy.id
      );
    }
    console.log('Created 80 customer returns');

    console.log('Seeding supplier quality metrics...');
    // Generate supplier quality data for each vendor
    let supplierQualityCount = 0;
    vendors.forEach(vendor => {
      // 20-30 receipts per vendor over the year
      const numReceipts = randomInt(20, 30);

      for (let i = 0; i < numReceipts; i++) {
        const recordId = `SQ-${vendor.id}-${String(i + 1).padStart(4, '0')}`;
        const recordDate = randomDate(startDate, now);
        const facility = randomPick(facilities);
        const partNumber = randomPick(partNumbers);

        const quantityReceived = randomInt(100, 1000);
        const quantityInspected = Math.min(quantityReceived, randomInt(32, 200));

        // 95-99% acceptance rate
        const acceptRate = randomDecimal(0.95, 0.99);
        const quantityAccepted = Math.floor(quantityInspected * acceptRate);
        const quantityRejected = quantityInspected - quantityAccepted;

        const ppbDefects = quantityRejected > 0
          ? Math.floor((quantityRejected / quantityInspected) * 1000000000)
          : 0;

        const insert = db.prepare(`
          INSERT INTO qc_supplier_quality (
            record_id, record_date, vendor_id, facility_id, receipt_id,
            part_number, lot_number, quantity_received, quantity_inspected,
            quantity_accepted, quantity_rejected, ppb_defects,
            supplier_notification_sent, corrective_action_required, inspector_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const inspector = randomPick(employees);

        insert.run(
          recordId, recordDate, vendor.id, facility.id, `RCPT-${randomInt(10000, 99999)}`,
          partNumber, `LOT-${randomInt(1000, 9999)}`, quantityReceived, quantityInspected,
          quantityAccepted, quantityRejected, ppbDefects,
          quantityRejected > 10 ? 1 : 0,
          quantityRejected > 20 ? 1 : 0,
          inspector.id
        );

        supplierQualityCount++;
      }
    });
    console.log(`Created ${supplierQualityCount} supplier quality records`);

    console.log('Seeding scrap tracking...');
    const scrapReasons = [
      'Material defect', 'Process error', 'Handling damage', 'Design change',
      'Tool wear', 'Operator error', 'Equipment malfunction', 'Setup error'
    ];
    const scrapCategories = ['Material', 'Process', 'Design', 'Handling'];

    // Generate 300 scrap records
    for (let i = 0; i < 300; i++) {
      const scrapId = `SCRAP-${format(now, 'yyyy')}-${String(i + 1).padStart(5, '0')}`;
      const scrapDate = randomDate(startDate, now);
      const facility = randomPick(facilities);
      const quantityScrapped = randomInt(1, 100);
      const materialCost = quantityScrapped * randomDecimal(20, 150);
      const laborCost = quantityScrapped * randomDecimal(10, 50);

      const insert = db.prepare(`
        INSERT INTO qc_scrap (
          scrap_id, scrap_date, facility_id, part_number, lot_number,
          quantity_scrapped, scrap_reason, scrap_category,
          material_cost, labor_cost, total_scrap_cost, responsible_department
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        scrapId, scrapDate, facility.id, randomPick(partNumbers), `LOT-${randomInt(1000, 9999)}`,
        quantityScrapped, randomPick(scrapReasons), randomPick(scrapCategories),
        materialCost, laborCost, materialCost + laborCost,
        randomPick(['Production', 'Assembly', 'Quality', 'Machining'])
      );
    }
    console.log('Created 300 scrap records');

    console.log('Seeding rework tracking...');
    const reworkOperations = [
      'Re-machine dimension', 'Touch-up paint', 'Re-assemble', 'Repair weld',
      'Replace component', 'Adjust alignment', 'Clean and refinish', 'Rework coating'
    ];

    // Generate 250 rework records
    for (let i = 0; i < 250; i++) {
      const reworkId = `RWRK-${format(now, 'yyyy')}-${String(i + 1).padStart(5, '0')}`;
      const reworkDate = randomDate(startDate, now);
      const facility = randomPick(facilities);
      const quantityReworked = randomInt(1, 50);
      const reworkHours = quantityReworked * randomDecimal(0.5, 3.0);
      const laborCost = reworkHours * randomDecimal(50, 80);
      const materialCost = quantityReworked * randomDecimal(5, 30);

      const insert = db.prepare(`
        INSERT INTO qc_rework (
          rework_id, rework_date, facility_id, part_number, lot_number,
          quantity_reworked, original_defect, rework_operation,
          rework_hours, labor_cost, material_cost, total_rework_cost,
          rework_success, performed_by_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const performedBy = randomPick(employees);

      insert.run(
        reworkId, reworkDate, facility.id, randomPick(partNumbers), `LOT-${randomInt(1000, 9999)}`,
        quantityReworked, randomPick(returnReasons), randomPick(reworkOperations),
        reworkHours, laborCost, materialCost, laborCost + materialCost,
        Math.random() > 0.1 ? 1 : 0, performedBy.id
      );
    }
    console.log('Created 250 rework records');

    console.log('Seeding quality audits...');
    const auditTypes = ['Internal', 'External', 'Supplier', 'Customer'];
    const auditScopes = ['ISO 9001', 'AS9100', 'IATF 16949', 'Product Audit', 'Process Audit'];

    // Generate 48 audits (quarterly per facility)
    facilities.forEach(facility => {
      for (let q = 0; q < 12; q++) {
        const auditId = `AUD-${facility.id}-${format(now, 'yyyy')}-${String(q + 1).padStart(2, '0')}`;
        const auditDate = format(subDays(now, q * 30), 'yyyy-MM-dd');
        const auditType = randomPick(auditTypes);
        const auditScope = randomPick(auditScopes);

        const totalFindings = auditType === 'External' ? randomInt(3, 15) : randomInt(5, 20);
        const criticalFindings = randomInt(0, 2);
        const majorFindings = randomInt(0, Math.min(5, totalFindings - criticalFindings));
        const minorFindings = randomInt(0, totalFindings - criticalFindings - majorFindings);
        const observations = totalFindings - criticalFindings - majorFindings - minorFindings;

        const overallScore = randomDecimal(75, 98);
        const passFail = overallScore >= 85 ? 'Pass' : overallScore >= 75 ? 'Conditional Pass' : 'Fail';

        const insert = db.prepare(`
          INSERT INTO qc_audits (
            audit_id, audit_date, facility_id, audit_type, audit_scope,
            auditor_name, total_findings, critical_findings, major_findings,
            minor_findings, observations, overall_score, pass_fail,
            next_audit_date, report_issued_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
          auditId, auditDate, facility.id, auditType, auditScope,
          `${randomPick(['John', 'Sarah', 'Mike', 'Lisa'])} ${randomPick(['Smith', 'Johnson', 'Williams'])} - Lead Auditor`,
          totalFindings, criticalFindings, majorFindings, minorFindings, observations,
          overallScore, passFail,
          format(addDays(new Date(auditDate), auditType === 'External' ? 365 : 90), 'yyyy-MM-dd'),
          format(addDays(new Date(auditDate), randomInt(7, 21)), 'yyyy-MM-dd')
        );
      }
    });
    console.log('Created 48 quality audits');

    console.log('Seeding measurement system analysis...');
    const measurementTypes = ['Gage R&R', 'Linearity', 'Bias', 'Stability'];

    // Generate 30 MSA studies
    for (let i = 0; i < 30; i++) {
      const msaId = `MSA-${format(now, 'yyyy')}-${String(i + 1).padStart(3, '0')}`;
      const studyDate = randomDate(startDate, now);
      const facility = randomPick(facilities);
      const measurementType = randomPick(measurementTypes);

      const grrPercent = randomDecimal(5, 35);
      const passFail = grrPercent < 10 ? 'Pass' : grrPercent < 30 ? 'Marginal' : 'Fail';

      const insert = db.prepare(`
        INSERT INTO qc_measurement_systems (
          msa_id, study_date, facility_id, equipment_name, measurement_type,
          characteristic_measured, study_type, operators, parts, trials,
          grr_percent, reproducibility_percent, repeatability_percent,
          pass_fail, calibration_due_date, performed_by_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const performedBy = randomPick(employees);

      insert.run(
        msaId, studyDate, facility.id,
        `${randomPick(['CMM', 'Micrometer', 'Caliper', 'Hardness Tester', 'Spectrophotometer'])} #${randomInt(1, 5)}`,
        measurementType, `${randomPick(['Length', 'Width', 'Thickness', 'Hardness', 'Color'])} measurement`,
        randomPick(['Crossed', 'Nested']), randomInt(2, 3), randomInt(10, 15), randomInt(2, 3),
        grrPercent, grrPercent * randomDecimal(0.4, 0.6), grrPercent * randomDecimal(0.4, 0.6),
        passFail, format(addDays(new Date(studyDate), 365), 'yyyy-MM-dd'), performedBy.id
      );
    }
    console.log('Created 30 MSA studies');

    console.log('Seeding cost of quality data...');
    const coqCategories = ['Prevention', 'Appraisal', 'Internal Failure', 'External Failure'];
    const coqSubcategories: { [key: string]: string[] } = {
      'Prevention': ['Training', 'Quality Planning', 'Process Control', 'Preventive Maintenance'],
      'Appraisal': ['Inspection', 'Testing', 'Calibration', 'Audit Costs'],
      'Internal Failure': ['Scrap', 'Rework', 'Re-inspection', 'Downtime'],
      'External Failure': ['Returns', 'Warranty', 'Recalls', 'Liability']
    };

    // Generate monthly COQ data for each facility
    let coqCount = 0;
    for (let m = 0; m < 12; m++) {
      const recordDate = format(subDays(now, m * 30), 'yyyy-MM-dd');

      facilities.forEach(facility => {
        coqCategories.forEach(category => {
          const subcategory = randomPick(coqSubcategories[category]);
          const recordId = `COQ-${facility.id}-${format(new Date(recordDate), 'yyyyMM')}-${category.substring(0, 3)}`;

          const amount = category === 'Prevention' ? randomDecimal(5000, 20000) :
                        category === 'Appraisal' ? randomDecimal(10000, 30000) :
                        category === 'Internal Failure' ? randomDecimal(20000, 80000) :
                        randomDecimal(10000, 50000);

          const salesPeriod = randomDecimal(800000, 1500000);
          const copqPercentage = (amount / salesPeriod) * 100;

          const insert = db.prepare(`
            INSERT INTO qc_cost_of_quality (
              record_id, record_date, facility_id, cost_category, cost_subcategory,
              description, amount, sales_period, copq_percentage, department
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          insert.run(
            recordId, recordDate, facility.id, category, subcategory,
            `${category} costs for ${subcategory}`, amount, salesPeriod, copqPercentage,
            randomPick(['Quality', 'Production', 'Engineering'])
          );

          coqCount++;
        });
      });
    }
    console.log(`Created ${coqCount} cost of quality records`);

    console.log('QC data seeding completed successfully!');
    console.log('Summary:');
    console.log(`  - ${inspectionIds.length} quality inspections`);
    console.log(`  - ${defectCount} defect records`);
    console.log(`  - ${ncrIds.length} NCRs`);
    console.log(`  - ${capaCount} CAPAs`);
    console.log(`  - 80 customer returns`);
    console.log(`  - ${supplierQualityCount} supplier quality records`);
    console.log(`  - 300 scrap records`);
    console.log(`  - 250 rework records`);
    console.log(`  - 48 quality audits`);
    console.log(`  - 30 MSA studies`);
    console.log(`  - ${coqCount} cost of quality records`);

  } catch (error) {
    console.error('Error seeding QC data:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  seedDataQC();
}
