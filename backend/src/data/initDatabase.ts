import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const schemaPath = path.join(__dirname, '../../database/schema.sql');
const hseSchemaPath = path.join(__dirname, '../../database/schema-hse.sql');
const opsSchemaPath = path.join(__dirname, '../../database/schema-ops.sql');
const qcSchemaPath = path.join(__dirname, '../../database/schema-qc.sql');
const scSchemaPath = path.join(__dirname, '../../database/schema-supplychain.sql');
const financeSchemaPath = path.join(__dirname, '../../database/schema-finance.sql');
const adminSchemaPath = path.join(__dirname, '../../database/schema-administration.sql');
const salesSchemaPath = path.join(__dirname, '../../database/schema-sales.sql');
const customerSuccessSchemaPath = path.join(__dirname, '../../database/schema-customer-success.sql');
const marketingSchemaPath = path.join(__dirname, '../../database/schema-marketing.sql');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Existing database removed.');
}

// Create new database
const db = new Database(dbPath);
console.log('Database created at:', dbPath);

// Read and execute main schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);
console.log('Main database schema created successfully.');

// Read and execute HSE schema
const hseSchema = fs.readFileSync(hseSchemaPath, 'utf8');
db.exec(hseSchema);
console.log('HSE database schema created successfully.');

// Read and execute Operations schema
const opsSchema = fs.readFileSync(opsSchemaPath, 'utf8');
db.exec(opsSchema);
console.log('Operations database schema created successfully.');

// Read and execute QC schema
const qcSchema = fs.readFileSync(qcSchemaPath, 'utf8');
db.exec(qcSchema);
console.log('QC database schema created successfully.');

// Read and execute Supply Chain schema
const scSchema = fs.readFileSync(scSchemaPath, 'utf8');
db.exec(scSchema);
console.log('Supply Chain database schema created successfully.');

// Read and execute Finance schema
const financeSchema = fs.readFileSync(financeSchemaPath, 'utf8');
db.exec(financeSchema);
console.log('Finance database schema created successfully.');

// Read and execute IT & Administration schema
const adminSchema = fs.readFileSync(adminSchemaPath, 'utf8');
db.exec(adminSchema);
console.log('IT & Administration database schema created successfully.');

// Read and execute Sales schema
const salesSchema = fs.readFileSync(salesSchemaPath, 'utf8');
db.exec(salesSchema);
console.log('Sales database schema created successfully.');

// Read and execute Customer Success schema
const customerSuccessSchema = fs.readFileSync(customerSuccessSchemaPath, 'utf8');
db.exec(customerSuccessSchema);
console.log('Customer Success database schema created successfully.');

// Read and execute Marketing schema
const marketingSchema = fs.readFileSync(marketingSchemaPath, 'utf8');
db.exec(marketingSchema);
console.log('Marketing database schema created successfully.');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Close database
db.close();
console.log('Database initialization complete!');
