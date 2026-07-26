import React, { ChangeEvent, FormEvent } from 'react';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  ArrowRightIcon,
  ScissorsIcon,
} from '../../../components/ui/Icons';
import { SignupFormData, FormErrors } from '../types/auth.types';

export interface SignupFormProps {
  formData: SignupFormData;
  errors: FormErrors;
  showPassword: boolean;
  showConfirm: boolean;
  isLoading: boolean;
  registerSuccess: boolean;
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
  registerSuccess,
  onChange,
  onTogglePassword,
  onToggleConfirm,
  onSubmit,
}) => {
  // ─── Registration Success State ──────────────────────────────────────────────
  if (registerSuccess) {
    return (
      <div className="register-success">
        <div className="register-success__icon">✅</div>
        <h3 className="register-success__title">Account Created!</h3>
        <p className="register-success__msg">
          Your salon account has been registered successfully.
          <br />
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <form className="login-form login-form--compact" onSubmit={onSubmit} noValidate>

      {/* Server Error Banner */}
      {errors.server && (
        <div className="form-server-error" role="alert">
          <span>⚠️</span>
          <span>{errors.server}</span>
        </div>
      )}

      <div className="form-row-2col">
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">Full Name</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon"><UserIcon /></span>
            <input
              id="signup-name"
              name="name"
              type="text"
              className={`form-input${errors.name ? ' form-input--error' : ''}`}
              placeholder="Jane Doe"
              value={formData.name}
              onChange={onChange}
              autoComplete="name"
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
              className={`form-input${errors.phone ? ' form-input--error' : ''}`}
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={onChange}
              autoComplete="tel"
            />
          </div>
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="signup-salon-name">Salon Name (Optional)</label>
        <div className="form-input-wrapper">
          <span className="form-input-icon"><ScissorsIcon /></span>
          <input
            id="signup-salon-name"
            name="salonName"
            type="text"
            className="form-input"
            placeholder="e.g. Glamour Style Studio"
            value={formData.salonName || ''}
            onChange={onChange}
            autoComplete="organization"
          />
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
            className={`form-input${errors.email ? ' form-input--error' : ''}`}
            placeholder="jane@salon.com"
            value={formData.email}
            onChange={onChange}
            autoComplete="email"
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
              className={`form-input${errors.password ? ' form-input--error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={onChange}
              autoComplete="new-password"
            />
            <button type="button" className="form-input-action" onClick={onTogglePassword}>
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
              className={`form-input${errors.confirm ? ' form-input--error' : ''}`}
              placeholder="••••••••"
              value={formData.confirm}
              onChange={onChange}
              autoComplete="new-password"
            />
            <button type="button" className="form-input-action" onClick={onToggleConfirm}>
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
