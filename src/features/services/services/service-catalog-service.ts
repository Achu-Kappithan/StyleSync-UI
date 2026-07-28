import { fetchApi } from '../../../services/api';
import {
  ServiceCategory,
  ServiceItem,
  CreateServicePayload,
  PackageItem,
  CreatePackagePayload,
  MembershipPlan,
  CreateMembershipPayload,
} from '../types/service.types';

export const serviceCatalogService = {
  // ─── CATEGORIES ───────────────────────────────────────────────────────────
  getCategories: async (): Promise<ServiceCategory[]> => {
    return fetchApi<ServiceCategory[]>('/service-categories');
  },

  createCategory: async (data: { name: string; subCategories?: string[] }): Promise<ServiceCategory> => {
    return fetchApi<ServiceCategory>('/service-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory: async (id: string, data: { name?: string; subCategories?: string[] }): Promise<ServiceCategory> => {
    return fetchApi<ServiceCategory>(`/service-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/service-categories/${id}`, {
      method: 'DELETE',
    });
  },

  // ─── SERVICES ─────────────────────────────────────────────────────────────
  getServices: async (categoryId?: string, search?: string): Promise<ServiceItem[]> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);

    return fetchApi<ServiceItem[]>(`/services?${params.toString()}`);
  },

  createService: async (payload: CreateServicePayload): Promise<ServiceItem> => {
    return fetchApi<ServiceItem>('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateService: async (id: string, payload: Partial<CreateServicePayload>): Promise<ServiceItem> => {
    return fetchApi<ServiceItem>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteService: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
  },

  // ─── PACKAGES ─────────────────────────────────────────────────────────────
  getPackages: async (): Promise<PackageItem[]> => {
    return fetchApi<PackageItem[]>('/packages');
  },

  createPackage: async (payload: CreatePackagePayload): Promise<PackageItem> => {
    return fetchApi<PackageItem>('/packages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updatePackage: async (id: string, payload: Partial<CreatePackagePayload>): Promise<PackageItem> => {
    return fetchApi<PackageItem>(`/packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deletePackage: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/packages/${id}`, {
      method: 'DELETE',
    });
  },

  // ─── MEMBERSHIPS ──────────────────────────────────────────────────────────
  getMemberships: async (): Promise<MembershipPlan[]> => {
    return fetchApi<MembershipPlan[]>('/memberships');
  },

  createMembership: async (payload: CreateMembershipPayload): Promise<MembershipPlan> => {
    return fetchApi<MembershipPlan>('/memberships', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateMembership: async (id: string, payload: Partial<CreateMembershipPayload>): Promise<MembershipPlan> => {
    return fetchApi<MembershipPlan>(`/memberships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteMembership: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchApi<{ success: boolean; message: string }>(`/memberships/${id}`, {
      method: 'DELETE',
    });
  },
};
