import { BaseEntity, UserRole, Status } from './common.types';

export interface User extends BaseEntity {
  email: string;
  displayName: string;
  role: UserRole;
  centerId: string | null;
  phone: string;
  avatar: string;
  status: Status;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  centerId: string | null;
  phone: string;
  avatar: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  centerId: string | null;
  phone: string;
}

export interface UpdateUserData {
  displayName?: string;
  phone?: string;
  avatar?: string;
  status?: Status;
}