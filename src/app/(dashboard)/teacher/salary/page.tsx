'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTeacher } from '@/lib/hooks/useTeacher';
import { teacherService } from '@/lib/services/teacherService';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export default function TeacherSalaryPage() {
  const { user } = useAuthContext();
  const { teacher, loading: teacherLoading } = useTeacher(
    user?.uid || '',
    user?.centerId || ''
  );
  const [salary, setSalary] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateSalary = useCallback(async () => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const amount = await teacherService.calculateMonthlySalary(
        user!.uid,
        user!.centerId!,
        year,
        month
      );

      setSalary(amount);
    } catch (error) {
      console.error('Calculate salary error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (teacher && user?.centerId) {
      calculateSalary();
    }
  }, [calculateSalary, teacher, user]);

  if (teacherLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-12">
          O'qituvchi ma'lumotlari topilmadi
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Oylik maosh</h1>
        <p className="text-gray-600 mt-1">Sizning maosh ma'lumotlaringiz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <p className="text-success-100 mb-2">Joriy oylik maosh</p>
          <p className="text-4xl font-bold">{salary.toLocaleString()}</p>
          <p className="text-success-100 mt-2">so'm</p>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Maosh turi</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tur:</span>
              <span className="font-semibold">
                {teacher.salaryType === 'fixed' ? 'Qat\'iy' : 'Talaba boshiga'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Miqdor:</span>
              <span className="font-semibold">
                {teacher.salaryAmount.toLocaleString()} so'm
              </span>
            </div>
            {teacher.salaryType === 'per_student' && (
              <div className="text-sm text-gray-600 mt-2">
                * Har bir talaba uchun {teacher.salaryAmount.toLocaleString()} so'm
              </div>
            )}
          </div>
        </Card>

        <Card className="md:col-span-2 bg-primary-50">
          <h3 className="font-semibold mb-4">Oylik hisobot</h3>
          <p className="text-gray-700">
            Batafsil maosh hisoboti tez orada qo'shiladi...
          </p>
        </Card>
      </div>
    </div>
  );
}
