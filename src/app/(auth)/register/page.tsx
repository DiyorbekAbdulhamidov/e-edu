'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';
import { centerService } from '@/lib/services/centerService';
import { useAuthContext } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerType, setRegisterType] = useState<'new' | 'invite'>('new');

  const [formData, setFormData] = useState({
    // Yangi markaz uchun
    centerName: '',
    centerPhone: '',
    centerAddress: '',

    // Ikkala tur uchun
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Mavjud markaz uchun
    inviteCode: '',
  });

  useEffect(() => {
    if (user) {
      router.replace('/admin');
    }
  }, [user, router]);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Parollar bir xil emas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setLoading(false);
      return;
    }

    try {
      if (registerType === 'new') {
        // Yangi markaz yaratish
        const adminUser = await authService.register({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          phone: formData.phone,
          role: 'centeradmin',
          centerId: 'pending',
        });

        const centerData = {
          name: formData.centerName,
          phone: formData.centerPhone,
          address: formData.centerAddress,
          email: formData.email,
          ownerId: adminUser.uid,
        };

        const centerRef = await centerService.createBasic(centerData);
        await centerService.updateUserCenterId(adminUser.uid, centerRef);

        alert('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);

      } else {
        // Invite code bilan qo'shilish
        if (!formData.inviteCode) {
          setError('Invite code kiriting');
          setLoading(false);
          return;
        }

        // Invite code orqali centerni topish
        const center = await centerService.getByInviteCode(formData.inviteCode);

        if (!center) {
          setError('Invite code noto\'g\'ri yoki eskirgan');
          setLoading(false);
          return;
        }

        if (center.status !== 'active') {
          setError('Bu markaz hozirda faol emas');
          setLoading(false);
          return;
        }

        // Admin yaratish
        await authService.register({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          phone: formData.phone,
          role: 'centeradmin',
          centerId: center.id,
        });

        alert('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      }

    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ro'yxatdan o'tish
        </h1>
        <p className="text-gray-600">
          O'quv markazi CRM tizimiga xush kelibsiz
        </p>
      </div>

      {/* Register Type Selection */}
      <div className="flex gap-4 mb-8">
        <button
          type="button"
          onClick={() => setRegisterType('new')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${registerType === 'new'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          🏢 Yangi markaz
        </button>
        <button
          type="button"
          onClick={() => setRegisterType('invite')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${registerType === 'invite'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          🎫 Invite code bilan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {registerType === 'new' ? (
          <>
            {/* Yangi markaz */}
            <div className="space-y-4 p-4 bg-primary-50 rounded-lg">
              <h3 className="font-semibold text-primary-900">
                📍 Markaz ma'lumotlari
              </h3>
              <Input
                label="Markaz nomi"
                name="centerName"
                value={formData.centerName}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manzil <span className="text-danger-500">*</span>
                </label>
                <textarea
                  name="centerAddress"
                  value={formData.centerAddress}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Invite code */}
            <div className="p-4 bg-success-50 rounded-lg">
              <Input
                label="Invite Code"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                required
                placeholder="XXXXXXXX"
                helperText="SuperAdmin dan olingan 8 ta belgili kod"
              />
            </div>
          </>
        )}

        {/* Admin ma'lumotlari */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">👤 Sizning ma'lumotlaringiz</h3>
          <Input
            label="To'liq ismingiz"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Telefon"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <Input
            label="Parol"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
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

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? 'Ro\'yxatdan o\'tish...' : 'Ro\'yxatdan o\'tish'}
        </Button>

        <div className="text-center text-sm text-gray-600">
          Allaqachon hisobingiz bormi?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Kirish
          </Link>
        </div>
      </form>
    </Card>
  );
}