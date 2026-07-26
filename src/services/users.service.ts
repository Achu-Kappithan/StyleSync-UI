import { fetchApi } from './api';
import {
  UserMember,
  UserRole,
  CreateUserPayload,
} from '../features/users/types/user.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getUsers(): Promise<UserMember[]> {
  const res = await fetchApi<ApiResponse<UserMember[]>>('/users', {
    method: 'GET',
  });
  return res.data;
}

export async function getRoles(): Promise<UserRole[]> {
  const res = await fetchApi<ApiResponse<UserRole[]>>('/users/roles', {
    method: 'GET',
  });
  return res.data;
}

export async function createUser(payload: CreateUserPayload): Promise<UserMember> {
  const res = await fetchApi<ApiResponse<UserMember>>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateUserStatus(
  userId: string,
  status: 'active' | 'inactive',
): Promise<UserMember> {
  const res = await fetchApi<ApiResponse<UserMember>>(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.data;
}
