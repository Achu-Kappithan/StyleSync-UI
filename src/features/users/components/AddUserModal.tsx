import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { UserRole, CreateUserPayload, UserFormErrors } from '../types/user.types';

const FALLBACK_ROLES: UserRole[] = [
  { id: '1', roleName: 'STAFF', description: 'Service provider / stylist viewing assigned schedules' },
  { id: '2', roleName: 'MANAGER', description: 'Operations manager for bookings, schedules, and team' },
  { id: '3', roleName: 'RECEPTIONIST', description: 'Front desk coordinator for client check-in and booking' },
  { id: '4', roleName: 'ACCOUNTANT', description: 'Financial manager for invoices, sales reports, and billing' },
  { id: '5', roleName: 'ADMIN', description: 'Administrator with elevated management privileges' },
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
  const activeRoles = roles && roles.length > 0 ? roles : FALLBACK_ROLES;

  const [formData, setFormData] = useState<CreateUserPayload>({
    fullName: '',
    phone: '',
    gender: 'Female',
    email: '',
    password: '',
    roleName: activeRoles[0]?.roleName || 'STAFF',
  });

  const [errors, setErrors] = useState<UserFormErrors>({});

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

    // CORE MANDATORY FIELDS: Full Name (*), Phone Number (*), Gender (*)
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim().replace(/\D/g, ''))) {
      errs.phone = 'Phone number must be 10 digits';
    }

    if (!formData.gender) {
      errs.gender = 'Gender selection is required';
    }

    // Email is optional (if provided, format must be valid)
    if (formData.email && formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    // Password is optional (if provided, min 6 characters)
    if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

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
        phone: '',
        gender: 'Female',
        email: '',
        password: '',
        roleName: activeRoles[0]?.roleName || 'STAFF',
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
          {/* CORE MANDATORY FIELDS SECTION */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Priya Sharma"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'form-input--error' : ''}
              disabled={isSubmitting}
              required
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="phone">Phone Number (10-Digit) <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setFormData((prev) => ({ ...prev, phone: clean }));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                maxLength={10}
                className={errors.phone ? 'form-input--error' : ''}
                disabled={isSubmitting}
                required
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? 'form-input--error' : ''}
                disabled={isSubmitting}
                required
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="field-error">{errors.gender}</span>}
            </div>
          </div>

          {/* OPTIONAL FIELDS SECTION */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="email">Work Email (Optional)</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. alex.smith@salon.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'form-input--error' : ''}
                disabled={isSubmitting}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="roleName">Assigned Role</label>
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
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Initial Password (Optional)</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Defaults to phone number if left empty"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'form-input--error' : ''}
              disabled={isSubmitting}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
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
              {isSubmitting ? 'Creating Account...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
