export interface Customer {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  email?: string | null;
  gender?: string | null;
  dob?: string | null;
  anniversary?: string | null;
  gstin?: string | null;
  preferredStylistId?: string | null;
  preferredStylistName?: string | null;
  referralSource?: string | null;
  medicalNotes?: string | null;
  tags: string[];
  lifetimeValue: number;
  lastVisitDate?: string | null;
  loyaltyPoints: number;
  totalVisits: number;
  householdNote?: string | null;
  status: string;
  isAnonymized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerNote {
  _id: string;
  customerId: string;
  authorName: string;
  note: string;
  isMedical: boolean;
  createdAt: string;
}

export interface CustomerHistoryItem {
  id: string;
  customerId: string;
  eventType: 'BILL' | 'APPOINTMENT' | 'NOTE' | 'LOYALTY_ADJUSTMENT' | 'PACKAGE';
  title: string;
  description?: string | null;
  amount?: number | null;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CustomerImageItem {
  _id: string;
  customerId: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  dob?: string;
  anniversary?: string;
  gstin?: string;
  preferredStylistId?: string;
  preferredStylistName?: string;
  referralSource?: string;
  medicalNotes?: string;
  tags?: string[];
  householdNote?: string;
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {}

export interface CustomerFilterParams {
  search?: string;
  tag?: string;
  lastVisitRange?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCustomersResponse {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
