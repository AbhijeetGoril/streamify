// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, CheckCircle, UserPlus, ShipWheel } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

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
    
    // Clear general errors
    if (formErrors.general || formErrors.submit) {
      setFormErrors(prev => ({ ...prev, general: '', submit: '' }));
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
      queryClient.setQueryData(["user"], { user: data.user });
      
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
      const redirectPath = data.user.isOnboarded ? '/homepage' : '/onboarding';
      const from = location.state?.from?.pathname || redirectPath;
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error('❌ Login failed:', error.response?.data);
      const errorData = error.response?.data;
      
      // Handle different error types
      if (error.code === 'ERR_NETWORK') {
        setFormErrors({ submit: "Cannot connect to server. Make sure backend is running." });
      } else if (error.code === 'ECONNABORTED') {
        setFormErrors({ submit: "Request timeout. Server is taking too long to respond." });
      } else if (errorData?.requiresVerification) {
        setFormErrors({
          submit: (
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
          submit: 'Invalid email or password. Please try again.',
          email: 'Check your email address',
          password: 'Check your password'
        });
      } else if (errorData?.message) {
        setFormErrors({ submit: errorData.message });
      } else {
        setFormErrors({ submit: "Login failed. Please try again." });
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
      <div className="border border-primary/20 flex w-full max-w-5xl mx-auto bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side form - Consistent with SignupPage */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col">
          {/* Logo/Brand Header */}
          <div className="mb-6 flex items-center justify-start gap-2">
            <ShipWheel className="w-10 h-10 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          {/* Success Message from Email Verification */}
          {successMessage && (
            <div className="mb-6 animate-fade-in">
              <div className="alert alert-success shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <div className="flex-1">
                  <span className="font-medium">Success!</span>
                  <div className="text-sm opacity-90">{successMessage}</div>
                </div>
                <button 
                  onClick={() => setSuccessMessage('')}
                  className="btn btn-ghost btn-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm opacity-70 mt-1">
                Sign in to your account to continue your language learning journey
              </p>
            </div>

            {/* Error Message */}
            {formErrors.submit && (
              <div className="alert alert-error animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  {typeof formErrors.submit === 'string' ? (
                    <span className="text-sm">{formErrors.submit}</span>
                  ) : (
                    formErrors.submit
                  )}
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="form-control w-full">
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
                  placeholder="example@gmail.com"
                  autoComplete="email"
                />
              </div>
              {formErrors.email && <span className="label-text-alt text-error">{formErrors.email}</span>}
            </div>

            {/* Password Input */}
            <div className="form-control w-full">
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
              <span className="label-text-alt opacity-70">Minimum 6 characters</span>
              {formErrors.password && <span className="label-text-alt text-error">{formErrors.password}</span>}
            </div>

            {/* Remember Me & Verification */}
            <div className="flex items-center justify-between">
              <label className="cursor-pointer label gap-3">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="checkbox checkbox-sm"
                />
                <span className="label-text text-sm">Remember me</span>
              </label>
              
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
              className={`btn btn-primary w-full ${loginMutation.isPending ? "loading" : ""}`} 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing In..." : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider text-base-content/50 text-sm">OR</div>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-sm opacity-70">
                Don't have an account?{" "}
                <Link to="/signup" className="link link-primary font-semibold">Sign Up</Link>
              </span>
            </div>

            {/* Security Notice - Optional */}
            <div className="mt-4 pt-4 border-t border-base-300 text-center">
              <p className="text-xs opacity-70">
                Secure login with HTTP-only cookies. Your session is protected.
              </p>
            </div>
          </form>
        </div>

        {/* Right side Image - Consistent with SignupPage */}
        <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
          <div className="text-center">
            <img 
              src="/Video-call-bro.png" 
              alt="Video call illustration" 
              className="w-full max-w-md object-contain mb-6" 
            />
            <h3 className="text-xl font-bold mb-2">Continue Your Language Journey</h3>
            <p className="text-sm opacity-70 max-w-md">
              Reconnect with your language partners and continue improving your skills through interactive conversations.
            </p>
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-xs opacity-70">
                <strong>Note:</strong> If you haven't verified your email, please check your inbox 
                or use the "Resend verification email" link.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;