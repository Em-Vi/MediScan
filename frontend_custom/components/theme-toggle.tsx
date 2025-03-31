"use client"

import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useApp()

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${theme === "dark" ? "opacity-0 scale-0 rotate-90" : "opacity-100 scale-100 rotate-0"}`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${theme === "dark" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 rotate-90"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

