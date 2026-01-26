'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTeachers } from '@/lib/hooks/useTeachers';
import { TeacherWithUser } from '@/lib/types';
import TeacherModal from '@/components/teachers/TeacherModal';
import TeacherCard from '@/components/teachers/TeacherCard';
import LoadingSpinner from '@/components/ui/Spinner';

export default function TeachersPage() {
  const { user } = useAuth();
  const { teachers, loading, refresh } = useTeachers(user?.centerId || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const handleEditTeacher = (teacher: TeacherWithUser) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleSuccess = () => {
    refresh();
    handleCloseModal();
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === 'all' || teacher.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">O'qituvchilar</h1>
        <p className="text-gray-600">
          Jami {teachers.length} ta o'qituvchi
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Ism, email yoki fan bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters and Add Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Barchasi</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>

            {/* Add Teacher Button */}
            <button
              onClick={handleAddTeacher}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap font-medium"
            >
              + O'qituvchi qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            O'qituvchilar topilmadi
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Qidiruv bo\'yicha natija topilmadi'
              : 'Hali birorta o\'qituvchi qo\'shilmagan'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleAddTeacher}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Birinchi o'qituvchini qo'shish
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={handleEditTeacher}
            />
          ))}
        </div>
      )}

      {/* Teacher Modal */}
      {isModalOpen && (
        <TeacherModal
          teacher={selectedTeacher}
          centerId={user?.centerId || ''}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
