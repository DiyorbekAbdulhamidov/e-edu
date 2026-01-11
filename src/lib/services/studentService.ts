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
  // studentService.ts - TUZATILGAN VERSIYA
  async list(
    centerId: string,
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<{ students: Student[]; hasMore: boolean }> {
    try {
      const constraints: QueryConstraint[] = [
        where('centerId', '==', centerId)
      ];

      // ✅ SERVER-SIDE FILTERING
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      // ✅ PAGINATION
      constraints.push(orderBy('createdAt', 'desc'));

      if (pagination?.limit) {
        constraints.push(limit(pagination.limit));
      }

      if (pagination?.lastDoc) {
        constraints.push(startAfter(pagination.lastDoc));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      const students: Student[] = [];
      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as Student);
      });

      // ⚠️ SEARCH faqat client-side (Firestore full-text qo'llab-quvvatlamaydi)
      // VARIANT: Algolia/Meilisearch integration tavsiya etiladi
      let filteredStudents = students;
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredStudents = students.filter(
          (student) =>
            student.firstName.toLowerCase().includes(searchLower) ||
            student.lastName.toLowerCase().includes(searchLower) ||
            student.phone.includes(searchLower)
        );
      }

      return {
        students: filteredStudents,
        hasMore: students.length === (pagination?.limit || 50)
      };
    } catch (error) {
      console.error('List students error:', error);
      throw new Error('Talabalar ro\'yxatini olishda xatolik');
    }
  }

  /**
   * Real-time listener
   */
  // studentService.ts - TUZATILGAN
  subscribe(
    centerId: string,
    callback: (students: Student[]) => void,
    filters?: FilterParams
  ): () => void {
    const constraints: QueryConstraint[] = [
      where('centerId', '==', centerId)
    ];

    // ✅ SERVER-SIDE FILTER
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    // ✅ LIMIT (pagination bilan)
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(filters?.limit || 50)); // Default 50

    const q = query(collection(db, this.collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let students: Student[] = [];
        snapshot.forEach((doc) => {
          students.push({ id: doc.id, ...doc.data() } as Student);
        });

        // Search faqat client-side (unavoidable)
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          students = students.filter(
            (student) =>
              student.firstName.toLowerCase().includes(searchLower) ||
              student.lastName.toLowerCase().includes(searchLower) ||
              student.phone.includes(searchLower)
          );
        }

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