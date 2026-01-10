'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { teacherService } from '@/lib/services/teacherService';
import { authService } from '@/lib/services/authService';
import { TeacherWithUser, CreateTeacherData, UpdateTeacherData } from '@/lib/types';

interface TeacherModalProps {
  teacher: TeacherWithUser | null;
  centerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  displayName: string;
  email: string;
  phone: string;
  password?: string;
  subjects: string;
  salaryType: 'fixed' | 'per_student';
  salaryAmount: number;
  hireDate: string;
  qualification: string;
  bio: string;
  status: 'active' | 'inactive';
}

export default function TeacherModal({
  teacher,
  centerId,
  onClose,
  onSuccess,
}: TeacherModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!teacher;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      displayName: teacher?.displayName || '',
      email: teacher?.email || '',
      phone: teacher?.phone || '',
      subjects: teacher?.subjects.join(', ') || '',
      salaryType: teacher?.salaryType || 'fixed',
      salaryAmount: teacher?.salaryAmount || 0,
      hireDate: teacher?.hireDate
        ? new Date(teacher.hireDate.toDate()).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      qualification: teacher?.qualification || '',
      bio: teacher?.bio || '',
      status: teacher?.status || 'active',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const subjects = data.subjects
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);

      if (isEdit) {
        // Update teacher
        const updateData: UpdateTeacherData = {
          subjects,
          salaryType: data.salaryType,
          salaryAmount: data.salaryAmount,
          qualification: data.qualification,
          bio: data.bio,
          status: data.status,
        };

        await teacherService.update(teacher.id, updateData, centerId);

        // Update user info - TUZATILDI
        await authService.updateUserProfile(teacher.id, {
          displayName: data.displayName,
          phone: data.phone,
        });
      } else {
        // Create new teacher
        if (!data.password || data.password.length < 6) {
          setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
          setLoading(false);
          return;
        }

        // Create user via API - TUZATILDI
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            displayName: data.displayName,
            phone: data.phone,
            role: 'teacher',
            centerId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'User yaratishda xatolik');
        }

        const userId = result.userId;

        // Create teacher profile
        const createData: CreateTeacherData = {
          userId,
          subjects,
          salaryType: data.salaryType,
          salaryAmount: data.salaryAmount,
          hireDate: new Date(data.hireDate),
          qualification: data.qualification,
          bio: data.bio,
        };

        await teacherService.create(createData, centerId);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Submit teacher error:', err);
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'O\'qituvchini tahrirlash' : 'Yangi o\'qituvchi qo\'shish'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Shaxsiy ma'lumotlar</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                F.I.O <span className="text-red-500">*</span>
              </label>
              <input
                {...register('displayName', { required: 'F.I.O kiriting' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email', {
                  required: 'Email kiriting',
                  pattern: { value: /^\S+@\S+$/i, message: 'Noto\'g\'ri email' },
                })}
                type="email"
                disabled={isEdit}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parol <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('password', {
                    required: !isEdit && 'Parol kiriting',
                    minLength: { value: 6, message: 'Kamida 6 ta belgi' },
                  })}
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Professional Info */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Professional ma'lumotlar</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fanlar <span className="text-red-500">*</span>
              </label>
              <input
                {...register('subjects', { required: 'Fanlarni kiriting' })}
                placeholder="Matematika, Fizika, Ingliz tili"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Vergul bilan ajrating
              </p>
              {errors.subjects && (
                <p className="text-red-500 text-sm mt-1">{errors.subjects.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maosh turi <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('salaryType')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fixed">Qat'iy (oylik)</option>
                  <option value="per_student">Talaba soni bo'yicha</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summa <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('salaryAmount', {
                    required: 'Summani kiriting',
                    min: { value: 0, message: 'Musbat son kiriting' },
                  })}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.salaryAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.salaryAmount.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ishga qabul qilingan sana <span className="text-red-500">*</span>
              </label>
              <input
                {...register('hireDate', { required: 'Sanani tanlang' })}
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.hireDate && (
                <p className="text-red-500 text-sm mt-1">{errors.hireDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Malaka
              </label>
              <input
                {...register('qualification')}
                placeholder="Masalan: Oliy ma'lumotli, Magistr"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qo'shimcha ma'lumot
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}