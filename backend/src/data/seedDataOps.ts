// Seed data for Operations Analytics Module
import Database from 'better-sqlite3';
import path from 'path';
import { subDays, format, addDays, differenceInHours } from 'date-fns';

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

function randomDatetime(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

function randomDecimal(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

export function seedDataOps() {
  console.log('Starting Operations data seeding...');

  try {
    // Get facilities
    const facilities = db.prepare('SELECT id, name, type FROM facilities').all() as any[];
    console.log(`Found ${facilities.length} facilities`);

    // Get employees
    const employees = db.prepare("SELECT id, employee_id, department FROM employees WHERE status = 'Active' LIMIT 200").all() as any[];
    console.log(`Found ${employees.length} employees`);

    // Product categories for manufacturing
    const productCategories: string[] = [
      'Steel Beams',
      'Concrete Panels',
      'Lumber Packages',
      'Roofing Materials',
      'Window Units',
      'Door Assemblies',
      'HVAC Components',
      'Electrical Panels',
      'Piping Systems',
      'Fastener Sets'
    ];

    // Equipment types
    const equipmentTypes = [
      { type: 'CNC Machine', count: 8, maintenance_days: 90 },
      { type: 'Press', count: 6, maintenance_days: 60 },
      { type: 'Conveyor System', count: 12, maintenance_days: 120 },
      { type: 'Forklift', count: 15, maintenance_days: 30 },
      { type: 'Crane', count: 4, maintenance_days: 90 },
      { type: 'Welding Station', count: 10, maintenance_days: 60 },
      { type: 'Paint Booth', count: 5, maintenance_days: 90 },
      { type: 'Assembly Line', count: 6, maintenance_days: 120 },
      { type: 'Testing Equipment', count: 8, maintenance_days: 180 },
      { type: 'Packaging Machine', count: 7, maintenance_days: 60 }
    ];

    // Downtime types
    const downtimeTypes: string[] = [
      'Breakdown',
      'Planned Maintenance',
      'Changeover',
      'No Demand',
      'Material Shortage',
      'Quality Hold'
    ];

    // Defect types
    const defectTypes: string[] = [
      'Dimensional',
      'Surface Finish',
      'Material Defect',
      'Assembly Error',
      'Coating Issue',
      'Functional Failure',
      'Documentation Error',
      'Packaging Damage'
    ];

    // Inventory categories
    const inventoryCategories: string[] = [
      'Raw Material',
      'WIP',
      'Finished Goods',
      'MRO'
    ];

    const transactionTypes: string[] = [
      'Receipt',
      'Issue',
      'Transfer',
      'Adjustment',
      'Count'
    ];

    // Vendor categories
    const vendorCategories: string[] = [
      'Raw Materials',
      'Components',
      'Services',
      'Equipment',
      'MRO Supplies'
    ];

    // Carrier names
    const carriers: string[] = [
      'FedEx Freight',
      'UPS Freight',
      'XPO Logistics',
      'Old Dominion',
      'YRC Freight',
      'Estes Express',
      'ABF Freight'
    ];

    console.log('Seeding vendors...');
    const vendorNames: string[] = [
      'SteelCo Suppliers',
      'MetalWorks Inc',
      'BuildMart Supply',
      'Industrial Components Ltd',
      'Precision Parts Co',
      'MRO Solutions',
      'FastFix Maintenance',
      'QualityFirst Materials',
      'LogiSupply Chain',
      'TechEquip Services',
      'GreenBuild Materials',
      'SafetyFirst Supplies',
      'PowerTools Direct',
      'ChemSupply Corp',
      'PackPro Solutions'
    ];

    const vendorIds: number[] = [];
    vendorNames.forEach((name, idx) => {
      const vendorId = `VEND-${String(idx + 1).padStart(4, '0')}`;
      const category = randomPick(vendorCategories);
      const rating = randomDecimal(3.0, 5.0, 2);

      const insert = db.prepare(`
        INSERT INTO ops_vendors (vendor_id, vendor_name, vendor_category, contact_email, contact_phone, rating)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = insert.run(
        vendorId,
        name,
        category,
        `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        `555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        rating
      );

      vendorIds.push(result.lastInsertRowid as number);
    });
    console.log(`Created ${vendorIds.length} vendors`);

    console.log('Seeding equipment...');
    const equipmentIds: number[] = [];
    const equipmentData: any[] = [];

    facilities.forEach(facility => {
      equipmentTypes.forEach(eqType => {
        const numEquipment = Math.ceil(eqType.count / facilities.length);

        for (let i = 0; i < numEquipment; i++) {
          const equipmentId = `EQ-${facility.id}-${eqType.type.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
          const equipmentName = `${eqType.type} #${i + 1}`;
          const purchaseDate = randomDate(subDays(new Date(), 1800), subDays(new Date(), 365));
          const lastMaintenanceDate = randomDate(subDays(new Date(), 90), subDays(new Date(), 1));
          const nextMaintenanceDate = format(addDays(new Date(lastMaintenanceDate), eqType.maintenance_days), 'yyyy-MM-dd');

          // Some equipment is down or in maintenance
          const statusRoll = Math.random();
          let status = 'Operational';
          if (statusRoll > 0.95) status = 'Down';
          else if (statusRoll > 0.90) status = 'Maintenance';

          const oeeTarget = randomDecimal(80.0, 90.0, 2);

          const insert = db.prepare(`
            INSERT INTO ops_equipment (
              equipment_id, equipment_name, facility_id, equipment_type,
              purchase_date, last_maintenance_date, next_maintenance_date,
              status, oee_target
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const result = insert.run(
            equipmentId,
            equipmentName,
            facility.id,
            eqType.type,
            purchaseDate,
            lastMaintenanceDate,
            nextMaintenanceDate,
            status,
            oeeTarget
          );

          equipmentIds.push(result.lastInsertRowid as number);
          equipmentData.push({
            id: result.lastInsertRowid as number,
            equipmentId,
            facilityId: facility.id,
            type: eqType.type,
            status
          });
        }
      });
    });
    console.log(`Created ${equipmentIds.length} equipment records`);

    console.log('Seeding production orders...');
    const orderIds: number[] = [];
    const now = new Date();
    const orderStartDate = subDays(now, 365);

    // Generate 500 production orders over past year
    for (let i = 0; i < 500; i++) {
      const orderId = `PO-${format(now, 'yyyy')}-${String(i + 1).padStart(5, '0')}`;
      const facility = randomPick(facilities);
      const productName = randomPick(productCategories);
      const orderDate = randomDate(orderStartDate, now);
      const dueDate = format(addDays(new Date(orderDate), randomInt(7, 45)), 'yyyy-MM-dd');

      const quantityOrdered = randomInt(50, 500);
      let quantityProduced = 0;
      let completionDate = null;
      let status = 'Scheduled';

      // Determine order status based on dates
      const orderDateObj = new Date(orderDate);
      const dueDateObj = new Date(dueDate);

      if (dueDateObj < now) {
        // Past due date - should be completed
        const completionRoll = Math.random();
        if (completionRoll > 0.1) {
          // 90% completed
          status = 'Completed';
          completionDate = randomDate(orderDateObj, dueDateObj);
          quantityProduced = quantityOrdered;

          // Some orders are late
          if (Math.random() > 0.85) {
            completionDate = format(addDays(dueDateObj, randomInt(1, 10)), 'yyyy-MM-dd');
          }
        } else {
          // 10% in progress (delayed)
          status = 'In Progress';
          quantityProduced = Math.floor(quantityOrdered * randomDecimal(0.6, 0.9));
        }
      } else if (orderDateObj < now) {
        // Between order date and due date - in progress
        status = 'In Progress';
        quantityProduced = Math.floor(quantityOrdered * randomDecimal(0.3, 0.8));
      } else {
        // Future order date - scheduled
        status = 'Scheduled';
        quantityProduced = 0;
      }

      const priorityRoll = Math.random();
      let priority = 'Medium';
      if (priorityRoll > 0.90) priority = 'Urgent';
      else if (priorityRoll > 0.70) priority = 'High';
      else if (priorityRoll < 0.20) priority = 'Low';

      const insert = db.prepare(`
        INSERT INTO ops_production_orders (
          order_id, facility_id, product_name, order_date, due_date,
          completion_date, quantity_ordered, quantity_produced, status, priority
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insert.run(
        orderId,
        facility.id,
        productName,
        orderDate,
        dueDate,
        completionDate,
        quantityOrdered,
        quantityProduced,
        status,
        priority
      );

      orderIds.push(result.lastInsertRowid as number);
    }
    console.log(`Created ${orderIds.length} production orders`);

    console.log('Seeding equipment downtime...');
    // Generate downtime events for past 180 days
    const downtimeStartDate = subDays(now, 180);
    let downtimeCount = 0;

    equipmentData.forEach(equipment => {
      // Each equipment has 2-8 downtime events over 180 days
      const numDowntimes = randomInt(2, 8);

      for (let i = 0; i < numDowntimes; i++) {
        const downtimeId = `DT-${equipment.equipmentId}-${String(i + 1).padStart(3, '0')}`;
        const startTime = randomDatetime(downtimeStartDate, now);
        const startTimeObj = new Date(startTime);

        const downtimeType = randomPick(downtimeTypes);

        // Duration depends on type
        let durationHours: number;
        if (downtimeType === 'Breakdown') durationHours = randomDecimal(2, 48);
        else if (downtimeType === 'Planned Maintenance') durationHours = randomDecimal(4, 16);
        else if (downtimeType === 'Changeover') durationHours = randomDecimal(0.5, 4);
        else if (downtimeType === 'Material Shortage') durationHours = randomDecimal(1, 24);
        else if (downtimeType === 'Quality Hold') durationHours = randomDecimal(2, 12);
        else durationHours = randomDecimal(1, 8);

        const endTime = format(addDays(startTimeObj, durationHours / 24), 'yyyy-MM-dd HH:mm:ss');
        const productionLossUnits = Math.floor(durationHours * randomInt(5, 20));

        const resolved = new Date(endTime) < now ? 1 : 0;

        const reasons: { [key: string]: string[] } = {
          'Breakdown': ['Mechanical failure', 'Electrical fault', 'Hydraulic leak', 'Bearing failure', 'Control system error'],
          'Planned Maintenance': ['Scheduled PM', 'Oil change', 'Filter replacement', 'Calibration', 'Preventive inspection'],
          'Changeover': ['Product changeover', 'Tooling change', 'Setup adjustment', 'Line reconfiguration'],
          'Material Shortage': ['Raw material delay', 'Component shortage', 'Supplier issue', 'Inventory error'],
          'Quality Hold': ['Quality issue detected', 'Inspection hold', 'Rework required', 'Specification change'],
          'No Demand': ['Schedule gap', 'Customer delay', 'Inventory surplus']
        };

        const reason = randomPick(reasons[downtimeType] || ['General downtime']);

        const insert = db.prepare(`
          INSERT INTO ops_downtime (
            downtime_id, equipment_id, start_time, end_time, downtime_type,
            reason, impact_hours, production_loss_units, resolved
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
          downtimeId,
          equipment.id,
          startTime,
          endTime,
          downtimeType,
          reason,
          durationHours,
          productionLossUnits,
          resolved
        );

        downtimeCount++;
      }
    });
    console.log(`Created ${downtimeCount} downtime events`);

    console.log('Seeding quality inspections...');
    // Create quality inspections for completed orders
    const completedOrders = db.prepare("SELECT id, order_id, quantity_produced FROM ops_production_orders WHERE status = 'Completed'").all() as any[];

    let inspectionCount = 0;
    completedOrders.forEach(order => {
      // 1-3 inspections per order
      const numInspections = randomInt(1, 3);

      for (let i = 0; i < numInspections; i++) {
        const inspectionId = `QI-${order.order_id}-${String(i + 1).padStart(2, '0')}`;
        const inspectionDate = randomDate(subDays(now, 365), now);
        const inspector = randomPick(employees);

        const unitsInspected = Math.min(randomInt(20, 100), order.quantity_produced);
        const defectRate = randomDecimal(0.01, 0.08); // 1-8% defect rate
        const unitsFailed = Math.floor(unitsInspected * defectRate);
        const unitsPassed = unitsInspected - unitsFailed;

        const numDefectTypes: number = unitsFailed > 0 ? randomInt(1, 3) : 0;
        const selectedDefects: string[] = [];
        for (let j = 0; j < numDefectTypes; j++) {
          let defect = randomPick(defectTypes);
          while (selectedDefects.includes(defect)) {
            defect = randomPick(defectTypes);
          }
          selectedDefects.push(defect);
        }

        const correctiveActions: string[] = [
          'Rework completed',
          'Process adjustment made',
          'Operator retrained',
          'Equipment recalibrated',
          'Material supplier notified',
          'Inspection criteria clarified',
          'Preventive measures implemented',
          'Root cause analysis completed'
        ];

        const correctiveAction = unitsFailed > 0 ? randomPick(correctiveActions) : null;

        const insert = db.prepare(`
          INSERT INTO ops_quality_inspections (
            inspection_id, production_order_id, inspection_date, inspector_id,
            units_inspected, units_passed, units_failed, defect_types, corrective_action
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
          inspectionId,
          order.id,
          inspectionDate,
          inspector.id,
          unitsInspected,
          unitsPassed,
          unitsFailed,
          JSON.stringify(selectedDefects),
          correctiveAction
        );

        inspectionCount++;
      }
    });
    console.log(`Created ${inspectionCount} quality inspections`);

    console.log('Seeding inventory transactions...');
    const inventoryItems: string[] = [
      'Steel Sheets',
      'Aluminum Coils',
      'Fasteners',
      'Paint',
      'Lubricants',
      'Packaging Materials',
      'Safety Equipment',
      'Electrical Components',
      'Hydraulic Fluid',
      'Cutting Tools'
    ];

    let transactionCount = 0;
    const inventoryStartDate = subDays(now, 365);

    facilities.forEach(facility => {
      inventoryItems.forEach(item => {
        // 20-50 transactions per item per facility over the year
        const numTransactions = randomInt(20, 50);
        let balance = randomDecimal(1000, 5000);

        for (let i = 0; i < numTransactions; i++) {
          const transactionId = `INV-${facility.id}-${String(transactionCount + 1).padStart(6, '0')}`;
          const transactionDate = randomDate(inventoryStartDate, now);
          const transactionType = randomPick(transactionTypes);
          const category = randomPick(inventoryCategories);

          let quantity: number;
          if (transactionType === 'Receipt') {
            quantity = randomDecimal(100, 1000);
            balance += quantity;
          } else if (transactionType === 'Issue') {
            quantity = -randomDecimal(50, 500);
            balance += quantity;
          } else if (transactionType === 'Transfer') {
            quantity = Math.random() > 0.5 ? randomDecimal(50, 300) : -randomDecimal(50, 300);
            balance += quantity;
          } else {
            // Adjustment or Count
            quantity = randomDecimal(-100, 100);
            balance += quantity;
          }

          balance = Math.max(0, balance); // Can't go negative

          const unitCost = randomDecimal(5, 150, 2);

          const insert = db.prepare(`
            INSERT INTO ops_inventory (
              transaction_id, facility_id, item_name, item_category,
              transaction_type, transaction_date, quantity, unit_cost, balance_after
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          insert.run(
            transactionId,
            facility.id,
            item,
            category,
            transactionType,
            transactionDate,
            quantity,
            unitCost,
            balance
          );

          transactionCount++;
        }
      });
    });
    console.log(`Created ${transactionCount} inventory transactions`);

    console.log('Seeding shipments...');
    const customerNames: string[] = [
      'BuildRight Construction',
      'MegaProject Developers',
      'Urban Renovations Inc',
      'SkyHigh Builders',
      'Foundation First LLC',
      'Premier Construction Co',
      'Apex Building Solutions',
      'TowerBuild Enterprises',
      'CityScape Developers',
      'Horizon Construction'
    ];

    let shipmentCount = 0;
    const shipmentStartDate = subDays(now, 365);

    for (let i = 0; i < 400; i++) {
      const shipmentId = `SHIP-${format(now, 'yyyy')}-${String(i + 1).padStart(5, '0')}`;
      const facility = randomPick(facilities);
      const customerName = randomPick(customerNames);
      const orderDate = randomDate(shipmentStartDate, now);
      const promisedDeliveryDate = format(addDays(new Date(orderDate), randomInt(5, 21)), 'yyyy-MM-dd');

      const unitsOrdered = randomInt(50, 300);
      const unitsShipped = unitsOrdered;

      let shipmentStatus = 'Pending';
      let actualDeliveryDate = null;
      let onTime = null;

      const orderDateObj = new Date(orderDate);
      const promisedDateObj = new Date(promisedDeliveryDate);

      if (promisedDateObj < now) {
        // Should be delivered
        const deliveryRoll = Math.random();
        if (deliveryRoll > 0.05) {
          shipmentStatus = 'Delivered';

          // 85% on time, 15% late
          if (Math.random() > 0.15) {
            actualDeliveryDate = randomDate(orderDateObj, promisedDateObj);
            onTime = 1;
          } else {
            actualDeliveryDate = format(addDays(promisedDateObj, randomInt(1, 10)), 'yyyy-MM-dd');
            onTime = 0;
          }
        } else {
          // 5% delayed
          shipmentStatus = 'Delayed';
        }
      } else if (addDays(orderDateObj, 3) < now) {
        // In transit
        const statusRoll = Math.random();
        if (statusRoll > 0.7) shipmentStatus = 'In Transit';
        else if (statusRoll > 0.3) shipmentStatus = 'Shipped';
        else shipmentStatus = 'Pending';
      }

      const carrier = randomPick(carriers);
      const trackingNumber = `1Z${randomInt(100000, 999999)}${randomInt(10000000, 99999999)}`;

      const insert = db.prepare(`
        INSERT INTO ops_shipments (
          shipment_id, facility_id, customer_name, order_date,
          promised_delivery_date, actual_delivery_date, shipment_status,
          units_ordered, units_shipped, on_time, carrier, tracking_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        shipmentId,
        facility.id,
        customerName,
        orderDate,
        promisedDeliveryDate,
        actualDeliveryDate,
        shipmentStatus,
        unitsOrdered,
        unitsShipped,
        onTime,
        carrier,
        trackingNumber
      );

      shipmentCount++;
    }
    console.log(`Created ${shipmentCount} shipments`);

    console.log('Seeding vendor deliveries...');
    let vendorDeliveryCount = 0;
    const vendorDeliveryStartDate = subDays(now, 365);

    vendorIds.forEach(vendorId => {
      // Each vendor has 20-40 deliveries over the year
      const numDeliveries = randomInt(20, 40);

      for (let i = 0; i < numDeliveries; i++) {
        const deliveryId = `VD-${vendorId}-${String(i + 1).padStart(4, '0')}`;
        const facility = randomPick(facilities);
        const poNumber = `PO-${randomInt(10000, 99999)}`;
        const orderDate = randomDate(vendorDeliveryStartDate, now);
        const expectedDate = format(addDays(new Date(orderDate), randomInt(5, 21)), 'yyyy-MM-dd');

        let actualDeliveryDate = null;
        let onTime = null;
        let qualityRating = null;

        const orderDateObj = new Date(orderDate);
        const expectedDateObj = new Date(expectedDate);

        if (expectedDateObj < now) {
          // Should be delivered
          // 80% on time, 20% late
          if (Math.random() > 0.20) {
            actualDeliveryDate = randomDate(orderDateObj, expectedDateObj);
            onTime = 1;
          } else {
            actualDeliveryDate = format(addDays(expectedDateObj, randomInt(1, 7)), 'yyyy-MM-dd');
            onTime = 0;
          }

          qualityRating = randomDecimal(3.5, 5.0, 2);
        }

        const unitsOrdered = randomInt(100, 1000);
        const unitsReceived = actualDeliveryDate ? unitsOrdered : 0;
        const unitsRejected = actualDeliveryDate ? Math.floor(unitsReceived * randomDecimal(0, 0.05)) : 0;

        const insert = db.prepare(`
          INSERT INTO ops_vendor_deliveries (
            delivery_id, vendor_id, facility_id, po_number, order_date,
            expected_date, actual_delivery_date, on_time, quality_rating,
            units_ordered, units_received, units_rejected
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
          deliveryId,
          vendorId,
          facility.id,
          poNumber,
          orderDate,
          expectedDate,
          actualDeliveryDate,
          onTime,
          qualityRating,
          unitsOrdered,
          unitsReceived,
          unitsRejected
        );

        vendorDeliveryCount++;
      }
    });
    console.log(`Created ${vendorDeliveryCount} vendor deliveries`);

    console.log('Seeding work orders...');
    const workOrderTypes: string[] = ['Preventive', 'Corrective', 'Predictive', 'Emergency'];
    const workOrderStatuses: string[] = ['Open', 'In Progress', 'Completed', 'Cancelled'];
    const workOrderPriorities: string[] = ['Low', 'Medium', 'High', 'Critical'];

    let workOrderCount = 0;
    const workOrderStartDate = subDays(now, 365);

    equipmentData.forEach(equipment => {
      // Each equipment has 5-15 work orders over the year
      const numWorkOrders = randomInt(5, 15);

      for (let i = 0; i < numWorkOrders; i++) {
        const workOrderId = `WO-${equipment.equipmentId}-${String(i + 1).padStart(4, '0')}`;
        const workOrderType = randomPick(workOrderTypes);
        const createdDate = randomDate(workOrderStartDate, now);
        const scheduledDate = format(addDays(new Date(createdDate), randomInt(1, 14)), 'yyyy-MM-dd');

        let completionDate = null;
        let status = 'Open';

        const scheduledDateObj = new Date(scheduledDate);

        if (scheduledDateObj < now) {
          // Should be completed or in progress
          const statusRoll = Math.random();
          if (statusRoll > 0.2) {
            status = 'Completed';
            completionDate = randomDate(scheduledDateObj, now);
          } else if (statusRoll > 0.1) {
            status = 'In Progress';
          } else {
            status = 'Open'; // Overdue
          }
        }

        const technician = randomPick(employees);
        const laborHours = status === 'Completed' ? randomDecimal(2, 16, 2) : null;
        const partsCost = status === 'Completed' ? randomDecimal(50, 2000, 2) : null;
        const totalCost = laborHours && partsCost ? laborHours * 75 + partsCost : null;

        const priorityRoll = Math.random();
        let priority = 'Medium';
        if (workOrderType === 'Emergency') priority = 'Critical';
        else if (priorityRoll > 0.80) priority = 'High';
        else if (priorityRoll < 0.20) priority = 'Low';

        const descriptions: string[] = [
          'Routine maintenance and inspection',
          'Replace worn components',
          'Calibration and adjustment',
          'Lubrication and cleaning',
          'Repair hydraulic system',
          'Replace filters and fluids',
          'Electrical system troubleshooting',
          'Safety system inspection',
          'Performance optimization',
          'Emergency repair'
        ];

        const description = randomPick(descriptions);

        const insert = db.prepare(`
          INSERT INTO ops_work_orders (
            work_order_id, equipment_id, work_order_type, created_date,
            scheduled_date, completion_date, status, technician_id,
            labor_hours, parts_cost, total_cost, priority, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
          workOrderId,
          equipment.id,
          workOrderType,
          createdDate,
          scheduledDate,
          completionDate,
          status,
          technician.id,
          laborHours,
          partsCost,
          totalCost,
          priority,
          description
        );

        workOrderCount++;
      }
    });
    console.log(`Created ${workOrderCount} work orders`);

    console.log('Seeding cycle time data...');
    let cycleTimeCount = 0;
    const cycleTimeStartDate = subDays(now, 365);

    // Generate daily cycle time records for each facility and product category
    for (let d = 0; d < 365; d++) {
      const recordDate = format(subDays(now, d), 'yyyy-MM-dd');

      facilities.forEach(facility => {
        // 3-5 product categories per day
        const numCategories = randomInt(3, 5);
        const selectedCategories: string[] = [];

        for (let i = 0; i < numCategories; i++) {
          let category = randomPick(productCategories);
          while (selectedCategories.includes(category)) {
            category = randomPick(productCategories);
          }
          selectedCategories.push(category);

          const avgCycleTimeHours = randomDecimal(8, 72, 2);
          const targetCycleTimeHours = randomDecimal(6, 48, 2);
          const ordersCompleted = randomInt(1, 10);

          const insert = db.prepare(`
            INSERT INTO ops_cycle_times (
              record_date, facility_id, product_category,
              avg_cycle_time_hours, target_cycle_time_hours, orders_completed
            ) VALUES (?, ?, ?, ?, ?, ?)
          `);

          insert.run(
            recordDate,
            facility.id,
            category,
            avgCycleTimeHours,
            targetCycleTimeHours,
            ordersCompleted
          );

          cycleTimeCount++;
        }
      });
    }
    console.log(`Created ${cycleTimeCount} cycle time records`);

    console.log('Seeding capacity utilization...');
    const departments: string[] = ['Production', 'Assembly', 'Quality', 'Packaging', 'Maintenance'];
    let capacityCount = 0;

    // Generate weekly capacity records for past year
    for (let w = 0; w < 52; w++) {
      const recordDate = format(subDays(now, w * 7), 'yyyy-MM-dd');

      facilities.forEach(facility => {
        departments.forEach(dept => {
          const availableHours = 40 * randomInt(20, 50); // 20-50 workers * 40 hours
          const usedHours = availableHours * randomDecimal(0.65, 0.95);
          const utilizationPercent = (usedHours / availableHours) * 100;

          const insert = db.prepare(`
            INSERT INTO ops_capacity (
              record_date, facility_id, department,
              available_hours, used_hours, utilization_percent
            ) VALUES (?, ?, ?, ?, ?, ?)
          `);

          insert.run(
            recordDate,
            facility.id,
            dept,
            availableHours,
            usedHours,
            utilizationPercent
          );

          capacityCount++;
        }
        );
      });
    }
    console.log(`Created ${capacityCount} capacity records`);

    console.log('Operations data seeding completed successfully!');
    console.log('Summary:');
    console.log(`  - ${vendorIds.length} vendors`);
    console.log(`  - ${equipmentIds.length} equipment items`);
    console.log(`  - ${orderIds.length} production orders`);
    console.log(`  - ${downtimeCount} downtime events`);
    console.log(`  - ${inspectionCount} quality inspections`);
    console.log(`  - ${transactionCount} inventory transactions`);
    console.log(`  - ${shipmentCount} shipments`);
    console.log(`  - ${vendorDeliveryCount} vendor deliveries`);
    console.log(`  - ${workOrderCount} work orders`);
    console.log(`  - ${cycleTimeCount} cycle time records`);
    console.log(`  - ${capacityCount} capacity records`);

  } catch (error) {
    console.error('Error seeding Operations data:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  seedDataOps();
}
