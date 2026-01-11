import {
  collection,
  getDocs,
  query,
  where,
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
          studentsCount: 0,
        });
      }

      return report;
    } catch (error) {
      console.error('Income report error:', error);
      throw new Error('Daromad hisobotini olishda xatolik');
    }
  }

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

  async getAttendanceReport(centerId: string): Promise<AttendanceReport[]> {
    try {
      const groupsData = await groupService.list(centerId, {});
      const groups = groupsData.groups;

      const report: AttendanceReport[] = [];

      for (const group of groups) {
        if (group.status !== 'active') continue;

        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('centerId', '==', centerId),
          where('groupId', '==', group.id)
        );

        const attendanceSnapshot = await getDocs(attendanceQuery);
        let presentCount = 0;
        const totalCount = attendanceSnapshot.size;

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

  async getTeacherPerformance(
    centerId: string
  ): Promise<TeacherPerformance[]> {
    try {
      const groupsData = await groupService.list(centerId, {});
      const groups = groupsData.groups;

      const teacherMap = new Map<
        string,
        {
          name: string;
          groups: string[];
          students: number,
        }
      >();

      for (const group of groups) {
        if (group.status !== 'active') continue;

        if (!teacherMap.has(group.teacherId)) {
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

      const performance: TeacherPerformance[] = [];

      for (const [teacherId, data] of teacherMap.entries()) {
        let totalAttendance = 0;
        let attendanceCount = 0;

        for (const groupId of data.groups) {
          const attendanceQuery = query(
            collection(db, 'attendance'),
            where('centerId', '==', centerId),
            where('groupId', '==', groupId)
          );

          const snapshot = await getDocs(attendanceQuery);

          snapshot.forEach((doc) => {
            if (doc.data().status === 'present') {
              totalAttendance++;
            }
            attendanceCount++;
          });
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

  exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        const escaped = ('' + val).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
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