import Link from 'next/link';
import StudentList from '@/components/students/StudentList';
import Button from '@/components/ui/Button';
import { PlusIcon } from '@/components/ui/Icons';

export default function StudentsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talabalar</h1>
          <p className="text-gray-600 mt-1">Barcha talabalarni boshqarish</p>
        </div>

        <Link href="/admin/students/new">
          <Button>
            <PlusIcon className="h-5 w-5" />
            Yangi talaba
          </Button>
        </Link>
      </div>

      <StudentList />
    </div>
  );
}