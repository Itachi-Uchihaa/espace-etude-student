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

// Types pour l'authentification
export interface Location {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  email: string;
  grade: string;
  mayenneDeClasse: number;
  online: boolean;
  profileImage: string;
  name: string;
  role: string;
  type?: string;
  status?: string;
  createdAt?: { toDate: () => Date } | string | Date | null;
  updatedAt?: { toDate: () => Date } | string | Date | null;
  location?: Location;
}

// Types pour le store des étudiants
export interface StoreStudent {
  id: string;
  name: string;
  email: string;
  createdAt: { toDate: () => Date } | string | Date | null; // Timestamp Firebase
  updatedAt: { toDate: () => Date } | string | Date | null; // Timestamp Firebase
  grade?: string;
  mayenneDeClasse?: number;
  online?: boolean;
  profileImage?: string;
  role: string;
  status: string;
  type: string;
  location?: Location;
  [key: string]: unknown;
}

export interface StudentsState {
  studentsData: StoreStudent[] | null;
  currentUser: StoreStudent | null;
  uid: string | null;
  isLoading: boolean;
  error: string | null;
  setStudents: (students: StoreStudent[]) => void;
  setCurrentUser: (user: StoreStudent | null) => void;
  setUid: (uid: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<{ success: boolean; error?: string }>;
  updateUserPresence: (params: { uid: string; onlineStatus: boolean }) => Promise<void>;
  updateUserProfile: (updates: Partial<{
    name: string;
    email: string;
    grade: string;
    mayenneDeClasse: string;
    profileImage: string;
  }>) => Promise<void>;
  changeUserPassword: (passwords: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
} 