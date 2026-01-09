import GroupForm from '@/components/groups/GroupForm';

export default function NewGroupPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yangi guruh qo'shish</h1>
        <p className="text-gray-600 mt-1">Guruh ma'lumotlarini kiriting</p>
      </div>

      <GroupForm />
    </div>
  );
}