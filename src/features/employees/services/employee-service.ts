import { fetchApi } from '../../../services/api';
import {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeFilterParams,
  PaginatedEmployeesResponse,
  MonthlyAttendanceData,
  LeaveRequest,
  PerformanceSummary,
  AttendanceRecord,
} from '../types/employee.types';

export const employeeService = {
  async getEmployees(params: EmployeeFilterParams = {}): Promise<PaginatedEmployeesResponse> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);
    if (params.skill) query.append('skill', params.skill);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const res = await fetchApi<any>(
      `/employees?${query.toString()}`,
    );
    return res?.data || res;
  },

  async createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
    const res = await fetchApi<{ success: boolean; data: Employee }>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const res = await fetchApi<{ success: boolean; data: Employee }>(`/employees/${id}`);
    return res.data;
  },

  async updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<Employee> {
    const res = await fetchApi<{ success: boolean; data: Employee }>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async markAttendance(
    id: string,
    payload: { date: string; status: string; checkInTime?: string; checkOutTime?: string; notes?: string },
  ): Promise<AttendanceRecord> {
    const res = await fetchApi<{ success: boolean; data: AttendanceRecord }>(
      `/employees/${id}/attendance`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return res.data;
  },

  async getMonthlyAttendance(id: string, month?: string): Promise<MonthlyAttendanceData> {
    const query = month ? `?month=${month}` : '';
    const res = await fetchApi<{ success: boolean; data: MonthlyAttendanceData }>(
      `/employees/${id}/attendance${query}`,
    );
    return res.data;
  },

  async getDailyAttendanceGrid(date?: string): Promise<{ date: string; grid: any[] }> {
    const query = date ? `?date=${date}` : '';
    const res = await fetchApi<{ success: boolean; data: { date: string; grid: any[] } }>(
      `/employees/attendance/daily${query}`,
    );
    return res.data;
  },

  async createLeaveRequest(
    id: string,
    payload: { startDate: string; endDate: string; leaveType: string; reason: string },
  ): Promise<LeaveRequest> {
    const res = await fetchApi<{ success: boolean; data: LeaveRequest }>(
      `/employees/${id}/leave-requests`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return res.data;
  },

  async getLeaveRequests(id: string): Promise<LeaveRequest[]> {
    const res = await fetchApi<{ success: boolean; data: LeaveRequest[] }>(
      `/employees/${id}/leave-requests`,
    );
    return res.data;
  },

  async updateLeaveStatus(
    leaveId: string,
    payload: { status: 'APPROVED' | 'REJECTED'; actionReason?: string },
  ): Promise<LeaveRequest> {
    const res = await fetchApi<{ success: boolean; data: LeaveRequest }>(
      `/employees/leave-requests/${leaveId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
    return res.data;
  },

  async getPerformance(id: string, month?: string): Promise<PerformanceSummary> {
    const query = month ? `?month=${month}` : '';
    const res = await fetchApi<{ success: boolean; data: PerformanceSummary }>(
      `/employees/${id}/performance${query}`,
    );
    return res.data;
  },
};
