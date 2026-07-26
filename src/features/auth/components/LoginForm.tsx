import React, { ChangeEvent, FormEvent } from 'react';
import { MailIcon, LockIcon, EyeIcon, ArrowRightIcon } from '../../../components/ui/Icons';
import { SignupFormData, FormErrors, DemoRolePreset } from '../types/auth.types';

const DEMO_PRESETS: DemoRolePreset[] = [
  { id: 'owner', label: 'Salon Owner', role: 'SALON_OWNER', email: 'owner@stylesync.com', badgeColor: '#00c9a7', icon: '👑' },
  { id: 'admin', label: 'Admin', role: 'ADMIN', email: 'admin@stylesync.com', badgeColor: '#7c6ef9', icon: '🛡️' },
  { id: 'manager', label: 'Manager', role: 'MANAGER', email: 'manager@stylesync.com', badgeColor: '#f9a76e', icon: '💼' },
  { id: 'staff', label: 'Staff', role: 'STAFF', email: 'staff@stylesync.com', badgeColor: '#6ef9e4', icon: '✂️' },
];

export interface LoginFormProps {
  formData: SignupFormData;
  errors: FormErrors;
  showPassword: boolean;
  isLoading: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onSubmit: (e: FormEvent) => void;
  onSelectPreset?: (preset: DemoRolePreset) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  errors,
  showPassword,
  isLoading,
  onChange,
  onTogglePassword,
  onSubmit,
  onSelectPreset,
}) => {
  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      {/* Quick Demo Account Selector */}
      <div className="demo-preset-section" style={{ marginBottom: '1.25rem' }}>
        <p className="form-label" style={{ marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
          ⚡ QUICK DEMO ROLE LOGIN:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {DEMO_PRESETS.map((preset) => {
            const isSelected = formData.email.toLowerCase() === preset.email.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                className={`demo-preset-pill ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectPreset?.(preset)}
                style={{
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: isSelected ? `1.5px solid ${preset.badgeColor}` : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? `${preset.badgeColor}22` : 'rgba(255,255,255,0.03)',
                  color: isSelected ? preset.badgeColor : 'var(--text-muted, #a0aec0)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.2s ease',
                }}
                title={`Autofill credentials for ${preset.label}`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

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
