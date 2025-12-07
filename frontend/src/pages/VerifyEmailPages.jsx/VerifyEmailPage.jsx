// src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axois.js';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Verify email with token
  const { isLoading, error, data } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      console.log('🔐 One-time verification for token:', token);
      
      if (!token) {
        throw new Error('Verification token is missing');
      }
      
      try {
        const response = await axiosInstance.get(`/auth/verify-email/${token}`);
        console.log('✅ One-time verification response:', response.data);
        return response.data;
      } catch (err) {
        console.log('❌ One-time verification failed:', {
          status: err.response?.status,
          data: err.response?.data
        });
        throw err;
      }
    },
    enabled: !!token,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 5,
  });

  // Handle the query response
  useEffect(() => {
    if (data) {
      console.log('🎉 Query data received:', data);
      
      if (data.error === 'ALREADY_VERIFIED') {
        setStatus('already_verified');
      } else if (data.success) {
        console.log("verified");
        setStatus('success');
        
        // Store user info if needed
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else {
        setStatus('error');
      }
    }
  }, [data]);

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.log('🚨 Query error:', error.response?.data);
      
      const errorData = error.response?.data;
      const errorType = errorData?.error;
      
      if (error.response?.status === 400) {
        if (errorType === 'TOKEN_EXPIRED') {
          setStatus('expired');
        } else if (errorType === 'ALREADY_VERIFIED' || errorType === 'TOKEN_USED') {
          setStatus('already_verified');
        } else if (errorType === 'TOKEN_INVALID' || errorType === 'INVALID_TOKEN_FORMAT') {
          setStatus('invalid');
        } else {
          setStatus('error');
        }
      } else if (error.response?.status === 200 && errorType === 'ALREADY_VERIFIED') {
        setStatus('already_verified');
      } else {
        setStatus('error');
      }
    }
  }, [error]);

  // Auto-redirect on success with countdown
  useEffect(() => {
    if (status === 'success' || status === 'already_verified') {
      const timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login', { 
              state: { 
                message: status === 'success' 
                  ? '🎉 Email verified successfully! Please login to continue.'
                  : '✅ Your email was already verified. Please login.',
                verifiedEmail: true 
              } 
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  // Show countdown timer in success/verified states
  const renderRedirectMessage = () => (
    <div className="alert alert-info mt-4">
      <div className="flex items-center gap-2">
        <Loader className="w-4 h-4 animate-spin" />
        <span>Redirecting to login in {redirectCountdown} seconds...</span>
      </div>
      <button
        onClick={() => navigate('/login', { 
          state: { 
            message: status === 'success' 
              ? '🎉 Email verified successfully! Please login to continue.'
              : '✅ Your email was already verified. Please login.',
            verifiedEmail: true 
          } 
        })}
        className="btn btn-sm btn-link ml-auto"
      >
        Click here if not redirected
      </button>
    </div>
  );

  // Loading state
  if (isLoading || status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6 animate-pulse">
            <Loader className="w-12 h-12 text-primary animate-spin" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Verifying Your Email</h1>
          <p className="text-base-content/70 mb-8">
            Please wait while we verify your email address...
          </p>
          
          <div className="text-xs text-base-content/50 mt-4 bg-base-200 p-2 rounded">
            <div className="font-mono break-all">
              Token: {token ? `${token.substring(0, 20)}...` : 'No token provided'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-error/10 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-error" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-error">Invalid Token</h1>
          <p className="text-base-content/70 mb-6">
            The verification link is invalid or malformed.
          </p>
          
          {error?.response?.data?.message && (
            <div className="alert alert-warning mb-6">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error.response.data.message}</span>
            </div>
          )}
          
          <div className="space-y-3">
            <Link to="/signup" className="btn btn-primary w-full">
              Sign Up Again
            </Link>
            
            <Link to="/" className="btn btn-ghost w-full">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-success/10 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-success">Email Verified!</h1>
          <p className="text-base-content/70 mb-6">
            {data?.message || 'Your email has been successfully verified!'}
          </p>
          
          {renderRedirectMessage()}
          
          <div className="space-y-3 mt-6">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-success w-full gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Go to Login Now
            </button>
            
            <Link to="/" className="btn btn-outline w-full">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Already verified state
  if (status === 'already_verified') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-info/10 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-info" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-info">Already Verified</h1>
          <p className="text-base-content/70 mb-6">
            Your email was already verified previously.
          </p>
          
          {renderRedirectMessage()}
          
          <div className="space-y-3 mt-6">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-info w-full gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Go to Login
            </button>
            
            <Link to="/" className="btn btn-outline w-full">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Expired token state
  if (status === 'expired') {
    const email = error?.response?.data?.email;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-warning/10 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-warning" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-warning">Link Expired</h1>
          <p className="text-base-content/70 mb-6">
            This verification link has expired. Links are valid for 15 minutes only.
          </p>
          
          <div className="space-y-3">
            {email && (
              <button
                onClick={() => navigate('/verify-instructions', { state: { email } })}
                className="btn btn-warning w-full gap-2"
              >
                <Mail className="w-4 h-4" />
                Request New Verification Email
              </button>
            )}
            
            <Link to="/login" className="btn btn-outline w-full">
              Go to Login
            </Link>
            
            <Link to="/" className="btn btn-ghost w-full">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state (general error)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-error/10 rounded-full mb-6">
          <XCircle className="w-12 h-12 text-error" />
        </div>
        
        <h1 className="text-3xl font-bold mb-3 text-error">Verification Failed</h1>
        
        <div className="space-y-4 mb-6">
          <p className="text-base-content/70">
            {error?.response?.data?.message || error?.message || 'Unable to verify your email address.'}
          </p>
          
          {error?.response?.data && (
            <div className="alert alert-error text-left">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium">Error Details:</div>
                <div className="font-mono text-xs mt-1">
                  Status: {error.response.status}<br />
                  Error: {error.response.data.error}<br />
                  Message: {error.response.data.message}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Link to="/signup" className="btn btn-primary w-full">
            Sign Up Again
          </Link>
          
          <Link to="/" className="btn btn-ghost w-full">
            Back to Home
          </Link>
        </div>
        
        <div className="mt-6 pt-6 border-t border-base-300">
          <p className="text-sm text-base-content/60">
            Token: {token?.substring(0, 20)}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

// Remove the backend function from this file - it should be in a separate server-side file