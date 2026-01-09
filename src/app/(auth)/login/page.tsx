'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';
import { useAuthContext } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Agar user allaqachon login qilgan bo'lsa
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || '/admin';
      console.log('User allaqachon login qilgan, redirect:', redirect);
      router.replace(redirect);
    }
  }, [user, router, searchParams]);

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

    try {
      console.log('Login attempt:', formData.email);
      const loggedInUser = await authService.login(formData);
      console.log('Login successful:', loggedInUser);

      // Redirect URL'ni olish
      const redirect = searchParams.get('redirect') || '/admin';
      console.log('Redirecting to:', redirect);

      // Router.replace ishlatish (push emas!)
      router.replace(redirect);

      // Backup: Agar router.replace ishlamasa
      setTimeout(() => {
        if (window.location.pathname !== redirect) {
          console.log('Router.replace ishlamadi, window.location ishlatyapman');
          window.location.href = redirect;
        }
      }, 500);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tizimga kirish
        </h1>
        <p className="text-gray-600">
          e-edu CRM tizimiga xush kelibsiz
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />

        <Input
          label="Parol"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? 'Kirish...' : 'Kirish'}
        </Button>

        <div className="text-center text-sm text-gray-600">
          Hisobingiz yo'qmi?{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Ro'yxatdan o'tish
          </Link>
        </div>
      </form>
    </Card>
  );
}