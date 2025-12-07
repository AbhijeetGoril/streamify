import { axiosInstance } from "../lib/axios";

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
