import { TenantEntity, AttendanceStatus } from './common.types';
import { Timestamp } from 'firebase/firestore';

export interface Attendance extends TenantEntity {
  groupId: string;
  studentId: string;
  teacherId: string;
  date: Timestamp;
  status: AttendanceStatus;
  notes: string;
  markedBy: string;
}

export interface MarkAttendanceData {
  groupId: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes: string;
}

export interface DailyAttendance {
  date: Date;
  groupId: string;
  groupName: string;
  records: AttendanceRecord[];
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}