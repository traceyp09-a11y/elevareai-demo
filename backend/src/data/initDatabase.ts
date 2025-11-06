import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const schemaPath = path.join(__dirname, '../../database/schema.sql');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Existing database removed.');
}

// Create new database
const db = new Database(dbPath);
console.log('Database created at:', dbPath);

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);
console.log('Database schema created successfully.');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Close database
db.close();
console.log('Database initialization complete!');
