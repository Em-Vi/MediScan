import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if window is defined (to ensure localStorage is available - for Next.js SSR/SSG)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("authToken"); // Assuming token is stored with key 'authToken'
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
