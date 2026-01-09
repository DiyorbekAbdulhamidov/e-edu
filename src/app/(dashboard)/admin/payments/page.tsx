'use client';

import { usePayments } from '@/lib/hooks/usePayments';
import { useAuthContext } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

export default function PaymentsPage() {
  const { user } = useAuthContext();
  const { payments, loading } = usePayments(user?.centerId || '');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">To'lovlar</h1>
        <p className="text-gray-600 mt-1">Barcha to'lovlar tarixi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {totalIncome.toLocaleString()}
          </div>
          <div className="text-success-100">Jami daromad (so'm)</div>
        </Card>

        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-3xl font-bold mb-2">{payments.length}</div>
          <div className="text-primary-100">Jami to'lovlar</div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="text-3xl font-bold mb-2">
            {payments.length > 0
              ? Math.round(totalIncome / payments.length).toLocaleString()
              : 0}
          </div>
          <div className="text-warning-100">O'rtacha to'lov</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">So'nggi to'lovlar</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Sana</th>
                <th className="table-header-cell">Chek raqami</th>
                <th className="table-header-cell">Summa</th>
                <th className="table-header-cell">Usul</th>
                <th className="table-header-cell">Tur</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 20).map((payment) => (
                <tr key={payment.id} className="table-row">
                  <td className="table-cell">
                    {new Date(
                      payment.paymentDate.seconds * 1000
                    ).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="table-cell font-mono text-sm">
                    {payment.receiptNumber}
                  </td>
                  <td className="table-cell font-semibold text-success-600">
                    {payment.amount.toLocaleString()} so'm
                  </td>
                  <td className="table-cell capitalize">
                    {payment.paymentMethod === 'cash' && 'Naqd'}
                    {payment.paymentMethod === 'card' && 'Karta'}
                    {payment.paymentMethod === 'transfer' && 'O\'tkazma'}
                  </td>
                  <td className="table-cell">
                    {payment.paymentType === 'full' && (
                      <Badge variant="success">To'liq</Badge>
                    )}
                    {payment.paymentType === 'partial' && (
                      <Badge variant="warning">Qisman</Badge>
                    )}
                    {payment.paymentType === 'discount' && (
                      <Badge variant="primary">Chegirma</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}