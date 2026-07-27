export interface UserMember {
  id: string;
  fullName: string;
  phone: string;
  gender?: string;
  email?: string | null;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string | null;
}

export interface UserRole {
  id: string;
  roleName: string;
  description: string;
}

export interface CreateUserPayload {
  fullName: string;
  phone: string;
  gender: string;
  email?: string;
  password?: string;
  roleName?: string;
}

export interface UserFormErrors {
  fullName?: string;
  phone?: string;
  gender?: string;
  email?: string;
  password?: string;
  roleName?: string;
  server?: string;
}
