"use client";

import type React from "react";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, MessageSquare, Search, X, PanelLeft, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ChatSession, deleteChatSession } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { on } from "events";

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onClose?: () => void;
  className?: string;
}

export function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onClose,
  className = "",
}: ChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteChatSession("user_id", sessionId);

      // If we're deleting the current session, select another one
      if (sessionId === currentSessionId && sessions.length > 1) {
        const nextSession = sessions.find((s) => s.id !== sessionId);
        if (nextSession) {
          onSessionSelect(nextSession.id);
        }
      }

      // If this was the last session, create a new one
      if (sessions.length === 1) {
        onNewSession();
      }
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Chat History</h2>
          <div className="flex items-center gap-1">
            {showSearch ? (
              <>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSearch(false)}
              >
                <Search className="h-4 w-4" />
              </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn("rounded-full")}
                aria-label={"Close sidebar"}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewSession}
                className="rounded-full"
                aria-label="New chat"
              >
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
              </>
            )}
          </div>
        </div>

        {showSearch && (
          <div className="animate-fade-in">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations found
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-2 rounded-md cursor-pointer transition-colors group ${
                  session.id === currentSessionId
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <div className="truncate font-medium">{session.title}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleDeleteSession(e, session.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="ml-6 text-xs text-muted-foreground truncate">
                  {session.lastMessage || "No messages yet"}
                </div>
                <div className="ml-6 text-xs text-muted-foreground mt-1">
                  {session.lastMessageDate
                    ? format(new Date(session.lastMessageDate), "MMM d, yyyy")
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
