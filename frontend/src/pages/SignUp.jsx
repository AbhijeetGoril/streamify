import { ShipWheelIcon } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axois.js";

const SignUp = () => {
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState({
    fullName: "",
    password: "",
    email: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!signupData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!signupData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) newErrors.email = "Invalid email";
    if (!signupData.password) newErrors.password = "Password is required";
    else if (signupData.password.length < 6) newErrors.password = "Minimum 6 characters";
    if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    return newErrors;
  };

  // React Query Mutation
  const { mutate: signup, isPending: isLoading } = useMutation({
    mutationFn: async (userData) => {
      try {
        console.log("📤 Sending signup request...");
        const response = await axiosInstance.post("/auth/signup", userData);
        console.log("✅ Signup response:", response.data);
        return response.data;
      } catch (error) {
        console.error("❌ Signup catch error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("🎉 Signup successful, navigating...");
      navigate('/verify-instructions', { 
        state: { 
          email: signupData.email,
          fullName: signupData.fullName,
          message: data.message,
          expiresAt: Date.now() + (15 * 60 * 1000)
        } 
      });
      setSignupData({ fullName: "", password: "", email: "", confirmPassword: "" });
    },
    onError: (error) => {
      console.error("🔥 Signup mutation error:", error);
      
      // Handle different error types
      if (error.code === 'ERR_NETWORK') {
        setErrors({ submit: "Cannot connect to server. Make sure backend is running on port 5001." });
      } else if (error.code === 'ECONNABORTED') {
        setErrors({ submit: "Request timeout. Server is taking too long to respond." });
      } else if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes("Email already exists")) {
          setErrors({ email: "Email already exists. Please use a different email." });
        } else if (errorMessage.includes("Password must be at least")) {
          setErrors({ password: "Password must be at least 6 characters" });
        } else if (errorMessage.includes("Invalid email")) {
          setErrors({ email: "Please enter a valid email address" });
        } else if (errorMessage.includes("All fields are required")) {
          setErrors({ submit: "All fields are required" });
        } else {
          setErrors({ submit: errorMessage });
        }
      } else {
        setErrors({ submit: "Sign up failed. Please try again." });
      }
    },
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});

    // Call the mutation
    signup({
      fullName: signupData.fullName,
      email: signupData.email,
      password: signupData.password,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200" data-theme="forest">
      <div className="border border-primary/20 flex w-full max-w-5xl mx-auto bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col">
          <div className="mb-6 flex items-center justify-start gap-2">
            <ShipWheelIcon className="w-10 h-10 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          <form onSubmit={handleSignUp} className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Create an Account</h2>
              <p className="text-sm opacity-70 mt-1">
                Join Streamify and start your language learning adventure
              </p>
            </div>

            {/* Full Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                className={`input input-bordered w-full ${errors.fullName ? 'input-error' : ''}`}
                value={signupData.fullName}
                onChange={handleChange}
                required
              />
              {errors.fullName && <span className="label-text-alt text-error">{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                value={signupData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="label-text-alt text-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                value={signupData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <span className="label-text-alt opacity-70">Minimum 6 characters</span>
              {errors.password && <span className="label-text-alt text-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                value={signupData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <span className="label-text-alt text-error">{errors.confirmPassword}</span>}
            </div>

            {/* Terms */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" required />
                <span className="label-text text-sm">
                  I agree to the <a href="#" className="link link-primary">Terms</a> and <a href="#" className="link link-primary">Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`} disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Error Message */}
            {errors.submit && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Login Link */}
            <div className="text-center pt-4">
              <span className="text-sm opacity-70">
                Already have an account?{" "}
                <Link to="/login" className="link link-primary font-semibold">Sign In</Link>
              </span>
            </div>
          </form>
        </div>

        {/* Right side Image */}
        <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
          <div className="text-center">
            <img src="/Video-call-bro.png" alt="Video call illustration" className="w-full max-w-md object-contain mb-6" />
            <h3 className="text-xl font-bold mb-2">Start Learning Languages</h3>
            <p className="text-sm opacity-70 max-w-md">
              Join thousands of users who are improving their language skills through interactive video conversations.
            </p>
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-xs opacity-70">
                <strong>Note:</strong> After signing up, you'll receive a verification email. 
                Please verify your email to activate your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;