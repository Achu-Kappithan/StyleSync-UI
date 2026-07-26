import { useState, useRef, useCallback, useEffect } from 'react';
import { verifyEmail, resendOtp } from '../../../services/auth.service';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function useOtpVerification(
  email: string,
  onSuccess: () => void,
) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));

  // ─── Countdown Timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ─── OTP Input Handling ───────────────────────────────────────────────────────
  const handleOtpChange = useCallback((index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1); // single digit only
    setError('');
    setOtp(prev => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    // Auto-advance to next box
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      setOtp(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index] = '';
        } else if (index > 0) {
          next[index - 1] = '';
          inputRefs.current[index - 1]?.focus();
        }
        return next;
      });
    }
  }, []);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const digits = pasted.split('');
    setOtp(prev => {
      const next = [...prev];
      digits.forEach((d, i) => { next[i] = d; });
      return next;
    });
    // Focus the last filled box
    const lastIndex = Math.min(digits.length, OTP_LENGTH) - 1;
    inputRefs.current[lastIndex]?.focus();
  }, []);

  // ─── Verify ───────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async () => {
    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await verifyEmail({ email, otp: otpString });
      setSuccessMsg('Email verified! Redirecting to sign in…');
      setTimeout(onSuccess, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      // Clear OTP boxes on error so user can re-enter
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  }, [email, otp, onSuccess]);

  // ─── Resend ───────────────────────────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      await resendOtp({ email });
      setSuccessMsg('A new code has been sent to your email.');
      setCountdown(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  }, [canResend, email]);

  return {
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
  };
}
