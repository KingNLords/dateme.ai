import { ChatMood } from "@/store/chatStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MoodSelectorProps {
  currentMood: ChatMood;
  onMoodChange: (mood: ChatMood) => void;
}

const moodEmojis = {
  Romantic: "💕",
  Playful: "😄",
  Serious: "🤔",
  Supportive: "🤗",
  Flirty: "😉",
};

export const MoodSelector = ({
  currentMood,
  onMoodChange,
}: MoodSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-white font-medium">
        Mood:
      </span>
      <Select
        value={currentMood}
        onValueChange={(value) => onMoodChange(value as ChatMood)}
      >
        <SelectTrigger className="w-32 h-8 text-sm bg-white dark:text-pink-300 dark:bg-gray-900 ">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white dark:text-pink-300 dark:bg-gray-900  ">
          {Object.entries(moodEmojis).map(([mood, emoji]) => (
            <SelectItem
              key={mood}
              value={mood}
              className="cursor-pointer hover:bg-pink-50"
            >
              <span className="flex items-center space-x-2">
                <span>{emoji}</span>
                <span>{mood}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
