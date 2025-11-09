import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { seedCustomerSuccessData } from '../data/seedDataCustomerSuccess';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const schemaPath = path.join(__dirname, '../../database/schema-customer-success.sql');

console.log('🚀 Initializing Customer Success & Experience Module...');
console.log(`Database: ${dbPath}`);
console.log(`Schema: ${schemaPath}`);

try {
  // Create/open database
  const db = new Database(dbPath);

  // Read and execute schema
  console.log('\n📋 Creating Customer Success tables...');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('  ✓ All Customer Success tables and indexes created successfully');

  db.close();

  // Seed data
  console.log('\n📦 Seeding Customer Success data...');
  seedCustomerSuccessData(dbPath);

  console.log('\n✅ Customer Success & Experience Module initialization complete!');

} catch (error) {
  console.error('❌ Error initializing Customer Success Module:', error);
  process.exit(1);
}
