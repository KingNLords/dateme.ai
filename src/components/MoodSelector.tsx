// import { ChatMood } from "@/store/chatStore";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface MoodSelectorProps {
//   currentMood: ChatMood;
//   onMoodChange: (mood: ChatMood) => void;
// }

// const moodEmojis = {
//   Romantic: "💕",
//   Playful: "😄",
//   Serious: "🤔",
//   Supportive: "🤗",
//   Flirty: "😉",
// };

// export const MoodSelector = ({
//   currentMood,
//   onMoodChange,
// }: MoodSelectorProps) => {
//   return (
//     <div className="flex items-center space-x-2">
//       <span className="hidden sm:inline text-sm text-gray-600 dark:text-white font-medium">
//         Mood:
//       </span>
//       <Select
//         value={currentMood}
//         onValueChange={(value) => onMoodChange(value as ChatMood)}
//       >
//         <SelectTrigger className="w-32 h-8 text-sm bg-white dark:text-pink-300 dark:bg-gray-900 ">
//           <SelectValue />
//         </SelectTrigger>
//         <SelectContent className="bg-white dark:text-pink-300 dark:bg-gray-900  ">
//           {Object.entries(moodEmojis).map(([mood, emoji]) => (
//             <SelectItem
//               key={mood}
//               value={mood}
//               className="cursor-pointer hover:bg-pink-50"
//             >
//               <span className="flex items-center space-x-2">
//                 <span>{emoji}</span>
//                 <span>{mood}</span>
//               </span>
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// };

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
      {/* Label only visible on sm and up */}
      <span className="hidden sm:inline text-sm text-gray-600 dark:text-white font-medium">
        Mood:
      </span>
      <Select
        value={currentMood}
        onValueChange={(value) => onMoodChange(value as ChatMood)}
      >
        <SelectTrigger className="w-36 h-8 text-sm bg-white dark:text-pink-300 dark:bg-gray-900">
          <SelectValue placeholder="Mood" className="truncate">
            <div className="flex items-center space-x-2">
              <span>{moodEmojis[currentMood]}</span>
              <span className="hidden sm:inline">{currentMood}</span>
              <span className="sm:hidden">Mood</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:text-pink-300 dark:bg-gray-900">
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
