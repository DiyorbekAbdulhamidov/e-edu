'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCenters } from '@/lib/hooks/useCenters';
import { centerService } from '@/lib/services/centerService';
import { Center } from '@/lib/types';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export default function AnalyticsPage() {
  const { centers, loading: centersLoading } = useCenters();
  type CenterWithStats = Center & {
    stats: Awaited<ReturnType<typeof centerService.getStats>>;
  };
  const [stats, setStats] = useState<CenterWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllStats = useCallback(async () => {
    try {
      const data = await Promise.all(
        centers.map(async (center) => {
          const centerStats = await centerService.getStats(center.id);
          return {
            ...center,
            stats: centerStats,
          };
        })
      );
      setStats(data);
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  }, [centers]);

  useEffect(() => {
    if (centers.length > 0) {
      loadAllStats();
    }
  }, [centers.length, loadAllStats]);

  if (centersLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalStudents = stats.reduce((sum, c) => sum + c.stats.totalStudents, 0);
  const totalRevenue = stats.reduce((sum, c) => sum + c.stats.monthlyRevenue, 0);
  const totalDebt = stats.reduce((sum, c) => sum + c.stats.totalDebt, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Analitikasi</h1>
        <p className="text-gray-600 mt-1">Umumiy statistika va tahlillar</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-4xl font-bold mb-2">{centers.length}</div>
          <div className="text-primary-100">Jami markazlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-4xl font-bold mb-2">{totalStudents}</div>
          <div className="text-success-100">Jami talabalar</div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {totalRevenue.toLocaleString()}
          </div>
          <div className="text-warning-100">Oylik daromad (so'm)</div>
        </Card>

        <Card className="bg-gradient-to-br from-danger-500 to-danger-600 text-white">
          <div className="text-4xl font-bold mb-2">
            {totalDebt.toLocaleString()}
          </div>
          <div className="text-danger-100">Jami qarzlar (so'm)</div>
        </Card>
      </div>

      {/* Top Centers */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Eng faol markazlar</h2>
        <div className="space-y-4">
          {stats
            .sort((a, b) => b.stats.totalStudents - a.stats.totalStudents)
            .slice(0, 10)
            .map((center, index) => (
              <div
                key={center.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{center.name}</h3>
                    <p className="text-sm text-gray-600">{center.email}</p>
                  </div>
                </div>

                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-xl font-bold text-primary-600">
                      {center.stats.totalStudents}
                    </div>
                    <div className="text-xs text-gray-600">Talabalar</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-success-600">
                      {center.stats.monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Daromad</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
