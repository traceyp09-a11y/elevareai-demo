import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { seedSalesData } from '../data/seedDataSales';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const schemaPath = path.join(__dirname, '../../database/schema-sales.sql');

console.log('🚀 Initializing Sales & Revenue Module...');
console.log(`Database: ${dbPath}`);
console.log(`Schema: ${schemaPath}`);

try {
  // Create/open database
  const db = new Database(dbPath);

  // Read and execute schema
  console.log('\n📋 Creating Sales & Revenue tables...');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('  ✓ All Sales & Revenue tables and indexes created successfully');

  db.close();

  // Seed data
  console.log('\n📦 Seeding Sales & Revenue data...');
  seedSalesData(dbPath);

  console.log('\n✅ Sales & Revenue Module initialization complete!');

} catch (error) {
  console.error('❌ Error initializing Sales & Revenue Module:', error);
  process.exit(1);
}
