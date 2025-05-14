// import { createBrowserClient } from '@supabase/ssr'


// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// export const supabase = createBrowserClient(
//   supabaseUrl,
//   supabaseAnonKey
//   )

// // Export helper functions for client-side use
// export const getSupabaseClient = () => supabase

// export type FileType = "image" | "audio" | "document" | "text"

// export interface MessageAttachment {
//   id: string
//   url: string
//   type: FileType
//   name: string
//   size: number
//   fileExtension: string
// }

// export interface Message {
//   id: string
//   content: string
//   sender: "user" | "bot"
//   timestamp: Date
//   attachments?: MessageAttachment[]
// }

// export interface ChatSession {
//   id: string
//   title: string
//   lastMessage: string
//   lastMessageDate: Date
//   messages: Message[]
// }

// export interface User {
//   id: string
//   email: string
//   fullName: string
//   createdAt: Date
//   lastLogin: Date
//   avatar?: string
//   provider?: "email" | "google"
// }

// // Chat history storage
// export const saveChatHistory = (userId: string, messages: Message[], sessionId: string) => {
//   // Get existing chat sessions
//   const sessionsJson = localStorage.getItem(`mediscan_sessions_${userId}`)
//   let sessions: ChatSession[] = []

//   if (sessionsJson) {
//     try {
//       sessions = JSON.parse(sessionsJson)
//     } catch (error) {
//       console.error("Failed to parse chat sessions:", error)
//     }
//   }

//   // Find the current session
//   const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

//   if (sessionIndex >= 0) {
//     // Update existing session
//     sessions[sessionIndex].messages = messages
//     sessions[sessionIndex].lastMessage = messages[messages.length - 1]?.content || ""
//     sessions[sessionIndex].lastMessageDate = new Date()

//     // Generate title from first user message if not already set
//     if (sessions[sessionIndex].title === "New Conversation") {
//       const firstUserMessage = messages.find((m) => m.sender === "user")
//       if (firstUserMessage) {
//         sessions[sessionIndex].title =
//           firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
//       }
//     }
//   }

//   // Save updated sessions
//   localStorage.setItem(`mediscan_sessions_${userId}`, JSON.stringify(sessions))

//   // Also save the current session messages separately for backward compatibility
//   localStorage.setItem(`mediscan_chat_${userId}_${sessionId}`, JSON.stringify(messages))
// }

// export const loadChatSessions = (userId: string): ChatSession[] => {
//   const sessionsJson = localStorage.getItem(`mediscan_sessions_${userId}`)
//   if (!sessionsJson) return []

//   try {
//     const sessions = JSON.parse(sessionsJson)
//     // Convert string dates back to Date objects with safety checks
//     return sessions.map((session: any) => ({
//       ...session,
//       lastMessageDate: session.lastMessageDate ? new Date(session.lastMessageDate) : new Date(),
//       messages: session.messages.map((msg: any) => ({
//         ...msg,
//         timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
//       })),
//     }))
//   } catch (error) {
//     console.error("Failed to parse chat sessions:", error)
//     return []
//   }
// }

// export const loadChatSession = (userId: string, sessionId: string): Message[] => {
//   const chatJson = localStorage.getItem(`mediscan_chat_${userId}_${sessionId}`)
//   if (!chatJson) return []

//   try {
//     const messages = JSON.parse(chatJson)
//     // Convert string dates back to Date objects with safety checks
//     return messages.map((msg: any) => ({
//       ...msg,
//       timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
//     }))
//   } catch (error) {
//     console.error("Failed to parse chat history:", error)
//     return []
//   }
// }

// export const createNewChatSession = (userId: string): ChatSession => {
//   // Get existing chat sessions
//   const sessionsJson = localStorage.getItem(`mediscan_sessions_${userId}`)
//   let sessions: ChatSession[] = []

//   if (sessionsJson) {
//     try {
//       sessions = JSON.parse(sessionsJson)
//     } catch (error) {
//       console.error("Failed to parse chat sessions:", error)
//     }
//   }

//   // Create new session
//   const newSession: ChatSession = {
//     id: Date.now().toString(),
//     title: "New Conversation",
//     lastMessage: "",
//     lastMessageDate: new Date(),
//     messages: [],
//   }

//   Add to sessions
//   sessions.unshift(newSession)

//   // Save updated sessions
//   localStorage.setItem(`mediscan_sessions_${userId}`, JSON.stringify(sessions))

//   return newSession
// }

// export const deleteChatSession = (userId: string, sessionId: string): boolean => {
//   // Get existing chat sessions
//   const sessionsJson = localStorage.getItem(`mediscan_sessions_${userId}`)
//   let sessions: ChatSession[] = []

//   if (sessionsJson) {
//     try {
//       sessions = JSON.parse(sessionsJson)
//     } catch (error) {
//       console.error("Failed to parse chat sessions:", error)
//       return false
//     }
//   }

//   // Filter out the session to delete
//   sessions = sessions.filter((s) => s.id !== sessionId)

//   // Save updated sessions
//   localStorage.setItem(`mediscan_sessions_${userId}`, JSON.stringify(sessions))

//   // Remove the session messages
//   localStorage.removeItem(`mediscan_chat_${userId}_${sessionId}`)

//   return true
// }

// // Mock functions for development
// export const mockSignUp = async (
//   email: string,
//   password: string,
//   fullName: string,
// ): Promise<{ user: User | null; error: string | null }> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   // For demo purposes, always succeed unless email contains "error"
//   if (email.includes("error")) {
//     return { user: null, error: "An error occurred during sign up" }
//   }

//   const newUser: User = {
//     id: Math.random().toString(36).substring(2, 15),
//     email,
//     fullName,
//     createdAt: new Date(),
//     lastLogin: new Date(),
//     provider: "email",
//   }

//   // Store in localStorage for demo
//   localStorage.setItem("mediscan_user", JSON.stringify(newUser))

//   return { user: newUser, error: null }
// }

// export const mockSignIn = async (
//   email: string,
//   password: string,
// ): Promise<{ user: User | null; error: string | null }> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   // For demo purposes, always succeed unless email contains "error"
//   if (email.includes("error")) {
//     return { user: null, error: "Invalid email or password" }
//   }

//   const user: User = {
//     id: Math.random().toString(36).substring(2, 15),
//     email,
//     fullName: email.split("@")[0],
//     createdAt: new Date(),
//     lastLogin: new Date(),
//     provider: "email",
//   }

//   // Store in localStorage for demo
//   localStorage.setItem("mediscan_user", JSON.stringify(user))

//   return { user, error: null }
// }

// export const mockGoogleSignIn = async (): Promise<{ user: User | null; error: string | null }> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1500))

//   const user: User = {
//     id: Math.random().toString(36).substring(2, 15),
//     email: "user@gmail.com",
//     fullName: "Google User",
//     createdAt: new Date(),
//     lastLogin: new Date(),
//     avatar: "https://lh3.googleusercontent.com/a/default-user=s120",
//     provider: "google",
//   }

//   // Store in localStorage for demo
//   localStorage.setItem("mediscan_user", JSON.stringify(user))

//   return { user, error: null }
// }

// export const mockSignOut = async (): Promise<{ error: string | null }> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 500))

//   // Remove from localStorage
//   localStorage.removeItem("mediscan_user")

//   return { error: null }
// }

// export const mockUploadFile = async (file: File): Promise<{ url: string; error: string | null }> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1500))

//   // Create a temporary URL for the file
//   const url = URL.createObjectURL(file)

//   return { url, error: null }
// }

// export const mockGetMessages = async (
//   userId: string,
//   sessionId: string,
// ): Promise<{ messages: Message[]; error: string | null }> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 800))

//   // Try to load from localStorage first
//   const savedMessages = loadChatSession(userId, sessionId)

//   if (savedMessages.length > 0) {
//     return { messages: savedMessages, error: null }
//   }

//   // Default welcome message if no history
//   const messages: Message[] = [
//     {
//       id: "1",
//       content: "Hello! I'm MediScan, your AI medical drug assistant. How can I help you today?",
//       sender: "bot",
//       timestamp: new Date(Date.now() - 86400000), // 1 day ago
//     },
//   ]

//   return { messages, error: null }
// }

// export const mockSendMessage = async (
//   userId: string,
//   sessionId: string,
//   content: string,
//   attachments?: MessageAttachment[],
// ): Promise<{ message: Message | null; error: string | null }> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 500))

//   const message: Message = {
//     id: Date.now().toString(),
//     content,
//     sender: "user",
//     timestamp: new Date(),
//     attachments,
//   }

//   return { message, error: null }
// }

// export const mockGetBotResponse = async (
//   userId: string,
//   sessionId: string,
//   userMessage: string,
// ): Promise<{ message: Message | null; error: string | null }> => {
//   // Simulate API delay - longer for bot thinking
//   await new Promise((resolve) => setTimeout(resolve, 2000))

//   const botResponses = [
//     "Based on your symptoms, I would recommend consulting with a healthcare professional. However, over-the-counter options like acetaminophen might help with the pain.",
//     "It sounds like you might be experiencing common side effects. Continue monitoring and contact your doctor if symptoms worsen.",
//     "For your described condition, staying hydrated and getting rest is important. Antihistamines might help with the allergic reaction symptoms.",
//     "The medication you mentioned is typically used for that condition. Common side effects include drowsiness and dry mouth.",
//     "I'd recommend taking that medication with food to minimize stomach irritation. Always follow your doctor's prescribed dosage.",
//   ]

//   const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

//   const message: Message = {
//     id: Date.now().toString(),
//     content: randomResponse,
//     sender: "bot",
//     timestamp: new Date(),
//   }

//   return { message, error: null }
// }

