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
  const [success, setSuccess] = useState<{
    centerName: string;
    inviteCode: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    centerName: '',
    centerEmail: '',
    centerPhone: '',
    centerAddress: '',
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
    setSuccess(null);

    try {
      const result = await centerService.create({
        name: formData.centerName,
        phone: formData.centerPhone,
        address: formData.centerAddress,
        email: formData.centerEmail,
        ownerId: user!.uid,
      });

      setSuccess({
        centerName: formData.centerName,
        inviteCode: result.inviteCode,
      });

      // Formani tozalash
      setFormData({
        centerName: '',
        centerEmail: '',
        centerPhone: '',
        centerAddress: '',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (success) {
      navigator.clipboard.writeText(success.inviteCode);
      alert('Invite code nusxalandi!');
    }
  };

  if (success) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ✅ Markaz muvaffaqiyatli yaratildi!
          </h1>
        </div>

        <Card className="max-w-2xl">
          <div className="text-center space-y-6">
            <div className="p-6 bg-success-50 rounded-lg">
              <h2 className="text-xl font-semibold text-success-900 mb-2">
                {success.centerName}
              </h2>
              <p className="text-success-700">
                Markaz muvaffaqiyatli yaratildi
              </p>
            </div>

            <div className="p-6 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                Bu invite code ni markaz adminiga yuboring:
              </p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-3xl font-bold text-primary-700 tracking-wider">
                  {success.inviteCode}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  📋 Nusxalash
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Admin register qilganda bu kodni kiritishi kerak
              </p>
            </div>

            <div className="bg-warning-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-warning-900 mb-2">
                📝 Keyingi qadamlar:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-warning-800">
                <li>Invite code ni markaz adminiga yuboring</li>
                <li>Admin register sahifasiga o'tsin: <code>/register</code></li>
                <li>Admin ma'lumotlarini to'ldirib, invite code ni kiritsin</li>
                <li>Admin markaz paneliga kiradi</li>
              </ol>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/superadmin/centers')}>
                Markazlar ro'yxatiga qaytish
              </Button>
              <Button variant="secondary" onClick={() => setSuccess(null)}>
                Yana markaz qo'shish
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Yangi o'quv markazi qo'shish
        </h1>
        <p className="text-gray-600 mt-1">
          Markaz ma'lumotlarini kiriting. Admin keyinroq o'zi register qiladi.
        </p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-sm text-primary-800">
              ℹ️ Admin yaratish shart emas! Markaz yaratilgandan keyin invite code
              beriladi. Admin o'zi register qilganda invite code kiritib markazga
              birikadi.
            </p>
          </div>

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

          <div>
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

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
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
