import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { CreateUserData, LoginCredentials, AuthUser } from '@/lib/types';

class AuthService {
  /* ================= REGISTER (Self Registration) ================= */
  async register(data: CreateUserData): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: data.displayName,
      });

      await setDoc(doc(db, 'users', user.uid), {
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        centerId: data.centerId,
        phone: data.phone || '',
        avatar: '',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        uid: user.uid,
        email: user.email!,
        displayName: data.displayName,
        role: data.role,
        centerId: data.centerId,
      };
    } catch (error: any) {
      console.error('Registration error:', error);

      const message = error.code
        ? this.getErrorMessage(error.code)
        : error.message || 'Ro\'yxatdan o\'tishda xatolik';

      throw new Error(message);
    }
  }

  /* ================= CREATE USER (Admin creates user via API) ================= */
  async createUser(data: CreateUserData): Promise<string> {
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Foydalanuvchi yaratishda xatolik');
      }

      return result.userId;
    } catch (error: any) {
      console.error('Create user error:', error);
      throw new Error(error.message || 'Foydalanuvchi yaratishda xatolik');
    }
  }

  /* ================= LOGIN ================= */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        await this.logout();
        throw new Error('Foydalanuvchi profili topilmadi');
      }

      const userData = userDoc.data();

      if (userData.status !== 'active') {
        await this.logout();
        throw new Error('Hisobingiz bloklangan');
      }

      return {
        uid: user.uid,
        email: user.email!,
        displayName: userData.displayName,
        role: userData.role,
        centerId: userData.centerId,
      };
    } catch (error: any) {
      console.error('Login error:', error);

      const message = error.code
        ? this.getErrorMessage(error.code)
        : error.message || 'Kirishda xatolik';

      throw new Error(message);
    }
  }

  /* ================= LOGOUT ================= */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /* ================= RESET PASSWORD ================= */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);

      const message = error.code
        ? this.getErrorMessage(error.code)
        : 'Parolni tiklashda xatolik';

      throw new Error(message);
    }
  }

  /* ================= CHANGE PASSWORD ================= */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;

      if (!user || !user.email) {
        throw new Error('Foydalanuvchi topilmadi');
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Change password error:', error);

      const message = error.code
        ? this.getErrorMessage(error.code)
        : error.message || 'Parolni o\'zgartirishda xatolik';

      throw new Error(message);
    }
  }

  /* ================= CURRENT USER ================= */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();

      return {
        uid: user.uid,
        email: user.email!,
        displayName: userData.displayName,
        role: userData.role,
        centerId: userData.centerId,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /* ================= UPDATE PROFILE ================= */
  async updateUserProfile(
    userId: string,
    data: {
      displayName?: string;
      phone?: string;
      avatar?: string;
    }
  ): Promise<void> {
    try {
      const user = auth.currentUser;

      // Only update Firebase Auth profile if it's the current user
      if (user && user.uid === userId && data.displayName) {
        await updateProfile(user, {
          displayName: data.displayName,
        });
      }

      // Always update Firestore
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Profilni yangilashda xatolik');
    }
  }

  /* ================= ERROR MAPPER ================= */
  private getErrorMessage(code: string): string {
    const errors: Record<string, string> = {
      'auth/email-already-in-use': 'Bu email allaqachon ro\'yxatdan o\'tgan',
      'auth/invalid-email': 'Email noto\'g\'ri formatda',
      'auth/weak-password': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
      'auth/user-disabled': 'Bu foydalanuvchi bloklangan',
      'auth/user-not-found': 'Foydalanuvchi topilmadi',
      'auth/wrong-password': 'Email yoki parol noto\'g\'ri',
      'auth/too-many-requests': 'Juda ko\'p urinish. Keyinroq urinib ko\'ring',
      'auth/network-request-failed': 'Internet aloqasi yo\'q',
      'auth/invalid-credential': 'Email yoki parol noto\'g\'ri',
    };

    return errors[code] || 'Noma\'lum xatolik yuz berdi';
  }
}

export const authService = new AuthService();