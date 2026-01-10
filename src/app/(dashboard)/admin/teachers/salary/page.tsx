// src/app/(dashboard)/admin/teachers/salary/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTeachers } from '@/lib/hooks/useTeachers';
import { teacherSalaryService } from '@/lib/services/teacherSalaryService';
import { TeacherSalaryHistory } from '@/lib/types';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export default function TeacherSalaryPage() {
  const { user } = useAuth();
  const { teachers, loading: teachersLoading } = useTeachers(user?.centerId || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [salaryHistory, setSalaryHistory] = useState<TeacherSalaryHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  useEffect(() => {
    if (selectedTeacherId && user?.centerId) {
      loadSalaryHistory();
    }
  }, [selectedTeacherId, user]);

  const loadSalaryHistory = async () => {
    try {
      setLoading(true);
      const data = await teacherSalaryService.getTeacherSalaryHistory(
        selectedTeacherId,
        user!.centerId!
      );
      setSalaryHistory(data);
    } catch (error) {
      console.error('Load salary history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlySalaries = async () => {
    if (!confirm('Joriy oy uchun barcha o\'qituvchilar maoshini yaratmoqchimisiz?')) {
      return;
    }

    try {
      setGenerating(true);
      const now = new Date();
      const result = await teacherSalaryService.generateMonthlySalariesForAllTeachers(
        user!.centerId!,
        now.getFullYear(),
        now.getMonth() + 1
      );

      alert(`Muvaffaqiyatli: ${result.success} ta, Xato: ${result.failed} ta`);

      if (selectedTeacherId) {
        loadSalaryHistory();
      }
    } catch (error: any) {
      alert('Xatolik: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPaid = async (salaryId: string) => {
    if (!confirm('Maoshni to\'langan deb belgilamoqchimisiz?')) return;

    try {
      await teacherSalaryService.markAsPaid(
        salaryId,
        user!.uid,
        user!.centerId!
      );
      loadSalaryHistory();
      alert('Maosh to\'langan deb belgilandi!');
    } catch (error: any) {
      alert('Xatolik: ' + error.message);
    }
  };

  if (teachersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalPaid = salaryHistory
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalPending = salaryHistory
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            O'qituvchilar maoshi
          </h1>
          <p className="text-gray-600">
            Maosh tarixi va to'lovlar
          </p>
        </div>

        <button
          onClick={handleGenerateMonthlySalaries}
          disabled={generating}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {generating ? 'Yaratilmoqda...' : '🔄 Oylik maosh yaratish'}
        </button>
      </div>

      {/* Teacher Selection */}
      <Card className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          O'qituvchini tanlang
        </label>
        <select
          value={selectedTeacherId}
          onChange={(e) => setSelectedTeacherId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">O'qituvchi tanlang</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.displayName} - {teacher.salaryType === 'fixed' ? 'Oylik' : 'Per-Student'}
            </option>
          ))}
        </select>
      </Card>

      {selectedTeacherId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="text-3xl font-bold mb-2">
                {totalPaid.toLocaleString()}
              </div>
              <div className="text-green-100">To'langan (so'm)</div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="text-3xl font-bold mb-2">
                {totalPending.toLocaleString()}
              </div>
              <div className="text-yellow-100">Kutilmoqda (so'm)</div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="text-3xl font-bold mb-2">
                {salaryHistory.length}
              </div>
              <div className="text-blue-100">Jami yozuvlar</div>
            </Card>
          </div>

          {/* Salary History Table */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Maosh tarixi</h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : salaryHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                Maosh tarixi topilmadi
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Oy
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Summa
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Turi
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        To'langan sana
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Amal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryHistory.map((salary) => (
                      <tr
                        key={salary.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          {salary.month}
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          {salary.amount.toLocaleString()} so'm
                        </td>
                        <td className="px-6 py-4">
                          {salary.salaryType === 'fixed' ? 'Qat\'iy' : 'Per-Student'}
                          {salary.studentsCount && ` (${salary.studentsCount} talaba)`}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${salary.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                              }`}
                          >
                            {salary.status === 'paid' ? 'To\'langan' : 'Kutilmoqda'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {salary.paidDate
                            ? new Date(salary.paidDate.seconds * 1000).toLocaleDateString('uz-UZ')
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {salary.status === 'pending' && (
                            <button
                              onClick={() => handleMarkAsPaid(salary.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                            >
                              To'langan
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}