// src/pages/VerifyInstructionsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axois.js';

const VerifyInstructionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { email, fullName } = location.state || {};
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectTimerRef = useRef(null);

  // React Query: Check verification status
  const { data: verificationStatus, isLoading, error } = useQuery({
    queryKey: ['verification-status', email],
    queryFn: async () => {
      if (!email) return null;
      try {
        const response = await axiosInstance.get(`/auth/check-verification?email=${encodeURIComponent(email)}`);
        return response.data;
      } catch (err) {
        // Handle 401 specifically
        if (err.response?.status === 401) {
          return { isVerified: false, error: 'unauthorized' };
        }
        throw err;
      }
    },
    refetchInterval: 3000,
    enabled: !!email, // Always enabled if we have email
    retry: false,
    refetchOnWindowFocus: false
  });

  // React Query: Resend email mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('/auth/resend-verification', { email });
      return response.data;
    },
    onSuccess: () => {
      setTimeLeft(15 * 60);
    },
    onError: (error) => {
      console.error('Resend error:', error);
    }
  });

  // Handle redirection when verified
  useEffect(() => {
  if (verificationStatus?.isVerified && !hasRedirected) {
    setHasRedirected(true);

    redirectTimerRef.current = setTimeout(() => {
      navigate("/verification-success", { 
        state: { email, fullName }
      });
    }, 2000);
  }

  return () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
  };
}, [verificationStatus?.isVerified]);


  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle resend email
  const handleResendEmail = useCallback(() => {
    if (!email) return;
    resendMutation.mutate();
  }, [email, resendMutation]);

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Safely check if verified (handle undefined/null)
  const isVerified = verificationStatus?.isVerified || false;
  const isUnauthorized = verificationStatus?.error === 'unauthorized';

  // Loading state
  if (isLoading && email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-sm opacity-70">Checking verification status...</p>
        </div>
      </div>
    );
  }

  // No email state
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Email Not Found</h1>
          <p className="mb-6">Please sign up first to receive a verification email.</p>
          <Link to="/signup" className="btn btn-primary">Go to Sign Up</Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="alert alert-error mb-4">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Error Checking Verification</h3>
              <div className="text-xs">Unable to check verification status. Please try again.</div>
            </div>
          </div>
          <Link to="/signup" className="btn btn-primary">Go to Sign Up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8">
        
        {/* Success message when verified */}
        {isVerified && (
          <div className="alert alert-success mb-6 animate-pulse">
            <CheckCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Email Verified!</h3>
              <div className="text-xs">Redirecting you to login...</div>
            </div>
          </div>
        )}

        {/* Show unauthorized message */}
        {isUnauthorized && (
          <div className="alert alert-warning mb-6">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Session Expired</h3>
              <div className="text-xs">Please sign up again to receive a new verification email.</div>
            </div>
          </div>
        )}

        {/* Only show verification instructions if not verified and not unauthorized */}
        {!isVerified && !isUnauthorized && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
              <p className="text-sm text-base-content/70">
                We've sent a verification link to
              </p>
              <p className="font-medium text-primary mt-1 break-all">{email}</p>
            </div>

            {/* Timer */}
            <div className={`${timeLeft <= 60 ? 'bg-error/10 border-error/20' : 'bg-warning/10 border-warning/20'} border rounded-lg p-4 mb-6 transition-colors duration-300`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className={`w-5 h-5 ${timeLeft <= 60 ? 'text-error' : 'text-warning'}`} />
                <span className={`font-semibold ${timeLeft <= 60 ? 'text-error' : 'text-warning'}`}>
                  {timeLeft > 0 ? 'Link Expires In' : 'Link Expired'}
                </span>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-mono font-bold ${timeLeft <= 60 ? 'text-error animate-pulse' : ''}`}>
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs mt-1 opacity-70">minutes : seconds</div>
                {timeLeft <= 0 && (
                  <div className="mt-2 text-error text-sm font-medium">
                    ⚠️ Verification link has expired. Please resend.
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                <div className="badge badge-primary mt-1">1</div>
                <div>
                  <p className="font-medium">Open your email</p>
                  <p className="text-sm opacity-70">Check your inbox (and spam/junk folder)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                <div className="badge badge-primary mt-1">2</div>
                <div>
                  <p className="font-medium">Click the verification link</p>
                  <p className="text-sm opacity-70">The link will activate your account</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                <div className="badge badge-primary mt-1">3</div>
                <div>
                  <p className="font-medium">Start learning!</p>
                  <p className="text-sm opacity-70">Login and begin your language journey</p>
                </div>
              </div>
            </div>

            {/* Resend Button */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleResendEmail}
                disabled={resendMutation.isPending || (timeLeft > (14 * 60) && timeLeft > 0)}
                className={`btn w-full ${resendMutation.isPending ? 'btn-disabled' : 'btn-outline btn-primary'}`}
              >
                {resendMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </button>
              
              {/* Success/Error Messages */}
              {resendMutation.isSuccess && (
                <div className="alert alert-success p-3">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">✅ New verification email sent! Check your inbox.</span>
                </div>
              )}
              
              {resendMutation.isError && (
                <div className="alert alert-error p-3">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">❌ Failed to send verification email. Please try again.</span>
                </div>
              )}
              
              {/* Resend availability message */}
              {timeLeft > (14 * 60) && timeLeft > 0 && (
                <div className="alert alert-warning p-3">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Wait for current link to expire before resending</span>
                </div>
              )}
              
              {timeLeft <= (14 * 60) && timeLeft > 0 && (
                <div className="alert alert-info p-3">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Link expires soon. You can resend now.</span>
                </div>
              )}
              
              {timeLeft <= 0 && !resendMutation.isSuccess && (
                <div className="alert alert-error p-3">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Link has expired. Please resend.</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="space-y-3 pt-4 border-t border-base-300">
          {isVerified ? (
            <div className="text-center">
              <div className="loading loading-spinner loading-sm mr-2"></div>
              <span className="text-sm">Redirecting...</span>
            </div>
          ) : isUnauthorized ? (
            <>
              <Link to="/signup" className="btn btn-primary w-full">
                Sign Up Again
              </Link>
              <Link to="/" className="btn btn-ghost w-full">
                Back to Home
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary w-full">
                Already Verified? Login
              </Link>
              <Link to="/" className="btn btn-ghost w-full">
                Back to Home
              </Link>
              <div className="text-center">
                <button 
                  onClick={() => navigate('/signup', { replace: true })}
                  className="link link-primary text-sm"
                >
                  Need a different email? Sign up again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyInstructionsPage;