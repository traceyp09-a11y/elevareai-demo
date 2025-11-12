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
  first_name: string;
  last_name: string;
  role: string;
}

// Department types
export interface Department {
  id: string;
  name: string;
  scope: string;
}

// Assessment types
export interface Question {
  id: string;
  scope: string;
  dimension: string;
  text: string;
  input_type: string;
  weight: number;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_value: string | null;
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
