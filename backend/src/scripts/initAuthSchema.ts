/**
 * Initialize Authentication Schema
 * Run this to add authentication tables to the database
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const schemaPath = path.join(__dirname, '../../database/schema-auth.sql');

async function initializeAuthSchema() {
  console.log('Initializing authentication schema...');
  console.log('Database path:', dbPath);
  console.log('Schema path:', schemaPath);

  const db = new Database(dbPath);

  try {
    // Disable foreign key constraints for migration
    db.exec('PRAGMA foreign_keys = OFF');

    // Read schema file
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Executing authentication schema...');

    // Execute the entire schema at once - better-sqlite3 can handle multiple statements
    try {
      db.exec(schema);
      console.log('✓ Schema executed successfully');
    } catch (error: any) {
      // If full exec fails, try statement by statement
      console.log('Full exec failed, trying individual statements...');

      // Better split that handles CREATE TABLE statements correctly
      const statements: string[] = [];
      let currentStatement = '';
      let inCreate = false;

      schema.split('\n').forEach(line => {
        const trimmed = line.trim();

        if (trimmed.startsWith('CREATE TABLE') || trimmed.startsWith('INSERT')) {
          inCreate = true;
        }

        currentStatement += line + '\n';

        if (trimmed.endsWith(');') && inCreate) {
          statements.push(currentStatement.trim());
          currentStatement = '';
          inCreate = false;
        } else if (trimmed.endsWith(';') && !inCreate) {
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      });

      for (const statement of statements) {
        if (statement && statement.length > 5 && !statement.startsWith('--')) {
          try {
            db.exec(statement);
          } catch (err: any) {
            if (!err.message.includes('already exists')) {
              console.error('Error:', err.message);
            }
          }
        }
      }
    }

    // Create default admin user with hashed password
    console.log('Creating default admin user...');
    const adminPassword = 'Admin123!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    try {
      const result = db.prepare(`
        INSERT OR REPLACE INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_verified)
        VALUES (1, 'admin@elevareai.com', ?, 'System', 'Administrator', 'admin', 1, 1)
      `).run(passwordHash);

      console.log('✓ Default admin user created');
      console.log('  Email: admin@elevareai.com');
      console.log('  Password: Admin123!');
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        console.log('✓ Admin user already exists');
      } else {
        throw error;
      }
    }

    console.log('✓ Authentication schema initialized successfully');

    // Verify tables were created
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%user%' OR name LIKE '%auth%'
    `).all();

    console.log('\nAuthentication tables created:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.name}`);
    });

    // Re-enable foreign keys
    db.exec('PRAGMA foreign_keys = ON');
    console.log('\n✓ Foreign key constraints re-enabled');

  } catch (error) {
    console.error('Error initializing auth schema:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  initializeAuthSchema()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

export { initializeAuthSchema };
