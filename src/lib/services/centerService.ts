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
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Center,
  CreateCenterData,
  UpdateCenterData,
} from '@/lib/types';

class CenterService {
  private collectionName = 'centers';

  /**
   * Invite code generatsiya qilish
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * O'quv markazi yaratish (FAQAT CENTER, admin yo'q)
   */
  async create(data: CreateCenterData): Promise<{
    centerId: string;
    inviteCode: string;
  }> {
    try {
      const inviteCode = this.generateInviteCode();

      const centerData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        email: data.email,
        logo: '',
        status: 'active' as const,
        ownerId: data.ownerId,
        inviteCode: inviteCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const centerRef = await addDoc(
        collection(db, this.collectionName),
        centerData
      );

      return {
        centerId: centerRef.id,
        inviteCode: inviteCode,
      };
    } catch (error) {
      console.error('Create center error:', error);
      throw new Error('O\'quv markazini yaratishda xatolik');
    }
  }

  /**
   * Invite code orqali centerni topish
   */
  async getByInviteCode(inviteCode: string): Promise<Center | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('inviteCode', '==', inviteCode.toUpperCase())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Center;
    } catch (error) {
      console.error('Get by invite code error:', error);
      return null;
    }
  }

  /**
   * Oddiy center yaratish (register uchun)
   */
  async createBasic(data: {
    name: string;
    phone: string;
    address: string;
    email: string;
    ownerId: string;
  }): Promise<string> {
    try {
      const inviteCode = this.generateInviteCode();

      const centerData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        email: data.email,
        logo: '',
        status: 'active' as const,
        ownerId: data.ownerId,
        inviteCode: inviteCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const centerRef = await addDoc(
        collection(db, this.collectionName),
        centerData
      );

      return centerRef.id;
    } catch (error) {
      console.error('Create basic center error:', error);
      throw new Error('Markazni yaratishda xatolik');
    }
  }

  /**
   * User'ning centerID'sini yangilash
   */
  async updateUserCenterId(userId: string, centerId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        centerId: centerId,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update user centerId error:', error);
      throw new Error('CenterId yangilashda xatolik');
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
  async updateStatus(centerId: string, status: 'active' | 'inactive'): Promise<void> {
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
      const studentsQuery = query(
        collection(db, 'students'),
        where('centerId', '==', centerId)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      let totalDebt = 0;
      studentsSnapshot.forEach((doc) => {
        totalDebt += doc.data().totalDebt || 0;
      });

      const groupsQuery = query(
        collection(db, 'groups'),
        where('centerId', '==', centerId),
        where('status', '==', 'active')
      );
      const groupsSnapshot = await getDocs(groupsQuery);

      const teachersQuery = query(
        collection(db, 'teachers'),
        where('centerId', '==', centerId),
        where('status', '==', 'active')
      );
      const teachersSnapshot = await getDocs(teachersQuery);

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
