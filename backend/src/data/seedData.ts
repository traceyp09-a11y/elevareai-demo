import Database from 'better-sqlite3';
import * as path from 'path';
import { addDays, subDays, subMonths, format } from 'date-fns';

const dbPath = path.join(__dirname, '../../database/elevareiq.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

console.log('Starting data seeding for TitanBuild Manufacturing & Logistics...\n');

// Helper Functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return format(date, 'yyyy-MM-dd');
}

function randomPick<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

// 1. Insert Company Information
console.log('1. Inserting company information...');
const insertCompany = db.prepare(`
  INSERT INTO company (name, industry, founded_year, headquarters, num_facilities)
  VALUES (?, ?, ?, ?, ?)
`);
insertCompany.run('TitanBuild Manufacturing & Logistics', 'Manufacturing, Construction, Logistics', 1998, 'Detroit, Michigan', 4);

// 2. Insert Facilities
console.log('2. Inserting facilities...');
const insertFacility = db.prepare(`
  INSERT INTO facilities (name, type, address, city, state, employee_count)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const facilities = [
  { name: 'Detroit Manufacturing Plant', type: 'Manufacturing', address: '1500 Industrial Pkwy', city: 'Detroit', state: 'MI', count: 385 },
  { name: 'Phoenix Distribution Center', type: 'Logistics', address: '2840 Warehouse Dr', city: 'Phoenix', state: 'AZ', count: 182 },
  { name: 'Atlanta Construction Division', type: 'Construction', address: '760 Builder Blvd', city: 'Atlanta', state: 'GA', count: 218 },
  { name: 'Chicago Corporate Office', type: 'Office', address: '400 Executive Plaza', city: 'Chicago', state: 'IL', count: 62 }
];

facilities.forEach(f => insertFacility.run(f.name, f.type, f.address, f.city, f.state, f.count));

// 3. Insert Employees
console.log('3. Inserting employees...');
const insertEmployee = db.prepare(`
  INSERT INTO employees (
    employee_id, first_name, last_name, email, hire_date, termination_date,
    status, department, job_title, job_level, facility_id, base_salary, hourly_rate, employment_type
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const departments = ['Manufacturing', 'Logistics', 'Construction', 'Quality Assurance', 'Maintenance',
  'Human Resources', 'Finance', 'IT', 'Safety', 'Operations'];

const jobTitles: { [key: string]: string[] } = {
  Entry: ['Production Associate', 'Warehouse Associate', 'Construction Laborer', 'Quality Inspector', 'Maintenance Helper', 'HR Assistant', 'Forklift Operator'],
  Mid: ['Machine Operator', 'Lead Technician', 'Skilled Tradesperson', 'Logistics Coordinator', 'Safety Specialist', 'HR Generalist', 'Accountant'],
  Senior: ['Senior Engineer', 'Master Electrician', 'Senior Analyst', 'Project Manager', 'Senior Developer', 'Safety Manager'],
  Manager: ['Operations Manager', 'Plant Manager', 'Warehouse Manager', 'Construction Manager', 'HR Manager'],
  Director: ['Director of Operations', 'Director of Safety', 'Director of HR', 'Director of Manufacturing'],
  VP: ['VP of Operations', 'VP of Human Resources', 'VP of Supply Chain']
};

const levels = ['Entry', 'Entry', 'Entry', 'Mid', 'Mid', 'Senior', 'Manager', 'Director', 'VP'];
let employeeCount = 0;

// Generate 847 active employees
for (let i = 1; i <= 847; i++) {
  const firstName = randomPick(firstNames);
  const lastName = randomPick(lastNames);
  const level = levels[randomInt(0, 8)];
  const title = randomPick(jobTitles[level]);
  const dept = randomPick(departments);
  const facilityId = randomInt(1, 4);
  const hireDate = randomDate(new Date(2010, 0, 1), new Date(2024, 10, 1));

  let baseSalary = null;
  let hourlyRate = null;

  if (level === 'Entry') {
    hourlyRate = randomFloat(16, 22);
  } else if (level === 'Mid') {
    hourlyRate = randomFloat(22, 35);
  } else if (level === 'Senior') {
    baseSalary = randomFloat(65000, 95000, 0);
  } else if (level === 'Manager') {
    baseSalary = randomFloat(85000, 115000, 0);
  } else if (level === 'Director') {
    baseSalary = randomFloat(110000, 155000, 0);
  } else if (level === 'VP') {
    baseSalary = randomFloat(150000, 225000, 0);
  }

  insertEmployee.run(
    `TB${i.toString().padStart(5, '0')}`,
    firstName,
    lastName,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@titanbuild.com`,
    hireDate,
    null,
    'Active',
    dept,
    title,
    level,
    facilityId,
    baseSalary,
    hourlyRate,
    'Full-time'
  );
  employeeCount++;
}

// Generate 35 terminated employees from past 12 months
for (let i = 848; i <= 882; i++) {
  const firstName = randomPick(firstNames);
  const lastName = randomPick(lastNames);
  const level = levels[randomInt(0, 7)]; // Mostly entry-mid level turnover
  const title = randomPick(jobTitles[level]);
  const dept = randomPick(departments);
  const facilityId = randomInt(1, 4);
  const hireDate = randomDate(new Date(2018, 0, 1), new Date(2023, 6, 1));
  const termDate = randomDate(new Date(2023, 11, 1), new Date(2024, 10, 30));

  let baseSalary = null;
  let hourlyRate = null;

  if (level === 'Entry') hourlyRate = randomFloat(16, 22);
  else if (level === 'Mid') hourlyRate = randomFloat(22, 35);
  else baseSalary = randomFloat(65000, 115000, 0);

  insertEmployee.run(
    `TB${i.toString().padStart(5, '0')}`,
    firstName,
    lastName,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@titanbuild.com`,
    hireDate,
    termDate,
    'Terminated',
    dept,
    title,
    level,
    facilityId,
    baseSalary,
    hourlyRate,
    'Full-time'
  );
}

console.log(`   - Inserted ${employeeCount} active employees`);
console.log(`   - Inserted 35 terminated employees`);

// 4. Insert Separations (for terminated employees)
console.log('4. Inserting separation records...');
const insertSeparation = db.prepare(`
  INSERT INTO separations (employee_id, separation_date, separation_type, reason, department, job_level, tenure_years, exit_interview_completed, rehire_eligible)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const separationTypes = ['Voluntary', 'Voluntary', 'Voluntary', 'Involuntary', 'Retirement'];
const separationReasons = [
  'Better opportunity', 'Relocation', 'Career change', 'Compensation', 'Work-life balance',
  'Performance issues', 'Attendance issues', 'Policy violation', 'Restructuring', 'Retirement'
];

const terminatedEmployees = db.prepare('SELECT id, termination_date, department, job_level, hire_date FROM employees WHERE status = ?').all('Terminated');
terminatedEmployees.forEach((emp: any) => {
  const type = randomPick(separationTypes);
  const reason = randomPick(separationReasons);
  const hireYear = new Date(emp.hire_date).getFullYear();
  const termYear = new Date(emp.termination_date).getFullYear();
  const tenure = termYear - hireYear + randomFloat(0, 0.99);

  insertSeparation.run(
    emp.id,
    emp.termination_date,
    type,
    reason,
    emp.department,
    emp.job_level,
    tenure,
    randomInt(0, 1),
    type === 'Voluntary' ? 1 : randomInt(0, 1)
  );
});
console.log(`   - Inserted ${terminatedEmployees.length} separation records`);

// 5. Insert Job Postings
console.log('5. Inserting job postings...');
const insertJobPosting = db.prepare(`
  INSERT INTO job_postings (job_id, title, department, facility_id, job_level, posted_date, filled_date, status, num_applicants)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Generate 45 job postings (15 filled recently, 8 currently open, 22 filled in past)
for (let i = 1; i <= 45; i++) {
  const level = randomPick(['Entry', 'Entry', 'Mid', 'Senior']);
  const title = randomPick(jobTitles[level]);
  const dept = randomPick(departments);
  const postedDate = randomDate(new Date(2024, 0, 1), new Date(2024, 10, 15));

  let status = 'Filled';
  let filledDate = randomDate(new Date(postedDate), new Date(2024, 10, 30));

  if (i > 37) { // Last 8 are open
    status = 'Open';
    filledDate = null as any;
  }

  insertJobPosting.run(
    `JOB-2024-${i.toString().padStart(3, '0')}`,
    title,
    dept,
    randomInt(1, 4),
    level,
    postedDate,
    filledDate,
    status,
    randomInt(12, 85)
  );
}
console.log('   - Inserted 45 job postings (8 open, 37 filled)');

// 6. Insert Candidates
console.log('6. Inserting candidates and offers...');
const insertCandidate = db.prepare(`
  INSERT INTO candidates (
    candidate_id, job_posting_id, first_name, last_name, email,
    applied_date, interview_date, offer_date, offer_accepted, offer_declined_reason, start_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const declineReasons = ['Compensation', 'Accepted Counter-Offer', 'Better Opportunity', 'Location/Commute', 'Company Reputation', 'Other'];

let candidateId = 1;
const jobPostings = db.prepare('SELECT id, posted_date, filled_date, status FROM job_postings').all();

jobPostings.forEach((job: any) => {
  const numCandidates = randomInt(8, 20);

  for (let i = 0; i < numCandidates; i++) {
    const firstName = randomPick(firstNames);
    const lastName = randomPick(lastNames);
    const endDate = job.filled_date ? new Date(job.filled_date) : new Date();
    const appliedDate = randomDate(new Date(job.posted_date), endDate);
    const interviewed = randomInt(0, 100) < 40; // 40% get interviews
    const interviewDate = interviewed ? randomDate(new Date(appliedDate), endDate) : null;
    const offered = interviewed && randomInt(0, 100) < 50; // 50% of interviewed get offers
    const offerDate = offered ? randomDate(new Date(interviewDate!), endDate) : null;
    const acceptedBool = offered ? randomInt(0, 100) < 82 : false; // 82% acceptance rate
    const accepted = offered ? (acceptedBool ? 1 : 0) : null;
    const declineReason = offered && !acceptedBool ? randomPick(declineReasons) : null;
    const startDate = offered && acceptedBool ? randomDate(new Date(offerDate!), addDays(new Date(offerDate!), 30)) : null;

    insertCandidate.run(
      `CAND-${candidateId.toString().padStart(5, '0')}`,
      job.id,
      firstName,
      lastName,
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      appliedDate,
      interviewDate,
      offerDate,
      accepted,
      declineReason,
      startDate
    );
    candidateId++;
  }
});
console.log(`   - Inserted ${candidateId - 1} candidates`);

// 7. Insert Absences (past 12 months)
console.log('7. Inserting absence records...');
const insertAbsence = db.prepare(`
  INSERT INTO absences (employee_id, absence_date, absence_type, hours_missed, approved)
  VALUES (?, ?, ?, ?, ?)
`);

const absenceTypes = ['Sick', 'Sick', 'Sick', 'Personal', 'Personal', 'NCNS', 'FMLA'];
const activeEmployees = db.prepare('SELECT id FROM employees WHERE status = ?').all('Active') as Array<{ id: number }>;

// Generate realistic absences
for (let month = 0; month < 12; month++) {
  const numAbsences = randomInt(45, 60); // ~50 absences per month
  for (let i = 0; i < numAbsences; i++) {
    const empId = randomPick(activeEmployees).id;
    const absenceDate = randomDate(subMonths(new Date(), month), subMonths(new Date(), month - 1));
    const type = randomPick(absenceTypes);
    const hours = type === 'FMLA' ? randomFloat(40, 160) : randomInt(4, 12);
    const approved = type !== 'NCNS' ? 1 : 0;

    insertAbsence.run(empId, absenceDate, type, hours, approved);
  }
}
console.log('   - Inserted ~600 absence records for past 12 months');

// 8. Insert Safety Incidents
console.log('8. Inserting safety incidents...');
const insertIncident = db.prepare(`
  INSERT INTO safety_incidents (
    incident_id, incident_date, facility_id, department, employee_id,
    incident_type, severity, description, recordable, lost_work_days, direct_cost, estimated_indirect_cost
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const incidentTypes = ['First Aid', 'First Aid', 'Medical Treatment', 'Medical Treatment', 'Lost Time', 'Restricted Work'];
const severities = ['Minor', 'Minor', 'Moderate', 'Severe'];
const incidentDescriptions = [
  'Slip on wet floor', 'Cut from sharp edge', 'Strain from lifting', 'Caught hand in machinery',
  'Fall from height', 'Chemical exposure', 'Repetitive motion injury', 'Struck by equipment'
];

// Generate incidents over past 12 months (~4 per month = 48 per year)
for (let month = 0; month < 12; month++) {
  const numIncidents = randomInt(3, 5);
  for (let i = 0; i < numIncidents; i++) {
    const type = randomPick(incidentTypes);
    const recordable = type !== 'First Aid';
    const lostDays = type === 'Lost Time' ? randomInt(1, 45) : type === 'Restricted Work' ? randomInt(1, 15) : 0;
    const directCost = type === 'First Aid' ? randomFloat(50, 500) :
                      type === 'Medical Treatment' ? randomFloat(1000, 8000) :
                      randomFloat(8000, 45000);
    const indirectCost = directCost * randomFloat(4, 8);

    insertIncident.run(
      `INC-2024-${(month * 10 + i).toString().padStart(4, '0')}`,
      randomDate(subMonths(new Date(), month), subMonths(new Date(), month - 1)),
      randomInt(1, 4),
      randomPick(departments),
      randomPick(activeEmployees).id,
      type,
      randomPick(severities),
      randomPick(incidentDescriptions),
      recordable ? 1 : 0,
      lostDays,
      directCost,
      indirectCost,
    );
  }
}
console.log('   - Inserted ~48 safety incidents for past 12 months');

// 9. Insert Training Programs
console.log('9. Inserting training programs...');
const insertProgram = db.prepare(`
  INSERT INTO training_programs (program_id, name, category, duration_hours, cost_per_employee, provider)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const programs = [
  { id: 'TRN-001', name: 'OSHA 30-Hour Safety Certification', category: 'Safety', hours: 30, cost: 450, provider: 'OSHA Training Institute' },
  { id: 'TRN-002', name: 'Forklift Operator Certification', category: 'Technical', hours: 8, cost: 200, provider: 'SafetyFirst Training' },
  { id: 'TRN-003', name: 'Lean Manufacturing Principles', category: 'Technical', hours: 16, cost: 850, provider: 'Lean Institute' },
  { id: 'TRN-004', name: 'Leadership Development Program', category: 'Leadership', hours: 40, cost: 2500, provider: 'Corporate Leadership Academy' },
  { id: 'TRN-005', name: 'Lockout/Tagout Procedures', category: 'Safety', hours: 4, cost: 150, provider: 'Industrial Safety Systems' },
  { id: 'TRN-006', name: 'Quality Control & Six Sigma', category: 'Technical', hours: 24, cost: 1200, provider: 'Six Sigma Institute' },
  { id: 'TRN-007', name: 'Harassment Prevention Training', category: 'Compliance', hours: 2, cost: 75, provider: 'HR Compliance Solutions' },
  { id: 'TRN-008', name: 'Advanced Welding Techniques', category: 'Technical', hours: 40, cost: 1800, provider: 'American Welding Society' },
  { id: 'TRN-009', name: 'Confined Space Entry', category: 'Safety', hours: 8, cost: 350, provider: 'SafetyFirst Training' },
  { id: 'TRN-010', name: 'Project Management Fundamentals', category: 'Leadership', hours: 24, cost: 1100, provider: 'PMI Authorized' }
];

programs.forEach(p => insertProgram.run(p.id, p.name, p.category, p.hours, p.cost, p.provider));
console.log(`   - Inserted ${programs.length} training programs`);

// 10. Insert Training Enrollments
console.log('10. Inserting training enrollments...');
const insertEnrollment = db.prepare(`
  INSERT INTO training_enrollments (
    employee_id, program_id, enrollment_date, completion_date, status,
    pre_assessment_score, post_assessment_score, certification_earned
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// Enroll ~30% of employees in various training over past 12 months
const trainingEligible = activeEmployees.slice(0, Math.floor(activeEmployees.length * 0.4));
trainingEligible.forEach((emp: any) => {
  const numPrograms = randomInt(1, 3);
  for (let i = 0; i < numPrograms; i++) {
    const programId = randomInt(1, 10);
    const enrollDate = randomDate(new Date(2024, 0, 1), new Date(2024, 9, 1));
    const completed = randomInt(0, 100) < 87; // 87% completion rate
    const completionDate = completed ? randomDate(new Date(enrollDate), new Date(2024, 10, 30)) : null;
    const preScore = randomFloat(40, 75);
    const postScore = completed ? randomFloat(75, 98) : null;
    const certified = completed && postScore! >= 80;

    insertEnrollment.run(
      emp.id,
      programId,
      enrollDate,
      completionDate,
      completed ? 'Completed' : 'In Progress',
      preScore,
      postScore,
      certified ? 1 : 0
    );
  }
});
console.log('   - Inserted training enrollments for ~40% of workforce');

// 11. Insert Engagement Surveys
console.log('11. Inserting engagement survey data...');
const insertSurvey = db.prepare(`
  INSERT INTO engagement_surveys (survey_id, survey_name, survey_date, total_employees, responses_received)
  VALUES (?, ?, ?, ?, ?)
`);

const surveys = [
  { id: 'SURVEY-2024-Q1', name: 'Q1 2024 Employee Engagement', date: '2024-03-15', total: 842, responses: 716 },
  { id: 'SURVEY-2024-Q2', name: 'Q2 2024 Employee Engagement', date: '2024-06-15', total: 839, responses: 701 },
  { id: 'SURVEY-2024-Q3', name: 'Q3 2024 Employee Engagement', date: '2024-09-15', total: 845, responses: 723 },
];

surveys.forEach(s => insertSurvey.run(s.id, s.name, s.date, s.total, s.responses));

const insertSurveyResponse = db.prepare(`
  INSERT INTO survey_responses (
    survey_id, employee_id, response_date,
    job_satisfaction_score, manager_effectiveness_score, career_growth_score,
    company_culture_score, work_life_balance_score, total_score
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Generate survey responses
surveys.forEach((survey, idx) => {
  const numResponses = survey.responses;
  const respondents = activeEmployees.slice(0, numResponses);

  respondents.forEach((emp: any) => {
    // Scores tend to be between 60-85 (realistic engagement scores)
    const jobSat = randomInt(12, 24); // out of 25 (5 questions × 5 points)
    const mgrEff = randomInt(12, 22); // out of 20 (4 questions × 5 points)
    const career = randomInt(8, 17); // out of 15 (3 questions × 5 points)
    const culture = randomInt(13, 22); // out of 20 (4 questions × 5 points)
    const workLife = randomInt(12, 21); // out of 20 (4 questions × 5 points)
    const total = jobSat + mgrEff + career + culture + workLife;

    insertSurveyResponse.run(
      idx + 1,
      emp.id,
      survey.date,
      jobSat,
      mgrEff,
      career,
      culture,
      workLife,
      total
    );
  });
});
console.log('   - Inserted 3 quarterly surveys with ~85% response rate');

// 12. Insert Labor Hours (monthly aggregates)
console.log('12. Inserting labor hours data...');
const insertLaborHours = db.prepare(`
  INSERT INTO labor_hours (record_date, facility_id, department, regular_hours, overtime_hours, total_hours, num_employees)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (let month = 0; month < 12; month++) {
  for (let fac = 1; fac <= 4; fac++) {
    departments.forEach(dept => {
      const numEmps = randomInt(15, 95);
      const avgHoursPerEmp = 173.33; // Monthly average
      const regularHours = numEmps * avgHoursPerEmp * randomFloat(0.92, 1.0);
      const overtimeHours = numEmps * randomFloat(8, 25);
      const totalHours = regularHours + overtimeHours;

      insertLaborHours.run(
        format(subMonths(new Date(), month), 'yyyy-MM-01'),
        fac,
        dept,
        regularHours,
        overtimeHours,
        totalHours,
        numEmps
      );
    });
  }
}
console.log('   - Inserted 12 months of labor hours data');

// 13. Insert Production Data
console.log('13. Inserting production data...');
const insertProduction = db.prepare(`
  INSERT INTO production_data (record_date, facility_id, department, units_produced, defect_count, rework_count, labor_hours)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (let month = 0; month < 12; month++) {
  for (let fac = 1; fac <= 2; fac++) { // Only manufacturing and some construction
    const unitsProduced = randomInt(9000, 13000);
    const defectRate = randomFloat(0.02, 0.05);
    const defects = Math.floor(unitsProduced * defectRate);
    const rework = Math.floor(defects * randomFloat(0.6, 0.85));
    const laborHours = randomFloat(11000, 14500);

    insertProduction.run(
      format(subMonths(new Date(), month), 'yyyy-MM-01'),
      fac,
      'Manufacturing',
      unitsProduced,
      defects,
      rework,
      laborHours
    );
  }
}
console.log('   - Inserted 12 months of production data');

// 14. Insert Financial Data
console.log('14. Inserting financial data...');
const insertFinancial = db.prepare(`
  INSERT INTO financial_data (
    fiscal_period, period_start, period_end,
    total_revenue, operating_income, total_labor_costs,
    recruitment_costs, training_costs, benefits_costs, safety_costs
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const quarters = [
  { period: '2024-Q1', start: '2024-01-01', end: '2024-03-31', revenue: 21250000 },
  { period: '2024-Q2', start: '2024-04-01', end: '2024-06-30', revenue: 22100000 },
  { period: '2024-Q3', start: '2024-07-01', end: '2024-09-30', revenue: 21850000 },
  { period: '2024-Q4', start: '2024-10-01', end: '2024-12-31', revenue: 22300000 }
];

quarters.forEach(q => {
  const operatingIncome = q.revenue * randomFloat(0.135, 0.148);
  const laborCosts = q.revenue * randomFloat(0.52, 0.55);
  const recruitmentCosts = randomFloat(135000, 185000);
  const trainingCosts = randomFloat(95000, 135000);
  const benefitsCosts = laborCosts * 0.35;
  const safetyCosts = randomFloat(175000, 245000);

  insertFinancial.run(
    q.period,
    q.start,
    q.end,
    q.revenue,
    operatingIncome,
    laborCosts,
    recruitmentCosts,
    trainingCosts,
    benefitsCosts,
    safetyCosts
  );
});
console.log('   - Inserted quarterly financial data for 2024');

// 15. Insert HR Budget
console.log('15. Inserting HR budget data...');
const insertBudget = db.prepare(`
  INSERT INTO hr_budget (fiscal_year, category, budgeted_amount, actual_spend, variance)
  VALUES (?, ?, ?, ?, ?)
`);

const budgetCategories = [
  { cat: 'Recruitment', budget: 720000, actual: 658500 },
  { cat: 'Training', budget: 485000, actual: 512300 },
  { cat: 'Benefits', budget: 16300000, actual: 16285000 },
  { cat: 'Compensation', budget: 47200000, actual: 46585000 },
  { cat: 'Technology', budget: 225000, actual: 218750 },
  { cat: 'Safety', budget: 850000, actual: 892000 }
];

budgetCategories.forEach(b => {
  insertBudget.run(2024, b.cat, b.budget, b.actual, b.actual - b.budget);
});
console.log('   - Inserted 2024 HR budget data');

console.log('\n✅ Data seeding completed successfully!');
console.log('\nSummary:');
console.log('- Company: TitanBuild Manufacturing & Logistics');
console.log('- Facilities: 4');
console.log('- Active Employees: 847');
console.log('- Past Year Separations: 35');
console.log('- Job Postings: 45 (8 open)');
console.log('- Safety Incidents: ~48');
console.log('- Training Programs: 10');
console.log('- Engagement Surveys: 3 (quarterly)');
console.log('- Data Period: 2024 fiscal year');

db.close();
