'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { reportService } from '@/lib/services/reportService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

export default function DebtsReportPage() {
  const { user } = useAuthContext();
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.centerId) {
      loadReport();
    }
  }, [user]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getDebtReport(user!.centerId!);
      setReport(data);
    } catch (error) {
      console.error('Load report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    reportService.exportToCSV(report, 'debts_report');
  };

  const totalDebt = report.reduce((sum, r) => sum + r.totalDebt, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Qarzlar hisoboti</h1>
          <p className="text-gray-600 mt-1">Talabalar qarzlari ro'yxati</p>
        </div>

        <Button onClick={handleExport}>Export CSV</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-danger-500 to-danger-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {totalDebt.toLocaleString()}
          </div>
          <div className="text-danger-100">Jami qarz (so'm)</div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="text-3xl font-bold mb-2">{report.length}</div>
          <div className="text-warning-100">Qarzdor talabalar</div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        {report.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            Qarzdor talabalar yo'q! 🎉
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Talaba</th>
                  <th className="table-header-cell">Telefon</th>
                  <th className="table-header-cell">Guruhlar</th>
                  <th className="table-header-cell">Qarz summasi</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.studentId} className="table-row">
                    <td className="table-cell font-medium">
                      {row.studentName}
                    </td>
                    <td className="table-cell">{row.phone}</td>
                    <td className="table-cell">
                      <Badge>{row.groups.length} ta guruh</Badge>
                    </td>
                    <td className="table-cell font-bold text-danger-600">
                      {row.totalDebt.toLocaleString()} so'm
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