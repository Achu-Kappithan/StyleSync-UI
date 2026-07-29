import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointment-service';
import {
  Appointment,
  AppointmentListResponse,
  AppointmentQueryParams,
  AppointmentStatus,
  AppointmentStats,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '../types/appointment.types';

const todayStr = () => new Date().toISOString().split('T')[0];

export type AppointmentViewMode = 'list' | 'timeline';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0, pending: 0, confirmed: 0, inProgress: 0,
    completed: 0, cancelled: 0, noShow: 0,
  });
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [viewMode, setViewMode] = useState<AppointmentViewMode>('list');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await appointmentService.getAppointments({ date, limit: 100 });
      setAppointments(result.items);
      setStats(result.stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selectedDate);
  }, [load, selectedDate]);

  const refetch = useCallback(() => load(selectedDate), [load, selectedDate]);

  // ─── Date Navigation ──────────────────────────────────────────────────────

  const goToPrevDay = useCallback(() => {
    setSelectedDate((d) => {
      const date = new Date(d);
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0];
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate((d) => {
      const date = new Date(d);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    });
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(todayStr());
  }, []);

  // ─── CRUD Actions ─────────────────────────────────────────────────────────

  const bookAppointment = useCallback(
    async (payload: CreateAppointmentPayload): Promise<Appointment> => {
      const newAppt = await appointmentService.create(payload);
      // Refresh if the booking is on the selected date
      const apptDate = newAppt.scheduledAt.split('T')[0];
      if (apptDate === selectedDate) {
        await load(selectedDate);
      }
      return newAppt;
    },
    [selectedDate, load],
  );

  const updateAppointment = useCallback(
    async (id: string, payload: UpdateAppointmentPayload): Promise<Appointment> => {
      const updated = await appointmentService.update(id, payload);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const advanceStatus = useCallback(
    async (id: string, status: AppointmentStatus, reason?: string): Promise<void> => {
      const updated = await appointmentService.updateStatus(id, status, reason);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      // Update stats optimistically then refetch
      await load(selectedDate);
    },
    [selectedDate, load],
  );

  const cancelAppointment = useCallback(
    async (id: string, reason?: string): Promise<void> => {
      await appointmentService.cancel(id, reason);
      await load(selectedDate);
    },
    [selectedDate, load],
  );

  return {
    appointments,
    stats,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    goToPrevDay,
    goToNextDay,
    goToToday,
    bookAppointment,
    updateAppointment,
    advanceStatus,
    cancelAppointment,
    refetch,
  };
}
