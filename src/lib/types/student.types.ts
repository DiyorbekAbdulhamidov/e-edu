import { TenantEntity, StudentStatus } from './common.types';
import { Timestamp } from 'firebase/firestore';

export interface Student extends TenantEntity {
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone: string;
  dateOfBirth: Timestamp;
  address: string;
  status: StudentStatus;
  enrollmentDate: Timestamp;
  groups: string[];
  assignedGroupId?: string | null;
  assignedGroupName?: string | null;
  totalDebt: number;
  photo: string;
  notes: string;
  parentId: string | null;
  createdBy: string;
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone: string;
  dateOfBirth: Date;
  address: string;
  enrollmentDate: Date;
  assignedGroupId?: string;
  assignedGroupName?: string;
  groups?: string[];
  photo?: string;
  notes?: string;
  parentId?: string;
}

export interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  parentPhone?: string;
  dateOfBirth?: Date;
  address?: string;
  enrollmentDate?: Date;
  status?: StudentStatus;
  photo?: string;
  notes?: string;
}

export interface StudentWithGroups extends Student {
  groupDetails: Array<{
    id: string;
    name: string;
    teacherName: string;
  }>;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  frozenStudents: number;
  leftStudents: number;
  totalDebt: number;
}
