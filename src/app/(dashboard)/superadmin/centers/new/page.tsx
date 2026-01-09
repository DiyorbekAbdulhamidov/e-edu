'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { centerService } from '@/lib/services/centerService';
import { useAuthContext } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function NewCenterPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    centerName: '',
    centerEmail: '',
    centerPhone: '',
    centerAddress: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Parollar bir xil emas');
      setLoading(false);
      return;
    }

    if (formData.adminPassword.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setLoading(false);
      return;
    }

    try {
      await centerService.create(
        {
          name: formData.centerName,
          phone: formData.centerPhone,
          address: formData.centerAddress,
          email: formData.centerEmail,
          ownerId: user!.uid,
        },
        formData.adminEmail,
        formData.adminPassword,
        formData.adminName,
        formData.adminPhone
      );

      alert('Markaz muvaffaqiyatli yaratildi!');
      router.push('/superadmin/centers');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Yangi o'quv markazi qo'shish
        </h1>
        <p className="text-gray-600 mt-1">
          Markaz va admin ma'lumotlarini kiriting
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Center Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
              📍 Markaz ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Markaz nomi"
                name="centerName"
                value={formData.centerName}
                onChange={handleChange}
                required
                helperText="Masalan: Success Education Center"
              />

              <Input
                label="Markaz email"
                name="centerEmail"
                type="email"
                value={formData.centerEmail}
                onChange={handleChange}
                required
              />

              <Input
                label="Markaz telefoni"
                name="centerPhone"
                type="tel"
                value={formData.centerPhone}
                onChange={handleChange}
                required
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manzil <span className="text-danger-500">*</span>
                </label>
                <textarea
                  name="centerAddress"
                  value={formData.centerAddress}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
              👤 Admin ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Admin ismi"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                required
              />

              <Input
                label="Admin email"
                name="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={handleChange}
                required
                helperText="Login uchun ishlatiladi"
              />

              <Input
                label="Admin telefoni"
                name="adminPhone"
                type="tel"
                value={formData.adminPhone}
                onChange={handleChange}
                required
              />

              <div></div>

              <Input
                label="Parol"
                name="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={handleChange}
                required
                helperText="Kamida 6 ta belgi"
              />

              <Input
                label="Parolni tasdiqlang"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={loading} disabled={loading}>
              Markazni yaratish
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              Bekor qilish
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}