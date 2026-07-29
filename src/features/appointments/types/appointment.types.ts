export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type BookingType = 'ADVANCE' | 'WALK_IN';

export interface ServiceSnapshot {
  serviceId: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Appointment {
  id: string;
  salonId: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  employeeId: string | null;
  employeeName: string;
  serviceSnapshots: ServiceSnapshot[];
  totalDurationMinutes: number;
  totalAmount: number;
  scheduledAt: string; // ISO datetime
  endsAt: string;      // ISO datetime
  bookingType: BookingType;
  status: AppointmentStatus;
  queueToken: string | null;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface AppointmentListResponse {
  items: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: AppointmentStats;
}

export interface CreateAppointmentPayload {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  employeeId?: string;
  serviceIds: string[];
  scheduledAt: string; // ISO 8601
  bookingType?: BookingType;
  notes?: string;
}

export interface UpdateAppointmentPayload {
  employeeId?: string;
  serviceIds?: string[];
  scheduledAt?: string;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface AppointmentQueryParams {
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: AppointmentStatus;
  employeeId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}
