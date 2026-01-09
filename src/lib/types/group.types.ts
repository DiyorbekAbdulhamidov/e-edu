import { TenantEntity, Schedule, GroupStatus } from './common.types';
import { Timestamp } from 'firebase/firestore';

export interface Group extends TenantEntity {
  name: string;
  courseName: string;
  level: string;
  teacherId: string;
  schedule: Schedule;
  monthlyPrice: number;
  maxStudents: number;
  currentStudents: number;
  startDate: Timestamp;
  endDate: Timestamp | null;
  status: GroupStatus;
  room: string;
  createdBy: string;
}

export interface CreateGroupData {
  name: string;
  courseName: string;
  level: string;
  teacherId: string;
  schedule: Schedule;
  monthlyPrice: number;
  maxStudents: number;
  startDate: Date;
  endDate?: Date;
  room: string;
}

export interface UpdateGroupData {
  name?: string;
  courseName?: string;
  level?: string;
  teacherId?: string;
  schedule?: Schedule;
  monthlyPrice?: number;
  maxStudents?: number;
  endDate?: Date;
  status?: GroupStatus;
  room?: string;
}

export interface GroupWithTeacher extends Group {
  teacherName: string;
  teacherPhone: string;
}

export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  totalStudents: number;
  averageStudentsPerGroup: number;
}