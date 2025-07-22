import { proxy } from "valtio";
import { v4 as uuidv4 } from "uuid";

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
  | "TrustBuilder";

export interface UserPreferences {
  name: string;
  partnerName: string;
  tone: string;
  mood: ChatMood;
  loveLanguage: string;
  // NEW: MBTI types
  mbtiType: string | null; // User's MBTI type (e.g., "INFJ", "ESTP")
  partnerMbtiType: string | null; // Partner's MBTI type
}

export interface Conversation {
  id: string;
  messages: Message[];
  userPreferences: UserPreferences;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
}

export interface ChatState {
  conversations: Record<string, Conversation>;
  currentConversationId: string;
  currentInput: string;
  uploadingImage: boolean;
  isTyping: boolean;
  sidebarOpen: boolean;
  isLoadingMessages: boolean;
}

const initialConversationId = uuidv4();

export const chatState = proxy<ChatState>({
  conversations: {
    [initialConversationId]: {
      id: initialConversationId,
      userPreferences: {
        name: "You",
        partnerName: "Your Partner",
        tone: "romantic",
        mood: "Romantic",
        loveLanguage: "Words of Affirmation",
        // NEW: Initialize MBTI types as null
        mbtiType: null,
        partnerMbtiType: null,
      },
      messages: [
        {
          id: uuidv4(),
          text: "Hi, I'm Amo, your dating assistant. How are you feeling today?",
          sender: "assistant",
          timestamp: new Date(),
          mood: "Supportive",
        },
      ],
      title: "First Chat",
      preview: "Your first conversation with Amo!",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  currentConversationId: initialConversationId,
  currentInput: "",
  uploadingImage: false,
  isTyping: false,
  sidebarOpen: false,
  isLoadingMessages: false,
});
