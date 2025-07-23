import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Heart,
  Smile,
  Calendar,
  Settings,
  X,
  Menu,
  LogOut,
  Sun,
  Moon,
  Plus,
  CircleUserRound,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { conversationService } from "@/services/conversationService";
import { Conversation } from "@/store/chatStore";
import { useToast } from "@/hooks/use-toast";
import logoT from "@/assets/Asset 4.png";
import { MbtiSettings } from "@/components/MbtiSettings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSnapshot } from "valtio";
import { chatState } from "@/store/chatStore";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapseToggle: () => void;
  onConversationSelect?: (conversationId: string) => void;
  onNewConversation?: () => Promise<void>;
  onOpenMbtiQuiz: (quizFor: "user" | "partner") => void;
}

const mainMenuItems = [
  { icon: MessageCircle, label: "Conversations", id: "conversations" },
  { icon: Heart, label: "Love Vault", id: "love-vault" },
  { icon: Smile, label: "Mood Scanner", id: "mood-scanner" },
  { icon: Calendar, label: "Romantic Routine", id: "routine" },
];

export const Sidebar = ({
  isOpen,
  isCollapsed,
  onToggle,
  onCollapseToggle,
  onConversationSelect,
  onNewConversation,
  onOpenMbtiQuiz,
}: SidebarProps) => {
  const state = useSnapshot(chatState);
  const [activeItem, setActiveItem] = useState("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (activeItem === "conversations") {
      loadConversations();
    }
  }, [activeItem]);

  const loadConversations = async () => {
    try {
      const data = await conversationService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect?.(conversationId);
    if (window.innerWidth < 768 && isOpen) {
      onToggle();
    }
  };

  const handleNewChatClick = async () => {
    if (onNewConversation) {
      await onNewConversation();
      await loadConversations();
      if (window.innerWidth < 768 && isOpen) {
        onToggle();
      }
    }
  };

  const goToLanding = () => {
    navigate("/");
  };

  const truncateEmail = (email: string | undefined | null, maxLength = 15) => {
    if (!email) return "Guest";
    return email.length <= maxLength
      ? email
      : email.slice(0, maxLength) + "...";
  };

  const renderContent = () => {
    switch (activeItem) {
      case "conversations":
        return (
          <div className="space-y-2 px-4 py-2">
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No conversations yet. Start a new one!
              </p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors flex flex-col",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    conversation.id === state.currentConversationId
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                      : "text-gray-800 dark:text-gray-200"
                  )}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <h4 className="font-medium text-sm truncate">
                    {isCollapsed ? "" : conversation.title}
                  </h4>
                  {!isCollapsed && (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {conversation.preview}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </button>
              ))
            )}
          </div>
        );
      case "love-vault":
      case "mood-scanner":
      case "routine":
        return (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            {mainMenuItems.find((item) => item.id === activeItem)?.label} coming
            soon...
          </div>
        );
      case "settings":
        return (
          <div className="p-4">
            {isCollapsed ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Settings
              </p>
            ) : (
              <MbtiSettings onOpenMbtiQuiz={onOpenMbtiQuiz} />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-all duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0 w-80" : "-translate-x-full w-80",
          "md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-72"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "p-4 flex items-center",
            isCollapsed ? "justify-center" : "justify-between",
            "border-b border-gray-200 dark:border-gray-700"
          )}
        >
          <div
            onClick={goToLanding}
            className={cn("cursor-pointer", isCollapsed && "hidden md:block")}
          >
            <img src={logoT} alt="logo" className="w-12 h-auto" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="md:hidden text-gray-600 dark:text-gray-300"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapseToggle}
            className="hidden md:flex text-gray-600 dark:text-gray-300"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* New Chat */}
        <div className="p-4">
          <Button
            variant="outline"
            className={cn(
              "w-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg",
              isCollapsed
                ? "justify-center px-2 py-2"
                : "justify-start py-3 px-4 font-semibold text-base"
            )}
            onClick={handleNewChatClick}
          >
            <Plus className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            <span className={cn(isCollapsed && "hidden")}>New Chat</span>
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full overflow-auto">
            {renderContent()}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <nav className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center space-x-3 p-2 rounded-lg text-left",
                    activeItem === item.id
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                    isCollapsed && "justify-center space-x-0"
                  )}
                  onClick={() => setActiveItem(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  <span className={cn("font-medium", isCollapsed && "hidden")}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            <button
              key="settings"
              className={cn(
                "w-full flex items-center space-x-3 p-2 rounded-lg text-left",
                activeItem === "settings"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                isCollapsed && "justify-center space-x-0"
              )}
              onClick={() => setActiveItem("settings")}
            >
              <Settings className="w-5 h-5" />
              <span className={cn("font-medium", isCollapsed && "hidden")}>
                Settings
              </span>
            </button>
          </nav>

          {/* Theme Toggle */}
          <button
            className={cn(
              "w-full flex items-center space-x-3 p-2 rounded-lg text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              isCollapsed && "justify-center space-x-0"
            )}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className={cn("font-medium", isCollapsed && "hidden")}>
              Toggle Theme
            </span>
          </button>

          {/* Profile + Logout */}
          <div
            className={cn(
              "flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700",
              isCollapsed && "justify-center"
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isCollapsed ? "space-x-0" : "space-x-3"
              )}
            >
              <CircleUserRound className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <span
                className={cn(
                  "font-medium text-gray-800 dark:text-gray-200",
                  isCollapsed && "hidden"
                )}
              >
                {truncateEmail(user?.email)}
              </span>
            </div>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Relationship Tip */}
          {!isCollapsed && (
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg p-3 mt-4">
              <p className="text-sm text-pink-700 dark:text-pink-300 font-medium">
                💝 Relationship Tip
              </p>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                Send a "good morning" text every day to start their day with
                love!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-30 md:hidden bg-white dark:bg-gray-800 shadow-md border border-pink-200 dark:border-gray-600"
        onClick={onToggle}
      >
        <Menu className="w-4 h-4" />
      </Button>
    </>
  );
};
