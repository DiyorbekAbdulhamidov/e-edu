'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupService } from '@/lib/services/groupService';
import { CreateGroupData, UpdateGroupData, Group, Schedule } from '@/lib/types';
import { useAuthContext } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface GroupFormProps {
  group?: Group;
  onSuccess?: () => void;
}

const daysOfWeek = [
  { key: 'monday', label: 'Dushanba' },
  { key: 'tuesday', label: 'Seshanba' },
  { key: 'wednesday', label: 'Chorshanba' },
  { key: 'thursday', label: 'Payshanba' },
  { key: 'friday', label: 'Juma' },
  { key: 'saturday', label: 'Shanba' },
  { key: 'sunday', label: 'Yakshanba' },
];

export default function GroupForm({ group, onSuccess }: GroupFormProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: group?.name || '',
    courseName: group?.courseName || '',
    level: group?.level || '',
    teacherId: group?.teacherId || user?.uid || '',
    monthlyPrice: group?.monthlyPrice || 0,
    maxStudents: group?.maxStudents || 10,
    startDate: group?.startDate
      ? new Date(group.startDate.seconds * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    endDate: group?.endDate
      ? new Date(group.endDate.seconds * 1000).toISOString().split('T')[0]
      : '',
    room: group?.room || '',
  });

  const [schedule, setSchedule] = useState<Schedule>(
    group?.schedule || {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleScheduleChange = (
    day: keyof Schedule,
    field: 'start' | 'end',
    value: string
  ) => {
    setSchedule({
      ...schedule,
      [day]: {
        start: field === 'start' ? value : schedule[day]?.start || '',
        end: field === 'end' ? value : schedule[day]?.end || '',
      },
    });
  };

  const toggleDay = (day: keyof Schedule) => {
    if (schedule[day]) {
      setSchedule({ ...schedule, [day]: null });
    } else {
      setSchedule({ ...schedule, [day]: { start: '09:00', end: '11:00' } });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.centerId) {
      setError('Center ID topilmadi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (group) {
        const updateData: UpdateGroupData = {
          name: formData.name,
          courseName: formData.courseName,
          level: formData.level,
          teacherId: formData.teacherId,
          schedule,
          monthlyPrice: formData.monthlyPrice,
          maxStudents: formData.maxStudents,
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
          room: formData.room,
        };

        await groupService.update(group.id, updateData, user.centerId);
      } else {
        const createData: CreateGroupData = {
          name: formData.name,
          courseName: formData.courseName,
          level: formData.level,
          teacherId: formData.teacherId,
          schedule,
          monthlyPrice: formData.monthlyPrice,
          maxStudents: formData.maxStudents,
          startDate: new Date(formData.startDate),
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
          room: formData.room,
        };

        await groupService.create(createData, user.centerId, user.uid);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/groups');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Guruh nomi"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            helperText="Masalan: IELTS Advanced A1"
          />

          <Input
            label="Kurs nomi"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            required
            helperText="Masalan: IELTS"
          />

          <Input
            label="Daraja"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
            helperText="Masalan: Advanced, Beginner"
          />

          <Input
            label="Xona"
            name="room"
            value={formData.room}
            onChange={handleChange}
            required
            helperText="Masalan: 201"
          />

          <Input
            label="Oylik to'lov (so'm)"
            name="monthlyPrice"
            type="number"
            value={formData.monthlyPrice}
            onChange={handleChange}
            required
          />

          <Input
            label="Maksimal talabalar soni"
            name="maxStudents"
            type="number"
            value={formData.maxStudents}
            onChange={handleChange}
            required
          />

          <Input
            label="Boshlanish sanasi"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            disabled={!!group}
          />

          <Input
            label="Tugash sanasi (ixtiyoriy)"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        {/* Schedule */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Dars jadvali</h3>
          <div className="space-y-3">
            {daysOfWeek.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <label className="flex items-center gap-2 w-32">
                  <input
                    type="checkbox"
                    checked={!!schedule[key as keyof Schedule]}
                    onChange={() => toggleDay(key as keyof Schedule)}
                    className="rounded"
                  />
                  <span>{label}</span>
                </label>

                {schedule[key as keyof Schedule] && (
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="time"
                      value={schedule[key as keyof Schedule]?.start || ''}
                      onChange={(e) =>
                        handleScheduleChange(
                          key as keyof Schedule,
                          'start',
                          e.target.value
                        )
                      }
                      label=""
                    />
                    <span className="self-center">-</span>
                    <Input
                      type="time"
                      value={schedule[key as keyof Schedule]?.end || ''}
                      onChange={(e) =>
                        handleScheduleChange(
                          key as keyof Schedule,
                          'end',
                          e.target.value
                        )
                      }
                      label=""
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" loading={loading} disabled={loading}>
            {group ? 'Yangilash' : 'Saqlash'}
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