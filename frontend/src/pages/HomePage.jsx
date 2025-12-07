// src/pages/HomePage.jsx (simplified version)
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold">Streamify</div>
        <div className="space-x-4">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>
      
      {/* Hero section */}
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to Streamify</h1>
        <p className="text-lg mb-8">Learn languages through video conversations</p>
        <Link to="/signup" className="btn btn-primary btn-lg">
          Get Started Free
        </Link>
      </div>
    </div>
  );
};

export default HomePage;