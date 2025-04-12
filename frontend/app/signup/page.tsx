"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingScreen } from "@/components/loading-screen"
import { GoogleSignIn } from "@/components/google-signin"
import { useApp } from "@/contexts/app-context"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, user, isLoading } = useApp()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/chat")
    }
  }, [user, isLoading, router])

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName)

      if (error) {
        setErrors((prev) => ({ ...prev, general: error }))
        return
      }

      router.push("/chat")
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: "An unexpected error occurred" }))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Setting up your account..." />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="absolute top-4 left-4">
        <Logo />
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your AutoDoc account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Your Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90 transition-opacity"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative px-4 bg-card text-xs text-muted-foreground">OR CONTINUE WITH</div>
            </div>

            <GoogleSignIn mode="signup" />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

