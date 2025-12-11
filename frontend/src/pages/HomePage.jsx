// src/pages/HomePage.jsx - Complete with logout
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Shield, 
  Zap, 
  Sparkles, 
  Smartphone, 
  Globe,
  LogOut,
  User,
  Settings,
  ChevronDown
} from 'lucide-react';
import { axiosInstance } from "../lib/axois.js"; // Adjust path as needed

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Get user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await axiosInstance.post('/auth/logout', {}, { 
        withCredentials: true 
      });
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout API error:', error);
      // Still continue with frontend cleanup even if backend fails
    } finally {
      // Always clear frontend data
      localStorage.clear();
      setUser(null);
      setShowDropdown(false);
      
      // Redirect to login page
      navigate('/login', { replace: true });
    }
  };

  const features = [
    {
      icon: <MessageSquare className="w-10 h-10 text-primary" />,
      title: 'Instant Messaging',
      description: 'Real-time chat with friends, family, or colleagues',
      color: 'bg-primary/10'
    },
    {
      icon: <Users className="w-10 h-10 text-secondary" />,
      title: 'Group Chats',
      description: 'Create unlimited groups with up to 100 members',
      color: 'bg-secondary/10'
    },
    {
      icon: <Shield className="w-10 h-10 text-accent" />,
      title: 'Secure & Private',
      description: 'End-to-end encryption keeps your conversations safe',
      color: 'bg-accent/10'
    }
  ];

  const platforms = [
    { icon: <Globe className="w-8 h-8 text-primary" />, name: 'Web', desc: 'Any browser' },
    { icon: <Smartphone className="w-8 h-8 text-secondary" />, name: 'Mobile', desc: 'iOS & Android' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
      {/* Navigation with Logout */}
      <nav className="navbar px-6 py-4">
        <div className="navbar-start">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span>Streamify</span>
          </Link>
        </div>
        
        <div className="navbar-end">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Simple Logout Button (Always Visible) */}
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm md:btn-md gap-2 text-error hover:text-error hover:bg-error/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn btn-ghost flex items-center gap-2"
                >
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-8">
                      <span className="text-sm">
                        {user?.fullName?.[0] || user?.email?.[0] || 'U'}
                      </span>
                    </div>
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {user?.fullName || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 z-50">
                      <div className="menu dropdown-content bg-base-100 rounded-box shadow-lg border border-base-300 p-2">
                        <div className="px-4 py-3 border-b border-base-300">
                          <p className="font-semibold truncate">{user?.fullName || 'User'}</p>
                          <p className="text-sm text-base-content/60 truncate">{user?.email}</p>
                        </div>
                        <ul className="py-2">
                          <li>
                            <Link to="/profile" className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link to="/settings" className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                          </li>
                          <div className="divider my-1"></div>
                          <li>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 text-error hover:bg-error/10 w-full text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">
                Get Started
                <Sparkles className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="badge badge-primary badge-lg mb-6 gap-1">
              <Zap className="w-3 h-3" />
              {user ? `Welcome back, ${user?.fullName?.split(' ')[0] || 'User'}!` : '100% Free Forever'}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {user ? (
                <>
                  Ready to{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    start chatting
                  </span>
                  ?
                </>
              ) : (
                <>
                  Chat with{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Anyone,
                  </span>{' '}
                  <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    Anywhere
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto mb-10">
              {user
                ? 'Continue your conversations or start new ones'
                : 'Simple, fast, and secure messaging app. No ads, no limits, completely free.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                <>
                  <Link to="/chat" className="btn btn-primary btn-lg px-8">
                    Go to Chat
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline btn-lg">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg px-8">
                    Start Chatting Free
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Already have account?
                  </Link>
                </>
              )}
            </div>

            {/* Chat Demo */}
            <div className="max-w-md mx-auto">
              <div className="card bg-base-100 shadow-2xl border border-base-300">
                <div className="card-body p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="avatar online">
                      <div className="w-10 rounded-full bg-gradient-to-br from-primary to-secondary">
                        <span className="text-white font-bold">A</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Alex</div>
                      <div className="text-xs opacity-60">Online • Typing...</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="chat chat-start">
                      <div className="chat-bubble">Hey! Ready for the call?</div>
                    </div>
                    
                    <div className="chat chat-end">
                      <div className="chat-bubble chat-bubble-primary">Yeah! 5 minutes?</div>
                    </div>
                    
                    <div className="chat chat-start">
                      <div className="chat-bubble">Perfect! See you then 👌</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type your message..." 
                        className="input input-bordered flex-1" 
                        disabled
                      />
                      <button className="btn btn-primary" disabled>
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-base-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-lg text-base-content/70">Powerful features, simple to use</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="card-body items-center text-center">
                  <div className={`p-4 rounded-2xl ${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="card-title mb-2">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Available everywhere</h2>
            <p className="text-lg text-base-content/70">Chat seamlessly across all your devices</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {platforms.map((platform, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-base-100 rounded-2xl shadow hover:shadow-lg transition-shadow">
                {platform.icon}
                <div>
                  <div className="font-bold">{platform.name}</div>
                  <div className="text-sm opacity-60">{platform.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
            <div className="card-body py-12">
              <h2 className="text-3xl font-bold mb-6">
                {user ? 'Continue chatting' : 'Start chatting today'}
              </h2>
              <p className="text-lg mb-8">
                {user
                  ? 'Your conversations are waiting for you'
                  : 'Join thousands of users who enjoy free, secure messaging'}
              </p>
              
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/chat" className="btn btn-primary btn-lg">
                    Go to Chat
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline btn-lg">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg px-10">
                    Create Free Account
                  </Link>
                  <p className="mt-6 text-sm text-base-content/60">
                    No credit card • No ads • No limits
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer p-10 bg-base-300 text-base-content">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Streamify</span>
          </div>
          <p>Simple, free chat for everyone</p>
        </div>
        
        <div>
          <span className="footer-title">Product</span>
          <Link to="/features" className="link link-hover">Features</Link>
          <Link to="/download" className="link link-hover">Download</Link>
          <Link to="/security" className="link link-hover">Security</Link>
        </div>
        
        <div>
          <span className="footer-title">Company</span>
          <Link to="/about" className="link link-hover">About</Link>
          <Link to="/contact" className="link link-hover">Contact</Link>
          <Link to="/blog" className="link link-hover">Blog</Link>
        </div>
        
        <div>
          <span className="footer-title">Legal</span>
          <Link to="/privacy" className="link link-hover">Privacy Policy</Link>
          <Link to="/terms" className="link link-hover">Terms of Service</Link>
        </div>
      </footer>
      
      <div className="footer footer-center p-4 bg-base-300 text-base-content border-t border-base-300">
        <div>
          <p>© {new Date().getFullYear()} Streamify. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;