export interface UserMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
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
  email: string;
  phone: string;
  password: string;
  roleName: string;
}

export interface UserFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleName?: string;
  server?: string;
}
