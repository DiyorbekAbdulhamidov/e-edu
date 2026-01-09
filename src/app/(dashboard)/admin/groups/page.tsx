import Link from 'next/link';
import GroupList from '@/components/groups/GroupList';
import Button from '@/components/ui/Button';
import { PlusIcon } from '@/components/ui/Icons';

export default function GroupsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guruhlar</h1>
          <p className="text-gray-600 mt-1">Barcha guruhlarni boshqarish</p>
        </div>

        <Link href="/admin/groups/new">
          <Button>
            <PlusIcon className="h-5 w-5" />
            Yangi guruh
          </Button>
        </Link>
      </div>

      <GroupList />
    </div>
  );
}