export interface WorkingHours {
  start: string;
  end: string;
  daysOfWeek: number[];
}

export interface Employee {
  id: string;
  salonId: string;
  userId?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  role: string;
  skills: string[];
  gender: string;
  workingHours: WorkingHours;
  status: 'active' | 'inactive' | 'on_leave';
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'WEEK_OFF';
  checkInTime?: string | null;
  checkOutTime?: string | null;
  notes?: string | null;
  markedBy?: string | null;
}

export interface PayrollSummary {
  totalRecordedDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysHalfDay: number;
  daysLeave: number;
  daysWeekOff: number;
  payrollEligibleDays: number;
}

export interface MonthlyAttendanceData {
  employeeId: string;
  month: string;
  payrollSummary: PayrollSummary;
  records: AttendanceRecord[];
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: 'CASUAL' | 'SICK' | 'PAID' | 'UNPAID';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  actionReason?: string | null;
  createdAt: string;
}

export interface PerformanceSummary {
  employeeId: string;
  month: string;
  rating: number;
  totalServicesCompleted: number;
  totalRevenueGenerated: number;
  avgServiceDurationMinutes: number;
  targetAchievementPct: number;
}

export interface CreateEmployeePayload {
  fullName: string;
  phone: string;
  gender: string;
  email?: string;
  role?: string;
  skills?: string[];
  workingHours?: WorkingHours;
  joiningDate?: string;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface EmployeeFilterParams {
  search?: string;
  role?: string;
  status?: string;
  skill?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedEmployeesResponse {
  items: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
