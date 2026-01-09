'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';

export default function StudentDashboard() {
  const { user } = useAuthContext();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Xush kelibsiz, {user?.displayName}!
        </h1>
        <p className="text-gray-600 mt-2">Talaba paneli</p>
      </div>

      <Card>
        <p className="text-center text-gray-500 py-12">
          Talaba paneli tez orada qo'shiladi...
        </p>
      </Card>
    </div>
  );
}