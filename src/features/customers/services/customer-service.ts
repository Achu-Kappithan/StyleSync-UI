import { fetchApi } from '../../../services/api';
import {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerFilterParams,
  PaginatedCustomersResponse,
  CustomerNote,
  CustomerHistoryItem,
  CustomerImageItem,
} from '../types/customer.types';

export const customerService = {
  async getCustomers(params: CustomerFilterParams = {}): Promise<PaginatedCustomersResponse> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.tag) query.append('tag', params.tag);
    if (params.lastVisitRange) query.append('lastVisitRange', params.lastVisitRange);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const res = await fetchApi<{ success: boolean; data: PaginatedCustomersResponse }>(
      `/customers?${query.toString()}`,
    );
    return res.data;
  },

  async checkDuplicate(phone: string): Promise<{ isDuplicate: boolean; existingCustomer: Customer | null }> {
    const res = await fetchApi<{
      success: boolean;
      data: { isDuplicate: boolean; existingCustomer: Customer | null };
    }>(`/customers/duplicates?phone=${encodeURIComponent(phone)}`);
    return res.data;
  },

  async createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    const res = await fetchApi<{ success: boolean; data: Customer }>('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async getCustomerById(id: string): Promise<Customer> {
    const res = await fetchApi<{ success: boolean; data: Customer }>(`/customers/${id}`);
    return res.data;
  },

  async updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
    const res = await fetchApi<{ success: boolean; data: Customer }>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await fetchApi(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  async getCustomerHistory(id: string): Promise<CustomerHistoryItem[]> {
    const res = await fetchApi<{ success: boolean; data: CustomerHistoryItem[] }>(
      `/customers/${id}/history`,
    );
    return res.data;
  },

  async getCustomerNotes(id: string): Promise<CustomerNote[]> {
    const res = await fetchApi<{ success: boolean; data: CustomerNote[] }>(
      `/customers/${id}/notes`,
    );
    return res.data;
  },

  async addCustomerNote(
    id: string,
    payload: { note: string; isMedical?: boolean },
  ): Promise<CustomerNote> {
    const res = await fetchApi<{ success: boolean; data: CustomerNote }>(`/customers/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async getCustomerLoyalty(id: string) {
    const res = await fetchApi<{ success: boolean; data: any }>(`/customers/${id}/loyalty`);
    return res.data;
  },

  async getCustomerImages(id: string): Promise<CustomerImageItem[]> {
    const res = await fetchApi<{ success: boolean; data: CustomerImageItem[] }>(
      `/customers/${id}/images`,
    );
    return res.data;
  },

  async addCustomerImage(
    id: string,
    payload: { imageUrl: string; caption?: string },
  ): Promise<CustomerImageItem> {
    const res = await fetchApi<{ success: boolean; data: CustomerImageItem }>(
      `/customers/${id}/images`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return res.data;
  },
};
