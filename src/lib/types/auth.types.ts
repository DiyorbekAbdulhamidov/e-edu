import { UserRole } from './common.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phone: string;
  centerName?: string; // For CenterAdmin registration
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  centerId: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}