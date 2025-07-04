// Types pour les étudiants
export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  city: string;
  lastActive: string;
  status: string;
  avatar?: string;
}

// Types pour les détails d'étudiant
export interface Subject {
  name: string;
  progress: number;
}

export interface Assessment {
  subject: string;
  date: string;
  score: number;
}

export interface StudentDetails {
  age: string;
  school: string;
  city: string;
  email: string;
  phone: string;
  overallProgress: number;
  subjects: Subject[];
  assessments: Assessment[];
}

// Types pour les événements d'analytics
export interface AnalyticsEventData {
  subjectId?: string;
  subjectName?: string;
  courseId?: string;
  pageName?: string;
  exerciseId?: string;
  score?: number;
  duration?: number;
  [key: string]: string | number | undefined;
}

// Types pour les composants
export interface StudentTableProps {
  students: Student[];
  onViewStudent: (student: Student) => void;
}

export interface StudentRowProps {
  student: Student;
  onViewStudent: (student: Student) => void;
  isEven: boolean;
}

export interface StudentDrawerProps {
  student: Student;
  studentDetails: StudentDetails;
  onClose: () => void;
} 