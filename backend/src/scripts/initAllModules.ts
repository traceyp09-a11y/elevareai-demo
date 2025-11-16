#!/usr/bin/env ts-node
/**
 * Complete Database Initialization Script
 * Initializes ALL modules in the correct order:
 * 1. Core schemas (HR, HSE, OPS, QC, Supply Chain)
 * 2. Additional departments (Finance, Sales, Marketing, Customer Success, Administration)
 * 3. Authentication system
 *
 * Run this once to set up the entire database.
 */

import { execSync } from 'child_process';
import * as path from 'path';

console.log('🚀 Starting Complete Database Initialization...\n');

const scriptsDir = path.join(__dirname);

const scripts = [
  { name: 'Core Schemas (HR, HSE, OPS, QC, Supply Chain)', script: '../data/initDatabase.ts' },
  { name: 'Finance Module', script: './initFinance.ts' },
  { name: 'Sales Module', script: './initSales.ts' },
  { name: 'Marketing Module', script: './initMarketing.ts' },
  { name: 'Customer Success Module', script: './initCustomerSuccess.ts' },
  { name: 'Administration Module', script: './initAdministration.ts' },
  { name: 'Authentication System', script: './initAuthSchema.ts' }
];

let successCount = 0;
let errorCount = 0;

scripts.forEach(({ name, script }, index) => {
  console.log(`\n[${ index + 1}/${scripts.length}] 📦 Initializing ${name}...`);
  console.log('━'.repeat(60));

  try {
    const scriptPath = path.join(scriptsDir, script);
    execSync(`npx ts-node "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..')
    });
    console.log(`✅ ${name} initialized successfully!`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to initialize ${name}`);
    console.error(error);
    errorCount++;
    // Continue with other scripts even if one fails
  }
});

console.log('\n' + '═'.repeat(60));
console.log('📊 INITIALIZATION SUMMARY');
console.log('═'.repeat(60));
console.log(`✅ Successful: ${successCount}/${scripts.length}`);
console.log(`❌ Failed: ${errorCount}/${scripts.length}`);

if (errorCount === 0) {
  console.log('\n🎉 All modules initialized successfully!');
  console.log('\n📝 Default Admin Credentials:');
  console.log('   Email: admin@elevareai.com');
  console.log('   Password: Admin123!');
  console.log('\n🚀 You can now start the server with: npm start\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some modules failed to initialize. Check errors above.');
  process.exit(1);
}
