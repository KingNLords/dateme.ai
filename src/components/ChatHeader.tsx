import { Button } from "@/components/ui/button";
import { MoodSelector } from "./MoodSelector"; // Assuming MoodSelector is a separate component
import { ChatMood } from "@/store/chatStore";
import { Menu } from "lucide-react"; // Only Menu icon needed here for mobile
// Removed Sun, Moon, useTheme as they are now in the sidebar

interface ChatHeaderProps {
  currentMood: ChatMood;
  onMoodChange: (mood: ChatMood) => void;
  onSidebarToggle: () => void; // This is specifically for the mobile sidebar overlay
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentMood,
  onMoodChange,
  onSidebarToggle,
}) => {
  return (
    <header className="flex items-center justify-between p-2 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-10">
      {/* Left Side: Hamburger Menu (Mobile Only) and App Info */}
      <div className="flex items-center space-x-4">
        {/* Hamburger Menu - Only visible on small screens (md:hidden) */}
        <Button
          variant="ghost"
          size="icon" // Changed to icon size for better alignment
          onClick={onSidebarToggle}
          className="md:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-2 h-2" />
        </Button>
        {/* App Title and Online Status */}
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Dateme.ai
          </h3>
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center relative">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Online
          </div>
        </div>
      </div>

      {/* Right Side: Mood Selector (always visible) and placeholder for other desktop elements */}
      <div className="flex items-center space-x-4">
        <MoodSelector currentMood={currentMood} onMoodChange={onMoodChange} />
        {/* Theme Toggle and Settings are now exclusively in the Sidebar.
            This div remains as a placeholder for any future desktop-only header elements. */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Add other desktop-only header elements here if needed */}
        </div>
      </div>
    </header>
  );
};
