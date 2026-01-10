import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Student,
  CreateStudentData,
  UpdateStudentData,
  StudentStats,
  PaginationParams,
  FilterParams,
} from '@/lib/types';

class StudentService {
  private collectionName = 'students';

  /**
   * Talaba yaratish
   */
  async create(data: CreateStudentData, centerId: string, userId: string): Promise<string> {
    try {
      const studentData = {
        centerId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        parentPhone: data.parentPhone,
        dateOfBirth: Timestamp.fromDate(data.dateOfBirth),
        address: data.address,
        status: 'active' as const,
        enrollmentDate: Timestamp.fromDate(data.enrollmentDate),
        groups: [],
        totalDebt: 0,
        photo: data.photo || '',
        notes: data.notes || '',
        parentId: data.parentId || null,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), studentData);
      return docRef.id;
    } catch (error) {
      console.error('Create student error:', error);
      throw new Error('Talabani yaratishda xatolik yuz berdi');
    }
  }

  /**
   * Talabani yangilash
   */
  async update(
    studentId: string,
    data: UpdateStudentData,
    centerId: string
  ): Promise<void> {
    try {
      const studentRef = doc(db, this.collectionName, studentId);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        throw new Error('Talaba topilmadi');
      }

      if (studentDoc.data().centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (data.dateOfBirth) {
        updateData.dateOfBirth = Timestamp.fromDate(data.dateOfBirth);
      }

      await updateDoc(studentRef, updateData);
    } catch (error) {
      console.error('Update student error:', error);
      throw new Error('Talabani yangilashda xatolik yuz berdi');
    }
  }

  /**
   * Talabani o'chirish
   */
  async delete(studentId: string, centerId: string): Promise<void> {
    try {
      const studentRef = doc(db, this.collectionName, studentId);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        throw new Error('Talaba topilmadi');
      }

      if (studentDoc.data().centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      // Talabaning guruhlarini tekshirish
      const student = studentDoc.data() as Student;
      if (student.groups && student.groups.length > 0) {
        throw new Error('Talaba guruhlardan chiqarilmagan');
      }

      await deleteDoc(studentRef);
    } catch (error) {
      console.error('Delete student error:', error);
      throw error;
    }
  }

  /**
   * Bitta talabani olish
   */
  async getById(studentId: string, centerId: string): Promise<Student | null> {
    try {
      const studentDoc = await getDoc(doc(db, this.collectionName, studentId));

      if (!studentDoc.exists()) {
        return null;
      }

      const student = { id: studentDoc.id, ...studentDoc.data() } as Student;

      if (student.centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      return student;
    } catch (error) {
      console.error('Get student error:', error);
      throw error;
    }
  }

  /**
   * Talabalar ro'yxatini olish (pagination bilan)
   */
  // list() metodini to'liq o'zgartirish:

  async list(
    centerId: string,
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<{ students: Student[]; hasMore: boolean }> {
    try {
      // Faqat centerId bo'yicha filter, orderBy'siz
      const constraints: QueryConstraint[] = [
        where('centerId', '==', centerId)
      ];

      if (pagination?.limit) {
        constraints.push(limit(pagination.limit));
      }

      if (pagination?.lastDoc) {
        constraints.push(startAfter(pagination.lastDoc));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      let students: Student[] = [];
      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as Student);
      });

      // Client-side filtering va sorting
      if (filters?.status) {
        students = students.filter(s => s.status === filters.status);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        students = students.filter(
          (student) =>
            student.firstName.toLowerCase().includes(searchLower) ||
            student.lastName.toLowerCase().includes(searchLower) ||
            student.phone.includes(searchLower)
        );
      }

      // Client-side sorting by createdAt
      students.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      const hasMore = pagination?.limit
        ? students.length === pagination.limit
        : false;

      return { students, hasMore };
    } catch (error) {
      console.error('List students error:', error);
      throw new Error('Talabalar ro\'yxatini olishda xatolik');
    }
  }

  /**
   * Real-time listener
   */
  subscribe(
    centerId: string,
    callback: (students: Student[]) => void,
    filters?: FilterParams
  ): () => void {
    // Faqat centerId filter, orderBy yo'q
    const constraints: QueryConstraint[] = [
      where('centerId', '==', centerId)
    ];

    // Status filter qo'shish (agar kerak bo'lsa)
    // Lekin bu ham index talab qilishi mumkin, shuning uchun client-side qilamiz

    const q = query(collection(db, this.collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let students: Student[] = [];
        snapshot.forEach((doc) => {
          students.push({ id: doc.id, ...doc.data() } as Student);
        });

        // Client-side filtering
        if (filters?.status) {
          students = students.filter(s => s.status === filters.status);
        }

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          students = students.filter(
            (student) =>
              student.firstName.toLowerCase().includes(searchLower) ||
              student.lastName.toLowerCase().includes(searchLower) ||
              student.phone.includes(searchLower)
          );
        }

        // Client-side sorting
        students.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        callback(students);
      },
      (error) => {
        console.error('Student subscription error:', error);
      }
    );

    return unsubscribe;
  }

  /**
   * Talaba statistikasi
   */
  async getStats(centerId: string): Promise<StudentStats> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId)
      );

      const querySnapshot = await getDocs(q);

      let activeStudents = 0;
      let frozenStudents = 0;
      let leftStudents = 0;
      let totalDebt = 0;

      querySnapshot.forEach((doc) => {
        const student = doc.data() as Student;

        if (student.status === 'active') activeStudents++;
        if (student.status === 'frozen') frozenStudents++;
        if (student.status === 'left') leftStudents++;

        totalDebt += student.totalDebt || 0;
      });

      return {
        totalStudents: querySnapshot.size,
        activeStudents,
        frozenStudents,
        leftStudents,
        totalDebt,
      };
    } catch (error) {
      console.error('Get student stats error:', error);
      throw new Error('Statistikani olishda xatolik');
    }
  }

  /**
   * Talabani guruhga qo'shish
   */
  async addToGroup(studentId: string, groupId: string, centerId: string): Promise<void> {
    try {
      const studentRef = doc(db, this.collectionName, studentId);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        throw new Error('Talaba topilmadi');
      }

      const student = studentDoc.data() as Student;

      if (student.centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      if (student.groups.includes(groupId)) {
        throw new Error('Talaba allaqachon bu guruhda');
      }

      await updateDoc(studentRef, {
        groups: [...student.groups, groupId],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Add to group error:', error);
      throw error;
    }
  }

  /**
   * Talabani guruhdan o'chirish
   */
  async removeFromGroup(
    studentId: string,
    groupId: string,
    centerId: string
  ): Promise<void> {
    try {
      const studentRef = doc(db, this.collectionName, studentId);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        throw new Error('Talaba topilmadi');
      }

      const student = studentDoc.data() as Student;

      if (student.centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      await updateDoc(studentRef, {
        groups: student.groups.filter((gId) => gId !== groupId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Remove from group error:', error);
      throw error;
    }
  }

  /**
   * Talaba qarzini yangilash
   */
  async updateDebt(studentId: string, amount: number, centerId: string): Promise<void> {
    try {
      const studentRef = doc(db, this.collectionName, studentId);
      const studentDoc = await getDoc(studentRef);

      if (!studentDoc.exists()) {
        throw new Error('Talaba topilmadi');
      }

      const student = studentDoc.data() as Student;

      if (student.centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      await updateDoc(studentRef, {
        totalDebt: (student.totalDebt || 0) + amount,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update debt error:', error);
      throw error;
    }
  }
}

export const studentService = new StudentService();