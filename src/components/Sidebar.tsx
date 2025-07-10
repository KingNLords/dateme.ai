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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  conversationService,
  Conversation,
} from "@/services/conversationService";
import { useToast } from "@/hooks/use-toast";
import logoT from "@/assets/Asset 4.png";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onConversationSelect?: (conversationId: string) => void;
}

const menuItems = [
  { icon: MessageCircle, label: "Conversations", id: "conversations" },
  { icon: Heart, label: "Love Vault", id: "love-vault" },
  { icon: Smile, label: "Mood Scanner", id: "mood-scanner" },
  { icon: Calendar, label: "Romantic Routine", id: "routine" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export const Sidebar = ({
  isOpen,
  onToggle,
  onConversationSelect,
}: SidebarProps) => {
  const [activeItem, setActiveItem] = useState("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (activeItem === "conversations") {
      loadConversations();
    }
  }, [activeItem]);

  const loadConversations = async () => {
    const data = await conversationService.getConversations();
    setConversations(data);
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
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const goToLanding = () => {
    navigate("/");
  };
  const renderContent = () => {
    switch (activeItem) {
      case "conversations":
        return (
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 p-3">
                No conversations yet
              </p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                    {conversation.title}
                  </h4>
                  <div>
                  <div className="mb-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {conversation.preview}
                    </p>
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </p>
                </div>
                </div>
                </button>
              ))
            )}
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 ">
              {menuItems.find((item) => item.id === activeItem)?.label} coming
              soon...
            </p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-pink-100 dark:border-gray-700 shadow-lg z-50 transition-transform duration-300 ease-in-out",
          "w-80 md:w-72",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div
              onClick={goToLanding}
              className="w-15 h-8 flex items-center justify-center"
            >
              <img
                src={logoT}
                alt="logo"
                className="w-15 h-8"
              />
            </div>
            {/* <h2 className="font-semibold text-gray-800 dark:text-white">
              Dateme.ai
            </h2> */}
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={cn(
                  "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors",
                  activeItem === item.id
                    ? "bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
                onClick={() => setActiveItem(item.id)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className=" flex-1 p-4 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 dark:scrollbar-thumb-pink-600">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-pink-100 dark:border-gray-700">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg p-3">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <p className="mt-5 text-sm text-pink-700 dark:text-pink-300 font-medium">
              💝 Relationship Tip
            </p>
            <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
              Send a "good morning" text every day to start their day with love!
            </p>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
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
