import { fetchApi } from '../../../services/api';
import {
  Appointment,
  AppointmentListResponse,
  AppointmentQueryParams,
  AppointmentStatus,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '../types/appointment.types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const appointmentService = {
  // ─── GET /appointments ────────────────────────────────────────────────────
  getAppointments: async (
    params: AppointmentQueryParams = {},
  ): Promise<AppointmentListResponse> => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);
    if (params.status) query.append('status', params.status);
    if (params.employeeId) query.append('employeeId', params.employeeId);
    if (params.customerId) query.append('customerId', params.customerId);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetchApi<ApiEnvelope<AppointmentListResponse>>(
      `/appointments?${query.toString()}`,
    );
    return res.data;
  },

  // ─── GET /appointments/:id ────────────────────────────────────────────────
  getById: async (id: string): Promise<Appointment> => {
    const res = await fetchApi<ApiEnvelope<Appointment>>(`/appointments/${id}`);
    return res.data;
  },

  // ─── POST /appointments ───────────────────────────────────────────────────
  create: async (payload: CreateAppointmentPayload): Promise<Appointment> => {
    const res = await fetchApi<ApiEnvelope<Appointment>>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // ─── PATCH /appointments/:id ──────────────────────────────────────────────
  update: async (id: string, payload: UpdateAppointmentPayload): Promise<Appointment> => {
    const res = await fetchApi<ApiEnvelope<Appointment>>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // ─── PATCH /appointments/:id/status ──────────────────────────────────────
  updateStatus: async (
    id: string,
    status: AppointmentStatus,
    reason?: string,
  ): Promise<Appointment> => {
    const res = await fetchApi<ApiEnvelope<Appointment>>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return res.data;
  },

  // ─── DELETE /appointments/:id ─────────────────────────────────────────────
  cancel: async (id: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return fetchApi<{ success: boolean; message: string }>(
      `/appointments/${id}${query}`,
      { method: 'DELETE' },
    );
  },
};
