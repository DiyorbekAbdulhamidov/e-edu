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
  onSnapshot,
  QueryConstraint,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Group,
  CreateGroupData,
  UpdateGroupData,
  GroupStats,
  PaginationParams,
  FilterParams,
} from '@/lib/types';

class GroupService {
  private collectionName = 'groups';

  /**
   * Guruh yaratish
   */
  async create(data: CreateGroupData, centerId: string, userId: string): Promise<string> {
    try {
      const groupData = {
        centerId,
        name: data.name,
        courseName: data.courseName,
        level: data.level,
        teacherId: data.teacherId,
        schedule: data.schedule,
        monthlyPrice: data.monthlyPrice,
        maxStudents: data.maxStudents,
        currentStudents: 0,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
        status: 'active' as const,
        room: data.room,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), groupData);
      return docRef.id;
    } catch (error) {
      console.error('Create group error:', error);
      throw new Error('Guruhni yaratishda xatolik yuz berdi');
    }
  }

  /**
   * Guruhni yangilash
   */
  async update(
    groupId: string,
    data: UpdateGroupData,
    centerId: string
  ): Promise<void> {
    try {
      const groupRef = doc(db, this.collectionName, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Guruh topilmadi');
      }

      if (groupDoc.data().centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate);
      }

      await updateDoc(groupRef, updateData);
    } catch (error) {
      console.error('Update group error:', error);
      throw new Error('Guruhni yangilashda xatolik yuz berdi');
    }
  }

  /**
   * Guruhni o'chirish
   */
  async delete(groupId: string, centerId: string): Promise<void> {
    try {
      const groupRef = doc(db, this.collectionName, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Guruh topilmadi');
      }

      if (groupDoc.data().centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      const group = groupDoc.data() as Group;
      if (group.currentStudents > 0) {
        throw new Error('Guruhda talabalar bor');
      }

      await deleteDoc(groupRef);
    } catch (error) {
      console.error('Delete group error:', error);
      throw error;
    }
  }

  /**
   * Bitta guruhni olish
   */
  async getById(groupId: string, centerId: string): Promise<Group | null> {
    try {
      const groupDoc = await getDoc(doc(db, this.collectionName, groupId));

      if (!groupDoc.exists()) {
        return null;
      }

      const group = { id: groupDoc.id, ...groupDoc.data() } as Group;

      if (group.centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      return group;
    } catch (error) {
      console.error('Get group error:', error);
      throw error;
    }
  }

  /**
   * Guruhlar ro'yxatini olish
   */
  async list(
    centerId: string,
    filters?: FilterParams,
    pagination?: PaginationParams
  ): Promise<{ groups: Group[]; hasMore: boolean }> {
    try {
      const constraints: QueryConstraint[] = [
        where('centerId', '==', centerId),
        orderBy('createdAt', 'desc'),
      ];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (pagination?.limit) {
        constraints.push(limit(pagination.limit));
      }

      if (pagination?.lastDoc) {
        constraints.push(startAfter(pagination.lastDoc));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      const groups: Group[] = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() } as Group);
      });

      // Search filter (client-side)
      let filteredGroups = groups;
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredGroups = groups.filter(
          (group) =>
            group.name.toLowerCase().includes(searchLower) ||
            group.courseName.toLowerCase().includes(searchLower)
        );
      }

      const hasMore = pagination?.limit
        ? groups.length === pagination.limit
        : false;

      return { groups: filteredGroups, hasMore };
    } catch (error) {
      console.error('List groups error:', error);
      throw new Error('Guruhlar ro\'yxatini olishda xatolik');
    }
  }

  /**
   * Real-time listener
   */
  subscribe(
    centerId: string,
    callback: (groups: Group[]) => void,
    filters?: FilterParams
  ): () => void {
    const constraints: QueryConstraint[] = [
      where('centerId', '==', centerId),
      orderBy('createdAt', 'desc'),
    ];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    const q = query(collection(db, this.collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groups: Group[] = [];
        snapshot.forEach((doc) => {
          groups.push({ id: doc.id, ...doc.data() } as Group);
        });

        // Client-side search
        let filteredGroups = groups;
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredGroups = groups.filter(
            (group) =>
              group.name.toLowerCase().includes(searchLower) ||
              group.courseName.toLowerCase().includes(searchLower)
          );
        }

        callback(filteredGroups);
      },
      (error) => {
        console.error('Group subscription error:', error);
      }
    );

    return unsubscribe;
  }

  /**
   * Guruh statistikasi
   */
  async getStats(centerId: string): Promise<GroupStats> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId)
      );

      const querySnapshot = await getDocs(q);

      let activeGroups = 0;
      let totalStudents = 0;

      querySnapshot.forEach((doc) => {
        const group = doc.data() as Group;
        if (group.status === 'active') {
          activeGroups++;
        }
        totalStudents += group.currentStudents || 0;
      });

      const averageStudentsPerGroup =
        querySnapshot.size > 0 ? totalStudents / querySnapshot.size : 0;

      return {
        totalGroups: querySnapshot.size,
        activeGroups,
        totalStudents,
        averageStudentsPerGroup: Math.round(averageStudentsPerGroup * 10) / 10,
      };
    } catch (error) {
      console.error('Get group stats error:', error);
      throw new Error('Statistikani olishda xatolik');
    }
  }

  /**
   * Guruhga talaba qo'shish (student count oshirish)
   */
  async incrementStudentCount(groupId: string, centerId: string): Promise<void> {
    try {
      const groupRef = doc(db, this.collectionName, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Guruh topilmadi');
      }

      const group = groupDoc.data() as Group;

      if (group.centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      if (group.currentStudents >= group.maxStudents) {
        throw new Error('Guruh to\'lgan');
      }

      await updateDoc(groupRef, {
        currentStudents: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Increment student count error:', error);
      throw error;
    }
  }

  /**
   * Guruhdan talaba o'chirish (student count kamaytirish)
   */
  async decrementStudentCount(groupId: string, centerId: string): Promise<void> {
    try {
      const groupRef = doc(db, this.collectionName, groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error('Guruh topilmadi');
      }

      const group = groupDoc.data() as Group;

      if (group.centerId !== centerId) {
        throw new Error('Ruxsat yo\'q');
      }

      await updateDoc(groupRef, {
        currentStudents: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Decrement student count error:', error);
      throw error;
    }
  }

  /**
   * O'qituvchining guruhlarini olish
   */
  async getByTeacherId(teacherId: string, centerId: string): Promise<Group[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('teacherId', '==', teacherId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      const groups: Group[] = [];

      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() } as Group);
      });

      return groups;
    } catch (error) {
      console.error('Get teacher groups error:', error);
      throw new Error('O\'qituvchi guruhlarini olishda xatolik');
    }
  }
}

export const groupService = new GroupService();