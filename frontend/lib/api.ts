/**
 * Centralized API Client and Configuration for PrepPilot AI
 * Connects Next.js Frontend to FastAPI Backend (Production & Local)
 */
import axios from "axios";

// Deployed FastAPI Backend fallback or env configuration
export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://social-impact-hackathon.vercel.app"
).replace(/\/+$/, "");

/**
 * Pre-configured Axios instance for calling the FastAPI Backend
 */
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor to handle standardized error reporting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Network connection error";
    return Promise.reject(new Error(errorMsg));
  }
);

export default apiClient;
