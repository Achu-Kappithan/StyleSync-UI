import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployeeProfile } from '../hooks/use-employees';
import { AddEditEmployeeModal } from '../components/AddEditEmployeeModal';
import { MarkAttendanceModal } from '../components/MarkAttendanceModal';
import './StaffProfilePage.css';

type TabType = 'details' | 'attendance' | 'leave' | 'performance';

export const StaffProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    employee,
    attendanceData,
    leaveRequests,
    performance,
    loading,
    error,
    refetch,
    createLeave,
    updateLeaveStatus,
  } = useEmployeeProfile(id);

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);

  // New Leave Form State
  const [leaveStartDate, setLeaveStartDate] = useState<string>('');
  const [leaveEndDate, setLeaveEndDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>('CASUAL');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [submittingLeave, setSubmittingLeave] = useState<boolean>(false);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleCreateLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason.trim()) return;
    try {
      setSubmittingLeave(true);
      await createLeave(leaveStartDate, leaveEndDate, leaveType, leaveReason.trim());
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
      alert('Leave request submitted successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await updateLeaveStatus(leaveId, 'APPROVED', 'Manager approved');
      alert('Leave request approved');
    } catch (err: any) {
      alert(err.message || 'Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await updateLeaveStatus(leaveId, 'REJECTED', 'Denied due to roster demand');
      alert('Leave request rejected');
    } catch (err: any) {
      alert(err.message || 'Failed to reject leave');
    }
  };

  if (loading) {
    return (
      <div className="emp-360-loading">
        <div className="staff-spinner" />
        <span>Loading Employee 360° Profile...</span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="emp-360-error">
        <h3>Employee Profile Not Found</h3>
        <p>{error || 'The requested staff profile could not be loaded.'}</p>
        <button className="emp-btn emp-btn--secondary" onClick={() => navigate('/dashboard/staff')}>
          ← Back to Staff Directory
        </button>
      </div>
    );
  }

  const initials = employee.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const payrollSummary = attendanceData?.payrollSummary;

  return (
    <div className="emp-360-container">
      {/* NAVIGATION BAR */}
      <div className="emp-360-nav">
        <button className="emp-btn emp-btn--outline emp-btn--sm" onClick={() => navigate('/dashboard/staff')}>
          ← Back to Staff Directory
        </button>
        <div className="emp-360-actions">
          <button className="emp-btn emp-btn--secondary emp-btn--sm" onClick={() => setIsAttendanceModalOpen(true)}>
            🕒 Mark Daily Attendance
          </button>
          <button className="emp-btn emp-btn--outline emp-btn--sm" onClick={() => setIsEditModalOpen(true)}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* HEADER CARD */}
      <div className="emp-360-header">
        <div className="emp-360-profile-info">
          <div className="emp-360-avatar">{initials}</div>
          <div>
            <div className="emp-360-title-row">
              <h2>{employee.fullName}</h2>
              <span className="staff-role-badge">
                {employee.role ? employee.role.replace('_', ' ') : 'STYLIST'}
              </span>
              <span className={`staff-status-badge staff-status-badge--${employee.status}`}>
                {employee.status === 'active' ? 'Active' : employee.status === 'on_leave' ? 'On Leave' : 'Inactive'}
              </span>
            </div>
            <p className="emp-360-sub">
              📱 +91 {employee.phone} {employee.email ? `• ✉️ ${employee.email}` : ''}
            </p>
            <div className="emp-360-skills">
              {employee.skills?.map((s) => (
                <span key={s} className="staff-skill-chip">
                  ✂️ {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* COMPUTED STATS STRIP */}
        <div className="emp-360-stats">
          <div className="emp-stat-box">
            <span className="emp-stat-label">Days Present (This Month)</span>
            <span className="emp-stat-val emp-stat-val--green">{payrollSummary?.daysPresent || 0} Days</span>
          </div>
          <div className="emp-stat-box">
            <span className="emp-stat-label">Payroll Eligible Days</span>
            <span className="emp-stat-val">{payrollSummary?.payrollEligibleDays || 0} Days</span>
          </div>
          <div className="emp-stat-box">
            <span className="emp-stat-label">Services Completed</span>
            <span className="emp-stat-val">{performance?.totalServicesCompleted || 0}</span>
          </div>
          <div className="emp-stat-box">
            <span className="emp-stat-label">Avg Rating</span>
            <span className="emp-stat-val emp-stat-val--gold">⭐ {performance?.rating || 4.8}</span>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="emp-tabs">
        <button className={`emp-tab ${activeTab === 'details' ? 'emp-tab--active' : ''}`} onClick={() => setActiveTab('details')}>
          Working Details
        </button>
        <button className={`emp-tab ${activeTab === 'attendance' ? 'emp-tab--active' : ''}`} onClick={() => setActiveTab('attendance')}>
          Attendance Calendar ({attendanceData?.records.length || 0})
        </button>
        <button className={`emp-tab ${activeTab === 'leave' ? 'emp-tab--active' : ''}`} onClick={() => setActiveTab('leave')}>
          Leave Requests ({leaveRequests.length})
        </button>
        <button className={`emp-tab ${activeTab === 'performance' ? 'emp-tab--active' : ''}`} onClick={() => setActiveTab('performance')}>
          Performance & Rating
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="emp-tab-body">
        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div className="emp-overview-grid">
            <div className="emp-info-card">
              <h4>Employee Profile Info</h4>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Full Name</span>
                <span>{employee.fullName}</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Phone</span>
                <span>+91 {employee.phone}</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Email</span>
                <span>{employee.email || '—'}</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Gender</span>
                <span>{employee.gender}</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Joining Date</span>
                <span>{formatDate(employee.joiningDate)}</span>
              </div>
            </div>

            <div className="emp-info-card">
              <h4>Roster & Working Hours</h4>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Shift Start Time</span>
                <span>{employee.workingHours?.start || '09:00'}</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Shift End Time</span>
                <span>{employee.workingHours?.end || '19:00'}</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Weekly Off Policy</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  🗓️ Rotational (1 Day / Calendar Week)
                </span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Assigned Role</span>
                <span>{employee.role?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE CALENDAR & PAYROLL SUMMARY */}
        {activeTab === 'attendance' && (
          <div className="emp-attendance-section">
            <div className="emp-payroll-card">
              <h4>📊 Payroll-Ready Monthly Attendance Export ({attendanceData?.month})</h4>
              <div className="emp-payroll-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                <div className="emp-payroll-box">
                  <span className="emp-subtext">Total Logged Days</span>
                  <strong>{payrollSummary?.totalRecordedDays || 0}</strong>
                </div>
                <div className="emp-payroll-box emp-payroll-box--green">
                  <span className="emp-subtext">Present Days</span>
                  <strong>{payrollSummary?.daysPresent || 0}</strong>
                </div>
                <div className="emp-payroll-box emp-payroll-box--amber">
                  <span className="emp-subtext">Half Days</span>
                  <strong>{payrollSummary?.daysHalfDay || 0}</strong>
                </div>
                <div className="emp-payroll-box emp-payroll-box--red">
                  <span className="emp-subtext">Absent Days</span>
                  <strong>{payrollSummary?.daysAbsent || 0}</strong>
                </div>
                <div className="emp-payroll-box emp-payroll-box--purple">
                  <span className="emp-subtext">Approved Leave</span>
                  <strong>{payrollSummary?.daysLeave || 0}</strong>
                </div>
                <div className="emp-payroll-box emp-payroll-box--cyan">
                  <span className="emp-subtext">Weekly Off</span>
                  <strong>{payrollSummary?.daysWeekOff || 0}</strong>
                </div>
              </div>
            </div>

            <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Daily Attendance Log</h4>
            {attendanceData?.records.length === 0 ? (
              <p className="emp-subtext">No attendance records logged for this month yet.</p>
            ) : (
              <div className="emp-attendance-list">
                {attendanceData?.records.map((r) => (
                  <div key={r._id} className="emp-att-row">
                    <span className="emp-att-date">📅 {formatDate(r.date)}</span>
                    <span className={`emp-att-badge emp-att-badge--${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                    <span className="emp-att-time">
                      {r.checkInTime ? `🕒 In: ${r.checkInTime}` : ''} {r.checkOutTime ? `• Out: ${r.checkOutTime}` : ''}
                    </span>
                    {r.notes && <span className="emp-att-notes">{r.notes}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEAVE REQUESTS */}
        {activeTab === 'leave' && (
          <div className="emp-leave-section">
            <form onSubmit={handleCreateLeaveSubmit} className="emp-add-leave-card">
              <h4>Submit New Leave Request</h4>
              <div className="emp-modal__grid">
                <div className="emp-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="emp-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="emp-field">
                  <label>Leave Type</label>
                  <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PAID">Paid Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                <div className="emp-field">
                  <label>Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Personal emergency / Family function"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.75rem' }}>
                <button type="submit" className="emp-btn emp-btn--primary emp-btn--sm" disabled={submittingLeave}>
                  {submittingLeave ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>

            <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Leave Requests History</h4>
            <div className="emp-leave-list">
              {leaveRequests.map((l) => (
                <div key={l._id} className="emp-leave-card">
                  <div className="emp-leave-header">
                    <div>
                      <strong>{l.leaveType} LEAVE</strong> ({formatDate(l.startDate)} - {formatDate(l.endDate)})
                    </div>
                    <span className={`emp-leave-status emp-leave-status--${l.status.toLowerCase()}`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="emp-leave-reason">Reason: {l.reason}</p>
                  {l.status === 'PENDING' && (
                    <div className="emp-leave-actions">
                      <button
                        className="emp-btn emp-btn--sm emp-btn--primary"
                        onClick={() => handleApproveLeave(l._id)}
                      >
                        Approve Request
                      </button>
                      <button
                        className="emp-btn emp-btn--sm emp-btn--outline"
                        onClick={() => handleRejectLeave(l._id)}
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PERFORMANCE */}
        {activeTab === 'performance' && (
          <div className="emp-perf-section">
            <div className="emp-info-card">
              <h4>Employee Productivity & Performance Summary</h4>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Client Feedback Rating</span>
                <span style={{ color: '#eab308', fontWeight: 700 }}>⭐ {performance?.rating || 4.8} / 5.0</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Services Completed (This Month)</span>
                <span>{performance?.totalServicesCompleted || 0} Services</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Total Revenue Attributed</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                  {formatCurrency(performance?.totalRevenueGenerated || 0)}
                </span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Avg Service Duration</span>
                <span>{performance?.avgServiceDurationMinutes || 42} Minutes</span>
              </div>
              <div className="emp-detail-row">
                <span className="emp-detail-label">Target Achievement Rate</span>
                <span>{performance?.targetAchievementPct || 92}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AddEditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialEmployee={employee}
        onSuccess={() => refetch()}
      />

      {/* ATTENDANCE MODAL */}
      <MarkAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        employeeId={employee.id}
        employeeName={employee.fullName}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
