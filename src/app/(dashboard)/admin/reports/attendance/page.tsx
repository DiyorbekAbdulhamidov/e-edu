'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { reportService } from '@/lib/services/reportService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function AttendanceReportPage() {
  const { user } = useAuthContext();
  type AttendanceReportRow = Awaited<
    ReturnType<typeof reportService.getAttendanceReport>
  >[number];
  const [report, setReport] = useState<AttendanceReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getAttendanceReport(user!.centerId!);
      setReport(data);
    } catch (error: unknown) {
      console.error('Load report error:', error);
      setError(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.centerId && user.centerId !== 'pending') {
      loadReport();
    }
  }, [loadReport, user]);

  const handleExport = () => {
    if (report.length === 0) {
      alert("Export qilish uchun ma'lumot yo'q");
      return;
    }
    reportService.exportToCSV(report, 'attendance_report');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const averageAttendance =
    report.length > 0
      ? report.reduce((sum, r) => sum + r.averageAttendance, 0) / report.length
      : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Davomat hisoboti
          </h1>
          <p className="text-gray-600 mt-1">
            Guruhlar bo&apos;yicha davomat statistikasi
          </p>
        </div>

        <Button onClick={handleExport} disabled={report.length === 0}>
          Export CSV
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-danger-50 border-danger-200">
          <p className="text-danger-700">{error}</p>
          <Button onClick={loadReport} className="mt-4">
            Qayta urinish
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-3xl font-bold mb-2">{report.length}</div>
          <div className="text-primary-100">Jami guruhlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {averageAttendance.toFixed(1)}%
          </div>
          <div className="text-success-100">O&apos;rtacha davomat</div>
        </Card>
      </div>

      <Card>
        {report.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            Ma&apos;lumot topilmadi
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Guruh</th>
                  <th className="table-header-cell">Talabalar</th>
                  <th className="table-header-cell">Davomat</th>
                  <th className="table-header-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.groupId} className="table-row">
                    <td className="table-cell font-medium">
                      {row.groupName}
                    </td>
                    <td className="table-cell">
                      {row.totalStudents}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${row.averageAttendance >= 80
                                ? 'bg-success-500'
                                : row.averageAttendance >= 60
                                  ? 'bg-warning-500'
                                  : 'bg-danger-500'
                              }`}
                            style={{ width: `${row.averageAttendance}%` }}
                          />
                        </div>
                        <span className="font-semibold">
                          {row.averageAttendance.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {row.averageAttendance >= 80
                        ? '✅ Yaxshi'
                        : row.averageAttendance >= 60
                          ? "⚠️ O‘rtacha"
                          : '❌ Past'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
