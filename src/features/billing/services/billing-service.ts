import { fetchApi } from '../../../services/api';
import {
  Bill,
  CreateBillPayload,
  BillQueryParams,
  PaginatedBillsResponse,
} from '../types/billing.types';

export const billingService = {
  async fetchBills(params: BillQueryParams = {}): Promise<PaginatedBillsResponse> {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const res = await fetchApi<any>(`/bills?${query.toString()}`);
    return res?.data || res;
  },

  async getBillById(id: string): Promise<Bill> {
    const res = await fetchApi<any>(`/bills/${id}`);
    return res?.data || res;
  },

  async createBill(payload: CreateBillPayload): Promise<Bill> {
    const res = await fetchApi<any>('/bills', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  },

  async createDraft(payload: CreateBillPayload): Promise<Bill> {
    const res = await fetchApi<any>('/bills/draft', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  },

  async refundBill(id: string, reason: string): Promise<Bill> {
    const res = await fetchApi<any>(`/bills/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return res?.data || res;
  },

  async voidBill(id: string, reason: string): Promise<Bill> {
    const res = await fetchApi<any>(`/bills/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return res?.data || res;
  },
};
