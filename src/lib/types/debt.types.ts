import { TenantEntity, DebtStatus } from './common.types';
import { Timestamp } from 'firebase/firestore';

export interface Debt extends TenantEntity {
  studentId: string;
  groupId: string;
  month: string;
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: DebtStatus;
  dueDate: Timestamp;
}

export interface DebtSummary {
  studentId: string;
  studentName: string;
  totalDebt: number;
  oldestDebt: string;
  groupsCount: number;
}

export interface CenterDebtStats {
  totalDebt: number;
  studentsWithDebt: number;
  averageDebtPerStudent: number;
  debtsByMonth: Array<{
    month: string;
    amount: number;
  }>;
}