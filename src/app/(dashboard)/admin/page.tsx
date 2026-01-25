'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { studentService } from '@/lib/services/studentService';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    frozenStudents: 0,
    leftStudents: 0,
    totalDebt: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      if (user?.centerId && user.centerId !== 'pending') {
        const data = await studentService.getStats(user.centerId);
        setStats(data);
        setError(null);
      }
    } catch (error: unknown) {
      console.error('Stats error:', error);
      setError(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.centerId && user.centerId !== 'pending') {
      loadStats();
    } else if (user?.centerId === 'pending') {
      setLoading(false);
    }
  }, [loadStats, user]);

  if (user?.centerId === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center p-8">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Hisobingiz tayyorlanmoqda
          </h2>
          <p className="text-gray-600 mb-4">
            Markazingiz yaratilmoqda. Iltimos, bir oz kuting va sahifani yangilang.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sahifani yangilash
          </button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-danger-600 mb-4">Xatolik: {error}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Qayta urinish
        </button>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Xush kelibsiz, {user?.displayName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Bu sizning bosh sahifangiz
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-4xl font-bold mb-2">{stats.totalStudents}</div>
          <div className="text-primary-100">Jami talabalar</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-4xl font-bold mb-2">{stats.activeStudents}</div>
          <div className="text-success-100">Faol talabalar</div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="text-4xl font-bold mb-2">{stats.frozenStudents}</div>
          <div className="text-warning-100">Muzlatilgan</div>
        </Card>

        <Card className="bg-gradient-to-br from-danger-500 to-danger-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {stats.totalDebt.toLocaleString()}
          </div>
          <div className="text-danger-100">Jami qarz (so&apos;m)</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Tezkor amallar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/students/new"
            className="p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">👨‍🎓</div>
            <div className="font-medium">Yangi talaba</div>
          </Link>

          <Link
            href="/admin/groups/new"
            className="p-4 bg-success-50 hover:bg-success-100 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-medium">Yangi guruh</div>
          </Link>

          <Link
            href="/admin/payments"
            className="p-4 bg-warning-50 hover:bg-warning-100 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium">To&apos;lovlar</div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
