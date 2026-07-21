import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthTab, SignupFormData, FormErrors } from '../types/auth.types';

const INITIAL_FORM_DATA: SignupFormData = {
  email: '',
  password: '',
  name: '',
  phone: '',
  confirm: '',
  remember: false,
};

export function useAuth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [formData, setFormData] = useState<SignupFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
      if (formData.confirm !== formData.password) errs.confirm = 'Passwords do not match';
    }

    return errs;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('ss_auth', 'true');
      navigate('/dashboard');
    }, 1200);
  };

  const handleSocialLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('ss_auth', 'true');
      navigate('/dashboard');
    }, 1000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ss_auth');
    navigate('/login');
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
    handleChange,
    handleSubmit,
    handleSocialLogin,
    handleLogout,
  };
}
