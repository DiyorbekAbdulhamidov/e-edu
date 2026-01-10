'use client';

import { use } from 'react';
import { useStudent } from '@/lib/hooks/useStudent';
import { useAuthContext } from '@/contexts/AuthContext';
import StudentForm from '@/components/students/StudentForm';
import Spinner from '@/components/ui/Spinner';

export default function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuthContext();
  const { student, loading } = useStudent(resolvedParams.id, user?.centerId || '');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Talaba topilmadi</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Talabani tahrirlash
        </h1>
        <p className="text-gray-600 mt-1">
          {student.firstName} {student.lastName}
        </p>
      </div>

      <StudentForm student={student} />
    </div>
  );
}