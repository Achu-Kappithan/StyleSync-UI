import React, { ChangeEvent, FormEvent } from 'react';
import { MailIcon, LockIcon, EyeIcon, ArrowRightIcon } from '../../../components/ui/Icons';
import { SignupFormData, FormErrors } from '../types/auth.types';

export interface LoginFormProps {
  formData: SignupFormData;
  errors: FormErrors;
  showPassword: boolean;
  isLoading: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onSubmit: (e: FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  errors,
  showPassword,
  isLoading,
  onChange,
  onTogglePassword,
  onSubmit,
}) => {
  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      {/* Server Error Banner */}
      {errors.server && (
        <div className="form-server-error" role="alert">
          <span>⚠️</span>
          <span>{errors.server}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="login-email">Email Address</label>
        <div className="form-input-wrapper">
          <span className="form-input-icon"><MailIcon /></span>
          <input
            id="login-email"
            name="email"
            type="email"
            className="form-input"
            placeholder="name@salon.com"
            value={formData.email}
            onChange={onChange}
            autoComplete="email"
          />
        </div>
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <div className="form-row">
          <label className="form-label" htmlFor="login-password">Password</label>
          <a href="#forgot" className="form-forgot" onClick={e => e.preventDefault()}>Forgot?</a>
        </div>
        <div className="form-input-wrapper">
          <span className="form-input-icon"><LockIcon /></span>
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            placeholder="••••••••"
            value={formData.password}
            onChange={onChange}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="form-input-action"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {errors.password && <span className="form-error">{errors.password}</span>}
      </div>

      <div className="form-row">
        <label className="form-checkbox-label" htmlFor="login-remember">
          <input
            id="login-remember"
            name="remember"
            type="checkbox"
            className="form-checkbox"
            checked={formData.remember}
            onChange={onChange}
          />
          Keep me signed in for 30 days
        </label>
      </div>

      <button
        id="login-submit-btn"
        type="submit"
        className={`btn-submit ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="btn-spinner" />
        ) : (
          <>
            <span>Sign In to StyleSync</span>
            <ArrowRightIcon className="btn-arrow" />
          </>
        )}
      </button>
    </form>
  );
};
