export interface MessageAttachment {
  id: string;
  url: string;
  type: "image" | "audio" | "document" | "text";
  name: string;
  size: number;
  fileExtension: string;
}

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  attachments?: MessageAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageDate: Date;
  messages: Message[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  is_verified: boolean;
  createdAt: Date;
  lastLogin: Date;
  avatar?: string;
  provider?: "email" | "google";
}