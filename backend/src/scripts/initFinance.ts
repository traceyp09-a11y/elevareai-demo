/**
 * Initialize Finance Module
 * Creates tables and seeds data
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { seedFinanceData } from '../data/seedDataFinance';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const schemaPath = path.join(__dirname, '../../database/schema-finance.sql');

console.log('🚀 Initializing Finance Module...');
console.log(`Database: ${dbPath}`);
console.log(`Schema: ${schemaPath}`);

// Read and execute schema
const db = new Database(dbPath);
const schema = fs.readFileSync(schemaPath, 'utf-8');

console.log('\n📋 Creating Finance tables...');
try {
  db.exec(schema);
  console.log('  ✓ All Finance tables and indexes created successfully');
} catch (error: any) {
  console.error('  ✗ Error creating tables:', error.message);
  throw error;
}

db.close();

console.log('\n📦 Seeding Finance data...');
seedFinanceData(dbPath);

console.log('\n✅ Finance Module initialization complete!');
