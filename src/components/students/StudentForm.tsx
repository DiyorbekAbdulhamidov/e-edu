'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { studentService } from '@/lib/services/studentService';
import { groupService } from '@/lib/services/groupService';
import { CreateStudentData, UpdateStudentData, Student } from '@/lib/types';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGroups } from '@/lib/hooks/useGroups';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface StudentFormProps {
  student?: Student;
  onSuccess?: () => void;
}

export default function StudentForm({ student, onSuccess }: StudentFormProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { groups } = useGroups(user?.centerId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initialGroupId =
    student?.assignedGroupId || student?.groups?.[0] || '';
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    phone: student?.phone || '',
    parentPhone: student?.parentPhone || '',
    dateOfBirth: student?.dateOfBirth
      ? new Date(student.dateOfBirth.seconds * 1000).toISOString().split('T')[0]
      : '',
    address: student?.address || '',
    enrollmentDate: student?.enrollmentDate
      ? new Date(student.enrollmentDate.seconds * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: student?.notes || '',
  });
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.centerId) {
      setError('Center ID topilmadi');
      return;
    }

    if (!selectedGroupId) {
      setError('Guruhni tanlang');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedGroup = groups.find((group) => group.id === selectedGroupId);
      const previousGroupId = student?.assignedGroupId || student?.groups?.[0] || '';
      const selectedGroupName =
        selectedGroup?.name || student?.assignedGroupName || null;

      if (!selectedGroup) {
        setError('Guruh topilmadi');
        setLoading(false);
        return;
      }

      if (
        selectedGroup.currentStudents >= selectedGroup.maxStudents &&
        previousGroupId !== selectedGroupId
      ) {
        setError('Tanlangan guruh to\'lgan');
        setLoading(false);
        return;
      }

      if (student) {
        // Yangilash
        const updateData: UpdateStudentData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          parentPhone: formData.parentPhone,
          dateOfBirth: new Date(formData.dateOfBirth),
          address: formData.address,
          notes: formData.notes,
          assignedGroupId: selectedGroupId,
          assignedGroupName: selectedGroupName,
          groups: [selectedGroupId],
        };

        await studentService.update(student.id, updateData, user.centerId);

        if (previousGroupId && previousGroupId !== selectedGroupId) {
          await groupService.decrementStudentCount(previousGroupId, user.centerId);
          await groupService.incrementStudentCount(selectedGroupId, user.centerId);
        }
      } else {
        // Yaratish
        const createData: CreateStudentData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          parentPhone: formData.parentPhone,
          dateOfBirth: new Date(formData.dateOfBirth),
          address: formData.address,
          enrollmentDate: new Date(formData.enrollmentDate),
          notes: formData.notes,
          assignedGroupId: selectedGroupId,
          assignedGroupName: selectedGroup?.name,
          groups: [selectedGroupId],
        };

        await studentService.create(createData, user.centerId, user.uid);
        await groupService.incrementStudentCount(selectedGroupId, user.centerId);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/students');
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
            label="Ism"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <Input
            label="Familiya"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <Input
            label="Telefon"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <Input
            label="Ota-ona telefoni"
            name="parentPhone"
            type="tel"
            value={formData.parentPhone}
            onChange={handleChange}
            required
          />

          <Input
            label="Tug'ilgan sana"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />

          {!student && (
            <Input
              label="Ro'yxatdan o'tgan sana"
              name="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={handleChange}
              required
            />
          )}
        </div>

        <Input
          label="Manzil"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Guruh <span className="text-danger-500">*</span>
          </label>
          <select
            name="groupId"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Guruh tanlang</option>
            {groups.length === 0 && (
              <option value="" disabled>
                Guruhlar topilmadi
              </option>
            )}
            {groups
              .filter((group) => group.status === 'active')
              .map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Izoh
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="input"
          />
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" loading={loading} disabled={loading}>
            {student ? 'Yangilash' : 'Saqlash'}
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
