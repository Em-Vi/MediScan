"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceAssistantProps {
  onTranscript: (text: string) => void
  isDisabled?: boolean
}

export function VoiceAssistant({ onTranscript, isDisabled = false }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)
  const recognitionRef = useRef<any>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const result = event.results[current]
          const transcriptText = result[0].transcript

          setTranscript(transcriptText)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setError(`Error: ${event.error}`)
          stopListening()
        }

        recognitionRef.current.onend = () => {
          if (isListening) {
            // If we're still supposed to be listening, restart
            recognitionRef.current.start()
          }
        }
      } else {
        setError("Speech recognition not supported in this browser")
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startListening = async () => {
    setError(null)
    setTranscript("")

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio processing for volume visualization
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)

      analyserRef.current.fftSize = 256
      microphoneRef.current.connect(analyserRef.current)

      const updateVolume = () => {
        if (!analyserRef.current) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate volume
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
        setVolume(average / 128) // Normalize to 0-1

        animationFrameRef.current = requestAnimationFrame(updateVolume)
      }

      updateVolume()

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
      }
    } catch (err) {
      console.error("Error accessing microphone", err)
      setError("Could not access microphone")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    setIsListening(false)

    // Submit the transcript if there's any
    if (transcript.trim()) {
      onTranscript(transcript)
    }
  }

  return (
    <div className="relative">
      {error && (
        <div className="absolute -top-10 left-0 right-0 bg-destructive/10 text-destructive text-xs p-2 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant={isListening ? "default" : "outline"}
        size="icon"
        className={`rounded-full relative ${isListening ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`}
        onClick={isListening ? stopListening : startListening}
        disabled={isDisabled || !!error}
      >
        {isListening ? (
          <>
            <StopCircle className="h-5 w-5" />
            {/* Voice visualization */}
            <div
              className="absolute inset-0 rounded-full border-4 border-destructive animate-pulse"
              style={{
                transform: `scale(${1 + volume * 0.5})`,
                opacity: 0.5,
              }}
            />
          </>
        ) : (
          <Mic className="h-5 w-5" />
        )}
        <span className="sr-only">{isListening ? "Stop recording" : "Start voice input"}</span>
      </Button>

      {isListening && transcript && (
        <div className="absolute -top-10 left-0 right-0 bg-background border rounded-md p-2 text-xs animate-fade-in">
          {transcript}
        </div>
      )}
    </div>
  )
}

