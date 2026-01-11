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
    if (user) {
      // Role bo'yicha redirect
      const redirect = searchParams.get('redirect');

      if (redirect) {
        router.replace(redirect);
      } else {
        // Role bo'yicha default redirect
        switch (user.role) {
          case 'superadmin':
            router.replace('/superadmin');
            break;
          case 'centeradmin':
            router.replace('/admin');
            break;
          case 'teacher':
            router.replace('/teacher');
            break;
          case 'student':
            router.replace('/student');
            break;
          case 'parent':
            router.replace('/parent');
            break;
          default:
            router.replace('/admin');
        }
      }
    }
  }, [user, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // login/page.tsx - TUZATILGAN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Login attempt:', formData.email);
      const loggedInUser = await authService.login(formData);
      console.log('Login successful:', loggedInUser);

      // ✅ DARHOL REDIRECT (useEffect kutilmaydi)
      const redirect = searchParams.get('redirect');

      if (redirect) {
        router.replace(redirect);
      } else {
        switch (loggedInUser.role) {
          case 'superadmin':
            router.replace('/superadmin');
            break;
          case 'centeradmin':
            router.replace('/admin');
            break;
          case 'teacher':
            router.replace('/teacher');
            break;
          case 'student':
            router.replace('/student');
            break;
          case 'parent':
            router.replace('/parent');
            break;
          default:
            router.replace('/admin');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
      setLoading(false); // ⚠️ Faqat error bo'lsa loading = false
    }
    // ⚠️ SUCCESS bo'lsa loading = true qoladi (redirect bo'lguncha)
  };

  // useEffect O'CHIRILSIN yoki faqat logout uchun qoldirilsin
  useEffect(() => {
    // Faqat logout qilganda login'ga qaytarish
    if (user && user.centerId !== 'pending') {
      // Already logged in, redirect to dashboard
      router.replace('/admin'); // yoki role-based
    }
  }, [user, router]);

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