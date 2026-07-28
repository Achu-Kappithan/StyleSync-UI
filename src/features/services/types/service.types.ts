export interface ServiceCategory {
  _id: string;
  name: string;
  subCategories: string[];
  displayOrder: number;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  subCategory?: string | null;
  price: number;
  durationMinutes: number;
  gstRate: number;
  defaultReminderDays?: number | null;
  description?: string | null;
  isActive: boolean;
}

export interface CreateServicePayload {
  name: string;
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  price: number;
  durationMinutes: number;
  gstRate: number;
  defaultReminderDays?: number;
  description?: string;
}

export interface PackageServiceItem {
  serviceId: string;
  serviceName: string;
  sessionCount: number;
}

export interface PackageItem {
  _id: string;
  name: string;
  description?: string | null;
  serviceItems: PackageServiceItem[];
  totalPrice: number;
  validityDays: number;
  impliedDiscountPct: number;
  isActive: boolean;
}

export interface CreatePackagePayload {
  name: string;
  description?: string;
  serviceItems: PackageServiceItem[];
  totalPrice: number;
  validityDays?: number;
}

export interface CustomerPackageBalance {
  _id: string;
  packageName: string;
  serviceBalances: {
    serviceId: string;
    serviceName: string;
    sessionsTotal: number;
    sessionsRemaining: number;
  }[];
  purchaseDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED';
}

export interface MembershipPlan {
  _id: string;
  name: string;
  tierName: 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP';
  price: number;
  validityMonths: number;
  discountPercentage: number;
  includedServiceIds?: string[];
  description?: string | null;
  isActive: boolean;
}

export interface CreateMembershipPayload {
  name: string;
  tierName: 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP';
  price: number;
  validityMonths: number;
  discountPercentage: number;
  includedServiceIds?: string[];
  description?: string;
}

export interface CustomerMembershipSubscription {
  _id: string;
  planName: string;
  tierName: string;
  discountPercentage: number;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}
