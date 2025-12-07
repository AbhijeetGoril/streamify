// src/pages/VerificationSuccessPage.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, LogIn, Home } from 'lucide-react';

const VerificationSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  
  // Auto-redirect to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { state: { email, message: 'Email verified successfully!' } });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, email]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8 text-center">
        
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-success/10 rounded-full mb-4">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Email Verified Successfully!</h1>
          
          <p className="text-base-content/70 mb-1">
            Your account is now fully activated
          </p>
          
          {email && (
            <p className="text-sm font-medium text-primary">
              {email}
            </p>
          )}
        </div>

        <div className="alert alert-success mb-6">
          <div>
            <h3 className="font-bold">Welcome to Streamify!</h3>
            <div className="text-xs">You'll be redirected to login in 5 seconds...</div>
          </div>
        </div>

        <div className="space-y-3">
          <Link 
            to="/login" 
            state={{ email, message: 'Email verified successfully!' }}
            className="btn btn-primary w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login to Your Account
          </Link>
          
          <Link to="/" className="btn btn-outline w-full">
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Link>
        </div>
        
        <div className="mt-6 pt-6 border-t border-base-300">
          <p className="text-xs text-base-content/50">
            You can now access all Streamify features including:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="badge badge-sm badge-outline">Video Calls</span>
            <span className="badge badge-sm badge-outline">Chat Rooms</span>
            <span className="badge badge-sm badge-outline">Language Partners</span>
            <span className="badge badge-sm badge-outline">Progress Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccessPage;