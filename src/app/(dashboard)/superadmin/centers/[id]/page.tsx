'use client';

import { use, useEffect, useState } from 'react';
import { centerService } from '@/lib/services/centerService';
import { Center } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function CenterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [center, setCenter] = useState<Center | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCenter();
  }, []);

  const loadCenter = async () => {
    try {
      const centerData = await centerService.getById(resolvedParams.id);
      const statsData = await centerService.getStats(resolvedParams.id);
      setCenter(centerData);
      setStats(statsData);
    } catch (error) {
      console.error('Load center error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!center || !confirm('Statusni o\'zgartirmoqchimisiz?')) return;

    try {
      const newStatus = center.status === 'active' ? 'suspended' : 'active';
      await centerService.updateStatus(center.id, newStatus);
      alert('Status o\'zgartirildi!');
      loadCenter();
    } catch (error: any) {
      alert('Xatolik: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!center) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Markaz topilmadi</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{center.name}</h1>
          <Badge
            variant={center.status === 'active' ? 'success' : 'danger'}
            className="mt-2"
          >
            {center.status === 'active' ? 'Faol' : 'Bloklangan'}
          </Badge>
        </div>

        <Button
          variant={center.status === 'active' ? 'danger' : 'success'}
          onClick={handleStatusToggle}
        >
          {center.status === 'active' ? 'Bloklash' : 'Aktivlashtirish'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {stats?.totalStudents || 0}
          </div>
          <div className="text-primary-100">Talabalar</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {stats?.totalGroups || 0}
          </div>
          <div className="text-success-100">Guruhlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {stats?.totalTeachers || 0}
          </div>
          <div className="text-warning-100">O'qituvchilar</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {stats?.monthlyRevenue.toLocaleString() || 0}
          </div>
          <div className="text-purple-100">Oylik daromad</div>
        </Card>

        <Card className="bg-gradient-to-br from-danger-500 to-danger-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {stats?.totalDebt.toLocaleString() || 0}
          </div>
          <div className="text-danger-100">Jami qarzlar</div>
        </Card>
      </div>

      {/* Center Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Markaz ma'lumotlari</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{center.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Telefon</p>
              <p className="font-medium">{center.phone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Manzil</p>
              <p className="font-medium">{center.address}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Yaratilgan sana</p>
              <p className="font-medium">
                {new Date(
                  center.createdAt.seconds * 1000
                ).toLocaleDateString('uz-UZ')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-primary-50">
          <h2 className="text-lg font-semibold mb-4">Tezkor harakatlar</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 rounded-lg transition-colors">
              📊 Batafsil statistika
            </button>
            <button className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 rounded-lg transition-colors">
              👥 Foydalanuvchilar ro'yxati
            </button>
            <button className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 rounded-lg transition-colors">
              💰 Moliyaviy hisobot
            </button>
            <button className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 rounded-lg transition-colors">
              ⚙️ Sozlamalar
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}