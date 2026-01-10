'use client';

import { use } from 'react';
import { useGroup } from '@/lib/hooks/useGroup';
import { useAuthContext } from '@/contexts/AuthContext';
import GroupForm from '@/components/groups/GroupForm';
import Spinner from '@/components/ui/Spinner';

export default function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuthContext();
  const { group, loading } = useGroup(resolvedParams.id, user?.centerId || '');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Guruh topilmadi</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Guruhni tahrirlash
        </h1>
        <p className="text-gray-600 mt-1">{group.name}</p>
      </div>

      <GroupForm group={group} />
    </div>
  );
}