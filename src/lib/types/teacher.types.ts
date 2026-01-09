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