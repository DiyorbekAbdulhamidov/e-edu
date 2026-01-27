// src/lib/types/teacher.types.ts - EXTENDED VERSION
import { TenantEntity, SalaryType, Status } from './common.types';
import { Timestamp } from 'firebase/firestore';

export interface Teacher extends TenantEntity {
  subjects: string[];
  salaryType: SalaryType;
  salaryAmount: number;
  hireDate: Timestamp;
  qualification: string;
  bio: string;
  groups: string[];
  status: Status;
}

export interface CreateTeacherData {
  userId: string;
  subjects: string[];
  salaryType: SalaryType;
  salaryAmount: number;
  hireDate: Date;
  qualification: string;
  bio?: string;
}

export interface UpdateTeacherData {
  subjects?: string[];
  salaryType?: SalaryType;
  salaryAmount?: number;
  qualification?: string;
  bio?: string;
  groups?: string[];
  status?: Status;
}

export interface TeacherWithUser extends Teacher {
  displayName: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface TeacherPerformance {
  teacherId: string;
  teacherName: string;
  totalGroups: number;
  totalStudents: number;
  attendanceRate: number;
  monthlySalary: number;
}

// ========== YANGI TYPES ==========

export interface TeacherSalaryHistory {
  id: string;
  teacherId: string;
  centerId: string;
  month: string; // "2025-01"
  year: number;
  amount: number;
  salaryType: SalaryType;
  studentsCount?: number; // for per_student type
  groupsCount: number;
  paidDate: Timestamp | null;
  status: 'pending' | 'paid';
  notes: string;
  paidBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateSalaryHistoryData {
  teacherId: string;
  month: string;
  year: number;
  amount: number;
  notes?: string;
}

export interface TeacherAnalytics {
  teacherId: string;
  teacherName: string;

  // Groups & Students
  totalGroups: number;
  activeGroups: number;
  totalStudents: number;
  averageStudentsPerGroup: number;

  // Attendance
  totalClasses: number;
  averageAttendanceRate: number;
  bestAttendanceGroup: {
    groupId: string;
    groupName: string;
    rate: number;
  } | null;

  // Salary
  currentMonthlySalary: number;
  last3MonthsSalary: number[];
  totalEarnings: number;

  // Performance Score (0-100)
  performanceScore: number;
}

export interface BulkTeacherImport {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  subjects: string;
  salaryType: 'fixed' | 'per_student';
  salaryAmount: number;
  qualification: string;
}

export interface BulkImportResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}
