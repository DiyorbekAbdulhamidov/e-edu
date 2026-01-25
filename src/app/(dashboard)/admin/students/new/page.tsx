import StudentForm from '@/components/students/StudentForm';

export default function NewStudentPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yangi talaba qo'shish</h1>
        <p className="text-gray-600 mt-1">Talaba ma'lumotlarini kiriting</p>
      </div>

      <StudentForm />
    </div>
  );
}
