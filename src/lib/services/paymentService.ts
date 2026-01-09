import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { studentService } from './studentService';
import {
  Payment,
  CreatePaymentData,
  PaymentHistory,
  MonthlyIncome,
} from '@/lib/types';

class PaymentService {
  private collectionName = 'payments';

  /**
   * To'lov qo'shish
   */
  async create(data: CreatePaymentData, centerId: string, userId: string): Promise<string> {
    try {
      const batch = writeBatch(db);

      // Payment yaratish
      const paymentRef = doc(collection(db, this.collectionName));
      const paymentData = {
        centerId,
        studentId: data.studentId,
        groupId: data.groupId,
        amount: data.amount,
        paymentDate: Timestamp.fromDate(data.paymentDate),
        month: data.month,
        year: parseInt(data.month.split('-')[0]),
        paymentType: data.paymentType,
        discount: data.discount || 0,
        notes: data.notes || '',
        paymentMethod: data.paymentMethod,
        receiptNumber: `PAY-${Date.now()}`,
        collectedBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.set(paymentRef, paymentData);

      // Student qarzini yangilash
      const studentRef = doc(db, 'students', data.studentId);
      batch.update(studentRef, {
        totalDebt: -data.amount, // Qarzni kamaytirish (increment ishlatib)
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return paymentRef.id;
    } catch (error) {
      console.error('Create payment error:', error);
      throw new Error('To\'lovni qo\'shishda xatolik yuz berdi');
    }
  }

  /**
   * Talaba to'lovlari tarixi
   */
  async getStudentPayments(
    studentId: string,
    centerId: string
  ): Promise<PaymentHistory> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('studentId', '==', studentId),
        orderBy('paymentDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const payments: Payment[] = [];
      let totalPaid = 0;

      querySnapshot.forEach((doc) => {
        const payment = { id: doc.id, ...doc.data() } as Payment;
        payments.push(payment);
        totalPaid += payment.amount;
      });

      // Talaba ma'lumotlarini olish
      const student = await studentService.getById(studentId, centerId);
      const totalExpected = 0; // Bu joyda guruhlar bo'yicha hisoblash kerak
      const remainingDebt = student?.totalDebt || 0;

      return {
        payments,
        totalPaid,
        totalExpected,
        remainingDebt,
      };
    } catch (error) {
      console.error('Get student payments error:', error);
      throw new Error('To\'lovlar tarixini olishda xatolik');
    }
  }

  /**
   * Oylik daromad
   */
  async getMonthlyIncome(
    centerId: string,
    year: number,
    month: number
  ): Promise<MonthlyIncome> {
    try {
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('month', '==', monthStr)
      );

      const querySnapshot = await getDocs(q);
      let totalIncome = 0;
      let paymentsCount = 0;

      querySnapshot.forEach((doc) => {
        const payment = doc.data() as Payment;
        totalIncome += payment.amount;
        paymentsCount++;
      });

      const averagePayment = paymentsCount > 0 ? totalIncome / paymentsCount : 0;

      return {
        month: monthStr,
        year,
        totalIncome,
        paymentsCount,
        averagePayment: Math.round(averagePayment),
      };
    } catch (error) {
      console.error('Get monthly income error:', error);
      throw new Error('Oylik daromadni olishda xatolik');
    }
  }

  /**
   * Real-time listener
   */
  subscribe(
    centerId: string,
    callback: (payments: Payment[]) => void
  ): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('centerId', '==', centerId),
      orderBy('paymentDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const payments: Payment[] = [];
        snapshot.forEach((doc) => {
          payments.push({ id: doc.id, ...doc.data() } as Payment);
        });
        callback(payments);
      },
      (error) => {
        console.error('Payment subscription error:', error);
      }
    );

    return unsubscribe;
  }
}

export const paymentService = new PaymentService();