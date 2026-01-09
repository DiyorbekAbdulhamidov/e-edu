'use client';

import { useEffect, useState } from 'react';
import { useCenters } from '@/lib/hooks/useCenters';
import { centerService } from '@/lib/services/centerService';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

interface CenterWithStats {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  stats: {
    totalStudents: number;
    totalGroups: number;
    totalTeachers: number;
    monthlyRevenue: number;
    totalDebt: number;
  };
}

export default function SuperAdminDashboard() {
  const { centers, loading } = useCenters();
  const [centersWithStats, setCentersWithStats] = useState<CenterWithStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (centers.length > 0) {
      loadAllStats();
    }
  }, [centers]);

  const loadAllStats = async () => {
    try {
      const data = await Promise.all(
        centers.map(async (center) => {
          const stats = await centerService.getStats(center.id);
          return {
            id: center.id,
            name: center.name,
            email: center.email,
            phone: center.phone,
            status: center.status,
            stats,
          };
        })
      );
      setCentersWithStats(data);
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Platform umumiy statistikasi
  const platformStats = {
    totalCenters: centers.length,
    activeCenters: centers.filter((c) => c.status === 'active').length,
    totalStudents: centersWithStats.reduce((sum, c) => sum + c.stats.totalStudents, 0),
    totalRevenue: centersWithStats.reduce((sum, c) => sum + c.stats.monthlyRevenue, 0),
    totalDebt: centersWithStats.reduce((sum, c) => sum + c.stats.totalDebt, 0),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          SuperAdmin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Platform umumiy ko'rinishi</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {platformStats.totalCenters}
          </div>
          <div className="text-primary-100">Jami markazlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {platformStats.activeCenters}
          </div>
          <div className="text-success-100">Faol markazlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {platformStats.totalStudents}
          </div>
          <div className="text-warning-100">Jami talabalar</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {platformStats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-purple-100">Oylik daromad</div>
        </Card>

        <Card className="bg-gradient-to-br from-danger-500 to-danger-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {platformStats.totalDebt.toLocaleString()}
          </div>
          <div className="text-danger-100">Jami qarzlar</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/superadmin/centers/new">
          <Card className="bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏢</div>
              <div>
                <h3 className="font-semibold text-lg">Yangi markaz</h3>
                <p className="text-gray-600 text-sm">O'quv markazi qo'shish</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/superadmin/centers">
          <Card className="bg-success-50 hover:bg-success-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📋</div>
              <div>
                <h3 className="font-semibold text-lg">Barcha markazlar</h3>
                <p className="text-gray-600 text-sm">Markazlarni boshqarish</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/superadmin/analytics">
          <Card className="bg-warning-50 hover:bg-warning-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📊</div>
              <div>
                <h3 className="font-semibold text-lg">Analitika</h3>
                <p className="text-gray-600 text-sm">Platform statistikasi</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Centers List */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">So'nggi markazlar</h2>
        <div className="space-y-4">
          {centersWithStats.slice(0, 5).map((center) => (
            <div
              key={center.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{center.name}</h3>
                  <Badge
                    variant={
                      center.status === 'active' ? 'success' : 'danger'
                    }
                  >
                    {center.status === 'active' ? 'Faol' : 'Bloklangan'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {center.email} • {center.phone}
                </p>
              </div>

              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {center.stats.totalStudents}
                  </div>
                  <div className="text-xs text-gray-600">Talabalar</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success-600">
                    {center.stats.totalGroups}
                  </div>
                  <div className="text-xs text-gray-600">Guruhlar</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning-600">
                    {center.stats.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Oylik</div>
                </div>
              </div>

              <Link
                href={`/superadmin/centers/${center.id}`}
                className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ko'rish
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}