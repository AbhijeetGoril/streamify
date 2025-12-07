// src/pages/VerificationFailedPage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, LogIn, Home } from 'lucide-react';

const VerificationFailedPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const reason = searchParams.get('reason');
  const email = searchParams.get('email');

  const getMessage = () => {
    switch(reason) {
      case 'expired':
        return {
          title: 'Link Expired',
          message: 'The verification link has expired. Verification links are valid for 15 minutes only.',
          icon: '⏰'
        };
      case 'invalid':
        return {
          title: 'Invalid Link',
          message: 'The verification link is invalid or has already been used.',
          icon: '❌'
        };
      case 'already':
        return {
          title: 'Already Verified',
          message: 'This email address is already verified. You can login directly.',
          icon: '✅'
        };
      default:
        return {
          title: 'Verification Failed',
          message: 'Something went wrong with the verification process.',
          icon: '⚠️'
        };
    }
  };

  const { title, message, icon } = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-error/10 rounded-full mb-4">
            <XCircle className="w-10 h-10 text-error" />
          </div>
          
          <div className="text-3xl mb-2">{icon}</div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-base-content/70">{message}</p>
        </div>

        <div className="space-y-4">
          {reason === 'expired' && email && (
            <Link 
              to="/verify-instructions" 
              state={{ email }}
              className="btn btn-primary w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Get New Verification Link
            </Link>
          )}
          
          <Link 
            to="/login" 
            state={{ email: email || '' }}
            className="btn btn-outline w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Go to Login Page
          </Link>
          
          <Link to="/" className="btn btn-ghost w-full">
            <Home className="w-4 h-4 mr-2" />
            Back to Homepage
          </Link>
        </div>

        {/* Troubleshooting tips */}
        <div className="mt-8 pt-6 border-t border-base-300">
          <h3 className="font-bold mb-3">Need Help?</h3>
          <ul className="text-sm space-y-2 text-base-content/70">
            <li className="flex items-start gap-2">
              <span className="badge badge-xs badge-outline mt-1">1</span>
              <span>Check if you're using the latest verification link</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="badge badge-xs badge-outline mt-1">2</span>
              <span>Make sure you're logged into the correct email account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="badge badge-xs badge-outline mt-1">3</span>
              <span>Try copying and pasting the link directly into your browser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="badge badge-xs badge-outline mt-1">4</span>
              <span>Contact support if the problem persists</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerificationFailedPage;