// src/lib/services/teacherAnalyticsService.ts
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { teacherService } from './teacherService';
import { groupService } from './groupService';
import { teacherSalaryService } from './teacherSalaryService';
import { TeacherAnalytics } from '@/lib/types';

class TeacherAnalyticsService {
  /**
   * O'qituvchi uchun to'liq analytics
   */
  async getTeacherAnalytics(
    teacherId: string,
    centerId: string
  ): Promise<TeacherAnalytics> {
    try {
      const teacher = await teacherService.getById(teacherId, centerId);
      if (!teacher) throw new Error('O\'qituvchi topilmadi');

      // User ma'lumotlarini olish
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('__name__', '==', teacherId))
      );
      const teacherName = userDoc.docs[0]?.data()?.displayName || 'Noma\'lum';

      // Groups statistics
      const teacherGroups = await groupService.getByTeacherId(teacherId, centerId);
      const activeGroups = teacherGroups.filter(g => g.status === 'active');
      const totalStudents = activeGroups.reduce((sum, g) => sum + g.currentStudents, 0);
      const averageStudentsPerGroup = activeGroups.length > 0
        ? totalStudents / activeGroups.length
        : 0;

      // Attendance statistics
      const attendanceStats = await this.calculateAttendanceStats(
        teacherId,
        centerId,
        teacherGroups
      );

      // Salary statistics
      const salaryStats = await this.calculateSalaryStats(
        teacherId,
        centerId
      );

      // Performance score calculation
      const performanceScore = this.calculatePerformanceScore(
        attendanceStats.averageRate,
        activeGroups.length,
        totalStudents
      );

      return {
        teacherId,
        teacherName,
        totalGroups: teacherGroups.length,
        activeGroups: activeGroups.length,
        totalStudents,
        averageStudentsPerGroup: Math.round(averageStudentsPerGroup * 10) / 10,
        totalClasses: attendanceStats.totalClasses,
        averageAttendanceRate: attendanceStats.averageRate,
        bestAttendanceGroup: attendanceStats.bestGroup,
        currentMonthlySalary: salaryStats.currentSalary,
        last3MonthsSalary: salaryStats.last3Months,
        totalEarnings: salaryStats.totalEarnings,
        performanceScore: Math.round(performanceScore),
      };
    } catch (error) {
      console.error('Get teacher analytics error:', error);
      throw new Error('Analitikani olishda xatolik');
    }
  }

  /**
   * Davomat statistikasi
   */
  private async calculateAttendanceStats(
    teacherId: string,
    centerId: string,
    groups: any[]
  ): Promise<{
    totalClasses: number;
    averageRate: number;
    bestGroup: { groupId: string; groupName: string; rate: number } | null;
  }> {
    try {
      let totalClasses = 0;
      let totalPresent = 0;
      let bestGroup: any = null;
      let bestRate = 0;

      for (const group of groups) {
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('centerId', '==', centerId),
          where('groupId', '==', group.id)
        );

        const snapshot = await getDocs(attendanceQuery);
        const groupTotal = snapshot.size;
        let groupPresent = 0;

        snapshot.forEach((doc) => {
          if (doc.data().status === 'present') {
            groupPresent++;
          }
        });

        totalClasses += groupTotal;
        totalPresent += groupPresent;

        const groupRate = groupTotal > 0 ? (groupPresent / groupTotal) * 100 : 0;

        if (groupRate > bestRate) {
          bestRate = groupRate;
          bestGroup = {
            groupId: group.id,
            groupName: group.name,
            rate: Math.round(groupRate * 10) / 10,
          };
        }
      }

      const averageRate = totalClasses > 0
        ? (totalPresent / totalClasses) * 100
        : 0;

      return {
        totalClasses,
        averageRate: Math.round(averageRate * 10) / 10,
        bestGroup,
      };
    } catch (error) {
      console.error('Calculate attendance stats error:', error);
      return {
        totalClasses: 0,
        averageRate: 0,
        bestGroup: null,
      };
    }
  }

  /**
   * Maosh statistikasi
   */
  private async calculateSalaryStats(
    teacherId: string,
    centerId: string
  ): Promise<{
    currentSalary: number;
    last3Months: number[];
    totalEarnings: number;
  }> {
    try {
      const salaryHistory = await teacherSalaryService.getTeacherSalaryHistory(
        teacherId,
        centerId
      );

      const currentSalary = salaryHistory[0]?.amount || 0;
      const last3Months = salaryHistory.slice(0, 3).map(s => s.amount);
      const totalEarnings = salaryHistory
        .filter(s => s.status === 'paid')
        .reduce((sum, s) => sum + s.amount, 0);

      return {
        currentSalary,
        last3Months,
        totalEarnings,
      };
    } catch (error) {
      console.error('Calculate salary stats error:', error);
      return {
        currentSalary: 0,
        last3Months: [],
        totalEarnings: 0,
      };
    }
  }

  /**
   * Performance score hisoblash (0-100)
   */
  private calculatePerformanceScore(
    attendanceRate: number,
    activeGroups: number,
    totalStudents: number
  ): number {
    // Davomat: 50%
    const attendanceScore = (attendanceRate / 100) * 50;

    // Guruhlar soni: 25% (max 5 guruh)
    const groupsScore = Math.min((activeGroups / 5) * 25, 25);

    // Talabalar soni: 25% (max 50 talaba)
    const studentsScore = Math.min((totalStudents / 50) * 25, 25);

    return attendanceScore + groupsScore + studentsScore;
  }

  /**
   * Barcha o'qituvchilar analytics
   */
  async getAllTeachersAnalytics(
    centerId: string
  ): Promise<TeacherAnalytics[]> {
    try {
      const teachers = await teacherService.list(centerId);
      const analytics: TeacherAnalytics[] = [];

      for (const teacher of teachers) {
        if (teacher.status !== 'active') continue;

        try {
          const teacherAnalytics = await this.getTeacherAnalytics(
            teacher.id,
            centerId
          );
          analytics.push(teacherAnalytics);
        } catch (error) {
          console.error(`Analytics error for teacher ${teacher.id}:`, error);
        }
      }

      // Sort by performance score
      analytics.sort((a, b) => b.performanceScore - a.performanceScore);

      return analytics;
    } catch (error) {
      console.error('Get all teachers analytics error:', error);
      throw new Error('Analitikalarni olishda xatolik');
    }
  }
}

export const teacherAnalyticsService = new TeacherAnalyticsService();