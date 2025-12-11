// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Lock, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Loader,
  Shield
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axois.js';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify token with POST (check if token is valid)
  const verifyTokenMutation = useMutation({
    mutationFn: async (token) => {
      // Send empty POST to verify token (or send some dummy data)
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, {
        verifyOnly: true // You might need to adapt this based on your API
      });
      return response.data;
    },
    onSuccess: (data) => {
      setTokenValid(true);
      setUserEmail(data.email || '');
      setMessage('Token is valid. Set your new password below.');
    },
    onError: (error) => {
      setTokenValid(false);
      setMessage(error.response?.data?.message || 'Invalid or expired reset link');
    },
    onSettled: () => {
      setIsVerifying(false);
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password }) => {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { 
        password 
      });
      return response.data;
    },
    onSuccess: (data) => {
      setMessage(data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please login with your new password.' 
          } 
        });
      }, 3000);
    },
    onError: (error) => {
      setMessage(error.response?.data?.message || 'Failed to reset password');
      // If error indicates token is invalid, update tokenValid state
      if (error.response?.status === 400 || error.response?.status === 410) {
        setTokenValid(false);
      }
    }
  });

  // Alternative: Verify by attempting to reset with empty password
  // Or combine verify and reset in one flow
  const verifyAndResetToken = useMutation({
    mutationFn: async (token) => {
      try {
        // Try to verify token by attempting a reset with empty password
        // This will fail with validation error but show if token is valid
        const response = await axiosInstance.post(`/auth/reset-password/${token}`, {
          password: ''
        });
        return { valid: true, data: response.data };
      } catch (error) {
        if (error.response?.data?.error?.includes('password') || 
            error.response?.status === 422) {
          // Token is valid but password validation failed
          return { valid: true, error: error.response.data };
        }
        // Token is invalid
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.valid) {
        setTokenValid(true);
        setUserEmail(result.data?.email || '');
        setMessage('Token is valid. Set your new password below.');
      }
    },
    onError: (error) => {
      setTokenValid(false);
      setMessage(error.response?.data?.message || 'Invalid or expired reset link');
    },
    onSettled: () => {
      setIsVerifying(false);
    }
  });

  // SIMPLER APPROACH: Combine verify and reset in one step
  // OR don't verify upfront, just try to reset and handle errors

  useEffect(() => {
    if (token) {
      // Option 1: Use verifyTokenMutation if your API supports it
      // verifyTokenMutation.mutate(token);
      
      // Option 2: Use verifyAndResetToken
      // verifyAndResetToken.mutate(token);
      
      // Option 3: Don't verify upfront - just show form and handle errors on submit
      setTokenValid(true); // Assume valid initially
      setIsVerifying(false);
      setMessage('Set your new password below');
    } else {
      setTokenValid(false);
      setMessage('No reset token provided');
      setIsVerifying(false);
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    resetPasswordMutation.mutate({ token, password: newPassword });
  };

  // SIMPLIFIED VERSION: No upfront verification
  const renderForm = () => {
    return (
      <>
        <div className="alert alert-info mb-6">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium">Create a new password for your account</div>
            <div className="mt-1">Make sure it's secure and easy to remember.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">New Password</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input input-bordered w-full pl-10"
                placeholder="••••••••"
                required
                autoFocus
                minLength={6}
              />
            </div>
            <label className="label">
              <span className="label-text-alt">At least 6 characters</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Confirm New Password</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered w-full pl-10"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="btn btn-primary w-full gap-2"
          >
            {resetPasswordMutation.isPending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="btn btn-ghost btn-sm gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {/* Main Card */}
        <div className="bg-base-100 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
            <p className="text-base-content/70">Create your new password</p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`alert ${
              message.includes('successfully') ? 'alert-success' : 
              resetPasswordMutation.isError ? 'alert-error' : 'alert-info'
            } mb-6`}>
              {message.includes('successfully') ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : resetPasswordMutation.isError ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Show form if token exists, show error if reset failed due to invalid token */}
          {token && !resetPasswordMutation.isError ? (
            renderForm()
          ) : (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2">Link Invalid or Expired</h3>
              <p className="text-base-content/70 mb-6">
                This password reset link is no longer valid. Links expire after 1 hour.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="btn btn-primary w-full"
                >
                  Request New Link
                </button>
                <Link to="/login" className="btn btn-outline w-full">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Success Redirect Info */}
        {resetPasswordMutation.isSuccess && (
          <div className="mt-6 text-center">
            <p className="text-sm text-base-content/70">
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;