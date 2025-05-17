"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { verifyEmail } from "@/lib/api"

type VerificationStatus = "loading" | "success" | "error"

function VerifyEmailConfirmPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>("success")
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get("token")


    if (!token) {
      setStatus("error")
      setError("Verification token is missing")
      return
    }

    const verifySendEmail = async () => {
      try {
        // Simulate API call to verify email
        await verifyEmail(token)

        // For demo purposes, we'll verify based on token length
        // In a real app, you would validate the token with your backend
        if (token.length > 10) {
          setStatus("success")
        } else {
          setStatus("error")
          setError("Invalid or expired verification token")
        }
      } catch (error) {
        setStatus("error")
        setError("Failed to verify email. Please try again.")
      }
    }

    verifySendEmail()
  }, [])

  const handleResendVerification = async () => {
    setIsResending(true)

    try {
      // Simulate API call to resend verification email
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      setError("A new verification email has been sent to your inbox.")
    } catch (error) {
      setError("Failed to send verification email. Please try again later.")
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
          {status === "loading" && (
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}

          {status === "success" && (
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
          )}

          {status === "error" && (
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
          )}

          <CardTitle className="text-2xl font-bold text-center">
            {status === "loading" && "Verifying Your Email"}
            {status === "success" && "Email Verified Successfully"}
            {status === "error" && "Email Verification Failed"}
          </CardTitle>

          <CardDescription className="text-center">
            {status === "loading" && "Please wait while we verify your email address..."}
            {status === "success" && "Your email has been verified"}
            {status === "error" && (error || "We couldn't verify your email address")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "loading" && (
            <div className="flex justify-center items-center py-8">
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Your account is now verified!</p>
              <p className="text-xs text-green-700 dark:text-green-400">
                You can now access all features of MediScan. Click the button below to log in to your account.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Verification failed</p>
              <p className="text-xs text-red-700 dark:text-red-400">
                The verification link may have expired or is invalid. You can request a new verification email using the
                button below.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          {status === "success" && (
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90 transition-opacity"
            >
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}


          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense>
      <VerifyEmailConfirmPageInner />
    </Suspense>
  )
}