"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquarePlus,
  PanelLeft,
  User,
  LogOut,
  Settings,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/app-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  sidebarOpen?: boolean;
  showLogo?: boolean;
}

export function Navigation({
  onToggleSidebar,
  onNewChat,
  sidebarOpen = false,
  showLogo = true,
}: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useApp();
  const [animateLogo, setAnimateLogo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isChatPage = pathname === "/chat";

  useEffect(() => {
    setMounted(true);
    setAnimateLogo(true);
  }, []);

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      router.push("/chat");
    }
  };

  const handleProfileClick = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between relative">
        {/* Left side icons (only on chat page) */}
        {isChatPage && !sidebarOpen && (
          <div className="flex items-center gap-2 absolute left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className={cn("rounded-full", sidebarOpen && "bg-primary/10")}
              aria-label="Toggle sidebar"
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
          </div>
        )}

        {/* Centered logo */}
        {showLogo && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo
              size={isChatPage ? "md" : "lg"}
              showText={!isChatPage}
              animate={animateLogo && mounted}
              centered={true}
            />
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-3 absolute right-4">
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
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
