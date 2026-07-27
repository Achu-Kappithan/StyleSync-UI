import { useState, useCallback, useEffect } from 'react';
import { employeeService } from '../services/employee-service';
import {
  Employee,
  EmployeeFilterParams,
  PaginatedEmployeesResponse,
  MonthlyAttendanceData,
  LeaveRequest,
  PerformanceSummary,
} from '../types/employee.types';

export function useEmployees(initialParams: EmployeeFilterParams = {}) {
  const [params, setParams] = useState<EmployeeFilterParams>(initialParams);
  const [data, setData] = useState<PaginatedEmployeesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getEmployees(params);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    data,
    loading,
    error,
    params,
    setParams,
    refetch: fetchEmployees,
  };
}

export function useEmployeeProfile(employeeId: string | undefined) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendanceData, setAttendanceData] = useState<MonthlyAttendanceData | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError(null);
      const [empData, attData, leaveData, perfData] = await Promise.all([
        employeeService.getEmployeeById(employeeId),
        employeeService.getMonthlyAttendance(employeeId).catch(() => null),
        employeeService.getLeaveRequests(employeeId).catch(() => []),
        employeeService.getPerformance(employeeId).catch(() => null),
      ]);
      setEmployee(empData);
      setAttendanceData(attData);
      setLeaveRequests(leaveData);
      setPerformance(perfData);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const markAttendance = async (date: string, status: string, notes?: string) => {
    if (!employeeId) return;
    await employeeService.markAttendance(employeeId, { date, status, notes });
    const attData = await employeeService.getMonthlyAttendance(employeeId);
    setAttendanceData(attData);
  };

  const createLeave = async (startDate: string, endDate: string, leaveType: string, reason: string) => {
    if (!employeeId) return;
    const newLeave = await employeeService.createLeaveRequest(employeeId, {
      startDate,
      endDate,
      leaveType,
      reason,
    });
    setLeaveRequests((prev) => [newLeave, ...prev]);
  };

  const updateLeaveStatus = async (leaveId: string, status: 'APPROVED' | 'REJECTED', actionReason?: string) => {
    const updated = await employeeService.updateLeaveStatus(leaveId, { status, actionReason });
    setLeaveRequests((prev) => prev.map((l) => (l._id === leaveId ? updated : l)));
    // Refresh employee & attendance data if status changed
    if (employeeId) {
      const empData = await employeeService.getEmployeeById(employeeId);
      const attData = await employeeService.getMonthlyAttendance(employeeId);
      setEmployee(empData);
      setAttendanceData(attData);
    }
  };

  return {
    employee,
    attendanceData,
    leaveRequests,
    performance,
    loading,
    error,
    refetch: loadProfile,
    markAttendance,
    createLeave,
    updateLeaveStatus,
  };
}
