import { TenantEntity, PaymentType, PaymentMethod } from './common.types';
import { Timestamp } from 'firebase/firestore';

export interface Payment extends TenantEntity {
  studentId: string;
  groupId: string;
  amount: number;
  paymentDate: Timestamp;
  month: string;
  year: number;
  paymentType: PaymentType;
  discount: number;
  notes: string;
  paymentMethod: PaymentMethod;
  receiptNumber: string;
  collectedBy: string;
}

export interface CreatePaymentData {
  studentId: string;
  groupId: string;
  amount: number;
  paymentDate: Date;
  month: string;
  paymentType: PaymentType;
  discount?: number;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentHistory {
  payments: Payment[];
  totalPaid: number;
  totalExpected: number;
  remainingDebt: number;
}

export interface MonthlyIncome {
  month: string;
  year: number;
  totalIncome: number;
  paymentsCount: number;
  averagePayment: number;
}