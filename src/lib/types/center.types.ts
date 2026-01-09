import { BaseEntity, Status } from './common.types';

export interface Center extends BaseEntity {
  name: string;
  phone: string;
  address: string;
  email: string;
  logo: string;
  status: Status;
  ownerId: string;
}

export interface CreateCenterData {
  name: string;
  phone: string;
  address: string;
  email: string;
  ownerId: string;
}

export interface UpdateCenterData {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
  logo?: string;
  status?: Status;
}