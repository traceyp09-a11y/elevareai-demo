// Tenant types
export interface Tenant {
  id: string;
  name: string;
  region: string;
  plan: string;
  created_at: string;
  users?: User[];
  departments?: Department[];
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  status: string;
}

// Department types
export interface Department {
  id: string;
  name: string;
  type: string;
}

// Assessment types
export interface Question {
  id: string;
  frameworkVersion: string;
  dimension: string;
  text: string;
  inputType: string;
  weight: number;
  options: { scope?: string } | null;
}

export interface Answer {
  id: string;
  questionId: string;
  value: any;
  normalizedScore: number | null;
  question?: Question;
}

export interface Assessment {
  id: string;
  department_id: string;
  status: string;
  created_at: string;
  department?: Department;
  answers?: Answer[];
}

export interface AssessmentScore {
  assessment_id: string;
  completion_rate: number;
  total_questions: number;
  completed_answers: number;
  scores: {
    data: number;
    technical: number;
    organizational: number;
    overall: number;
  };
}

// API Response types
export interface HealthCheckResponse {
  status: string;
  module: string;
}
