'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/lib/services/authService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SuperAdminSettingsPage() {
  const { user } = useAuthContext();
  const [saving, setSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yangi parollar bir xil emas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Xatolik yuz berdi';
      alert('Xatolik: ' + message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
        <p className="text-gray-600 mt-1">SuperAdmin sozlamalari</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Profil ma'lumotlari</h2>
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Ism</p>
              <p className="font-medium">{user?.displayName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rol</p>
              <p className="font-medium">SuperAdmin</p>
            </div>
          </div>

          <hr className="my-6" />

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

            <Button type="submit" loading={saving}>
              Parolni o'zgartirish
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
