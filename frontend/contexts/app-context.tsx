"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type User, mockSignIn, mockSignUp, mockSignOut, mockGoogleSignIn } from "@/lib/supabase"

type Theme = "light" | "dark" | "light-custom" | "system"

interface AppContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  googleSignIn: () => Promise<{ error: string | null }>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("AutoDoc-theme") as Theme | null

    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setThemeState(systemTheme)
    }

    // Check for existing user session
    const savedUser = localStorage.getItem("AutoDoc_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Failed to parse user data:", error)
      }
    }

    setIsLoading(false)
  }, [])

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove("light", "dark", "light-custom")

    // Apply the selected theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    // Save to localStorage
    localStorage.setItem("AutoDoc-theme", theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { user: newUser, error } = await mockSignIn(email, password)

      if (error) {
        return { error }
      }

      setUser(newUser)
      return { error: null }
    } catch (error) {
      return { error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true)
    try {
      const { user: newUser, error } = await mockSignUp(email, password, fullName)

      if (error) {
        return { error }
      }

      setUser(newUser)
      return { error: null }
    } catch (error) {
      return { error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      const { error } = await mockSignOut()

      if (error) {
        return { error }
      }

      setUser(null)
      return { error: null }
    } catch (error) {
      return { error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const googleSignIn = async () => {
    setIsLoading(true)
    try {
      const { user: newUser, error } = await mockGoogleSignIn()

      if (error) {
        return { error }
      }

      setUser(newUser)
      return { error: null }
    } catch (error) {
      return { error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

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
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

