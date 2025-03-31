"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onEnterPress?: () => void
}

export function TextareaInput({ className, onEnterPress, onChange, value, ...props }: TextareaInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto"

    // Set the height to scrollHeight to fit the content
    textarea.style.height = `${textarea.scrollHeight}px`

    // Limit max height
    if (textarea.scrollHeight > 150) {
      textarea.style.height = "150px"
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.overflowY = "hidden"
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && onEnterPress) {
      e.preventDefault()
      onEnterPress()
    }
  }

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[40px] max-h-[150px]",
        className,
      )}
      rows={1}
      onKeyDown={handleKeyDown}
      onChange={onChange}
      value={value}
      {...props}
    />
  )
}

