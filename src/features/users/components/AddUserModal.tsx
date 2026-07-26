import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { UserRole, CreateUserPayload, UserFormErrors } from '../types/user.types';

const FALLBACK_ROLES: UserRole[] = [
  { id: '1', roleName: 'MANAGER', description: 'Operations manager for bookings, schedules, and team' },
  { id: '2', roleName: 'ADMIN', description: 'Administrator with elevated management privileges' },
  { id: '3', roleName: 'ACCOUNTANT', description: 'Financial manager for invoices, sales reports, and billing' },
  { id: '4', roleName: 'RECEPTIONIST', description: 'Front desk coordinator for client check-in and booking' },
  { id: '5', roleName: 'STAFF', description: 'Service provider / stylist viewing assigned schedules' },
];

interface AddUserModalProps {
  isOpen: boolean;
  roles: UserRole[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  roles,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  // Use provided roles if available, otherwise fallback to standard system roles
  const activeRoles = roles && roles.length > 0 ? roles : FALLBACK_ROLES;

  const [formData, setFormData] = useState<CreateUserPayload>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleName: activeRoles[0]?.roleName || 'MANAGER',
  });

  const [errors, setErrors] = useState<UserFormErrors>({});

  // Sync roleName when activeRoles change
  useEffect(() => {
    if (activeRoles.length > 0 && !formData.roleName) {
      setFormData((prev) => ({ ...prev, roleName: activeRoles[0].roleName }));
    }
  }, [activeRoles]);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof UserFormErrors] || errors.server) {
      setErrors((prev) => ({ ...prev, [name]: '', server: '' }));
    }
  };

  const validate = (): UserFormErrors => {
    const errs: UserFormErrors = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Min 6 characters';
    }
    if (!formData.roleName) errs.roleName = 'Please select a role';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        roleName: activeRoles[0]?.roleName || 'MANAGER',
      });
      setErrors({});
    } catch (err: unknown) {
      setErrors({
        server: err instanceof Error ? err.message : 'Could not add team member',
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Add Team Member</h2>
            <p>Create an internal user account for your salon</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {errors.server && (
          <div className="form-server-error" style={{ margin: '1rem 1.5rem 0' }}>
            <span>⚠️</span>
            <span>{errors.server}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Alex Smith"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'form-input--error' : ''}
              disabled={isSubmitting}
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="email">Work Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="alex.smith@salon.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'form-input--error' : ''}
                disabled={isSubmitting}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'form-input--error' : ''}
                disabled={isSubmitting}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="roleName">Assigned Role *</label>
              <select
                id="roleName"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                className={errors.roleName ? 'form-input--error' : ''}
                disabled={isSubmitting}
              >
                {activeRoles.map((role) => (
                  <option key={role.id || role.roleName} value={role.roleName}>
                    {role.roleName} — {role.description}
                  </option>
                ))}
              </select>
              {errors.roleName && <span className="field-error">{errors.roleName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Initial Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'form-input--error' : ''}
                disabled={isSubmitting}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating User...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
