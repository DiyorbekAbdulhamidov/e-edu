// src/app/(dashboard)/admin/teachers/import/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { BulkTeacherImport, BulkImportResult } from '@/lib/types';
import Card from '@/components/ui/Card';
import Papa from 'papaparse'; // Import PapaParse

export default function BulkImportTeachersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  type ParsedTeacher = Omit<BulkTeacherImport, 'salaryAmount'> & {
    salaryAmount: string | number;
  };

  const handleImport = async () => {
    if (!file) {
      alert('Faylni tanlang!');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      // CSV ni parse qilish
      Papa.parse<ParsedTeacher>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<ParsedTeacher>) => {
          const teachers = results.data;

          if (teachers.length === 0) {
            alert('CSV fayl bo\'sh!');
            setImporting(false);
            return;
          }

          // Validation
          const errors: BulkImportResult['errors'] = [];

          teachers.forEach((teacher, index) => {
            if (!teacher.displayName || !teacher.email || !teacher.password) {
              errors.push({
                row: index + 2,
                email: teacher.email || 'N/A',
                error: 'Ism, email va parol majburiy',
              });
            }

            if (teacher.password && teacher.password.length < 6) {
              errors.push({
                row: index + 2,
                email: teacher.email,
                error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
              });
            }
          });

          if (errors.length > 0) {
            setResult({
              success: false,
              successCount: 0,
              failedCount: errors.length,
              errors,
            });
            setImporting(false);
            return;
          }

          // Import qilish
          let successCount = 0;
          const importErrors: BulkImportResult['errors'] = [];

          for (let i = 0; i < teachers.length; i++) {
            const teacher = teachers[i];

            try {
              // User yaratish
              const userResponse = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: teacher.email,
                  password: teacher.password,
                  displayName: teacher.displayName,
                  phone: teacher.phone || '',
                  role: 'teacher',
                  centerId: user!.centerId,
                }),
              });

              const userData = await userResponse.json();

              if (!userResponse.ok) {
                throw new Error(userData.error || 'User yaratishda xatolik');
              }

              // Teacher profile yaratish
              const teacherResponse = await fetch('/api/teachers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userData.userId,
                  centerId: user!.centerId,
                  subjects: teacher.subjects.split(',').map((s: string) => s.trim()),
                  salaryType: teacher.salaryType,
                  salaryAmount: parseFloat(teacher.salaryAmount.toString()),
                  hireDate: new Date().toISOString(),
                  qualification: teacher.qualification || '',
                  bio: '',
                }),
              });

              if (!teacherResponse.ok) {
                throw new Error('Teacher profile yaratishda xatolik');
              }

              successCount++;
            } catch (error: unknown) {
              importErrors.push({
                row: i + 2,
                email: teacher.email,
                error: error instanceof Error ? error.message : 'Xatolik yuz berdi',
              });
            }
          }

          setResult({
            success: importErrors.length === 0,
            successCount,
            failedCount: importErrors.length,
            errors: importErrors,
          });

          setImporting(false);
        },
        error: (error: Error) => {
          alert('CSV parse xatosi: ' + error.message);
          setImporting(false);
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Xatolik yuz berdi';
      alert('Xatolik: ' + message);
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `displayName,email,phone,password,subjects,salaryType,salaryAmount,qualification
Ali Valiyev,ali@example.com,+998901234567,password123,"Matematika,Fizika",fixed,3000000,Oliy
Vali Aliyev,vali@example.com,+998907654321,password456,"Ingliz tili",per_student,50000,Magistr`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'teachers_template.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          O'qituvchilarni import qilish
        </h1>
        <p className="text-gray-600">
          CSV fayl orqali ko'plab o'qituvchilarni bir vaqtda qo'shish
        </p>
      </div>

      {/* Instructions */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Ko'rsatmalar:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>CSV template faylni yuklab oling</li>
          <li>Excel yoki Google Sheets'da ochib, ma'lumotlarni to'ldiring</li>
          <li>Faylni CSV formatda saqlang</li>
          <li>Bu yerga yuklang va import qiling</li>
        </ol>
      </Card>

      {/* Template Download */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              CSV Template yuklab olish
            </h3>
            <p className="text-sm text-gray-600">
              To'g'ri formatdagi namuna faylni yuklab oling
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            📥 Template yuklab olish
          </button>
        </div>
      </Card>

      {/* File Upload */}
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">CSV faylni yuklash</h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm text-gray-600">
              {file ? file.name : 'CSV faylni tanlash uchun bosing'}
            </span>
          </label>
        </div>

        {file && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {importing ? 'Import qilinmoqda...' : '🚀 Import qilish'}
            </button>
          </div>
        )}
      </Card>

      {/* Result */}
      {result && (
        <Card
          className={
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }
        >
          <h3
            className={`font-semibold mb-4 ${result.success ? 'text-green-900' : 'text-red-900'
              }`}
          >
            {result.success ? '✅ Import muvaffaqiyatli!' : '⚠️ Import yakunlandi'}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Muvaffaqiyatli:</p>
              <p className="text-2xl font-bold text-green-600">
                {result.successCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Xato:</p>
              <p className="text-2xl font-bold text-red-600">
                {result.failedCount}
              </p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-red-900 mb-2">Xatolar:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.errors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded border border-red-200 text-sm"
                  >
                    <p className="font-medium text-red-900">
                      Qator {error.row}: {error.email}
                    </p>
                    <p className="text-red-700">{error.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => router.push('/admin/teachers')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              O'qituvchilar ro'yxatiga o'tish
            </button>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Yana import qilish
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
