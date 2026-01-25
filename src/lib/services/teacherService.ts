import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Teacher,
  CreateTeacherData,
  UpdateTeacherData,
  TeacherWithUser,
} from '@/lib/types';

class TeacherService {
  private collectionName = 'teachers';

  /**
   * O'qituvchi yaratish
   */
  async create(data: CreateTeacherData, centerId: string): Promise<string> {
    try {
      const teacherData = {
        centerId,
        subjects: data.subjects,
        salaryType: data.salaryType,
        salaryAmount: data.salaryAmount,
        hireDate: Timestamp.fromDate(data.hireDate),
        qualification: data.qualification,
        bio: data.bio || '',
        groups: [],
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        teacherData
      );
      return docRef.id;
    } catch (error) {
      console.error('Create teacher error:', error);
      throw new Error('O\'qituvchini yaratishda xatolik');
    }
  }

  /**
   * O'qituvchini yangilash
   */
  async update(
    teacherId: string,
    data: UpdateTeacherData,
    centerId: string
  ): Promise<void> {
    try {
      const teacherRef = doc(db, this.collectionName, teacherId);
      const teacherDoc = await getDoc(teacherRef);

      if (!teacherDoc.exists()) {
        throw new Error('O\'qituvchi topilmadi');
      }

      if (teacherDoc.data().centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      await updateDoc(teacherRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update teacher error:', error);
      throw error;
    }
  }

  /**
   * O'qituvchi ma'lumotlarini olish
   */
  async getById(teacherId: string, centerId: string): Promise<Teacher | null> {
    try {
      const teacherDoc = await getDoc(doc(db, this.collectionName, teacherId));

      if (!teacherDoc.exists()) {
        return null;
      }

      const teacher = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;

      if (teacher.centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      return teacher;
    } catch (error) {
      console.error('Get teacher error:', error);
      throw error;
    }
  }

  /**
   * User ID orqali teacher topish
   */
  async getByUserId(userId: string, centerId: string): Promise<Teacher | null> {
    try {
      const teacherDoc = await getDoc(doc(db, this.collectionName, userId));

      if (!teacherDoc.exists()) {
        return null;
      }

      const teacher = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;

      if (teacher.centerId !== centerId) {
        return null;
      }

      return teacher;
    } catch (error) {
      console.error('Get teacher by user ID error:', error);
      return null;
    }
  }

  /**
   * Barcha o'qituvchilar
   */
  // teacherService.ts - TUZATILGAN
  async list(centerId: string): Promise<TeacherWithUser[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId)
      );

      const querySnapshot = await getDocs(q);
      const teacherIds: string[] = [];
      const teachersMap = new Map<string, Teacher>();

      querySnapshot.forEach((doc) => {
        teacherIds.push(doc.id);
        teachersMap.set(doc.id, { id: doc.id, ...doc.data() } as Teacher);
      });

      // ✅ BATCH READ: 1 query orqali barcha userlarni olish
      // Firestore limit: 10 doc per `in` query
      const teachers: TeacherWithUser[] = [];

      for (let i = 0; i < teacherIds.length; i += 10) {
        const batch = teacherIds.slice(i, i + 10);

        const usersQuery = query(
          collection(db, 'users'),
          where('__name__', 'in', batch)
        );

        const usersSnapshot = await getDocs(usersQuery);
        const usersMap = new Map();

        usersSnapshot.forEach((doc) => {
          usersMap.set(doc.id, doc.data());
        });

        batch.forEach((teacherId) => {
          const teacher = teachersMap.get(teacherId)!;
          const userData = usersMap.get(teacherId);

          teachers.push({
            ...teacher,
            displayName: userData?.displayName || 'Noma\'lum',
            email: userData?.email || '',
            phone: userData?.phone || '',
            avatar: userData?.avatar || '',
          });
        });
      }

      return teachers;
    } catch (error) {
      console.error('List teachers error:', error);
      throw new Error('O\'qituvchilar ro\'yxatini olishda xatolik');
    }
  }

  /**
   * O'qituvchi oylik maoshini hisoblash
   */
  async calculateMonthlySalary(
    teacherId: string,
    centerId: string,
    _year: number,
    _month: number
  ): Promise<number> {
    try {
      void _year;
      void _month;
      const teacher = await this.getById(teacherId, centerId);
      if (!teacher) return 0;

      if (teacher.salaryType === 'fixed') {
        return teacher.salaryAmount;
      }

      // Per-student: har bir guruhda nechta talaba borligini hisoblash
      let totalStudents = 0;
      for (const groupId of teacher.groups) {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          totalStudents += groupData.currentStudents || 0;
        }
      }

      return totalStudents * teacher.salaryAmount;
    } catch (error) {
      console.error('Calculate salary error:', error);
      return 0;
    }
  }
}

export const teacherService = new TeacherService();
