"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, signup as apiSignup, getCurrentUser, googleSignInApi } from "@/lib/api"; // Import actual API functions
import { type User } from "@/lib/types"; // Import User type

// Define API_URL at the top of the file
const API_URL = process.env.NEXT_PUBLIC_API_URL

type Theme = "light" | "dark" | "light-custom" | "system";

// Update AppContextType interface to include googleSignIn
interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;

  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null; message?: string }>;
  signOut: () => Promise<{ error: string | null }>;
  googleSignIn: () => Promise<{ error: string | null }>;

}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch current user details using token
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const user = await getCurrentUser(); // Use the new getCurrentUser function
      console.log(user)
      setUser(user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setUser(null);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize theme and attempt to load user from token
  useEffect(() => {
    const savedTheme = localStorage.getItem("MediScan-theme") as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setThemeState(systemTheme);
    }
    fetchCurrentUser();
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "light-custom");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem("MediScan-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(email, password);
      if (response && response.access_token) {
        localStorage.setItem("authToken", response.access_token);
        await fetchCurrentUser();
        return { error: null };
      } else {
        return { error: "Login failed: No access token received." };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "An unexpected error occurred during sign-in";
      localStorage.removeItem("authToken");
      setUser(null);
      return { error: errorMessage };
    } finally {
      if (isLoading) setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setIsLoading(true);
    try {
      const response = await apiSignup(email, password, fullName);
      console.log(response);
      if (response && response.message && response.access_token) {
        localStorage.setItem("authToken", response.access_token);
        await fetchCurrentUser();
        return { error: null, message: response.message };
      } else {
        console.error("Unexpected response format during signup:", response);
        return { error: "Signup successful, but unexpected response format." };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "An unexpected error occurred during signup";
      console.error("Error during signup:", error);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem("authToken");
      setUser(null);
      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred during sign-out" };
    } finally {
      setIsLoading(false);
    }
  };

  // Fix error type handling in googleSignIn
  const googleSignIn = async (): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const data = await googleSignInApi();
      if (data && data.access_token) {
        localStorage.setItem("authToken", data.access_token);
        await fetchCurrentUser();
        return { error: null };
      } else {
        return { error: "Google Sign-In failed: No access token received." };
      }
    } catch (error: any) {
      console.error("Error during Google Sign-In:", error);
      return { error: error.message || "An unexpected error occurred during Google Sign-In" };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        googleSignIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

