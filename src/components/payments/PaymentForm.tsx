'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentService } from '@/lib/services/paymentService';
import { useAuthContext } from '@/contexts/AuthContext';
import { CreatePaymentData } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface PaymentFormProps {
  studentId: string;
  groupId: string;
  onSuccess?: () => void;
}

export default function PaymentForm({
  studentId,
  groupId,
  onSuccess,
}: PaymentFormProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [formData, setFormData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    month: currentMonth,
    paymentType: 'full' as const,
    discount: 0,
    notes: '',
    paymentMethod: 'cash' as const,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.centerId) {
      setError('Center ID topilmadi');
      return;
    }

    if (formData.amount <= 0) {
      setError('To\'lov summasi 0 dan katta bo\'lishi kerak');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const createData: CreatePaymentData = {
        studentId,
        groupId,
        amount: formData.amount,
        paymentDate: new Date(formData.paymentDate),
        month: formData.month,
        paymentType: formData.paymentType,
        discount: formData.discount,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
      };

      await paymentService.create(createData, user.centerId, user.uid);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/payments');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="To&apos;lov summasi (so&apos;m)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <Input
            label="To&apos;lov sanasi"
            name="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Oy (YYYY-MM)"
            name="month"
            type="month"
            value={formData.month}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To&apos;lov turi
            </label>
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="full">To&apos;liq</option>
              <option value="partial">Qisman</option>
              <option value="discount">Chegirma bilan</option>
            </select>
          </div>

          <Input
            label="Chegirma (%)"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            min="0"
            max="100"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To&apos;lov usuli
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="cash">Naqd</option>
              <option value="card">Karta</option>
              <option value="transfer">O&apos;tkazma</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Izoh
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
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
            To&apos;lovni qo&apos;shish
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
  );
}
