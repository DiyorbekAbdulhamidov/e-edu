// src/lib/services/teacherSalaryService.ts
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { teacherService } from './teacherService';
import { groupService } from './groupService';
import {
  TeacherSalaryHistory,
  CreateSalaryHistoryData,
} from '@/lib/types';

class TeacherSalaryService {
  private collectionName = 'teacher_salaries';

  /**
   * Oylik maosh history yaratish
   */
  async createSalaryHistory(
    data: CreateSalaryHistoryData,
    centerId: string,
    userId: string
  ): Promise<string> {
    try {
      const salaryData = {
        teacherId: data.teacherId,
        centerId,
        month: data.month,
        year: data.year,
        amount: data.amount,
        salaryType: 'fixed',
        studentsCount: 0,
        groupsCount: 0,
        paidDate: null,
        status: 'pending' as const,
        notes: data.notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        salaryData
      );
      return docRef.id;
    } catch (error) {
      console.error('Create salary history error:', error);
      throw new Error('Maosh tarixini yaratishda xatolik');
    }
  }

  /**
   * Maoshni to'langan deb belgilash
   */
  async markAsPaid(
    salaryId: string,
    userId: string,
    centerId: string
  ): Promise<void> {
    try {
      const salaryRef = doc(db, this.collectionName, salaryId);
      await updateDoc(salaryRef, {
        status: 'paid',
        paidDate: serverTimestamp(),
        paidBy: userId,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Mark as paid error:', error);
      throw new Error('Maoshni yangilashda xatolik');
    }
  }

  /**
   * O'qituvchi maosh tarixi
   */
  async getTeacherSalaryHistory(
    teacherId: string,
    centerId: string
  ): Promise<TeacherSalaryHistory[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('teacherId', '==', teacherId)
      );

      const querySnapshot = await getDocs(q);
      let salaries: TeacherSalaryHistory[] = [];

      querySnapshot.forEach((doc) => {
        salaries.push({ id: doc.id, ...doc.data() } as TeacherSalaryHistory);
      });

      // Client-side sorting
      salaries.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      return salaries;
    } catch (error) {
      console.error('Get salary history error:', error);
      throw new Error('Maosh tarixini olishda xatolik');
    }
  }

  /**
   * Oylik maosh hisoblash va saqlash
   */
  async calculateAndSaveMonthlySalary(
    teacherId: string,
    centerId: string,
    year: number,
    month: number
  ): Promise<string> {
    try {
      const teacher = await teacherService.getById(teacherId, centerId);
      if (!teacher) throw new Error('O\'qituvchi topilmadi');

      let amount = 0;
      let studentsCount = 0;

      if (teacher.salaryType === 'fixed') {
        amount = teacher.salaryAmount;
      } else {
        // Per-student: guruhlar bo'yicha hisoblash
        for (const groupId of teacher.groups) {
          const group = await groupService.getById(groupId, centerId);
          if (group && group.status === 'active') {
            studentsCount += group.currentStudents;
          }
        }
        amount = studentsCount * teacher.salaryAmount;
      }

      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

      const salaryData = {
        teacherId,
        centerId,
        month: monthStr,
        year,
        amount,
        salaryType: teacher.salaryType,
        studentsCount: teacher.salaryType === 'per_student' ? studentsCount : undefined,
        groupsCount: teacher.groups.length,
        paidDate: null,
        status: 'pending' as const,
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        salaryData
      );

      return docRef.id;
    } catch (error) {
      console.error('Calculate and save salary error:', error);
      throw error;
    }
  }

  /**
   * Barcha o'qituvchilar uchun oylik maosh yaratish
   */
  async generateMonthlySalariesForAllTeachers(
    centerId: string,
    year: number,
    month: number
  ): Promise<{ success: number; failed: number }> {
    try {
      const teachers = await teacherService.list(centerId);
      let success = 0;
      let failed = 0;

      for (const teacher of teachers) {
        if (teacher.status !== 'active') continue;

        try {
          await this.calculateAndSaveMonthlySalary(
            teacher.id,
            centerId,
            year,
            month
          );
          success++;
        } catch (error) {
          console.error(`Failed for teacher ${teacher.id}:`, error);
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Generate salaries error:', error);
      throw new Error('Maoshlarni yaratishda xatolik');
    }
  }

  /**
   * Markaz uchun oylik maosh statistikasi
   */
  async getCenterMonthlySalaryStats(
    centerId: string,
    year: number,
    month: number
  ): Promise<{
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    teachersCount: number;
  }> {
    try {
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('month', '==', monthStr)
      );

      const querySnapshot = await getDocs(q);

      let totalAmount = 0;
      let paidAmount = 0;
      let pendingAmount = 0;
      const teachersSet = new Set<string>();

      querySnapshot.forEach((doc) => {
        const salary = doc.data() as TeacherSalaryHistory;
        totalAmount += salary.amount;

        if (salary.status === 'paid') {
          paidAmount += salary.amount;
        } else {
          pendingAmount += salary.amount;
        }

        teachersSet.add(salary.teacherId);
      });

      return {
        totalAmount,
        paidAmount,
        pendingAmount,
        teachersCount: teachersSet.size,
      };
    } catch (error) {
      console.error('Get center salary stats error:', error);
      throw new Error('Statistikani olishda xatolik');
    }
  }
}

export const teacherSalaryService = new TeacherSalaryService();