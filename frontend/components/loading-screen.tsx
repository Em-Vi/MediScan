"use client"

import { Pill, Heart, Activity } from "lucide-react"
import { useEffect, useState } from "react"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 transition-opacity duration-300">
      <div className="relative mb-8">
        {/* Animated circles */}
        <div className="medical-pulse w-32 h-32"></div>
        <div className="medical-pulse w-40 h-40" style={{ animationDelay: "0.5s" }}></div>
        <div className="medical-pulse w-48 h-48" style={{ animationDelay: "1s" }}></div>

        {/* Spinning rings */}
        {/* <div className="loading-logo-circle w-24 h-24"></div>
        <div
          className="loading-logo-circle w-32 h-32"
          style={{ animationDelay: "0.2s", borderTopColor: "hsl(var(--secondary))" }}
        ></div> */}

        {/* Center logo */}
        <div className="relative animate-float">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <Activity className="h-6 w-6 text-accent animate-pulse-scale" />
          </div>
          <div className="bg-gradient-to-r from-medical-blue to-medical-green rounded-full p-4 shadow-lg">
            <Pill size={40} className="text-white" />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <Heart className="h-5 w-5 text-destructive animate-bounce-small" />
          </div>
        </div>
      </div>

      {/* {showText && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent mb-2 animate-pulse-scale">
            MediScan
          </h2>
          <p className="text-muted-foreground animate-fade-in">{message}</p>
        </div>
      )} */}
    </div>
  )
}

