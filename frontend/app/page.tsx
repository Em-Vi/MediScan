"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingScreen } from "@/components/loading-screen"
import { useApp } from "@/contexts/app-context"

export default function LandingPage() {
  const router = useRouter()
  const { user, isLoading } = useApp()

  // Redirect to chat if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/chat")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container flex justify-between items-center py-6">
        
          <Logo size="lg" animate={true} />
        
        <div className="relative right-4 flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
            Your AI Medical Drug Assistant
          </h1>

          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Get personalized medical drug recommendations based on your symptoms and health profile. Powered by advanced
            AI to help you make informed health decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-sm text-muted-foreground">© 2023 AutoDoc. All rights reserved.</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

