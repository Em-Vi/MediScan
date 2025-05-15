"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Paperclip,
  X,
  Info,
  Music,
  File,
  Image,
  MessageSquarePlus,
  PanelLeft,
  User,
  LogOut,
  Settings,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextareaInput } from "@/components/textarea-input";
import { LoadingScreen } from "@/components/loading-screen";
import { FileUpload } from "@/components/file-upload";
import { MessageItem } from "@/components/message-item";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { VoiceAssistant } from "@/components/voice-assistant";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";
import {
  type Message,
  type MessageAttachment,
  type ChatSession,
  getMessages,
  sendChatMessage,
  saveChatHistory,
  loadChatSessions,
  createNewChatSession,
  deleteChatSession,
  uploadChatFile,
  uploadAndAnalyzeImage, // Add this import
} from "@/lib/chat-service";
import { v4 as uuidv4 } from "uuid"; // Make sure to import uuid
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/logo";

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useApp();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [pendingAttachment, setPendingAttachment] =
    useState<MessageAttachment | null>(null);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user?.is_verified) {
      router.push("/verify-email");
    }
  }, [user, isLoading, router]);

  // Load chat sessions
  useEffect(() => {
    if (!user) return;

    // Load chat sessions
    const sessions = loadChatSessions(user.id);

    if (sessions.length === 0) {
      // Create a new session if none exist
      const newSession = createNewChatSession(user.id);
      setChatSessions([newSession]);
      setCurrentSessionId(newSession.id);
    } else {
      setChatSessions(sessions);
      setCurrentSessionId(sessions[0].id);
    }
  }, [user]);

  // Load messages for current session
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !currentSessionId) return;

      setIsLoadingMessages(true);

      try {
        const { messages: loadedMessages, error } = await getMessages(
          user.id,
          currentSessionId
        );

        if (error) {
          console.error("Failed to load messages:", error);
          return;
        }

        setMessages(loadedMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (user && currentSessionId) {
      loadMessages();
    }
  }, [user, currentSessionId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (user && currentSessionId && messages.length > 0) {
      saveChatHistory(user.id, messages, currentSessionId);

      // Update chat sessions
      setChatSessions((prev) => {
        const updatedSessions = [...prev];
        const sessionIndex = updatedSessions.findIndex(
          (s) => s.id === currentSessionId
        );

        if (sessionIndex >= 0) {
          updatedSessions[sessionIndex] = {
            ...updatedSessions[sessionIndex],
            lastMessage: messages[messages.length - 1]?.content || "",
            lastMessageDate: new Date(),
            messages,
          };

          // Generate title from first user message if not already set
          if (updatedSessions[sessionIndex].title === "New Conversation") {
            const firstUserMessage = messages.find((m) => m.sender === "user");
            if (firstUserMessage) {
              updatedSessions[sessionIndex].title =
                firstUserMessage.content.substring(0, 30) +
                (firstUserMessage.content.length > 30 ? "..." : "");
            }
          }
        }

        return updatedSessions;
      });
    }
  }, [user, currentSessionId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user || !currentSessionId) return;

    const messageContent = input.trim();
    if (!messageContent && !pendingAttachment) return;

    // Clear input and attachment
    setInput("");

    // Create message object
    const attachments = pendingAttachment ? [pendingAttachment] : undefined;

    try {
      // Send user message and get bot response
      const { userMessage, botMessage, error } = await sendChatMessage(
        user.id,
        currentSessionId,
        messageContent,
        attachments
      );

      if (error) {
        console.error("Failed to send message:", error);
        return;
      }

      if (userMessage) {
        setMessages((prev) => [...prev, userMessage]);
        setLatestMessageId(userMessage.id);
      }

      // Clear pending attachment
      setPendingAttachment(null);
      setShowFileUpload(false);

      // Show bot typing indicator
      setIsTyping(true);

      // Add a small delay to simulate typing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (botMessage) {
        setMessages((prev) => [...prev, botMessage]);
        setLatestMessageId(botMessage.id);
      }

      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(text);
  };

  const handleFileUpload = async (file: File) => {
    if (!user || !currentSessionId) return;

    setIsTyping(true);

    try {
      // Check if it's an image file that might be a prescription
      if (file.type.startsWith("image/")) {
        // Ask user if they want to analyze this as a prescription
        if (confirm("Do you want to analyze this image as a prescription?")) {
          // Use the prescription analysis flow
          const result = await uploadAndAnalyzeImage(user.id, file);

          if (result) {
            // Add user message with the image
            const userMessage: Message = {
              id: uuidv4(),
              content: "Can you analyze this prescription for me?",
              sender: "user",
              timestamp: new Date(),
              attachments: [result.attachment],
            };

            // Add messages with the analysis result (markdown will be rendered automatically)
            setMessages((prev) => [...prev, userMessage]);

            // Wait a moment for better UX
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Add AI response with the analysis
            const aiMessage: Message = {
              id: uuidv4(),
              content: result.analysis, // This contains markdown that will be rendered
              sender: "bot",
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
            setLatestMessageId(aiMessage.id);

            // Save chat history
            saveChatHistory(
              user.id,
              [...messages, userMessage, aiMessage],
              currentSessionId
            );

            // Clear file upload UI
            setShowFileUpload(false);
            return;
          }
        }
      }

      // Default file upload behavior if not a prescription or user declined analysis
      const attachment = await uploadChatFile(user.id, file);
      if (attachment) {
        setPendingAttachment(attachment);
      }
      setShowFileUpload(false);
    } catch (error) {
      console.error("Error uploading file:", error);

      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        content:
          "I'm sorry, I couldn't process that image. Please try again with a clearer image.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setShowFileUpload(false);
    }
  };

  const cancelFileUpload = () => {
    setShowFileUpload(false);
    setPendingAttachment(null);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleNewChat = () => {
    if (!user) return;

    const newSession = createNewChatSession(user.id);
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleProfileClick = (path: string) => {
    router.push(path);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your conversations..." />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-40 h-full w-[280px] border-r bg-background transition-transform duration-300 ease-in-out",
          showSidebar
            ? "translate-x-0 md:relative"
            : "-translate-x-full sm:-translate-x-[280px]"
        )}
      >
        <ChatHistorySidebar
          sessions={chatSessions}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewChat}
          onClose={() => setShowSidebar(false)}
        />
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4">
            {/* Left side controls */}
            <div className="flex items-center gap-4">
              {!showSidebar && (
                <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className={cn("rounded-full", showSidebar && "bg-primary/10")}
                  aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="rounded-full"
                aria-label="New chat"
              >
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
              </>
              )}

              <Logo />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-9 w-9 p-0 overflow-hidden"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleProfileClick("/profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleProfileClick("/contact")}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Contact</span>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => handleProfileClick("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <></>
              )}
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {isLoadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-muted mb-2"></div>
                <div className="h-4 w-32 bg-muted rounded"></div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Info className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Ask MediScan about medications, symptoms, or health concerns.
                You can also upload images, audio, or documents.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  "Medications for migraines?",
                  "How do I treat a common cold?",
                  "Side effects of ibuprofen?",
                  "Is this rash concerning?",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => {
                      setInput(suggestion);
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
                <MessageItem
                  key={message.id}
                  message={message}
                  isLatest={message.id === latestMessageId}
                />
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

        {/* Floating message input */}
        <div className="relative bottom-4 left-0 right-0 mx-auto w-full max-w-3xl px-4 z-10">
          <div className="bg-background border rounded-lg shadow-lg">
            {pendingAttachment && (
              <div className="p-2 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {pendingAttachment.type === "image" && (
                    <Image className="h-4 w-4 text-primary" />
                  )}
                  {pendingAttachment.type === "audio" && (
                    <Music className="h-4 w-4 text-accent" />
                  )}
                  {pendingAttachment.type === "document" && (
                    <File className="h-4 w-4 text-secondary" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">
                    {pendingAttachment.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPendingAttachment(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {showFileUpload ? (
              <div className="p-4">
                <FileUpload
                  onFileUpload={handleFileUpload}
                  onCancel={cancelFileUpload}
                />
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="flex items-end p-2 gap-2"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFileUpload(true)}
                  disabled={isTyping}
                  className="rounded-full flex-shrink-0"
                >
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Attach file</span>
                </Button>

                <VoiceAssistant
                  onTranscript={handleVoiceTranscript}
                  isDisabled={isTyping}
                />

                <div className="flex-1">
                  <TextareaInput
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="rounded-full resize-none"
                    disabled={isTyping}
                    onEnterPress={handleSendMessage}
                  />
                </div>

                <Button
                  type="submit"
                  size="icon"
                  className="bg-gradient-to-r from-medical-blue to-medical-green hover:opacity-90 rounded-full flex-shrink-0"
                  disabled={isTyping || (!input.trim() && !pendingAttachment)}
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
