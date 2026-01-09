'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { reportService } from '@/lib/services/reportService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function IncomeReportPage() {
  const { user } = useAuthContext();
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.centerId) {
      loadReport();
    }
  }, [user, year]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getIncomeReport(user!.centerId!, year);
      setReport(data);
    } catch (error) {
      console.error('Load report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    reportService.exportToCSV(report, `income_report_${year}`);
  };

  const totalIncome = report.reduce((sum, r) => sum + r.totalIncome, 0);
  const totalPayments = report.reduce((sum, r) => sum + r.paymentsCount, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Daromad hisoboti</h1>
          <p className="text-gray-600 mt-1">Yillik daromadlar statistikasi</p>
        </div>

        <div className="flex gap-4">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <Button onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {totalIncome.toLocaleString()}
          </div>
          <div className="text-success-100">Jami daromad (so'm)</div>
        </Card>

        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-3xl font-bold mb-2">{totalPayments}</div>
          <div className="text-primary-100">Jami to'lovlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {totalPayments > 0
              ? Math.round(totalIncome / totalPayments).toLocaleString()
              : 0}
          </div>
          <div className="text-warning-100">O'rtacha to'lov</div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Oy</th>
                <th className="table-header-cell">To'lovlar soni</th>
                <th className="table-header-cell">Jami daromad</th>
                <th className="table-header-cell">O'rtacha</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row) => (
                <tr key={row.month} className="table-row">
                  <td className="table-cell font-medium">{row.month}</td>
                  <td className="table-cell">{row.paymentsCount}</td>
                  <td className="table-cell font-semibold text-success-600">
                    {row.totalIncome.toLocaleString()} so'm
                  </td>
                  <td className="table-cell">
                    {row.paymentsCount > 0
                      ? Math.round(
                        row.totalIncome / row.paymentsCount
                      ).toLocaleString()
                      : 0}{' '}
                    so'm
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