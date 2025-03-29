"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, Paperclip, X, Info, Music, File, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { FileUpload } from "@/components/file-upload"
import { MessageItem } from "@/components/message-item"
import { ChatHistorySidebar } from "@/components/chat-history-sidebar"
import { VoiceAssistant } from "@/components/voice-assistant"
import { useApp } from "@/contexts/app-context"
import {
  type Message,
  type MessageAttachment,
  type ChatSession,
  mockGetMessages,
  mockSendMessage,
  mockGetBotResponse,
  saveChatHistory,
  loadChatSessions,
  createNewChatSession,
} from "@/lib/supabase"

export default function ChatPage() {
  const router = useRouter()
  const { user, isLoading } = useApp()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null)
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Set logo animation complete after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoAnimationComplete(true)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  // Close sidebar when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && showSidebar) {
        setShowSidebar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSidebar])

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Load chat sessions
  useEffect(() => {
    if (!user) return

    // Load chat sessions
    const sessions = loadChatSessions(user.id)

    if (sessions.length === 0) {
      // Create a new session if none exist
      const newSession = createNewChatSession(user.id)
      setChatSessions([newSession])
      setCurrentSessionId(newSession.id)
    } else {
      setChatSessions(sessions)
      setCurrentSessionId(sessions[0].id)
    }
  }, [user])

  // Load messages for current session
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !currentSessionId) return

      setIsLoadingMessages(true)

      try {
        const { messages: loadedMessages, error } = await mockGetMessages(user.id, currentSessionId)

        if (error) {
          console.error("Failed to load messages:", error)
          return
        }

        setMessages(loadedMessages)
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    if (user && currentSessionId) {
      loadMessages()
    }
  }, [user, currentSessionId])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (user && currentSessionId && messages.length > 0) {
      saveChatHistory(user.id, messages, currentSessionId)

      // Update chat sessions
      setChatSessions((prev) => {
        const updatedSessions = [...prev]
        const sessionIndex = updatedSessions.findIndex((s) => s.id === currentSessionId)

        if (sessionIndex >= 0) {
          updatedSessions[sessionIndex] = {
            ...updatedSessions[sessionIndex],
            lastMessage: messages[messages.length - 1]?.content || "",
            lastMessageDate: new Date(),
            messages,
          }

          // Generate title from first user message if not already set
          if (updatedSessions[sessionIndex].title === "New Conversation") {
            const firstUserMessage = messages.find((m) => m.sender === "user")
            if (firstUserMessage) {
              updatedSessions[sessionIndex].title =
                firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
            }
          }
        }

        return updatedSessions
      })
    }
  }, [user, currentSessionId, messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent, voiceText?: string) => {
    if (e) e.preventDefault()

    if (!user || !currentSessionId) return

    const messageContent = voiceText || input.trim()
    if (!messageContent && !pendingAttachment) return

    // Clear input and attachment
    setInput("")

    // Create message object
    const attachments = pendingAttachment ? [pendingAttachment] : undefined

    try {
      // Send user message
      const { message: userMessage, error: sendError } = await mockSendMessage(
        user.id,
        currentSessionId,
        messageContent,
        attachments,
      )

      if (sendError) {
        console.error("Failed to send message:", sendError)
        return
      }

      if (userMessage) {
        setMessages((prev) => [...prev, userMessage])
        setLatestMessageId(userMessage.id)
      }

      // Clear pending attachment
      setPendingAttachment(null)
      setShowFileUpload(false)

      // Show bot typing indicator
      setIsTyping(true)

      // Get bot response
      const { message: botMessage, error: botError } = await mockGetBotResponse(
        user.id,
        currentSessionId,
        messageContent,
      )

      if (botError) {
        console.error("Failed to get bot response:", botError)
        setIsTyping(false)
        return
      }

      if (botMessage) {
        setMessages((prev) => [...prev, botMessage])
        setLatestMessageId(botMessage.id)
      }

      setIsTyping(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsTyping(false)
    }
  }

  const handleFileUpload = (attachment: MessageAttachment) => {
    setPendingAttachment(attachment)
    setShowFileUpload(false)
  }

  const cancelFileUpload = () => {
    setShowFileUpload(false)
    setPendingAttachment(null)
  }

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setShowSidebar(false)
  }

  const handleNewChat = () => {
    if (!user) return

    const newSession = createNewChatSession(user.id)
    setChatSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setMessages([])
    setShowSidebar(false)
  }

  const handleVoiceTranscript = (text: string) => {
    handleSendMessage(undefined, text)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  if (isLoading || !logoAnimationComplete) {
    return <LoadingScreen message="Loading your conversations..." />
  }

  return (
    <div className="flex flex-col h-screen">
      <Navigation onToggleSidebar={toggleSidebar} onNewChat={handleNewChat} sidebarOpen={showSidebar} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Full-width sidebar overlay */}
        {showSidebar && <div className="fixed inset-0 bg-black/20 z-20" onClick={() => setShowSidebar(false)} />}

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`
            fixed inset-y-16 left-0 z-30 w-full max-w-xs md:max-w-sm lg:max-w-md
            bg-background border-r shadow-lg transition-transform duration-300
            ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <ChatHistorySidebar
            sessions={chatSessions}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewChat}
            onClose={() => setShowSidebar(false)}
          />
        </div>

        <main className="flex-1 flex flex-col w-full h-full">
          {isLoadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-muted mb-2"></div>
                <div className="h-4 w-32 bg-muted rounded"></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Info className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Start a conversation</h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Ask MediScan about medications, symptoms, or health concerns. You can also upload images, audio, or
                    documents.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                    {[
                      "What medications help with migraines?",
                      "How do I treat a common cold?",
                      "What are the side effects of ibuprofen?",
                      "Is this rash concerning?",
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        className="justify-start text-left h-auto py-3"
                        onClick={() => {
                          setInput(suggestion)
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageItem key={message.id} message={message} isLatest={message.id === latestMessageId} />
                  ))}

                  {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="chat-bubble-bot max-w-[80%]">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {pendingAttachment && (
            <div className="mx-4 mb-4 p-2 border rounded-lg bg-muted/30 flex items-center justify-between animate-slide-in-bottom">
              <div className="flex items-center gap-2">
                {pendingAttachment.type === "image" && <Image className="h-4 w-4 text-primary" />}
                {pendingAttachment.type === "audio" && <Music className="h-4 w-4 text-accent" />}
                {pendingAttachment.type === "document" && <File className="h-4 w-4 text-secondary" />}
                <span className="text-sm truncate max-w-[200px]">{pendingAttachment.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPendingAttachment(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showFileUpload ? (
            <div className="p-4">
              <FileUpload onFileUpload={handleFileUpload} onCancel={cancelFileUpload} />
            </div>
          ) : (
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFileUpload(true)}
                  disabled={isTyping}
                  className="rounded-full"
                >
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Attach file</span>
                </Button>

                <VoiceAssistant onTranscript={handleVoiceTranscript} isDisabled={isTyping} />

                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90 rounded-full"
                  disabled={isTyping || (!input.trim() && !pendingAttachment)}
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

