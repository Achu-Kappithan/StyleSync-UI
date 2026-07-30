export type BillStatus = 'DRAFT' | 'PAID' | 'REFUNDED' | 'VOIDED';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
}

export interface BillLineItem {
  serviceId: string;
  name: string;
  priceInclusive: number;
  baseRate: number;
  gstRate: number;
  gstAmount: number;
  quantity: number;
  subtotal: number;
}

export interface Bill {
  id: string;
  _id: string;
  salonId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  employeeId?: string;
  employeeName?: string;
  items: BillLineItem[];
  subtotalBase: number;
  taxTotal: number;
  discountAmount: number;
  grandTotal: number;
  payments: PaymentEntry[];
  status: BillStatus;
  notes?: string;
  refundReason?: string;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  serviceId: string;
  name: string;
  priceInclusive: number;
  gstRate: number;
  quantity: number;
}

export interface CreateBillPayload {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  employeeId?: string;
  items: { serviceId: string; quantity: number }[];
  discountAmount?: number;
  payments: PaymentEntry[];
  notes?: string;
}

export interface BillQueryParams {
  date?: string;
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  status?: BillStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBillsResponse {
  items: Bill[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
