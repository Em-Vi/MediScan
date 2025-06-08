"use client";

import type React from "react";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, MessageSquare, Search, X, PanelLeft, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatSession } from "@/lib/types";
import { deleteChatSession } from "@/lib/api";
import { cn } from "@/lib/utils";
import { on } from "events";

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  user_id: string;
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onClose?: () => void;
  className?: string;
  onSessionUpdate: (sessions: ChatSession[]) => void; // Add this line
}

export function ChatHistorySidebar({
  sessions,
  user_id,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onClose,
  className = "",
  onSessionUpdate, // Add this line
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
      deleteChatSession(user_id, sessionId);

      // Notify parent component to update sessions state
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);

      if (sessionId === currentSessionId && updatedSessions.length > 0) {
        const nextSession = updatedSessions[0];
        onSessionSelect(nextSession.id);
      }

      if (updatedSessions.length === 0) {
        onNewSession();
      }

      // Pass updated sessions to parent
      onSessionUpdate(updatedSessions);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className} `}>
      <div className="p-4 border-b ">
        <div className="flex items-center justify-between mb-2 ">
          <h2 className="font-semibold">Chat History</h2>
          <div className="flex items-center gap-1 overflow-hidden">
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
                    <div className="truncate font-medium">
                      {session.title.length > 22
                        ? `${session.title.slice(0, 22)}...`
                        : session.title}
                    </div>
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
