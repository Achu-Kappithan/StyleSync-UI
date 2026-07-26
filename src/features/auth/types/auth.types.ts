export type AuthTab = 'login' | 'signup';

// ─── Form Data ─────────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignupFormData extends LoginFormData {
  name: string;
  phone: string;
  confirm: string;
  salonName?: string;
}

// ─── Validation ────────────────────────────────────────────────────────────────

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  confirm?: string;
  salonName?: string;
  server?: string;
}

// ─── User Profile ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: UserProfile;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    requiresVerification: boolean;
    email: string;
  };
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

// ─── Session Storage ───────────────────────────────────────────────────────────

export interface StoredSession {
  token: string;
  user: UserProfile;
}
