import { proxy } from "valtio";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  image?: string;
  mood?: ChatMood;
}

export type ChatMood =
  | "Romantic"
  | "Playful"
  | "Serious"
  | "Supportive"
  | "Flirty"
  | "Trust-Builder";

export interface UserPreferences {
  name: string;
  partnerName: string;
  tone: string;
  mood: ChatMood;
  loveLanguage: string;
}

export interface ChatState {
  userPreferences: UserPreferences;
  messages: Message[];
  currentInput: string;
  uploadingImage: boolean;
  isTyping: boolean;
  sidebarOpen: boolean;
  currentConversation: string;
}

export const chatState = proxy<ChatState>({
  userPreferences: {
    name: "You",
    partnerName: "Your Partner",
    tone: "romantic",
    mood: "Romantic",
    loveLanguage: "Words of Affirmation",
  },
  messages: [
    {
      id: "1",
      text: "Hi, I'm Amo, your dating assistant. How are you feeling today?",
      sender: "assistant",
      timestamp: new Date(),
      mood: "Supportive",
    },
  ],
  currentInput: "",
  uploadingImage: false,
  isTyping: false,
  sidebarOpen: false,
  currentConversation: "main",
});
