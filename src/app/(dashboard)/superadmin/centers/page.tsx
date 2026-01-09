'use client';

import { useState } from 'react';
import { useCenters } from '@/lib/hooks/useCenters';
import { centerService } from '@/lib/services/centerService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import { PlusIcon, MagnifyingGlassIcon } from '@/components/ui/Icons';

export default function CentersListPage() {
  const { centers, loading, refresh } = useCenters();
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleStatusToggle = async (centerId: string, currentStatus: string) => {
    if (!confirm('Statusni o\'zgartirmoqchimisiz?')) return;

    setActionLoading(centerId);
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await centerService.updateStatus(centerId, newStatus);
      refresh();
      alert('Status o\'zgartirildi!');
    } catch (error: any) {
      alert('Xatolik: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCenters = centers.filter(
    (center) =>
      center.name.toLowerCase().includes(search.toLowerCase()) ||
      center.email.toLowerCase().includes(search.toLowerCase()) ||
      center.phone.includes(search)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barcha markazlar</h1>
          <p className="text-gray-600 mt-1">
            O'quv markazlarini boshqarish
          </p>
        </div>

        <Link href="/superadmin/centers/new">
          <Button>
            <PlusIcon className="h-5 w-5" />
            Yangi markaz
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Markaz nomi, email yoki telefon bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-3xl font-bold mb-2">{centers.length}</div>
          <div className="text-primary-100">Jami markazlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {centers.filter((c) => c.status === 'active').length}
          </div>
          <div className="text-success-100">Faol</div>
        </Card>

        <Card className="bg-gradient-to-br from-danger-500 to-danger-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {centers.filter((c) => c.status === 'inactive').length}
          </div>
          <div className="text-danger-100">Bloklangan</div>
        </Card>
      </div>

      {/* Centers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Markaz nomi</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Telefon</th>
                <th className="table-header-cell">Manzil</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredCenters.map((center) => (
                <tr key={center.id} className="table-row">
                  <td className="table-cell font-semibold">{center.name}</td>
                  <td className="table-cell">{center.email}</td>
                  <td className="table-cell">{center.phone}</td>
                  <td className="table-cell">{center.address}</td>
                  <td className="table-cell">
                    <Badge
                      variant={
                        center.status === 'active' ? 'success' : 'danger'
                      }
                    >
                      {center.status === 'active' ? 'Faol' : 'Bloklangan'}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <Link
                        href={`/superadmin/centers/${center.id}`}
                        className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                      >
                        Ko'rish
                      </Link>
                      <button
                        onClick={() =>
                          handleStatusToggle(center.id, center.status)
                        }
                        disabled={actionLoading === center.id}
                        className={`px-3 py-1 rounded text-sm ${center.status === 'active'
                            ? 'bg-danger-600 hover:bg-danger-700'
                            : 'bg-success-600 hover:bg-success-700'
                          } text-white disabled:opacity-50`}
                      >
                        {actionLoading === center.id
                          ? '...'
                          : center.status === 'active'
                            ? 'Bloklash'
                            : 'Aktivlashtirish'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}