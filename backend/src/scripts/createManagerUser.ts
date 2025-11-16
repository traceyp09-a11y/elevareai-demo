/**
 * Create Manager User Script
 * Adds a manager user to the database for testing
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../database/elevareiq.db');

async function createManagerUser() {
  const db = new Database(DB_PATH);

  try {
    // Check if manager already exists
    const existingManager = db.prepare('SELECT id FROM users WHERE email = ?')
      .get('manager@company.com') as any;

    if (existingManager) {
      console.log('✅ Manager user already exists');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash('Manager123!', 10);

    // Insert manager user
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, department, is_active, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'manager@company.com',
      passwordHash,
      'Department',
      'Manager',
      'manager',
      'Operations',
      1,
      1
    );

    console.log('✅ Manager user created successfully');
    console.log('   Email: manager@company.com');
    console.log('   Password: Manager123!');
    console.log('   Role: manager');
    console.log('   Department: Operations');

  } catch (error) {
    console.error('❌ Error creating manager user:', error);
    throw error;
  } finally {
    db.close();
  }
}

createManagerUser();
