// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axois.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Check for verification success message from location state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      // Clear the state so message doesn't persist on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-dismiss success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Check for verification flag
    if (location.state?.verifiedEmail) {
      setSuccessMessage('🎉 Email verified successfully! Please login to continue.');
    }
  }, [location.state]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  // Login mutation (with credentials)
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axiosInstance.post('/auth/login', credentials, {
        withCredentials: true, // IMPORTANT for HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ Login successful:', data);
      
      // Store user data in localStorage (but NOT tokens - they're in HTTP-only cookies)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // If remember me is checked, store email in localStorage
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Redirect based on user status
      const redirectPath = data.user.isOnboarded ? '/dashboard' : '/onboarding';
      const from = location.state?.from?.pathname || redirectPath;
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error('❌ Login failed:', error.response?.data);
      const errorData = error.response?.data;
      
      // Handle specific error cases
      if (errorData?.requiresVerification) {
        setFormErrors({
          general: (
            <div className="space-y-2">
              <p className="font-medium">Please verify your email first</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/verify-instructions', { state: { email: errorData.email } })}
                  className="btn btn-sm btn-outline"
                >
                  Resend Verification Email
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login-help', { state: { email: errorData.email } })}
                  className="btn btn-sm btn-ghost"
                >
                  Need help?
                </button>
              </div>
            </div>
          )
        });
      } else if (errorData?.message === "Invalid credentials") {
        setFormErrors({
          general: 'Invalid email or password. Please try again.',
          email: 'Check your email address',
          password: 'Check your password'
        });
      } else {
        setFormErrors({
          general: errorData?.message || 'Login failed. Please try again.'
        });
      }
    }
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear previous errors
    setFormErrors({});
    
    // Submit login
    loginMutation.mutate({
      email: formData.email.trim(),
      password: formData.password
    });
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Forgot password handler
  const handleForgotPassword = () => {
    if (!formData.email) {
      setFormErrors({ email: 'Please enter your email to reset password' });
      return;
    }
    
    navigate('/forgot-password', { state: { email: formData.email } });
  };

  // Resend verification email
  const handleResendVerification = () => {
    if (!formData.email) {
      setFormErrors({ email: 'Please enter your email first' });
      return;
    }
    
    navigate('/verify-instructions', { state: { email: formData.email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-md w-full">
        {/* Success Message from Email Verification */}
        {successMessage && (
          <div className="mb-6 animate-fade-in">
            <div className="alert alert-success shadow-lg">
              <CheckCircle className="w-5 h-5" />
              <div className="flex-1">
                <span className="font-medium">Success!</span>
                <div className="text-xs opacity-90">{successMessage}</div>
              </div>
              <button 
                onClick={() => setSuccessMessage('')}
                className="btn btn-ghost btn-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-base-100 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-base-content/70">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Message */}
          {formErrors.general && (
            <div className="alert alert-error mb-6 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                {typeof formErrors.general === 'string' ? (
                  <span className="text-sm">{formErrors.general}</span>
                ) : (
                  formErrors.general
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full pl-10 ${formErrors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {formErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.email}</span>
                </label>
              )}
            </div>

            {/* Password Input */}
            <div className="form-control">
              <div className="flex justify-between items-center mb-2">
                <label className="label-text font-medium">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-primary-focus hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full pl-10 pr-10 ${formErrors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.password}</span>
                </label>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="cursor-pointer label gap-3">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="checkbox checkbox-sm"
                />
                <span className="label-text">Remember me</span>
              </label>
              
              {/* Resend Verification Link */}
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-sm text-info hover:text-info-focus hover:underline transition-colors"
              >
                Resend verification email
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn btn-primary w-full gap-2"
            >
              {loginMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-base-content/50 text-sm my-6">OR</div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-base-content/70 mb-4">
              Don't have an account yet?
            </p>
            <Link 
              to="/signup" 
              className="btn btn-outline w-full gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create New Account
            </Link>
          </div>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-base-300 text-center">
            <p className="text-xs text-base-content/50">
              Secure login with HTTP-only cookies. Your session is protected.
            </p>
            <p className="text-xs text-base-content/50 mt-1">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="link link-hover">Terms</Link> and{' '}
              <Link to="/privacy" className="link link-hover">Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-x-4">
          <Link to="/" className="text-sm text-base-content/60 hover:text-base-content transition-colors">
            ← Back to Home
          </Link>
          <span className="text-base-content/30">•</span>
          <Link to="/login-help" className="text-sm text-base-content/60 hover:text-base-content transition-colors">
            Having trouble logging in?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;