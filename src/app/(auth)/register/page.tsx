'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    centerName: '',
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validatsiya
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
      // CenterAdmin sifatida ro'yxatdan o'tish
      await authService.register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        phone: formData.phone,
        role: 'centeradmin',
        centerId: null, // Keyinroq center yaratilgandan keyin set qilinadi
      });

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ro'yxatdan o'tish
        </h1>
        <p className="text-gray-600">
          O'quv markazingizni ro'yxatdan o'tkazing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="O'quv markaz nomi"
          name="centerName"
          value={formData.centerName}
          onChange={handleChange}
          required
        />

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

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Ro'yxatdan o'tish
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