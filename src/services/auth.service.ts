import { fetchApi } from './api';
import {
  LoginResponse,
  RegisterResponse,
  VerifyEmailResponse,
  ResendOtpResponse,
  UserProfile,
} from '../features/auth/types/auth.types';

// ─── Request Types ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  salonName?: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

// ─── Service Functions ─────────────────────────────────────────────────────────

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  return fetchApi<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerSalon(payload: RegisterRequest): Promise<RegisterResponse> {
  return fetchApi<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  return fetchApi<VerifyEmailResponse>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resendOtp(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
  return fetchApi<ResendOtpResponse>('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<UserProfile> {
  return fetchApi<UserProfile>('/auth/me', {
    method: 'GET',
  });
}

export async function refreshTokens(): Promise<LoginResponse> {
  return fetchApi<LoginResponse>('/auth/refresh', {
    method: 'POST',
  });
}
