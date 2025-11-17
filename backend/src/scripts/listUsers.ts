import Database from 'better-sqlite3';
import { resolve } from 'path';

// List all users in the database
const dbPath = resolve(__dirname, '../../database/elevareiq.db');
const db = new Database(dbPath);

console.log('\n📋 Current Users in Database\n');
console.log('='.repeat(80));

const users = db.prepare(`
  SELECT id, email, first_name, last_name, role, department, is_active, created_at
  FROM users
  ORDER BY id
`).all();

if (users.length === 0) {
  console.log('No users found in the database.');
} else {
  users.forEach((user: any) => {
    console.log(`\nID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.first_name} ${user.last_name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Department: ${user.department || 'N/A'}`);
    console.log(`Active: ${user.is_active ? 'Yes' : 'No'}`);
    console.log(`Created: ${user.created_at}`);
    console.log('-'.repeat(80));
  });

  console.log(`\nTotal users: ${users.length}\n`);
}

db.close();
