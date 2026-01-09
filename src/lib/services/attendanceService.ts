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
  Timestamp,
  serverTimestamp,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Attendance,
  MarkAttendanceData,
  AttendanceStats,
} from '@/lib/types';

class AttendanceService {
  private collectionName = 'attendance';

  /**
   * Davomatni belgilash
   */
  async mark(
    data: MarkAttendanceData,
    centerId: string,
    teacherId: string
  ): Promise<string> {
    try {
      // Duplicate check
      const existingAttendance = await this.findExisting(
        centerId,
        data.groupId,
        data.studentId,
        data.date
      );

      if (existingAttendance) {
        // Update existing
        await this.update(existingAttendance.id, data.status, data.notes);
        return existingAttendance.id;
      }

      // Create new
      const attendanceData = {
        centerId,
        groupId: data.groupId,
        studentId: data.studentId,
        teacherId,
        date: Timestamp.fromDate(new Date(data.date.setHours(0, 0, 0, 0))),
        status: data.status,
        notes: data.notes || '',
        markedBy: teacherId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        attendanceData
      );
      return docRef.id;
    } catch (error) {
      console.error('Mark attendance error:', error);
      throw new Error('Davomatni belgilashda xatolik yuz berdi');
    }
  }

  /**
   * Mavjud davomatni topish
   */
  private async findExisting(
    centerId: string,
    groupId: string,
    studentId: string,
    date: Date
  ): Promise<Attendance | null> {
    try {
      const dateStart = Timestamp.fromDate(new Date(date.setHours(0, 0, 0, 0)));
      const dateEnd = Timestamp.fromDate(new Date(date.setHours(23, 59, 59, 999)));

      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('groupId', '==', groupId),
        where('studentId', '==', studentId),
        where('date', '>=', dateStart),
        where('date', '<=', dateEnd)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Attendance;
    } catch (error) {
      console.error('Find existing attendance error:', error);
      return null;
    }
  }

  /**
   * Davomatni yangilash
   */
  async update(
    attendanceId: string,
    status: string,
    notes?: string
  ): Promise<void> {
    try {
      const attendanceRef = doc(db, this.collectionName, attendanceId);
      await updateDoc(attendanceRef, {
        status,
        notes: notes || '',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update attendance error:', error);
      throw new Error('Davomatni yangilashda xatolik');
    }
  }

  /**
   * Guruh uchun kunlik davomat
   */
  async getByGroupAndDate(
    groupId: string,
    date: Date,
    centerId: string
  ): Promise<Attendance[]> {
    try {
      const dateStart = Timestamp.fromDate(new Date(date.setHours(0, 0, 0, 0)));
      const dateEnd = Timestamp.fromDate(new Date(date.setHours(23, 59, 59, 999)));

      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('groupId', '==', groupId),
        where('date', '>=', dateStart),
        where('date', '<=', dateEnd)
      );

      const querySnapshot = await getDocs(q);
      const attendance: Attendance[] = [];

      querySnapshot.forEach((doc) => {
        attendance.push({ id: doc.id, ...doc.data() } as Attendance);
      });

      return attendance;
    } catch (error) {
      console.error('Get attendance by group error:', error);
      throw new Error('Davomatni olishda xatolik');
    }
  }

  /**
   * Talaba uchun davomat tarixi
   */
  async getByStudent(
    studentId: string,
    centerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Attendance[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('centerId', '==', centerId),
        where('studentId', '==', studentId),
        orderBy('date', 'desc'),
      ];

      if (startDate) {
        constraints.push(
          where('date', '>=', Timestamp.fromDate(startDate))
        );
      }

      if (endDate) {
        constraints.push(
          where('date', '<=', Timestamp.fromDate(endDate))
        );
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      const attendance: Attendance[] = [];

      querySnapshot.forEach((doc) => {
        attendance.push({ id: doc.id, ...doc.data() } as Attendance);
      });

      return attendance;
    } catch (error) {
      console.error('Get student attendance error:', error);
      throw new Error('Talaba davomatini olishda xatolik');
    }
  }

  /**
   * Talaba statistikasi
   */
  async getStudentStats(
    studentId: string,
    centerId: string
  ): Promise<AttendanceStats> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('studentId', '==', studentId)
      );

      const querySnapshot = await getDocs(q);

      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;
      let excusedDays = 0;

      querySnapshot.forEach((doc) => {
        const attendance = doc.data() as Attendance;
        if (attendance.status === 'present') presentDays++;
        if (attendance.status === 'absent') absentDays++;
        if (attendance.status === 'late') lateDays++;
        if (attendance.status === 'excused') excusedDays++;
      });

      const totalDays = querySnapshot.size;
      const attendanceRate =
        totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
      };
    } catch (error) {
      console.error('Get student stats error:', error);
      throw new Error('Statistikani olishda xatolik');
    }
  }

  /**
   * Real-time listener guruh uchun
   */
  subscribeToGroup(
    groupId: string,
    date: Date,
    centerId: string,
    callback: (attendance: Attendance[]) => void
  ): () => void {
    const dateStart = Timestamp.fromDate(new Date(date.setHours(0, 0, 0, 0)));
    const dateEnd = Timestamp.fromDate(new Date(date.setHours(23, 59, 59, 999)));

    const q = query(
      collection(db, this.collectionName),
      where('centerId', '==', centerId),
      where('groupId', '==', groupId),
      where('date', '>=', dateStart),
      where('date', '<=', dateEnd)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const attendance: Attendance[] = [];
        snapshot.forEach((doc) => {
          attendance.push({ id: doc.id, ...doc.data() } as Attendance);
        });
        callback(attendance);
      },
      (error) => {
        console.error('Attendance subscription error:', error);
      }
    );

    return unsubscribe;
  }
}

export const attendanceService = new AttendanceService();