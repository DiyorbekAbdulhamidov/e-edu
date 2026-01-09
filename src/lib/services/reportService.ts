import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { studentService } from './studentService';
import { groupService } from './groupService';
import { paymentService } from './paymentService';

interface IncomeReport {
  month: string;
  totalIncome: number;
  paymentsCount: number;
  studentsCount: number;
}

interface DebtReport {
  studentId: string;
  studentName: string;
  phone: string;
  totalDebt: number;
  groups: string[];
}

interface AttendanceReport {
  groupId: string;
  groupName: string;
  totalStudents: number;
  averageAttendance: number;
}

interface TeacherPerformance {
  teacherId: string;
  teacherName: string;
  groupsCount: number;
  studentsCount: number;
  averageAttendance: number;
}

class ReportService {
  /**
   * Oylik daromad hisoboti
   */
  async getIncomeReport(
    centerId: string,
    year: number
  ): Promise<IncomeReport[]> {
    try {
      const report: IncomeReport[] = [];

      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        const income = await paymentService.getMonthlyIncome(
          centerId,
          year,
          month
        );

        report.push({
          month: monthStr,
          totalIncome: income.totalIncome,
          paymentsCount: income.paymentsCount,
          studentsCount: 0, // Bu joyda hisoblash kerak
        });
      }

      return report;
    } catch (error) {
      console.error('Income report error:', error);
      throw new Error('Daromad hisobotini olishda xatolik');
    }
  }

  /**
   * Qarzlar hisoboti
   */
  async getDebtReport(centerId: string): Promise<DebtReport[]> {
    try {
      const studentsData = await studentService.list(centerId, {});
      const students = studentsData.students;

      const debtReport: DebtReport[] = students
        .filter((s) => s.totalDebt > 0)
        .map((s) => ({
          studentId: s.id,
          studentName: `${s.firstName} ${s.lastName}`,
          phone: s.phone,
          totalDebt: s.totalDebt,
          groups: s.groups,
        }))
        .sort((a, b) => b.totalDebt - a.totalDebt);

      return debtReport;
    } catch (error) {
      console.error('Debt report error:', error);
      throw new Error('Qarzlar hisobotini olishda xatolik');
    }
  }

  /**
   * Davomat hisoboti
   */
  async getAttendanceReport(centerId: string): Promise<AttendanceReport[]> {
    try {
      const groupsData = await groupService.list(centerId, {});
      const groups = groupsData.groups;

      const report: AttendanceReport[] = [];

      for (const group of groups) {
        if (group.status !== 'active') continue;

        // Guruh uchun o'rtacha davomatni hisoblash
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('centerId', '==', centerId),
          where('groupId', '==', group.id)
        );

        const attendanceSnapshot = await getDocs(attendanceQuery);
        let presentCount = 0;
        let totalCount = attendanceSnapshot.size;

        attendanceSnapshot.forEach((doc) => {
          if (doc.data().status === 'present') {
            presentCount++;
          }
        });

        const averageAttendance =
          totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

        report.push({
          groupId: group.id,
          groupName: group.name,
          totalStudents: group.currentStudents,
          averageAttendance: Math.round(averageAttendance * 10) / 10,
        });
      }

      return report.sort((a, b) => b.averageAttendance - a.averageAttendance);
    } catch (error) {
      console.error('Attendance report error:', error);
      throw new Error('Davomat hisobotini olishda xatolik');
    }
  }

  /**
   * O'qituvchilar samaradorligi
   */
  async getTeacherPerformance(
    centerId: string
  ): Promise<TeacherPerformance[]> {
    try {
      const groupsData = await groupService.list(centerId, {});
      const groups = groupsData.groups;

      const teacherMap = new Map<string, {
        name: string;
        groups: string[];
        students: number;
      }>();

      // Guruhlar bo'yicha o'qituvchilarni guruhlash
      for (const group of groups) {
        if (group.status !== 'active') continue;

        if (!teacherMap.has(group.teacherId)) {
          // O'qituvchi ismini olish
          const userDoc = await getDocs(
            query(
              collection(db, 'users'),
              where('__name__', '==', group.teacherId)
            )
          );
          const userName = userDoc.docs[0]?.data()?.displayName || 'Noma\'lum';

          teacherMap.set(group.teacherId, {
            name: userName,
            groups: [],
            students: 0,
          });
        }

        const teacher = teacherMap.get(group.teacherId)!;
        teacher.groups.push(group.id);
        teacher.students += group.currentStudents;
      }

      // Performance hisoboti
      const performance: TeacherPerformance[] = [];

      for (const [teacherId, data] of teacherMap.entries()) {
        // O'rtacha davomatni hisoblash
        let totalAttendance = 0;
        let attendanceCount = 0;

        for (const groupId of data.groups) {
          const attendanceQuery = query(
            collection(db, 'attendance'),
            where('centerId', '==', centerId),
            where('groupId', '==', groupId),
            where('status', '==', 'present')
          );

          const snapshot = await getDocs(attendanceQuery);
          totalAttendance += snapshot.size;

          const allAttendanceQuery = query(
            collection(db, 'attendance'),
            where('centerId', '==', centerId),
            where('groupId', '==', groupId)
          );
          const allSnapshot = await getDocs(allAttendanceQuery);
          attendanceCount += allSnapshot.size;
        }

        const averageAttendance =
          attendanceCount > 0 ? (totalAttendance / attendanceCount) * 100 : 0;

        performance.push({
          teacherId,
          teacherName: data.name,
          groupsCount: data.groups.length,
          studentsCount: data.students,
          averageAttendance: Math.round(averageAttendance * 10) / 10,
        });
      }

      return performance.sort((a, b) => b.studentsCount - a.studentsCount);
    } catch (error) {
      console.error('Teacher performance error:', error);
      throw new Error('O\'qituvchilar hisobotini olishda xatolik');
    }
  }

  /**
   * Export to CSV
   */
  exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || '')).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const reportService = new ReportService();