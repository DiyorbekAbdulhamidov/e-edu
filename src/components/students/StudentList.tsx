'use client';

import { useState } from 'react';
import { useStudents } from '@/lib/hooks/useStudents';
import { useAuthContext } from '@/contexts/AuthContext';
import StudentCard from './StudentCard';
import Spinner from '@/components/ui/Spinner';
import { MagnifyingGlassIcon } from '@/components/ui/Icons';

export default function StudentList() {
  const { user } = useAuthContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { students, loading } = useStudents(user?.centerId || '', {
    search,
    status: statusFilter || undefined,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ism, familiya yoki telefon bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Barcha holatlar</option>
          <option value="active">Faol</option>
          <option value="frozen">Muzlatilgan</option>
          <option value="left">Ketgan</option>
        </select>
      </div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Talabalar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
