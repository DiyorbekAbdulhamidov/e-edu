import { Timestamp } from 'firebase/firestore';

export type UserRole = 'superadmin' | 'centeradmin' | 'teacher' | 'student' | 'parent';

export type Status = 'active' | 'inactive';

export type StudentStatus = 'active' | 'frozen' | 'left';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type PaymentType = 'full' | 'partial' | 'discount';

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export type SalaryType = 'fixed' | 'per_student';

export type DebtStatus = 'pending' | 'partial' | 'paid';

export type GroupStatus = 'active' | 'completed' | 'cancelled';

export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TenantEntity extends BaseEntity {
  centerId: string;
}

export interface Schedule {
  monday: TimeSlot | null;
  tuesday: TimeSlot | null;
  wednesday: TimeSlot | null;
  thursday: TimeSlot | null;
  friday: TimeSlot | null;
  saturday: TimeSlot | null;
  sunday: TimeSlot | null;
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "11:00"
}

export interface PaginationParams {
  limit: number;
  lastDoc?: any;
}

export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  [key: string]: any;
}