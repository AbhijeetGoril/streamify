import React, { useEffect, useState } from "react";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../api/auth";
import { CameraIcon, ShuffleIcon } from "lucide-react";
import { LANGUAGE_TO_FLAG } from "../constants";
import Flag from "react-country-flag"; 

const LANGUAGES = Object.keys(LANGUAGE_TO_FLAG);

const OnboardingPage = () => {
  const { authUser, isLoading } = useAuthUser();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    location: "",
    profilePic: "",
  });

  // Generate initial random avatar on component mount
  useEffect(() => {
    const generateInitialAvatar = () => {
      const seed = Math.random().toString(36).substring(2, 10);
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    };

    if (authUser) {
      setFormData({
        bio: authUser.bio || "",
        nativeLanguage: authUser.nativeLanguage || "",
        learningLanguage: authUser.learningLanguage || "",
        location: authUser.location || "",
        profilePic: authUser.profilePic || generateInitialAvatar(),
      });
    } else if (!isLoading) {
      // If no authUser yet but loading is done, generate a random avatar
      const seed = Math.random().toString(36).substring(2, 10);
      setFormData(prev => ({
        ...prev,
        profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      }));
    }
  }, [authUser, isLoading]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate random avatar
  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 10);
    setFormData(prev => ({
      ...prev,
      profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    }));
  };

  // Submit - Send all required fields including profilePic
  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      // Handle specific backend errors
      if (error.response?.data?.missingFields) {
        const missing = error.response.data.missingFields.join(", ");
        toast.error(`Please fill in: ${missing}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Failed to update profile");
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data that matches the backend API
    const submissionData = {
      bio: formData.bio.trim(),
      nativeLanguage: formData.nativeLanguage,
      learningLanguage: formData.learningLanguage,
      location: formData.location.trim(),
      profilePic: formData.profilePic, // Now required by API
    };
    
    // Validation - all fields are required
    const errors = [];
    if (!submissionData.bio) errors.push("bio");
    if (!submissionData.nativeLanguage) errors.push("native language");
    if (!submissionData.learningLanguage) errors.push("learning language");
    if (!submissionData.location) errors.push("location");
    if (!submissionData.profilePic) errors.push("profile picture");
    
    if (errors.length > 0) {
      toast.error(`Please fill in: ${errors.join(", ")}`);
      return;
    }
    
    // Ensure profilePic is a valid URL
    if (!submissionData.profilePic.startsWith('http')) {
      toast.error("Please generate a valid profile picture");
      return;
    }
    
    onboardingMutation(submissionData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-3xl shadow-xl">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-center mb-2">
            Complete Your Profile
          </h1>
          <p className="text-center text-base-content/70 mb-8">
            Set up your language learning profile
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section (Now required by API) */}
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden bg-neutral shadow-lg border-4 border-base-200">
                {formData.profilePic ? (
                  <img
                    src={formData.profilePic}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-focus">
                    <CameraIcon className="size-16 opacity-40" />
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={generateRandomAvatar}
                  className="btn btn-accent flex items-center gap-2"
                  disabled={isPending}
                >
                  <ShuffleIcon className="size-4" />
                  Generate Random Avatar
                </button>
                <p className="text-sm text-base-content/70 text-center">
                  Click to generate a random profile picture
                </p>
                {!formData.profilePic && (
                  <div className="badge badge-warning gap-1 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    Profile picture required
                  </div>
                )}
              </div>
            </div>

            {/* Full Name Display (Read-only from authUser) */}
            {authUser?.fullName && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Full Name</span>
                </label>
                <div className="input input-bordered w-full bg-base-200 flex items-center">
                  {authUser.fullName}
                </div>
                <div className="label">
                  <span className="label-text-alt">
                    Your name is set from registration
                  </span>
                </div>
              </div>
            )}

            {/* Bio */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Bio *</span>
                <span className="label-text-alt text-error">Required</span>
              </label>
              <textarea
                name="bio"
                className="textarea textarea-bordered w-full"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself and your language learning goals..."
                maxLength={200}
                required
              />
              <div className="label">
                <span className="label-text-alt">
                  {formData.bio.length}/200 characters
                </span>
              </div>
            </div>

            {/* Language Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Native Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Native Language *</span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <div className="flex items-center gap-3">
                  {formData.nativeLanguage ? (
                    <div className="flex items-center gap-2">
                      <Flag
                        countryCode={
                          LANGUAGE_TO_FLAG[formData.nativeLanguage] || "US"
                        }
                        svg
                        style={{ width: '24px', height: '24px' }}
                        title={formData.nativeLanguage}
                      />
                    </div>
                  ) : (
                    <div className="w-6"></div>
                  )}
                  <select
                    name="nativeLanguage"
                    className="select select-bordered flex-1"
                    value={formData.nativeLanguage}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Learning Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Learning Language *</span>
                  <span className="label-text-alt text-error">Required</span>
                </label>
                <div className="flex items-center gap-3">
                  {formData.learningLanguage ? (
                    <div className="flex items-center gap-2">
                      <Flag
                        countryCode={
                          LANGUAGE_TO_FLAG[formData.learningLanguage] || "US"
                        }
                        svg
                        style={{ width: '24px', height: '24px' }}
                        title={formData.learningLanguage}
                      />
                    </div>
                  ) : (
                    <div className="w-6"></div>
                  )}
                  <select
                    name="learningLanguage"
                    className="select select-bordered flex-1"
                    value={formData.learningLanguage}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select language you're learning</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`learning-${lang}`} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Location *</span>
                <span className="label-text-alt text-error">Required</span>
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g., New York, USA"
                className="input input-bordered w-full"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit */}
            <div className="form-control pt-6">
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={isPending || !formData.profilePic}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  "Complete Onboarding"
                )}
              </button>
              <div className="label mt-2">
                <span className="label-text-alt text-center">
                  <span className="text-error">*</span> All fields are required
                </span>
              </div>
              {!formData.profilePic && (
                <div className="alert alert-warning mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Please generate a profile picture before submitting</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;