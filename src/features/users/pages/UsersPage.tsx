import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, getRoles, createUser, updateUserStatus } from '../../../services/users.service';
import { UserMember, UserRole, CreateUserPayload } from '../types/user.types';
import { UserTable } from '../components/UserTable';
import { AddUserModal } from '../components/AddUserModal';
import './UsersPage.css';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserMember[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Team Members & Roles on Mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Could not load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddUser = async (payload: CreateUserPayload) => {
    setIsSubmitting(true);
    try {
      const newUser = await createUser(payload);
      setUsers((prev) => [newUser, ...prev]);
      setIsModalOpen(false);
      showNotification('success', `Team member '${newUser.fullName}' added successfully!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const updated = await updateUserStatus(userId, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      showNotification(
        'success',
        `User account set to ${nextStatus.toUpperCase()}`,
      );
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const management = users.filter((u) =>
      ['SALON_OWNER', 'ADMIN', 'MANAGER'].includes(u.role.toUpperCase()),
    ).length;
    const staff = users.filter((u) =>
      ['STAFF', 'RECEPTIONIST', 'ACCOUNTANT'].includes(u.role.toUpperCase()),
    ).length;

    return { total, active, management, staff };
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);

      const matchesRole =
        roleFilter === 'ALL' || user.role.toUpperCase() === roleFilter.toUpperCase();

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-page-header">
        <div>
          <h1 className="page-title">Team & Staff Management</h1>
          <p className="page-subtitle">
            Manage your salon staff, assign operational roles, and control internal access.
          </p>
        </div>
        <button
          type="button"
          className="btn-add-user"
          onClick={() => setIsModalOpen(true)}
        >
          <span>➕ Add Team Member</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast notification-toast--${notification.type}`}>
          <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="users-summary-grid">
        <div className="summary-card">
          <div className="summary-card__icon text-cyan">👥</div>
          <div>
            <div className="summary-card__value">{stats.total}</div>
            <div className="summary-card__label">Total Members</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card__icon text-emerald">⚡</div>
          <div>
            <div className="summary-card__value">{stats.active}</div>
            <div className="summary-card__label">Active Accounts</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card__icon text-purple">👑</div>
          <div>
            <div className="summary-card__value">{stats.management}</div>
            <div className="summary-card__label">Management</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card__icon text-rose">✂️</div>
          <div>
            <div className="summary-card__value">{stats.staff}</div>
            <div className="summary-card__label">Stylists & Staff</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Role Filter */}
      <div className="users-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="role-filter">Filter Role:</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="SALON_OWNER">Salon Owners</option>
            <option value="ADMIN">Admins</option>
            <option value="MANAGER">Managers</option>
            <option value="ACCOUNTANT">Accountants</option>
            <option value="RECEPTIONIST">Receptionists</option>
            <option value="STAFF">Staff / Stylists</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        roles={roles}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />
    </div>
  );
};

export default UsersPage;
