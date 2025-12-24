import { axiosInstance } from "../lib/axois.js";

export async function signupUser(signupData) {
  try {
    const res = await axiosInstance.post("/auth/signup", signupData);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Sign up failed"
    );
  }
}

export const getAuthUser= async()=>{
  try {
     const res=await axiosInstance.get("/auth/me")
  return res.data
  } catch (error) {
    console.log(error)
    return null
  }
 
}

export const completeOnboarding=async(userData)=>{
  const res=await axiosInstance.post("/auth/onboarding",userData)
  return res.data
}

export const logout= async()=>{
  const res=await axiosInstance.post("/auth/logout")
  return res.data
}