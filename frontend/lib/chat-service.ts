import { sendMessage, getChatHistory, getSessionMessages, uploadImage } from './api';

export type FileType = "image" | "audio" | "document" | "text"

export interface MessageAttachment {
  id: string
  url: string
  type: FileType
  name: string
  size: number
  fileExtension: string
}

export interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  attachments?: MessageAttachment[]
}

export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  lastMessageDate: Date
  messages: Message[]
}

export interface User {
  id: string
  email: string
  fullName: string
  createdAt: Date
  lastLogin: Date
  avatar?: string
  provider?: "email" | "google"
}

// Chat history storage (keeping localStorage for offline support)
export const saveChatHistory = (userId: string, messages: Message[], sessionId: string) => {
  // Get existing chat sessions
  const sessionsJson = localStorage.getItem(`mediscan_sessions_${userId}`)
  let sessions: ChatSession[] = []

  if (sessionsJson) {
    try {
      sessions = JSON.parse(sessionsJson)
    } catch (error) {
      console.error("Failed to parse chat sessions:", error)
    }
  }

  // Find the current session
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

  if (sessionIndex >= 0) {
    // Update existing session
    sessions[sessionIndex].messages = messages
    sessions[sessionIndex].lastMessage = messages[messages.length - 1]?.content || ""
    sessions[sessionIndex].lastMessageDate = new Date()

    // Generate title from first user message if not already set
    if (sessions[sessionIndex].title === "New Conversation") {
      const firstUserMessage = messages.find((m) => m.sender === "user")
      if (firstUserMessage) {
        sessions[sessionIndex].title =
          firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
      }
    }
  }

  // Save updated sessions
  localStorage.setItem(`mediscan_sessions_${userId}`, JSON.stringify(sessions))

  // Also save the current session messages separately for backward compatibility
  localStorage.setItem(`mediscan_chat_${userId}_${sessionId}`, JSON.stringify(messages))
}

export const loadChatSessions = (userId: string): ChatSession[] => {
  const sessionsJson = localStorage.getItem(`mediscan_sessions_${userId}`)
  if (!sessionsJson) return []

  try {
    const sessions = JSON.parse(sessionsJson)
    // Convert string dates back to Date objects with safety checks
    return sessions.map((session: any) => ({
      ...session,
      lastMessageDate: session.lastMessageDate ? new Date(session.lastMessageDate) : new Date(),
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      })),
    }))
  } catch (error) {
    console.error("Failed to parse chat sessions:", error)
    return []
  }
}

export const loadChatSession = (userId: string, sessionId: string): Message[] => {
  const chatJson = localStorage.getItem(`mediscan_chat_${userId}_${sessionId}`)
  if (!chatJson) return []

  try {
    const messages = JSON.parse(chatJson)
    // Convert string dates back to Date objects with safety checks
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }))
  } catch (error) {
    console.error("Failed to parse chat history:", error)
    return []
  }
}

export const createNewChatSession = (userId: string): ChatSession => {
  // Get existing chat sessions
  const sessionsJson = localStorage.getItem(`mediscan_sessions_${userId}`)
  let sessions: ChatSession[] = []

  if (sessionsJson) {
    try {
      sessions = JSON.parse(sessionsJson)
    } catch (error) {
      console.error("Failed to parse chat sessions:", error)
    }
  }

  // Create new session
  const newSession: ChatSession = {
    id: Date.now().toString(),
    title: "New Conversation",
    lastMessage: "",
    lastMessageDate: new Date(),
    messages: [],
  }

  // Add to sessions
  sessions.unshift(newSession)

  // Save updated sessions
  localStorage.setItem(`mediscan_sessions_${userId}`, JSON.stringify(sessions))

  return newSession
}

export const deleteChatSession = (userId: string, sessionId: string): boolean => {
  // Get existing chat sessions
  const sessionsJson = localStorage.getItem(`mediscan_sessions_${userId}`)
  let sessions: ChatSession[] = []

  if (sessionsJson) {
    try {
      sessions = JSON.parse(sessionsJson)
    } catch (error) {
      console.error("Failed to parse chat sessions:", error)
      return false
    }
  }

  // Filter out the session to delete
  sessions = sessions.filter((s) => s.id !== sessionId)

  // Save updated sessions
  localStorage.setItem(`mediscan_sessions_${userId}`, JSON.stringify(sessions))

  // Remove the session messages
  localStorage.removeItem(`mediscan_chat_${userId}_${sessionId}`)

  return true
}

// API integration methods that replace the mock methods
export const getMessages = async (userId: string, sessionId: string) => {
  try {
    // Try local storage first for offline support
    const savedMessages = loadChatSession(userId, sessionId)
    if (savedMessages.length > 0) {
      return { messages: savedMessages, error: null }
    }

    // Otherwise fetch from API
    const response = await getSessionMessages(userId, sessionId);
    
    if (response.messages) {
      // Format dates
      const messages = response.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      
      return { messages, error: null };
    }

    // Default welcome message if no history
    const messages: Message[] = [
      {
        id: "1",
        content: "Hello! I'm AutoDoc, your AI pharmacy assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ];

    return { messages, error: null }
  } catch (error) {
    console.error("Error getting messages:", error)
    return { messages: [], error: "Failed to fetch messages" }
  }
}

export const sendChatMessage = async (
  userId: string, 
  sessionId: string, 
  content: string, 
  attachments?: MessageAttachment[]
) => {
  try {
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      attachments,
    }

    // Send to backend and get response
    const response = await sendMessage(userId, content, sessionId);
    
    // Create bot message from response
    const botMessage: Message = {
      id: response.bot_message_id || (Date.now() + 1).toString(),
      content: response.response,
      sender: "bot",
      timestamp: new Date(),
    }

    return { userMessage, botMessage, error: null }
  } catch (error) {
    console.error("Error sending message:", error)
    return { userMessage: null, botMessage: null, error: "Failed to send message" }
  }
}

// File upload function
export const uploadChatFile = async (userId: string, file: File): Promise<MessageAttachment | null> => {
  try {
    const response = await uploadImage(userId, file);
    
    if (response.url) {
      // Get file extension
      const fileExtension = file.name.split('.').pop() || '';
      
      // Determine file type
      let fileType: FileType = 'document';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase())) {
        fileType = 'image';
      } else if (['mp3', 'wav', 'ogg'].includes(fileExtension.toLowerCase())) {
        fileType = 'audio';
      } else if (['txt', 'md'].includes(fileExtension.toLowerCase())) {
        fileType = 'text';
      }
      
      return {
        id: response.id || Date.now().toString(),
        url: response.url,
        type: fileType,
        name: file.name,
        size: file.size,
        fileExtension
      };
    }
    return null;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}