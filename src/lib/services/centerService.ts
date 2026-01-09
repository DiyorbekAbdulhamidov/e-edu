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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { authService } from './authService';
import {
  Center,
  CreateCenterData,
  UpdateCenterData,
} from '@/lib/types';

class CenterService {
  private collectionName = 'centers';

  /**
   * O'quv markazi yaratish (SuperAdmin)
   */
  async create(
    data: CreateCenterData,
    adminEmail: string,
    adminPassword: string,
    adminName: string,
    adminPhone: string
  ): Promise<string> {
    try {
      // 1. Center yaratish
      const centerData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        email: data.email,
        logo: '',
        status: 'active' as const,
        ownerId: data.ownerId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const centerRef = await addDoc(
        collection(db, this.collectionName),
        centerData
      );
      const centerId = centerRef.id;

      // 2. Center Admin yaratish
      await authService.register({
        email: adminEmail,
        password: adminPassword,
        displayName: adminName,
        phone: adminPhone,
        role: 'centeradmin',
        centerId: centerId,
      });

      return centerId;
    } catch (error) {
      console.error('Create center error:', error);
      throw new Error('O\'quv markazini yaratishda xatolik');
    }
  }

  /**
   * Center ma'lumotlarini yangilash
   */
  async update(centerId: string, data: UpdateCenterData): Promise<void> {
    try {
      const centerRef = doc(db, this.collectionName, centerId);
      await updateDoc(centerRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update center error:', error);
      throw new Error('Markazni yangilashda xatolik');
    }
  }

  /**
   * Centerni bloklash/aktivlashtirish
   */
  async updateStatus(centerId: string, status: 'active' | 'suspended'): Promise<void> {
    try {
      const centerRef = doc(db, this.collectionName, centerId);
      await updateDoc(centerRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update status error:', error);
      throw new Error('Statusni yangilashda xatolik');
    }
  }

  /**
   * Bitta center ma'lumotlarini olish
   */
  async getById(centerId: string): Promise<Center | null> {
    try {
      const centerDoc = await getDoc(doc(db, this.collectionName, centerId));

      if (!centerDoc.exists()) {
        return null;
      }

      return { id: centerDoc.id, ...centerDoc.data() } as Center;
    } catch (error) {
      console.error('Get center error:', error);
      throw error;
    }
  }

  /**
   * Barcha centerlar ro'yxati (SuperAdmin)
   */
  async list(): Promise<Center[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const centers: Center[] = [];

      querySnapshot.forEach((doc) => {
        centers.push({ id: doc.id, ...doc.data() } as Center);
      });

      return centers;
    } catch (error) {
      console.error('List centers error:', error);
      throw new Error('Markazlar ro\'yxatini olishda xatolik');
    }
  }

  /**
   * Center statistikasi
   */
  async getStats(centerId: string): Promise<{
    totalStudents: number;
    totalGroups: number;
    totalTeachers: number;
    monthlyRevenue: number;
    totalDebt: number;
  }> {
    try {
      // Students
      const studentsQuery = query(
        collection(db, 'students'),
        where('centerId', '==', centerId)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      let totalDebt = 0;
      studentsSnapshot.forEach((doc) => {
        totalDebt += doc.data().totalDebt || 0;
      });

      // Groups
      const groupsQuery = query(
        collection(db, 'groups'),
        where('centerId', '==', centerId),
        where('status', '==', 'active')
      );
      const groupsSnapshot = await getDocs(groupsQuery);

      // Teachers
      const teachersQuery = query(
        collection(db, 'teachers'),
        where('centerId', '==', centerId),
        where('status', '==', 'active')
      );
      const teachersSnapshot = await getDocs(teachersQuery);

      // Monthly Revenue (joriy oy)
      const currentMonth = new Date().toISOString().slice(0, 7);
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('centerId', '==', centerId),
        where('month', '==', currentMonth)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      let monthlyRevenue = 0;
      paymentsSnapshot.forEach((doc) => {
        monthlyRevenue += doc.data().amount || 0;
      });

      return {
        totalStudents: studentsSnapshot.size,
        totalGroups: groupsSnapshot.size,
        totalTeachers: teachersSnapshot.size,
        monthlyRevenue,
        totalDebt,
      };
    } catch (error) {
      console.error('Get center stats error:', error);
      return {
        totalStudents: 0,
        totalGroups: 0,
        totalTeachers: 0,
        monthlyRevenue: 0,
        totalDebt: 0,
      };
    }
  }

  /**
   * Centerni o'chirish (SuperAdmin faqat)
   */
  async delete(centerId: string): Promise<void> {
    try {
      // Tekshirish: centerda ma'lumotlar bor-yo'qligini
      const studentsQuery = query(
        collection(db, 'students'),
        where('centerId', '==', centerId)
      );
      const studentsSnapshot = await getDocs(studentsQuery);

      if (!studentsSnapshot.empty) {
        throw new Error('Markazda talabalar mavjud. Avval barcha ma\'lumotlarni o\'chiring.');
      }

      await deleteDoc(doc(db, this.collectionName, centerId));
    } catch (error) {
      console.error('Delete center error:', error);
      throw error;
    }
  }
}

export const centerService = new CenterService();