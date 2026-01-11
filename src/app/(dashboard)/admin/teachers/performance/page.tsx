'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { teacherAnalyticsService } from '@/lib/services/teacherAnalyticsService';
import { TeacherAnalytics } from '@/lib/types';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function TeacherPerformancePage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<TeacherAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.centerId && user.centerId !== 'pending') {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherAnalyticsService.getAllTeachersAnalytics(
        user!.centerId!
      );
      setAnalytics(data);
    } catch (error: any) {
      console.error('Load analytics error:', error);
      setError(error.message || 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return 'A\'lo';
    if (score >= 60) return 'Yaxshi';
    return 'Yaxshilanishi kerak';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-danger-600 mb-4">{error}</p>
        <Button onClick={loadAnalytics}>Qayta urinish</Button>
      </Card>
    );
  }

  const totalStudents = analytics.reduce((sum, a) => sum + a.totalStudents, 0);
  const totalGroups = analytics.reduce((sum, a) => sum + a.totalGroups, 0);
  const avgAttendance = analytics.length > 0
    ? analytics.reduce((sum, a) => sum + a.averageAttendanceRate, 0) / analytics.length
    : 0;
  const avgScore = analytics.length > 0
    ? analytics.reduce((sum, a) => sum + a.performanceScore, 0) / analytics.length
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          O'qituvchilar samaradorligi
        </h1>
        <p className="text-gray-600">
          {analytics.length} ta o'qituvchi tahlili
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-3xl font-bold mb-2">{totalGroups}</div>
          <div className="text-blue-100">Jami guruhlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-3xl font-bold mb-2">{totalStudents}</div>
          <div className="text-green-100">Jami talabalar</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-3xl font-bold mb-2">{Math.round(avgAttendance)}%</div>
          <div className="text-purple-100">O'rtacha davomat</div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-3xl font-bold mb-2">{Math.round(avgScore)}</div>
          <div className="text-orange-100">O'rtacha ball</div>
        </Card>
      </div>

      {analytics.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">O'qituvchilar ma'lumoti topilmadi</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {analytics.map((teacher, index) => (
            <Card key={teacher.teacherId} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {teacher.teacherName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {teacher.activeGroups} guruh • {teacher.totalStudents} talaba
                    </p>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-lg font-semibold ${getPerformanceColor(teacher.performanceScore)}`}>
                  {teacher.performanceScore} ball
                  <div className="text-xs mt-1">
                    {getPerformanceLabel(teacher.performanceScore)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Guruhlar</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {teacher.activeGroups} / {teacher.totalGroups}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Davomat</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {teacher.averageAttendanceRate.toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Darslar</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {teacher.totalClasses}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Oylik maosh</p>
                  <p className="text-lg font-semibold text-green-600">
                    {teacher.currentMonthlySalary.toLocaleString()} so'm
                  </p>
                </div>
              </div>

              {teacher.bestAttendanceGroup && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Eng yaxshi guruh:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {teacher.bestAttendanceGroup.groupName}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {teacher.bestAttendanceGroup.rate}% davomat
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}