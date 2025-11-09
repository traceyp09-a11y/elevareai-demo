import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { seedMarketingData } from '../data/seedDataMarketing';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const schemaPath = path.join(__dirname, '../../database/schema-marketing.sql');

console.log('🚀 Initializing Marketing Module...');
console.log(`Database: ${dbPath}`);
console.log(`Schema: ${schemaPath}`);

// Create database connection
const db = new Database(dbPath);

// Read and execute schema
console.log('\n📋 Creating Marketing tables...');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);
console.log('  ✓ All Marketing tables and indexes created successfully');

// Seed data
console.log('\n📦 Seeding Marketing data...');
seedMarketingData();

console.log('\n✅ Marketing Module initialization complete!');

// Close database
db.close();
