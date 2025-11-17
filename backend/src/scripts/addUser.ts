import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';
import { resolve } from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function addUser() {
  try {
    // Connect to database
    const dbPath = resolve(__dirname, '../../database/elevareiq.db');
    const db = new Database(dbPath);

    console.log('\n=== ElevareAI User Management ===\n');
    console.log('Add a new user to the platform\n');

    // Get user details
    const email = await question('Email address: ');
    const firstName = await question('First name: ');
    const lastName = await question('Last name: ');
    const password = await question('Password: ');

    // Role selection
    console.log('\nAvailable roles:');
    console.log('1. admin    - Full system access');
    console.log('2. manager  - Department management');
    console.log('3. analyst  - View and analyze data');
    console.log('4. viewer   - Read-only access');
    const roleChoice = await question('Select role (1-4): ');

    const roles = ['admin', 'manager', 'analyst', 'viewer'];
    const role = roles[parseInt(roleChoice) - 1] || 'viewer';

    // Optional fields
    const department = await question('Department (optional, press Enter to skip): ');

    console.log('\n--- Creating user ---');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format');
      rl.close();
      process.exit(1);
    }

    // Validate password strength
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      console.error('❌ User with this email already exists');
      rl.close();
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, department, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(email, passwordHash, firstName, lastName, role, department || null);

    console.log('\n✅ User created successfully!');
    console.log('\nUser Details:');
    console.log(`- ID: ${result.lastInsertRowid}`);
    console.log(`- Email: ${email}`);
    console.log(`- Name: ${firstName} ${lastName}`);
    console.log(`- Role: ${role}`);
    if (department) {
      console.log(`- Department: ${department}`);
    }
    console.log('\nYou can now log in with these credentials at http://localhost:5173/login');

    db.close();
    rl.close();
  } catch (error) {
    console.error('\n❌ Error creating user:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the script
addUser();
