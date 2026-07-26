import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthTab, SignupFormData, FormErrors } from '../types/auth.types';
import { loginUser, registerSalon, logoutUser } from '../../../services/auth.service';

const INITIAL_FORM_DATA: SignupFormData = {
  email: '',
  password: '',
  name: '',
  phone: '',
  confirm: '',
  remember: false,
};

const SS_AUTH_KEY = 'ss_auth';
const SS_USER_KEY = 'ss_user';

export function useAuth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [formData, setFormData] = useState<SignupFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * When set, the OTP verification screen is shown instead of the signup/login form.
   * Cleared automatically when the user completes verification.
   */
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // ─── Field Change Handler ──────────────────────────────────────────────────

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof FormErrors] || errors.server) {
      setErrors(prev => ({ ...prev, [name]: '', server: '' }));
    }
  };

  // ─── Validation ────────────────────────────────────────────────────────────

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!formData.email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Min 6 characters';
    }

    if (activeTab === 'signup') {
      if (!formData.name) errs.name = 'Full name is required';
      if (!formData.phone) errs.phone = 'Phone number is required';
      if (!formData.confirm) {
        errs.confirm = 'Please confirm your password';
      } else if (formData.confirm !== formData.password) {
        errs.confirm = 'Passwords do not match';
      }
    }

    return errs;
  };

  // ─── Submit Handler ────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (activeTab === 'signup') {
        const response = await registerSalon({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          salonName: formData.salonName,
        });

        if (response.data.requiresVerification) {
          setPendingVerificationEmail(response.data.email);
          setFormData(INITIAL_FORM_DATA);
        }
      } else {
        const response = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        // HttpOnly cookies (access_token, refresh_token) are set automatically by backend Set-Cookie header
        sessionStorage.setItem(SS_AUTH_KEY, 'true');
        sessionStorage.setItem(SS_USER_KEY, JSON.stringify(response.data.user));

        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setErrors({ server: message });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP Verified Callback ─────────────────────────────────────────────────

  const handleVerificationSuccess = () => {
    setPendingVerificationEmail(null);
    setActiveTab('login');
    setErrors({ server: '' });
    setFormData(INITIAL_FORM_DATA);
  };

  // ─── Select Preset Handler ───────────────────────────────────────────────

  const handleSelectPreset = (preset: { email: string }) => {
    setFormData(prev => ({
      ...prev,
      email: preset.email,
      password: 'Password123!',
    }));
    setErrors({});
  };

  // ─── Social Login (placeholder) ────────────────────────────────────────────

  const handleSocialLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setErrors({ server: 'Social login is not yet available.' });
    }, 800);
  };

  // ─── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Clear client state even if logout API throws
    } finally {
      sessionStorage.removeItem(SS_AUTH_KEY);
      sessionStorage.removeItem(SS_USER_KEY);
      navigate('/login');
    }
  };

  return {
    activeTab,
    setActiveTab,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    isLoading,
    showBanner,
    setShowBanner,
    formData,
    errors,
    pendingVerificationEmail,
    handleChange,
    handleSubmit,
    handleSelectPreset,
    handleVerificationSuccess,
    handleSocialLogin,
    handleLogout,
  };
}
