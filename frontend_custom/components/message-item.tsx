"use client"

import { useState, useRef, useEffect } from "react"
import { FileText, Download, Play, Pause, Image, File } from "lucide-react"
import type { Message } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

interface MessageItemProps {
  message: Message
  isLatest?: boolean
}

export function MessageItem({ message, isLatest = false }: MessageItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLatest && messageRef.current) {
      messageRef.current.classList.add("animate-slide-in-bottom")
    }
  }, [isLatest])

  const formatTime = (date: Date | string) => {
    if (!date) return "N/A"
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayAudio = (url: string) => {
    if (!audioElement) {
      const audio = new Audio(url)

      audio.addEventListener("loadedmetadata", () => {
        setAudioDuration(audio.duration)
      })

      audio.addEventListener("timeupdate", () => {
        setAudioProgress((audio.currentTime / audio.duration) * 100)
      })

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setAudioProgress(0)
      })

      setAudioElement(audio)

      audio.play()
      setIsPlaying(true)
    } else {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        audioElement.play()
        setIsPlaying(true)
      }
    }
  }

  const renderAttachment = (attachment: any) => {
    switch (attachment.type) {
      case "image":
        return (
          <div className="mt-2 file-upload-preview">
            <img
              src={attachment.url || "/placeholder.svg"}
              alt={attachment.name}
              className="w-full h-auto max-h-60 object-contain rounded-lg"
            />
            <div className="flex justify-between items-center p-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                <span className="text-xs truncate max-w-[200px]">{attachment.name}</span>
              </div>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )

      case "audio":
        return (
          <div className="mt-2 audio-player">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex-shrink-0"
                onClick={() => handlePlayAudio(attachment.url)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium truncate max-w-[150px]">{attachment.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {audioElement ? formatAudioTime(audioElement.currentTime) : "0:00"} /
                    {audioDuration ? formatAudioTime(audioDuration) : "0:00"}
                  </div>
                </div>
                <div className="h-1.5 bg-muted-foreground/20 rounded-full">
                  <div
                    className={`h-full bg-primary rounded-full transition-all ${isPlaying ? "duration-300" : ""}`}
                    style={{ width: `${audioProgress}%` }}
                  ></div>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8 flex-shrink-0">
                <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )

      case "document":
        return (
          <div className="mt-2 document-preview">
            <div className="bg-primary/10 p-2 rounded">
              {attachment.fileExtension === "pdf" ? (
                <FileText className="h-6 w-6 text-primary" />
              ) : (
                <File className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs text-muted-foreground">
                {attachment.fileExtension.toUpperCase()} • {(attachment.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div ref={messageRef} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`${message.sender === "user" ? "chat-bubble-user" : "chat-bubble-bot"} max-w-[85%] break-words`}>
        {message.content && <div className="mb-1 whitespace-pre-wrap">{message.content}</div>}

        {message.attachments &&
          message.attachments.map((attachment) => <div key={attachment.id}>{renderAttachment(attachment)}</div>)}

        <div className="text-xs opacity-70 text-right">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  )
}

