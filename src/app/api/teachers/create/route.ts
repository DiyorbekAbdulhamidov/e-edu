// src/app/api/teachers/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      centerId,
      subjects,
      salaryType,
      salaryAmount,
      hireDate,
      qualification,
      bio,
    } = body;

    // Validation
    if (!userId || !centerId || !subjects || !salaryType || !salaryAmount) {
      return NextResponse.json(
        { error: 'Barcha majburiy maydonlar to\'ldirilishi shart' },
        { status: 400 }
      );
    }

    // Teacher document yaratish
    await setDoc(doc(db, 'teachers', userId), {
      centerId,
      subjects,
      salaryType,
      salaryAmount,
      hireDate: hireDate ? Timestamp.fromDate(new Date(hireDate)) : serverTimestamp(),
      qualification: qualification || '',
      bio: bio || '',
      groups: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      teacherId: userId,
    });
  } catch (error: any) {
    console.error('Create teacher API error:', error);
    return NextResponse.json(
      { error: error.message || 'Teacher yaratishda xatolik' },
      { status: 500 }
    );
  }
}