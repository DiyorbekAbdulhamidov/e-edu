import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
  onSnapshot,
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

      // TUZATILDI: Faqat centerId va groupId bo'yicha qidiramiz
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('groupId', '==', groupId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      // Client-side filter (studentId va date)
      const filtered = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        const docDate = data.date?.toDate();
        return (
          data.studentId === studentId &&
          docDate &&
          docDate >= dateStart.toDate() &&
          docDate <= dateEnd.toDate()
        );
      });

      if (filtered.length === 0) {
        return null;
      }

      const firstDoc = filtered[0];
      return { id: firstDoc.id, ...firstDoc.data() } as Attendance;
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

      // TUZATILDI: Faqat centerId va groupId
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('groupId', '==', groupId)
      );

      const querySnapshot = await getDocs(q);
      const attendance: Attendance[] = [];

      // Client-side filter by date
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const docDate = data.date?.toDate();

        if (
          docDate &&
          docDate >= dateStart.toDate() &&
          docDate <= dateEnd.toDate()
        ) {
          attendance.push({ id: doc.id, ...data } as Attendance);
        }
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
      // TUZATILDI: Faqat centerId va studentId, orderBy olib tashlandi
      const q = query(
        collection(db, this.collectionName),
        where('centerId', '==', centerId),
        where('studentId', '==', studentId)
      );

      const querySnapshot = await getDocs(q);
      let attendance: Attendance[] = [];

      querySnapshot.forEach((doc) => {
        attendance.push({ id: doc.id, ...doc.data() } as Attendance);
      });

      // Client-side filter by date range
      if (startDate) {
        attendance = attendance.filter(
          (a) => a.date?.toDate() >= startDate
        );
      }

      if (endDate) {
        attendance = attendance.filter(
          (a) => a.date?.toDate() <= endDate
        );
      }

      // Client-side sorting
      attendance.sort((a, b) => {
        const dateA = a.date?.toDate()?.getTime() || 0;
        const dateB = b.date?.toDate()?.getTime() || 0;
        return dateB - dateA; // desc order
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

    // TUZATILDI: Faqat centerId va groupId
    const q = query(
      collection(db, this.collectionName),
      where('centerId', '==', centerId),
      where('groupId', '==', groupId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const attendance: Attendance[] = [];

        // Client-side date filtering
        snapshot.forEach((doc) => {
          const data = doc.data();
          const docDate = data.date?.toDate();

          if (
            docDate &&
            docDate >= dateStart.toDate() &&
            docDate <= dateEnd.toDate()
          ) {
            attendance.push({ id: doc.id, ...data } as Attendance);
          }
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
