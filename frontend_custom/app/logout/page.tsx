"use client"

import { CardFooter } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { LoadingScreen } from "@/components/loading-screen"
import { useApp } from "@/contexts/app-context"

export default function LogoutPage() {
  const router = useRouter()
  const { signOut, user, isLoading } = useApp()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setError(null)

    try {
      const { error } = await signOut()

      if (error) {
        setError(error)
        setIsLoggingOut(false)
        return
      }

      router.push("/")
    } catch (err) {
      setError("An unexpected error occurred")
      setIsLoggingOut(false)
    }
  }

  const handleCancel = () => {
    router.push("/chat")
  }

  if (isLoading) {
    return <LoadingScreen message="Preparing logout..." />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1 items-center">
          <Logo size="lg" />
          <div className="mt-6 bg-muted/50 p-4 rounded-full">
            <LogOut className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center mt-4">Logout Confirmation</CardTitle>
          <CardDescription className="text-center">
            Are you sure you want to logout from your MediScan account?
          </CardDescription>
        </CardHeader>

        {error && (
          <CardContent>
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90 transition-opacity"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Yes, Logout"}
          </Button>
          <Button variant="outline" onClick={handleCancel} className="w-full" disabled={isLoggingOut}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

