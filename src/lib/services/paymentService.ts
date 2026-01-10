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
  increment,
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

      // Student qarzini yangilash (increment ishlatish)
      const studentRef = doc(db, 'students', data.studentId);
      batch.update(studentRef, {
        totalDebt: increment(-data.amount), // To'g'ri increment
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
      // TUZATILDI: orderBy olib tashlandi
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('studentId', '==', studentId)
      );

      const querySnapshot = await getDocs(q);
      let payments: Payment[] = [];
      let totalPaid = 0;

      querySnapshot.forEach((doc) => {
        const payment = { id: doc.id, ...doc.data() } as Payment;
        payments.push(payment);
        totalPaid += payment.amount;
      });

      // Client-side sorting
      payments.sort((a, b) => {
        const dateA = a.paymentDate?.toDate()?.getTime() || 0;
        const dateB = b.paymentDate?.toDate()?.getTime() || 0;
        return dateB - dateA; // desc order
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
   * Guruh uchun to'lovlar
   */
  async getGroupPayments(
    groupId: string,
    centerId: string
  ): Promise<Payment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('groupId', '==', groupId)
      );

      const querySnapshot = await getDocs(q);
      let payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() } as Payment);
      });

      // Client-side sorting
      payments.sort((a, b) => {
        const dateA = a.paymentDate?.toDate()?.getTime() || 0;
        const dateB = b.paymentDate?.toDate()?.getTime() || 0;
        return dateB - dateA;
      });

      return payments;
    } catch (error) {
      console.error('Get group payments error:', error);
      throw new Error('Guruh to\'lovlarini olishda xatolik');
    }
  }

  /**
   * Barcha to'lovlar (filter bilan)
   */
  async getAllPayments(
    centerId: string,
    filters?: {
      groupId?: string;
      studentId?: string;
      startDate?: Date;
      endDate?: Date;
      month?: string;
    }
  ): Promise<Payment[]> {
    try {
      // Faqat centerId bilan qidiramiz
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId)
      );

      const querySnapshot = await getDocs(q);
      let payments: Payment[] = [];

      querySnapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() } as Payment);
      });

      // Client-side filtering
      if (filters) {
        if (filters.groupId) {
          payments = payments.filter(p => p.groupId === filters.groupId);
        }

        if (filters.studentId) {
          payments = payments.filter(p => p.studentId === filters.studentId);
        }

        if (filters.startDate) {
          payments = payments.filter(p => {
            const paymentDate = p.paymentDate?.toDate();
            return paymentDate && paymentDate >= filters.startDate!;
          });
        }

        if (filters.endDate) {
          payments = payments.filter(p => {
            const paymentDate = p.paymentDate?.toDate();
            return paymentDate && paymentDate <= filters.endDate!;
          });
        }

        if (filters.month) {
          payments = payments.filter(p => p.month === filters.month);
        }
      }

      // Client-side sorting
      payments.sort((a, b) => {
        const dateA = a.paymentDate?.toDate()?.getTime() || 0;
        const dateB = b.paymentDate?.toDate()?.getTime() || 0;
        return dateB - dateA;
      });

      return payments;
    } catch (error) {
      console.error('Get all payments error:', error);
      throw new Error('To\'lovlarni olishda xatolik');
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
   * Yillik statistika
   */
  async getYearlyStats(centerId: string, year: number): Promise<MonthlyIncome[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('year', '==', year)
      );

      const querySnapshot = await getDocs(q);
      const monthlyData: { [key: string]: { total: number; count: number } } = {};

      querySnapshot.forEach((doc) => {
        const payment = doc.data() as Payment;
        const month = payment.month;

        if (!monthlyData[month]) {
          monthlyData[month] = { total: 0, count: 0 };
        }

        monthlyData[month].total += payment.amount;
        monthlyData[month].count++;
      });

      // Convert to array
      const stats: MonthlyIncome[] = Object.entries(monthlyData).map(
        ([month, data]) => ({
          month,
          year,
          totalIncome: data.total,
          paymentsCount: data.count,
          averagePayment: Math.round(data.total / data.count),
        })
      );

      // Sort by month
      stats.sort((a, b) => a.month.localeCompare(b.month));

      return stats;
    } catch (error) {
      console.error('Get yearly stats error:', error);
      throw new Error('Yillik statistikani olishda xatolik');
    }
  }

  /**
   * Real-time listener
   */
  subscribe(
    centerId: string,
    callback: (payments: Payment[]) => void
  ): () => void {
    // TUZATILDI: orderBy olib tashlandi
    const q = query(
      collection(db, this.collectionName),
      where('centerId', '==', centerId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let payments: Payment[] = [];
        snapshot.forEach((doc) => {
          payments.push({ id: doc.id, ...doc.data() } as Payment);
        });

        // Client-side sorting
        payments.sort((a, b) => {
          const dateA = a.paymentDate?.toDate()?.getTime() || 0;
          const dateB = b.paymentDate?.toDate()?.getTime() || 0;
          return dateB - dateA;
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