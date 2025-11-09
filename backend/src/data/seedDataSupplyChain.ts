import Database from 'better-sqlite3';
import * as path from 'path';
import { addDays, subMonths, format, differenceInDays } from 'date-fns';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const db = new Database(dbPath);

console.log('Starting Supply Chain data seeding...');

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Date range: last 12 months
const endDate = new Date('2024-12-31');
const startDate = subMonths(endDate, 12);

// ========== 1. Seed Suppliers ==========
console.log('Seeding suppliers...');

const suppliers = [
  { id: 1, name: 'Global Components Ltd', type: 'Raw Material', country: 'China', leadTime: 45, quality: 4.2, delivery: 3.8, cost: 4.5 },
  { id: 2, name: 'Premium Parts Inc', type: 'Raw Material', country: 'USA', leadTime: 14, quality: 4.7, delivery: 4.6, cost: 3.2 },
  { id: 3, name: 'FastShip Logistics', type: 'Finished Goods', country: 'Mexico', leadTime: 7, quality: 4.3, delivery: 4.4, cost: 4.0 },
  { id: 4, name: 'EuroSource GmbH', type: 'Raw Material', country: 'Germany', leadTime: 30, quality: 4.8, delivery: 4.5, cost: 2.8 },
  { id: 5, name: 'AsiaSupply Co', type: 'Finished Goods', country: 'Vietnam', leadTime: 60, quality: 3.5, delivery: 3.2, cost: 4.8 },
  { id: 6, name: 'LocalVendor LLC', type: 'MRO', country: 'USA', leadTime: 3, quality: 4.0, delivery: 4.7, cost: 3.5 },
  { id: 7, name: 'QualityFirst Mfg', type: 'Raw Material', country: 'Japan', leadTime: 35, quality: 4.9, delivery: 4.8, cost: 2.5 },
  { id: 8, name: 'BudgetSupplies Inc', type: 'Finished Goods', country: 'India', leadTime: 50, quality: 3.2, delivery: 3.0, cost: 4.9 }
];

const insertSupplier = db.prepare(`
  INSERT INTO sc_suppliers (supplier_id, supplier_name, supplier_type, country, lead_time_days, quality_rating, delivery_rating, cost_competitiveness, active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

suppliers.forEach(s => {
  insertSupplier.run(s.id, s.name, s.type, s.country, s.leadTime, s.quality, s.delivery, s.cost);
});

console.log(`Created ${suppliers.length} suppliers`);

// ========== 2. Seed Warehouses ==========
console.log('Seeding warehouses...');

const warehouses = [
  { id: 1, name: 'East Coast DC', location: 'Newark, NJ', capacity: 50000, used: 42000, type: 'Distribution Center', cost: 125000 },
  { id: 2, name: 'West Coast FC', location: 'Los Angeles, CA', capacity: 60000, used: 51000, type: 'Fulfillment Center', cost: 145000 },
  { id: 3, name: 'Midwest Hub', location: 'Chicago, IL', capacity: 45000, used: 38000, type: 'Distribution Center', cost: 98000 },
  { id: 4, name: 'South Regional', location: 'Dallas, TX', capacity: 40000, used: 35000, type: 'Fulfillment Center', cost: 87000 }
];

const insertWarehouse = db.prepare(`
  INSERT INTO sc_warehouses (warehouse_id, warehouse_name, location, total_capacity_sqm, used_capacity_sqm, capacity_utilization_pct, warehouse_type, operational_cost_monthly)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

warehouses.forEach(w => {
  const utilization = (w.used / w.capacity) * 100;
  insertWarehouse.run(w.id, w.name, w.location, w.capacity, w.used, utilization, w.type, w.cost);
});

console.log(`Created ${warehouses.length} warehouses`);

// ========== 3. Seed Orders (Sales Orders) ==========
console.log('Seeding sales orders...');

const orderStatuses = ['Delivered', 'In Transit', 'Pending', 'Cancelled'];
const priorities = ['Normal', 'Rush', 'Critical'];
const products = ['Widget-A', 'Widget-B', 'Gadget-X', 'Component-Y', 'Assembly-Z'];

const insertOrder = db.prepare(`
  INSERT INTO sc_orders (order_id, order_type, order_date, requested_delivery_date, actual_delivery_date, customer_id, total_value, status, priority, delivery_location, on_time, in_full, accurate)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertOrderLine = db.prepare(`
  INSERT INTO sc_order_lines (order_id, line_number, product_code, product_name, quantity_ordered, quantity_delivered, unit_price, line_total)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let orderCount = 0;
let currentDate = new Date(startDate);

while (currentDate <= endDate) {
  const ordersPerDay = randomInt(3, 8);

  for (let i = 0; i < ordersPerDay; i++) {
    orderCount++;
    const orderId = `SO-${format(currentDate, 'yyyyMMdd')}-${String(i + 1).padStart(3, '0')}`;
    const customerId = randomInt(1001, 1500);
    const requestedDelivery = addDays(currentDate, randomInt(5, 21));
    const priority = randomChoice(priorities);
    const status = randomChoice(orderStatuses);

    // Determine actual delivery date and on-time status
    let actualDelivery = null;
    let onTime = 0;
    let inFull = 1;
    let accurate = 1;

    if (status === 'Delivered') {
      const deliveryVariance = randomInt(-3, 7); // Can be early or late
      actualDelivery = format(addDays(requestedDelivery, deliveryVariance), 'yyyy-MM-dd');
      onTime = deliveryVariance <= 0 ? 1 : 0;
      inFull = Math.random() > 0.15 ? 1 : 0; // 85% in full
      accurate = Math.random() > 0.08 ? 1 : 0; // 92% accurate
    }

    const numLines = randomInt(1, 5);
    let orderTotal = 0;

    // Calculate order total and prepare line items
    const lineItems = [];
    for (let line = 1; line <= numLines; line++) {
      const product = randomChoice(products);
      const qtyOrdered = randomInt(10, 500);
      const qtyDelivered = status === 'Delivered' ? (inFull ? qtyOrdered : randomInt(Math.floor(qtyOrdered * 0.7), qtyOrdered)) : 0;
      const unitPrice = randomFloat(10, 500);
      const lineTotal = qtyOrdered * unitPrice;
      orderTotal += lineTotal;

      lineItems.push({
        lineNumber: line,
        product: product,
        qtyOrdered: qtyOrdered,
        qtyDelivered: qtyDelivered,
        unitPrice: unitPrice,
        lineTotal: lineTotal
      });
    }

    const location = randomChoice(['Newark, NJ', 'Los Angeles, CA', 'Chicago, IL', 'Dallas, TX', 'Atlanta, GA']);

    // Insert order FIRST
    insertOrder.run(
      orderId,
      'Sales Order',
      format(currentDate, 'yyyy-MM-dd'),
      format(requestedDelivery, 'yyyy-MM-dd'),
      actualDelivery,
      customerId,
      orderTotal,
      status,
      priority,
      location,
      onTime,
      inFull,
      accurate
    );

    // Then insert order lines (child records)
    lineItems.forEach(item => {
      insertOrderLine.run(orderId, item.lineNumber, item.product, item.product, item.qtyOrdered, item.qtyDelivered, item.unitPrice, item.lineTotal);
    });
  }

  currentDate = addDays(currentDate, 1);
}

console.log(`Created ${orderCount} sales orders`);

// ========== 4. Seed Purchase Orders ==========
console.log('Seeding purchase orders...');

const insertPO = db.prepare(`
  INSERT INTO sc_purchase_orders (po_number, supplier_id, po_date, required_date, delivery_date, po_value, status, lead_time_days, on_time)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let poCount = 0;
currentDate = new Date(startDate);

while (currentDate <= endDate) {
  if (randomInt(1, 3) === 1) { // ~33% of days have POs
    const supplier = randomChoice(suppliers);
    poCount++;
    const poNumber = `PO-${format(currentDate, 'yyyyMMdd')}-${String(poCount).padStart(4, '0')}`;
    const requiredDate = addDays(currentDate, supplier.leadTime);
    const poValue = randomFloat(5000, 150000);
    const status = randomChoice(['Delivered', 'In Transit', 'Pending']);

    let deliveryDate = null;
    let onTime = 0;

    if (status === 'Delivered') {
      const variance = randomInt(-5, Math.floor(supplier.leadTime * 0.3));
      deliveryDate = format(addDays(requiredDate, variance), 'yyyy-MM-dd');
      onTime = variance <= 0 ? 1 : 0;
    }

    insertPO.run(poNumber, supplier.id, format(currentDate, 'yyyy-MM-dd'), format(requiredDate, 'yyyy-MM-dd'), deliveryDate, poValue, status, supplier.leadTime, onTime);
  }

  currentDate = addDays(currentDate, 1);
}

console.log(`Created ${poCount} purchase orders`);

// ========== 5. Seed Shipments ==========
console.log('Seeding shipments...');

const carriers = ['FedEx', 'UPS', 'DHL', 'USPS', 'FreightCo'];
const modes = ['Air', 'Ground', 'Ocean', 'Rail'];

const insertShipment = db.prepare(`
  INSERT INTO sc_shipments (shipment_id, order_id, carrier, tracking_number, ship_date, estimated_delivery_date, actual_delivery_date, origin_location, destination_location, weight_kg, freight_cost, shipment_mode, on_time, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Get delivered orders
const deliveredOrders = db.prepare(`SELECT order_id, order_date, actual_delivery_date, delivery_location FROM sc_orders WHERE status = 'Delivered'`).all() as any[];

deliveredOrders.forEach((order, idx) => {
  const shipmentId = `SH-${String(idx + 1).padStart(6, '0')}`;
  const carrier = randomChoice(carriers);
  const trackingNum = `${carrier.substring(0, 3).toUpperCase()}${randomInt(100000000, 999999999)}`;
  const shipDate = format(addDays(new Date(order.order_date), randomInt(1, 3)), 'yyyy-MM-dd');
  const estimatedDelivery = format(addDays(new Date(shipDate), randomInt(2, 7)), 'yyyy-MM-dd');
  const actualDelivery = order.actual_delivery_date;
  const origin = randomChoice(['Newark, NJ', 'Los Angeles, CA', 'Chicago, IL', 'Dallas, TX']);
  const destination = order.delivery_location;
  const weight = randomFloat(5, 2000, 1);
  const freightCost = randomFloat(25, 1500);
  const mode = randomChoice(modes);
  const onTime = new Date(actualDelivery) <= new Date(estimatedDelivery) ? 1 : 0;

  insertShipment.run(shipmentId, order.order_id, carrier, trackingNum, shipDate, estimatedDelivery, actualDelivery, origin, destination, weight, freightCost, mode, onTime, 'Delivered');
});

console.log(`Created ${deliveredOrders.length} shipments`);

// ========== 6. Seed Inventory ==========
console.log('Seeding inventory snapshots...');

const insertInventory = db.prepare(`
  INSERT INTO sc_inventory (product_code, product_name, warehouse_id, quantity_on_hand, quantity_allocated, quantity_available, reorder_point, reorder_quantity, unit_cost, inventory_value, snapshot_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Monthly snapshots
for (let month = 0; month < 12; month++) {
  const snapshotDate = format(addDays(startDate, month * 30), 'yyyy-MM-dd');

  products.forEach(product => {
    warehouses.forEach(warehouse => {
      const qtyOnHand = randomInt(50, 5000);
      const qtyAllocated = randomInt(0, Math.floor(qtyOnHand * 0.4));
      const qtyAvailable = qtyOnHand - qtyAllocated;
      const reorderPoint = randomInt(100, 500);
      const reorderQty = randomInt(500, 2000);
      const unitCost = randomFloat(5, 250);
      const invValue = qtyOnHand * unitCost;

      insertInventory.run(product, product, warehouse.id, qtyOnHand, qtyAllocated, qtyAvailable, reorderPoint, reorderQty, unitCost, invValue, snapshotDate);
    });
  });
}

console.log('Created inventory snapshots (monthly for 12 months)');

// ========== 7. Seed Backorders ==========
console.log('Seeding backorders...');

const insertBackorder = db.prepare(`
  INSERT INTO sc_backorders (backorder_id, order_id, product_code, quantity_backordered, backorder_date, expected_fulfillment_date, actual_fulfillment_date, customer_id, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const notInFullOrders = db.prepare(`SELECT order_id, order_date, customer_id FROM sc_orders WHERE in_full = 0 AND status = 'Delivered'`).all() as any[];

notInFullOrders.forEach((order, idx) => {
  if (Math.random() > 0.3) { // 70% of not-in-full orders have backorders
    const backorderId = `BO-${String(idx + 1).padStart(5, '0')}`;
    const product = randomChoice(products);
    const qty = randomInt(10, 200);
    const backorderDate = order.order_date;
    const expectedFulfillment = format(addDays(new Date(backorderDate), randomInt(7, 30)), 'yyyy-MM-dd');
    const fulfilled = Math.random() > 0.4;
    const actualFulfillment = fulfilled ? format(addDays(new Date(backorderDate), randomInt(7, 35)), 'yyyy-MM-dd') : null;
    const status = fulfilled ? 'Fulfilled' : (Math.random() > 0.5 ? 'Open' : 'Partial');

    insertBackorder.run(backorderId, order.order_id, product, qty, backorderDate, expectedFulfillment, actualFulfillment, order.customer_id, status);
  }
});

console.log('Created backorders');

// ========== 8. Seed Returns ==========
console.log('Seeding returns...');

const insertReturn = db.prepare(`
  INSERT INTO sc_returns (return_id, original_order_id, return_date, product_code, quantity_returned, return_reason, return_value, restocking_fee, reverse_logistics_cost, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const returnReasons = ['Defective', 'Wrong Item', 'Customer Changed Mind', 'Damaged in Transit', 'Not as Described'];

deliveredOrders.forEach((order, idx) => {
  if (Math.random() > 0.92) { // 8% return rate
    const returnId = `RET-${String(idx + 1).padStart(5, '0')}`;
    const returnDate = format(addDays(new Date(order.actual_delivery_date), randomInt(1, 30)), 'yyyy-MM-dd');
    const product = randomChoice(products);
    const qty = randomInt(1, 50);
    const reason = randomChoice(returnReasons);
    const value = randomFloat(100, 5000);
    const restockingFee = reason === 'Customer Changed Mind' ? value * 0.15 : 0;
    const reverseCost = randomFloat(25, 200);
    const status = randomChoice(['Received', 'Restocked', 'Pending']);

    insertReturn.run(returnId, order.order_id, returnDate, product, qty, reason, value, restockingFee, reverseCost, status);
  }
});

console.log('Created returns');

// ========== 9. Seed Supply Chain Costs ==========
console.log('Seeding supply chain costs...');

const insertCost = db.prepare(`
  INSERT INTO sc_costs (cost_date, cost_category, cost_subcategory, amount, currency)
  VALUES (?, ?, ?, ?, 'USD')
`);

const costCategories = [
  { category: 'Transportation', subcategories: ['Freight', 'Last Mile Delivery', 'Fuel Surcharges'] },
  { category: 'Warehousing', subcategories: ['Rent', 'Labor', 'Utilities', 'Equipment'] },
  { category: 'Inventory Carrying', subcategories: ['Insurance', 'Obsolescence', 'Storage'] },
  { category: 'Procurement', subcategories: ['Purchasing Staff', 'Supplier Management', 'Systems'] },
  { category: 'Returns', subcategories: ['Reverse Logistics', 'Restocking', 'Disposal'] }
];

currentDate = new Date(startDate);
while (currentDate <= endDate) {
  if (randomInt(1, 7) === 1) { // Costs recorded weekly
    costCategories.forEach(cat => {
      const subcat = randomChoice(cat.subcategories);
      const amount = randomFloat(5000, 50000);
      insertCost.run(format(currentDate, 'yyyy-MM-dd'), cat.category, subcat, amount);
    });
  }
  currentDate = addDays(currentDate, 1);
}

console.log('Created supply chain costs');

// ========== 10. Seed Accounts Receivable ==========
console.log('Seeding accounts receivable...');

const insertAR = db.prepare(`
  INSERT INTO sc_accounts_receivable (invoice_id, order_id, customer_id, invoice_date, due_date, payment_date, invoice_amount, amount_paid, amount_outstanding, days_outstanding, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

deliveredOrders.forEach((order, idx) => {
  const invoiceId = `INV-${String(idx + 1).padStart(6, '0')}`;
  const invoiceDate = order.actual_delivery_date;
  const dueDate = format(addDays(new Date(invoiceDate), 30), 'yyyy-MM-dd'); // NET 30
  const orderValue = randomFloat(1000, 50000);

  const paymentStatus = randomChoice(['Paid', 'Paid', 'Paid', 'Partial', 'Open', 'Overdue']);
  let paymentDate = null;
  let amountPaid = 0;
  let amountOutstanding = orderValue;
  let daysOutstanding = 0;

  if (paymentStatus === 'Paid') {
    const paymentDelay = randomInt(0, 45);
    paymentDate = format(addDays(new Date(invoiceDate), paymentDelay), 'yyyy-MM-dd');
    amountPaid = orderValue;
    amountOutstanding = 0;
    daysOutstanding = 0;
  } else if (paymentStatus === 'Partial') {
    const paymentDelay = randomInt(15, 35);
    paymentDate = format(addDays(new Date(invoiceDate), paymentDelay), 'yyyy-MM-dd');
    amountPaid = orderValue * randomFloat(0.3, 0.7);
    amountOutstanding = orderValue - amountPaid;
    daysOutstanding = differenceInDays(new Date(), new Date(invoiceDate));
  } else {
    daysOutstanding = differenceInDays(new Date(), new Date(invoiceDate));
    amountOutstanding = orderValue;
  }

  insertAR.run(invoiceId, order.order_id, order.customer_id || randomInt(1001, 1500), invoiceDate, dueDate, paymentDate, orderValue, amountPaid, amountOutstanding, daysOutstanding, paymentStatus);
});

console.log('Created accounts receivable records');

// Close database
db.close();

console.log('\n✅ Supply Chain data seeding completed successfully!');
console.log('Summary:');
console.log(`  - ${suppliers.length} suppliers`);
console.log(`  - ${warehouses.length} warehouses`);
console.log(`  - ${orderCount} sales orders`);
console.log(`  - ${poCount} purchase orders`);
console.log(`  - ${deliveredOrders.length} shipments`);
console.log(`  - Inventory snapshots (monthly)`);
console.log(`  - Backorders, returns, costs, and AR records`);
