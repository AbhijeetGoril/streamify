// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle,
  Loader,
  Send
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axois.js';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Request reset link mutation
  const requestResetMutation = useMutation({
    mutationFn: async (email) => {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    },
    onSuccess: (data) => {
      setMessage(data.message || 'Password reset link sent to your email');
    },
    onError: (error) => {
      setMessage(error.response?.data?.message || 'Failed to send reset link');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }
    requestResetMutation.mutate(email);
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
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-base-content/70">
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className={`alert ${message.includes('sent') ? 'alert-success' : 'alert-warning'} mb-6`}>
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">
                  {message.includes('sent') ? 'Success!' : 'Notice'}
                </span>
                <div className="text-sm mt-1">{message}</div>
                {message.includes('sent') && (
                  <div className="mt-2">
                    <Link to="/login" className="btn btn-sm btn-success">
                      Return to Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  required
                  autoFocus
                  disabled={requestResetMutation.isSuccess}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={requestResetMutation.isPending || requestResetMutation.isSuccess}
              className="btn btn-primary w-full gap-2"
            >
              {requestResetMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-base-300">
            <div className="text-sm text-base-content/70 space-y-2">
              <p className="font-medium">What happens next?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>We'll send a reset link to your email</li>
                <li>Click the link in the email</li>
                <li>Set your new password</li>
                <li>Login with your new password</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <p className="text-base-content/70">
            Remembered your password?{' '}
            <Link to="/login" className="link link-primary font-medium">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;