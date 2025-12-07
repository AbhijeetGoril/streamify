// lib/axios.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,   // 🔥 MOST IMPORTANT — SEND COOKIES
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Always force credentials ON
axiosInstance.defaults.withCredentials = true;

// Debug request logs
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("➡️ AXIOS REQUEST:", config.method?.toUpperCase(), config.url);
    console.log("🟡 Sending Cookies:", config.withCredentials);
    return config;
  },
  (error) => {
    console.error("❌ REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

// Debug response logs
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("⬅️ AXIOS RESPONSE:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ RESPONSE ERROR:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);
