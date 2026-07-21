import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';
import { SignupForm } from '../components/SignupForm';
import { ScissorsIcon } from '../../../components/ui/Icons';
import salonBg from '../../../assets/salon_bg.png';
import salonSignupBg from '../../../assets/salon_signup_bg.png';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const {
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
  } = useAuth();

  return (
    <div className="login-page">
      {/* Top Banner */}
      {showBanner && (
        <div className="top-bar">
          <span className="top-bar__text">
            💡 <strong>Demo Mode:</strong> Click "Sign In" with any credentials to enter.
          </span>
          <button
            className="top-bar__close"
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Left Panel */}
      <div className="login-left">
        <img
          src={activeTab === 'login' ? salonBg : salonSignupBg}
          alt="Salon Interior"
          className="login-left__bg"
        />
        <div className="login-left__overlay" />
        <div className="login-left__overlay-bottom" />

        <div className="login-left__content">
          <div className="login-left__badge">
            <span className="login-left__badge-dot" />
            <span>Salon ERP System</span>
          </div>

          <h1 className="login-left__headline">
            {activeTab === 'login' ? (
              <>Elevate Your Salon <em>Experience.</em></>
            ) : (
              <>Join 2,400+ Top-Tier <em>Salons.</em></>
            )}
          </h1>

          <p className="login-left__sub">
            {activeTab === 'login'
              ? 'Manage bookings, staff schedules, and inventory seamlessly in one elegant workspace.'
              : 'Start your 14-day free trial. No credit card required. Cancel anytime.'}
          </p>

          <div className="login-left__stats">
            <div className="stat-item">
              <span className="stat-item__value">2.4k+</span>
              <span className="stat-item__label">Salons Joined</span>
            </div>
            <div className="stat-item">
              <span className="stat-item__value">99.9%</span>
              <span className="stat-item__label">Uptime</span>
            </div>
            <div className="stat-item">
              <span className="stat-item__value">4.9★</span>
              <span className="stat-item__label">User Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="decoration-ring" />
        <div className="decoration-ring" />

        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo__icon">
              <ScissorsIcon size={20} />
            </div>
            <span className="login-logo__text">Style<span>Sync</span></span>
          </div>

          {/* Heading */}
          <div className="login-heading">
            <h1>{activeTab === 'login' ? 'Welcome back 👋' : 'Create your account ✂️'}</h1>
            <p>
              {activeTab === 'login'
                ? 'Enter your credentials to access your salon dashboard'
                : 'Fill in your details to start managing your salon'}
            </p>
          </div>

          {/* Tabs */}
          <div className="login-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'signup'}
              className={`login-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Register Salon
            </button>
          </div>

          {/* Forms */}
          {activeTab === 'login' ? (
            <LoginForm
              formData={formData}
              errors={errors}
              showPassword={showPassword}
              isLoading={isLoading}
              onChange={handleChange}
              onTogglePassword={() => setShowPassword(v => !v)}
              onSubmit={handleSubmit}
            />
          ) : (
            <SignupForm
              formData={formData}
              errors={errors}
              showPassword={showPassword}
              showConfirm={showConfirm}
              isLoading={isLoading}
              onChange={handleChange}
              onTogglePassword={() => setShowPassword(v => !v)}
              onToggleConfirm={() => setShowConfirm(v => !v)}
              onSubmit={handleSubmit}
            />
          )}

          {/* Divider */}
          <div className="divider">
            <div className="divider__line" />
            <span className="divider__text">OR CONTINUE WITH</span>
            <div className="divider__line" />
          </div>

          {/* Social */}
          <div className="social-buttons">
            <button
              type="button"
              className="btn-social"
              onClick={handleSocialLogin}
              disabled={isLoading}
            >
              <span>Google</span>
            </button>
          </div>

          {/* Footer */}
          <div className="login-card__footer">
            {activeTab === 'login' ? (
              <p>Don't have an account? <a href="#signup" onClick={e => { e.preventDefault(); setActiveTab('signup'); }}>Register Salon</a></p>
            ) : (
              <p>Already have an account? <a href="#login" onClick={e => { e.preventDefault(); setActiveTab('login'); }}>Sign In</a></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
