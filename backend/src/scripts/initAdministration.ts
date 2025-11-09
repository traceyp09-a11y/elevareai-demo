/**
 * Initialize Administration Module
 * Creates tables and seeds data
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { seedAdministrationData } from '../data/seedDataAdministration';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const schemaPath = path.join(__dirname, '../../database/schema-administration.sql');

console.log('🚀 Initializing Administration Module...');
console.log(`Database: ${dbPath}`);
console.log(`Schema: ${schemaPath}`);

const db = new Database(dbPath);
const schema = fs.readFileSync(schemaPath, 'utf-8');

console.log('\n📋 Creating Administration tables...');
try {
  db.exec(schema);
  console.log('  ✓ All Administration tables and indexes created successfully');
} catch (error: any) {
  console.error('  ✗ Error creating tables:', error.message);
  throw error;
}

db.close();

console.log('\n📦 Seeding Administration data...');
seedAdministrationData(dbPath);

console.log('\n✅ Administration Module initialization complete!');
