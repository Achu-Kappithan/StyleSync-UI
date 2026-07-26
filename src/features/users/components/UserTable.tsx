import React from 'react';
import { UserMember } from '../types/user.types';

interface UserTableProps {
  users: UserMember[];
  isLoading: boolean;
  onToggleStatus: (userId: string, currentStatus: 'active' | 'inactive') => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onToggleStatus,
}) => {
  const getRoleBadgeClass = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SALON_OWNER':
        return 'role-badge role-badge--owner';
      case 'ADMIN':
        return 'role-badge role-badge--admin';
      case 'MANAGER':
        return 'role-badge role-badge--manager';
      case 'ACCOUNTANT':
        return 'role-badge role-badge--accountant';
      case 'RECEPTIONIST':
        return 'role-badge role-badge--receptionist';
      default:
        return 'role-badge role-badge--staff';
    }
  };

  const formatRoleName = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SALON_OWNER':
        return '👑 Salon Owner';
      case 'ADMIN':
        return '🛡️ Admin';
      case 'MANAGER':
        return '👔 Manager';
      case 'ACCOUNTANT':
        return '📊 Accountant';
      case 'RECEPTIONIST':
        return '🛎️ Receptionist';
      default:
        return '✂️ Staff';
    }
  };

  if (isLoading) {
    return (
      <div className="users-table-placeholder">
        <div className="table-spinner" />
        <p>Loading team members...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="users-table-placeholder">
        <span className="placeholder-icon">👥</span>
        <h3>No Team Members Found</h3>
        <p>Add your first internal user to collaborate in StyleSync ERP.</p>
      </div>
    );
  }

  return (
    <div className="users-table-wrapper">
      <table className="users-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Last Active</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="member-info">
                  <div className="avatar-circle">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="member-name">{user.fullName}</div>
                    <div className="member-email">{user.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={getRoleBadgeClass(user.role)}>
                  {formatRoleName(user.role)}
                </span>
              </td>
              <td>
                <div className="member-phone">{user.phone}</div>
              </td>
              <td>
                <span className={`status-pill status-pill--${user.status}`}>
                  <span className="status-dot" />
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </td>
              <td>
                <div className="last-login">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>
                {user.role.toUpperCase() !== 'SALON_OWNER' && (
                  <button
                    type="button"
                    className={`btn-action-status ${
                      user.status === 'active' ? 'deactivate' : 'activate'
                    }`}
                    onClick={() => onToggleStatus(user.id, user.status)}
                    title={
                      user.status === 'active'
                        ? 'Deactivate User Account'
                        : 'Activate User Account'
                    }
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
