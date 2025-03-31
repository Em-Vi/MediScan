"use client"

import { Pill } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
  onAnimationComplete?: () => void
}

export function AnimatedLogo({ size = "md", className = "", onAnimationComplete }: AnimatedLogoProps) {
  // Animation states: initial (hidden) -> logo (logo appears) -> text (text emerges) -> complete (animation done)
  const [animationState, setAnimationState] = useState<"initial" | "logo" | "text" | "complete">("initial")

  useEffect(() => {
    // Start animation sequence
    const sequence = async () => {
      // Initial delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Show logo
      setAnimationState("logo")

      // Wait for logo animation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show text
      setAnimationState("text")

      // Wait for text animation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Complete animation
      setAnimationState("complete")

      // Notify parent component
      if (onAnimationComplete) {
        onAnimationComplete()
      }
    }

    sequence()
  }, [onAnimationComplete])

  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32,
  }

  return (
    <div className={cn("flex items-center justify-center transition-all duration-700", sizeClasses[size], className)}>
      {/* Logo */}
      <div
        className={cn("relative transition-all duration-700", {
          "opacity-0 scale-50": animationState === "initial",
          "opacity-100 scale-100": animationState !== "initial",
        })}
      >
        <div className="bg-gradient-to-r from-medical-blue to-medical-green rounded-full p-1">
          <Pill size={iconSizes[size]} className="text-white" />
          <span
            className="absolute inset-0 flex items-center justify-center text-white font-bold"
            style={{ fontSize: `${iconSizes[size] / 3}px` }}
          >
            +
          </span>
        </div>
      </div>

      {/* Text that emerges from logo */}
      <div
        className={cn(
          "ml-2 font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent transition-all duration-1000",
          {
            "opacity-0 -translate-x-8 scale-50": animationState === "initial" || animationState === "logo",
            "opacity-100 translate-x-0 scale-100": animationState === "text" || animationState === "complete",
          },
        )}
      >
        MEDISCAN
      </div>
    </div>
  )
}

