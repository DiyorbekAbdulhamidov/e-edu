'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { centerService } from '@/lib/services/centerService';
import { authService } from '@/lib/services/authService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

export default function AdminSettingsPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [center, setCenter] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [centerData, setCenterData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user?.centerId && user.centerId !== 'pending') {
      loadCenter();
    }
  }, [user]);

  const loadCenter = async () => {
    try {
      const data = await centerService.getById(user!.centerId!);
      setCenter(data);
      setCenterData({
        name: data?.name || '',
        phone: data?.phone || '',
        address: data?.address || '',
        email: data?.email || '',
      });
      setError(null);
    } catch (error: any) {
      console.error('Load center error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCenterUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!centerData.name.trim()) {
      alert('Markaz nomini kiriting');
      return;
    }

    if (!centerData.phone.trim()) {
      alert('Telefon raqamini kiriting');
      return;
    }

    if (!centerData.email.trim()) {
      alert('Email kiriting');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await centerService.update(user!.centerId!, centerData);
      alert('Markaz ma\'lumotlari yangilandi!');
      loadCenter();
    } catch (error: any) {
      setError(error.message);
      alert('Xatolik: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      alert('Joriy parolni kiriting');
      return;
    }

    if (!passwordData.newPassword) {
      alert('Yangi parolni kiriting');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yangi parollar bir xil emas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      alert('Yangi parol joriy paroldan farq qilishi kerak');
      return;
    }

    setSaving(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      alert('Parol muvaffaqiyatli o\'zgartirildi!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      alert('Xatolik: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
        <p className="text-gray-600 mt-1">
          Markaz va profil sozlamalarini boshqarish
        </p>
      </div>

      {error && (
        <Card className="mb-6 bg-danger-50 border-danger-200">
          <p className="text-danger-700">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Markaz ma'lumotlari</h2>
          <form onSubmit={handleCenterUpdate} className="space-y-4">
            <Input
              label="Markaz nomi"
              value={centerData.name}
              onChange={(e) =>
                setCenterData({ ...centerData, name: e.target.value })
              }
              required
            />

            <Input
              label="Email"
              type="email"
              value={centerData.email}
              onChange={(e) =>
                setCenterData({ ...centerData, email: e.target.value })
              }
              required
            />

            <Input
              label="Telefon"
              type="tel"
              value={centerData.phone}
              onChange={(e) =>
                setCenterData({ ...centerData, phone: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manzil
              </label>
              <textarea
                value={centerData.address}
                onChange={(e) =>
                  setCenterData({ ...centerData, address: e.target.value })
                }
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <Button type="submit" loading={saving} disabled={saving}>
              Saqlash
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Parolni o'zgartirish</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Joriy parol"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
            />

            <Input
              label="Yangi parol"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
              helperText="Kamida 6 ta belgi"
            />

            <Input
              label="Yangi parolni tasdiqlang"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              required
            />

            <Button type="submit" loading={saving} disabled={saving}>
              Parolni o'zgartirish
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2 bg-primary-50">
          <h2 className="text-lg font-semibold mb-4">Markaz ma'lumotlari</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Invite Code</p>
              <code className="text-lg font-bold text-primary-700 font-mono">
                {center?.inviteCode}
              </code>
              <p className="text-xs text-gray-600 mt-1">
                Bu kodni yangi adminlar qo'shish uchun ishlatishingiz mumkin
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Yaratilgan sana</p>
              <p className="font-medium">
                {center?.createdAt
                  ? new Date(center.createdAt.seconds * 1000).toLocaleDateString('uz-UZ')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
