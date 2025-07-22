import React from "react";
import { useSnapshot } from "valtio";
import { chatState } from "@/store/chatStore"; // Ensure path is correct
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { conversationService } from "@/services/conversationService";
import { useToast } from "@/hooks/use-toast";

// Standard 16 MBTI types
const mbtiTypes = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];

export const MbtiSettings: React.FC = () => {
  const state = useSnapshot(chatState);
  const { toast } = useToast();

  const currentConversation = state.conversations[state.currentConversationId];

  if (!currentConversation) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 p-3">
        Select a conversation to manage preferences.
      </p>
    );
  }

  const handleMbtiChange = async (type: "user" | "partner", value: string) => {
    const newPreferences = { ...currentConversation.userPreferences };

    if (type === "user") {
      newPreferences.mbtiType = value;
    } else {
      newPreferences.partnerMbtiType = value;
    }

    // Update Valtio state immediately
    chatState.conversations[state.currentConversationId].userPreferences =
      newPreferences;

    // Persist to database
    try {
      await conversationService.updateConversationPreferences(
        state.currentConversationId,
        newPreferences
      );
      toast({
        title: "MBTI updated",
        description: "Your MBTI preferences have been saved.",
      });
    } catch (error) {
      console.error("Failed to save MBTI preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save MBTI preferences.",
        variant: "destructive",
      });
      // Revert Valtio state if save fails
      chatState.conversations[state.currentConversationId].userPreferences =
        currentConversation.userPreferences;
    }
  };

  return (
    <div className="space-y-4 p-4 text-gray-700 dark:text-gray-300">
      <h3 className="font-semibold text-base">MBTI Personalization</h3>

      {/* User's MBTI */}
      <div className="space-y-2">
        <Label htmlFor="user-mbti">Your MBTI Type</Label>
        <Select
          value={currentConversation.userPreferences.mbtiType || ""}
          onValueChange={(value) => handleMbtiChange("user", value)}
        >
          <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-pink-200 dark:border-gray-600">
            <SelectValue placeholder="Select MBTI type" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            {mbtiTypes.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-700"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Partner's MBTI */}
      <div className="space-y-2">
        <Label htmlFor="partner-mbti">Partner's MBTI Type</Label>
        <Select
          value={currentConversation.userPreferences.partnerMbtiType || ""}
          onValueChange={(value) => handleMbtiChange("partner", value)}
        >
          <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-pink-200 dark:border-gray-600">
            <SelectValue placeholder="Select MBTI type" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            {mbtiTypes.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-700"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
