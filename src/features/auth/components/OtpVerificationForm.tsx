import React from 'react';
import { useOtpVerification } from '../hooks/useOtpVerification';

interface OtpVerificationFormProps {
  email: string;
  onSuccess: () => void;
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({ email, onSuccess }) => {
  const {
    otp,
    inputRefs,
    isVerifying,
    isResending,
    error,
    successMsg,
    countdown,
    canResend,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleVerify,
    handleResend,
  } = useOtpVerification(email, onSuccess);

  return (
    <div className="otp-screen">
      {/* Icon */}
      <div className="otp-icon">📧</div>

      {/* Heading */}
      <h3 className="otp-title">Check your inbox</h3>
      <p className="otp-subtitle">
        We sent a 6-digit verification code to
        <br />
        <strong className="otp-email">{email}</strong>
      </p>

      {/* Success Banner */}
      {successMsg && (
        <div className="otp-success-banner" role="status">
          ✅ {successMsg}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="form-server-error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* OTP Digit Inputs */}
      <div className="otp-inputs" role="group" aria-label="Enter 6-digit verification code">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            id={`otp-digit-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={`otp-digit${digit ? ' otp-digit--filled' : ''}${error ? ' otp-digit--error' : ''}`}
            value={digit}
            onChange={e => handleOtpChange(index, e.target.value)}
            onKeyDown={e => handleOtpKeyDown(index, e)}
            onPaste={index === 0 ? handleOtpPaste : undefined}
            autoComplete="one-time-code"
            aria-label={`Digit ${index + 1}`}
            disabled={isVerifying}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        id="otp-verify-btn"
        type="button"
        className={`btn-submit${isVerifying ? ' loading' : ''}`}
        onClick={handleVerify}
        disabled={isVerifying || otp.join('').length < 6}
      >
        {isVerifying ? <span className="btn-spinner" /> : <span>Verify Email</span>}
      </button>

      {/* Resend Section */}
      <div className="otp-resend">
        {canResend ? (
          <button
            id="otp-resend-btn"
            type="button"
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Sending…' : 'Resend code'}
          </button>
        ) : (
          <p className="otp-countdown">
            Resend code in <span className="otp-countdown__value">{countdown}s</span>
          </p>
        )}
      </div>

      <p className="otp-hint">
        Didn't get it? Check your spam folder.
      </p>
    </div>
  );
};
