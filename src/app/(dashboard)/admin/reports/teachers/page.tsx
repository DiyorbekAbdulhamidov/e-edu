'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { reportService } from '@/lib/services/reportService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function TeachersReportPage() {
  const { user } = useAuthContext();
  type TeacherPerformanceRow = Awaited<
    ReturnType<typeof reportService.getTeacherPerformance>
  >[number];
  const [report, setReport] = useState<TeacherPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportService.getTeacherPerformance(user!.centerId!);
      setReport(data);
    } catch (error) {
      console.error('Load report error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.centerId) {
      loadReport();
    }
  }, [loadReport, user]);

  const handleExport = () => {
    reportService.exportToCSV(report, 'teachers_performance');
  };

  const totalStudents = report.reduce((sum, r) => sum + r.studentsCount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            O&apos;qituvchilar hisoboti
          </h1>
          <p className="text-gray-600 mt-1">O&apos;qituvchilar samaradorligi</p>
        </div>

        <Button onClick={handleExport}>Export CSV</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-3xl font-bold mb-2">{report.length}</div>
          <div className="text-primary-100">Jami o&apos;qituvchilar</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-3xl font-bold mb-2">{totalStudents}</div>
          <div className="text-success-100">Jami talabalar</div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">O&apos;qituvchi</th>
                <th className="table-header-cell">Guruhlar</th>
                <th className="table-header-cell">Talabalar</th>
                <th className="table-header-cell">O&apos;rtacha davomat</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row) => (
                <tr key={row.teacherId} className="table-row">
                  <td className="table-cell font-medium">
                    {row.teacherName}
                  </td>
                  <td className="table-cell">{row.groupsCount}</td>
                  <td className="table-cell">{row.studentsCount}</td>
                  <td className="table-cell">
                    <span
                      className={`font-semibold ${row.averageAttendance >= 80
                          ? 'text-success-600'
                          : row.averageAttendance >= 60
                            ? 'text-warning-600'
                            : 'text-danger-600'
                        }`}
                    >
                      {row.averageAttendance.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
