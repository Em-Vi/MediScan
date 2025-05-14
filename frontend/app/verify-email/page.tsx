"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { useApp } from "@/contexts/app-context"
import { resendEmail } from "@/lib/api"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user } = useApp()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // If no user is found, we'll use this as a fallback
  const userEmail = user?.email || "your email address"
  const token = localStorage.getItem("authToken") as string;
  
  const handleResendVerification = async () => {
    setIsResending(true)

    try {
      // Simulate API call to resend verification email
       await resendEmail(userEmail, token);

      // Update resend count and potentially disable button
      const newCount = resendCount + 1
      setResendCount(newCount)

      if (newCount >= 3) {
        setResendDisabled(true)
        let timeLeft = 60
        setCountdown(timeLeft)

        const timer = setInterval(() => {
          timeLeft -= 1
          setCountdown(timeLeft)

          if (timeLeft <= 0) {
            clearInterval(timer)
            setResendDisabled(false)
            setResendCount(0)
          }
        }, 1000)
      }

      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Failed to send verification email",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
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
        <CardHeader className="space-y-1 items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to <span className="font-medium">{userEmail}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm">Check your email inbox for the verification link</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm">Click the link in the email to verify your account</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm">Once verified, you'll be able to access all features</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Don't see the email?</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Check your spam folder or request a new verification link using the button below.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={handleResendVerification}
            className="w-full bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90 transition-opacity"
            disabled={isResending || resendDisabled}
          >
            {isResending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Sending...
              </>
            ) : resendDisabled ? (
              `Try again in ${countdown} seconds`
            ) : (
              "Resend Verification Email"
            )}
          </Button>

          <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}