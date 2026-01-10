// src/app/api/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, phone, role, centerId } = body;

    // Validation
    if (!email || !password || !displayName || !role || !centerId) {
      return NextResponse.json(
        { error: 'Barcha maydonlar to\'ldirilishi shart' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' },
        { status: 400 }
      );
    }

    // Firebase REST API orqali user yaratish
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || 'User yaratishda xatolik';

      // Error code'larni o'zbek tiliga tarjima qilish
      const errorMessages: Record<string, string> = {
        'EMAIL_EXISTS': 'Bu email allaqachon ro\'yxatdan o\'tgan',
        'INVALID_EMAIL': 'Email noto\'g\'ri formatda',
        'WEAK_PASSWORD': 'Parol juda zaif',
      };

      return NextResponse.json(
        { error: errorMessages[errorMessage] || errorMessage },
        { status: 400 }
      );
    }

    const userId = data.localId;

    // Firestore'da user document yaratish
    await setDoc(doc(db, 'users', userId), {
      email,
      displayName,
      role,
      centerId,
      phone: phone || '',
      avatar: '',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      userId
    });

  } catch (error: any) {
    console.error('Create user API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}