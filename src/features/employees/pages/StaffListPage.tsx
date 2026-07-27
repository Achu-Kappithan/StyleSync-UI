import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../hooks/use-employees';
import { Employee } from '../types/employee.types';
import { AddEditEmployeeModal } from '../components/AddEditEmployeeModal';
import { MarkAttendanceModal } from '../components/MarkAttendanceModal';
import './StaffListPage.css';

export const StaffListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, params, setParams, refetch } = useEmployees({
    page: 1,
    limit: 15,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [attendanceTarget, setAttendanceTarget] = useState<{ id: string; name: string } | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, role: e.target.value || undefined, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({ ...prev, status: e.target.value || undefined, page: 1 }));
  };

  const handleRowClick = (employeeId: string) => {
    navigate(`/dashboard/staff/${employeeId}`);
  };

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation();
    setEditingEmployee(emp);
    setIsAddModalOpen(true);
  };

  const handleOpenAttendanceModal = (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation();
    setAttendanceTarget({ id: emp.id, name: emp.fullName });
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="staff-list-container">
      {/* HEADER BAR */}
      <div className="staff-list-header">
        <div>
          <h1 className="staff-list-title">Staff & Workforce Management</h1>
          <p className="staff-list-subtitle">Manage employee schedules, skills, attendance, and leave requests</p>
        </div>
        <button className="emp-btn emp-btn--primary" onClick={handleOpenAddModal}>
          + Onboard New Staff
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="staff-filter-bar">
        <div className="staff-search-box">
          <svg className="staff-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search staff by name, phone number, email..."
            value={params.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        <div className="staff-filter-selects">
          <select value={params.role || ''} onChange={handleRoleChange}>
            <option value="">All Roles</option>
            <option value="SENIOR_STYLIST">Senior Stylist</option>
            <option value="HAIR_COLORIST">Hair Colorist</option>
            <option value="NAIL_ARTIST">Nail Artist</option>
            <option value="BEAUTICIAN">Beautician</option>
            <option value="MASSAGE_THERAPIST">Massage Therapist</option>
            <option value="ASSISTANT">Stylist Assistant</option>
            <option value="RECEPTIONIST">Front Desk Receptionist</option>
          </select>

          <select value={params.status || ''} onChange={handleStatusChange}>
            <option value="">All Statuses</option>
            <option value="active">Active Staff</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && <div className="emp-modal__alert emp-modal__alert--error">{error}</div>}

      {/* DATA TABLE */}
      <div className="staff-table-card">
        {loading ? (
          <div className="staff-loading-state">
            <div className="staff-spinner" />
            <span>Loading staff directory...</span>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="staff-empty-state">
            <p>No employees found matching filter criteria.</p>
            <button className="emp-btn emp-btn--secondary" onClick={handleOpenAddModal}>
              Onboard First Staff Member
            </button>
          </div>
        ) : (
          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Contact</th>
                  <th>Role / Designation</th>
                  <th>Skills & Services</th>
                  <th>Shift Hours</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((emp) => {
                  const initials = emp.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={emp.id} className="staff-table__row" onClick={() => handleRowClick(emp.id)}>
                      <td>
                        <div className="staff-profile-cell">
                          <div className="staff-avatar">{initials}</div>
                          <div>
                            <span className="staff-name">{emp.fullName}</span>
                            <span className="staff-subtext">Joined {formatDate(emp.joiningDate)}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="staff-contact-cell">
                          <span className="staff-phone">📱 +91 {emp.phone}</span>
                          {emp.email && <span className="staff-email">✉️ {emp.email}</span>}
                        </div>
                      </td>

                      <td>
                        <span className="staff-role-badge">
                          {emp.role ? emp.role.replace('_', ' ') : 'STYLIST'}
                        </span>
                      </td>

                      <td>
                        <div className="staff-skills-cell">
                          {emp.skills?.length > 0 ? (
                            emp.skills.slice(0, 3).map((s) => (
                              <span key={s} className="staff-skill-chip">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="staff-subtext">—</span>
                          )}
                          {emp.skills?.length > 3 && (
                            <span className="staff-skill-more">+{emp.skills.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="staff-shift">
                          🕒 {emp.workingHours?.start || '09:00'} - {emp.workingHours?.end || '19:00'}
                        </span>
                      </td>

                      <td>
                        <span className={`staff-status-badge staff-status-badge--${emp.status}`}>
                          {emp.status === 'active' ? 'Active' : emp.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="staff-actions-group">
                          <button
                            className="staff-action-btn"
                            title="Mark Attendance"
                            onClick={(e) => handleOpenAttendanceModal(e, emp)}
                          >
                            🕒
                          </button>
                          <button
                            className="staff-action-btn"
                            title="View 360° Profile"
                            onClick={() => handleRowClick(emp.id)}
                          >
                            👁️
                          </button>
                          <button
                            className="staff-action-btn"
                            title="Edit Profile"
                            onClick={(e) => handleOpenEditModal(e, emp)}
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {data && data.totalPages > 1 && (
          <div className="staff-pagination">
            <span className="staff-pagination-info">
              Showing page {data.page} of {data.totalPages} ({data.total} total employees)
            </span>
            <div className="staff-pagination-controls">
              <button
                className="emp-btn emp-btn--sm emp-btn--outline"
                disabled={data.page <= 1}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                Previous
              </button>
              <button
                className="emp-btn emp-btn--sm emp-btn--outline"
                disabled={data.page >= data.totalPages}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      <AddEditEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialEmployee={editingEmployee}
        onSuccess={() => refetch()}
      />

      {/* MARK ATTENDANCE MODAL */}
      {attendanceTarget && (
        <MarkAttendanceModal
          isOpen={!!attendanceTarget}
          onClose={() => setAttendanceTarget(null)}
          employeeId={attendanceTarget.id}
          employeeName={attendanceTarget.name}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};
