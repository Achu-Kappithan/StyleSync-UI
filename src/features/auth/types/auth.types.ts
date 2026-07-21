export type AuthTab = 'login' | 'signup';

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignupFormData extends LoginFormData {
  name: string;
  phone: string;
  confirm: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  confirm?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}
