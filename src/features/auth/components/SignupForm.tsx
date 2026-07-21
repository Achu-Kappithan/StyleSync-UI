import React, { ChangeEvent, FormEvent } from 'react';
import { UserIcon, MailIcon, PhoneIcon, LockIcon, EyeIcon, ArrowRightIcon } from '../../../components/ui/Icons';
import { SignupFormData, FormErrors } from '../types/auth.types';

export interface SignupFormProps {
  formData: SignupFormData;
  errors: FormErrors;
  showPassword: boolean;
  showConfirm: boolean;
  isLoading: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onToggleConfirm: () => void;
  onSubmit: (e: FormEvent) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  formData,
  errors,
  showPassword,
  showConfirm,
  isLoading,
  onChange,
  onTogglePassword,
  onToggleConfirm,
  onSubmit,
}) => {
  return (
    <form className="login-form login-form--compact" onSubmit={onSubmit} noValidate>
      <div className="form-row-2col">
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">Full Name</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon"><UserIcon /></span>
            <input
              id="signup-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={onChange}
            />
          </div>
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-phone">Phone Number</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon"><PhoneIcon /></span>
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              className="form-input"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={onChange}
            />
          </div>
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="signup-email">Work Email</label>
        <div className="form-input-wrapper">
          <span className="form-input-icon"><MailIcon /></span>
          <input
            id="signup-email"
            name="email"
            type="email"
            className="form-input"
            placeholder="jane@salon.com"
            value={formData.email}
            onChange={onChange}
          />
        </div>
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-row-2col">
        <div className="form-group">
          <label className="form-label" htmlFor="signup-password">Password</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon"><LockIcon /></span>
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={onChange}
            />
            <button
              type="button"
              className="form-input-action"
              onClick={onTogglePassword}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon"><LockIcon /></span>
            <input
              id="signup-confirm"
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={formData.confirm}
              onChange={onChange}
            />
            <button
              type="button"
              className="form-input-action"
              onClick={onToggleConfirm}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {errors.confirm && <span className="form-error">{errors.confirm}</span>}
        </div>
      </div>

      <button
        id="signup-submit-btn"
        type="submit"
        className={`btn-submit ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="btn-spinner" />
        ) : (
          <>
            <span>Create Free Account</span>
            <ArrowRightIcon className="btn-arrow" />
          </>
        )}
      </button>
    </form>
  );
};
