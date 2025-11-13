import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

const prisma = new PrismaClient();
const GLOBAL_TENANT_ID = '00000000-0000-0000-0000-000000000000'; // system library
const FRAMEWORK_VERSION = 'v1.0';

async function ensureGlobalTenant() {
  await prisma.tenant.upsert({
    where: { id: GLOBAL_TENANT_ID },
    update: {},
    create: {
      id: GLOBAL_TENANT_ID,
      name: 'GLOBAL LIBRARY',
      region: 'us',
      plan: 'system',
      settings: {},
    },
  });
  console.log('✅ Global tenant created');
}

async function seedQuestions() {
  const fp = path.resolve(process.cwd(), '../../seed/questions.v1.json');
  const raw = await readFile(fp, 'utf-8');
  const data = JSON.parse(raw) as Record<string, any[]>;
  const scopes = Object.keys(data);

  let count = 0;
  for (const scope of scopes) {
    for (const q of data[scope]) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: {
          frameworkVersion: FRAMEWORK_VERSION,
          dimension: q.dimension,
          text: q.text,
          inputType: q.input_type,
          weight: q.weight,
          options: { scope },
        },
        create: {
          id: q.id,
          frameworkVersion: FRAMEWORK_VERSION,
          dimension: q.dimension,
          text: q.text,
          inputType: q.input_type,
          weight: q.weight,
          options: { scope },
        },
      });
      count++;
    }
  }
  console.log(`✅ Seeded ${count} questions across ${scopes.length} scopes`);
}

type ControlJson = {
  control_id: string;
  area: string;
  title: string;
  description: string;
  weight: number;
  frequency?: string;
  owner_role?: string;
  evidence_examples?: string[];
  mappings?: Record<string, string[]>;
  pack?: string;
};

async function upsertControl(c: ControlJson) {
  await prisma.control.upsert({
    where: { id_tenantId: { id: c.control_id, tenantId: GLOBAL_TENANT_ID } },
    update: {
      tenantId: GLOBAL_TENANT_ID,
      area: c.area,
      code: c.control_id,
      description: c.description,
      weight: c.weight,
      requirementRef: c.mappings ?? {},
      meta: {
        title: c.title,
        frequency: c.frequency,
        owner_role: c.owner_role,
        evidence_examples: c.evidence_examples ?? [],
        pack: c.pack ?? null,
      },
    },
    create: {
      id: c.control_id,
      tenantId: GLOBAL_TENANT_ID,
      area: c.area,
      code: c.control_id,
      description: c.description,
      weight: c.weight,
      requirementRef: c.mappings ?? {},
      meta: {
        title: c.title,
        frequency: c.frequency,
        owner_role: c.owner_role,
        evidence_examples: c.evidence_examples ?? [],
        pack: c.pack ?? null,
      },
    },
  });
}

async function seedControls() {
  const basePath = path.resolve(process.cwd(), '../../seed');
  const base = JSON.parse(await readFile(path.join(basePath, 'controls.v1.json'), 'utf-8'));

  for (const c of base.controls as ControlJson[]) {
    await upsertControl(c);
  }
  console.log(`✅ Seeded ${base.controls.length} base controls`);

  // Industry packs
  const hipaa = JSON.parse(
    await readFile(path.join(basePath, 'packs/hipaa.v1.json'), 'utf-8')
  );
  for (const c of hipaa.controls as ControlJson[]) {
    await upsertControl({ ...c, pack: 'hipaa' });
  }
  console.log(`✅ Seeded ${hipaa.controls.length} HIPAA controls`);

  const sox = JSON.parse(await readFile(path.join(basePath, 'packs/sox.v1.json'), 'utf-8'));
  for (const c of sox.controls as ControlJson[]) {
    await upsertControl({ ...c, pack: 'sox' });
  }
  console.log(`✅ Seeded ${sox.controls.length} SOX controls`);
}

async function seedDemoTenant() {
  const DEMO_TENANT_ID = '11111111-2222-3333-4444-555555555555';

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: DEMO_TENANT_ID },
    update: {},
    create: {
      id: DEMO_TENANT_ID,
      name: 'Acme Corporation',
      region: 'us',
      plan: 'enterprise',
      settings: {
        industry: 'financial_services',
        employeeCount: 2500,
        enabledPacks: ['base', 'hipaa', 'sox'],
      },
    },
  });
  console.log(`✅ Demo tenant created: ${tenant.name}`);

  // Create demo user
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: DEMO_TENANT_ID, email: 'admin@acme.com' } },
    update: {},
    create: {
      tenantId: DEMO_TENANT_ID,
      email: 'admin@acme.com',
      name: 'Admin User',
      status: 'active',
    },
  });

  // Add Admin role
  await prisma.userRole.upsert({
    where: { userId_role: { userId: user.id, role: 'Admin' } },
    update: {},
    create: {
      userId: user.id,
      role: 'Admin',
    },
  });
  console.log(`✅ Demo user created: ${user.email}`);

  // Create departments (delete existing first to avoid duplicates)
  await prisma.department.deleteMany({
    where: { tenantId: DEMO_TENANT_ID },
  });

  const departments = [
    { type: 'sales', name: 'Sales' },
    { type: 'supply_chain', name: 'Supply Chain' },
    { type: 'finance', name: 'Finance' },
    { type: 'operations', name: 'Operations' },
    { type: 'admin', name: 'Administration' },
    { type: 'hr', name: 'Human Resources' },
    { type: 'hse', name: 'Health, Safety & Environment' },
    { type: 'marketing', name: 'Marketing' },
    { type: 'rnd', name: 'Research & Development' },
    { type: 'procurement', name: 'Procurement' },
    { type: 'quality', name: 'Quality Assurance' },
    { type: 'customer_success', name: 'Customer Success' },
    { type: 'strategy', name: 'Strategy & Business Development' },
  ];

  for (const dept of departments) {
    await prisma.department.create({
      data: {
        tenantId: DEMO_TENANT_ID,
        name: dept.name,
        type: dept.type,
      },
    });
  }
  console.log(`✅ Created ${departments.length} departments`);
}

async function main() {
  console.log('\n🌱 Seeding Elevare AI Platform database...\n');

  await ensureGlobalTenant();
  await seedQuestions();
  await seedControls();
  await seedDemoTenant();

  console.log('\n✨ Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
