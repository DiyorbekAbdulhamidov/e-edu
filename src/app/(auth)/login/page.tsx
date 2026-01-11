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

  useEffect(() => {
    if (user && !loading) {
      const redirect = searchParams.get('redirect');

      if (redirect) {
        router.replace(redirect);
      } else {
        const roleRoutes = {
          superadmin: '/superadmin',
          centeradmin: '/admin',
          teacher: '/teacher',
          student: '/student',
          parent: '/parent',
        };

        router.replace(roleRoutes[user.role] || '/admin');
      }
    }
  }, [user, loading, router, searchParams]);

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
      await authService.login(formData);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

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
          Kirish
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