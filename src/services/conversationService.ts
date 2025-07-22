import { supabase } from "@/lib/supabase";
import {
  Conversation as ChatStoreConversation,
  Message as ChatStoreMessage,
  UserPreferences, // Import UserPreferences
} from "@/store/chatStore";

export interface ConversationFromDB {
  id: string;
  user_id: string;
  title: string;
  preview: string;
  user_preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface MessageFromDB {
  id: string;
  conversation_id: string;
  sender_type: "user" | "assistant";
  content: string;
  image_url: string | null;
  mood: string | null;
  created_at: string;
}

export const conversationService = {
  async getConversations(): Promise<ChatStoreConversation[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error(
        "DEBUG getConversations: User not authenticated:",
        userError
      );
      return [];
    }
    console.log("DEBUG getConversations: Current User UID:", userData.user.id);

    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, preview, user_preferences, created_at, updated_at")
      .eq("user_id", userData.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(
        "Error fetching conversations:",
        error.message || JSON.stringify(error)
      );
      throw error;
    }
    console.log("DEBUG getConversations: Fetched conversations data:", data);
    return data.map((dbConv: ConversationFromDB) => ({
      id: dbConv.id,
      title: dbConv.title,
      preview: dbConv.preview,
      userPreferences: dbConv.user_preferences,
      created_at: dbConv.created_at,
      updated_at: dbConv.updated_at,
      messages: [],
    }));
  },

  async saveConversation(conversation: ChatStoreConversation): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error(
        "DEBUG saveConversation: User not authenticated:",
        userError
      );
      throw new Error("User not authenticated");
    }
    console.log("DEBUG saveConversation: Current User UID:", userData.user.id);
    console.log(
      "DEBUG saveConversation: Conversation object to save:",
      conversation
    );

    const { id, title, preview, userPreferences, created_at, updated_at } =
      conversation;

    const { error } = await supabase.from("conversations").insert({
      id: id,
      user_id: userData.user.id,
      title: title,
      preview: preview,
      user_preferences: userPreferences,
      created_at: created_at,
      updated_at: updated_at,
    });

    if (error) {
      console.error(
        "Error saving new conversation:",
        error.message || JSON.stringify(error)
      );
      throw error;
    }
    console.log("DEBUG saveConversation: Conversation saved successfully.");
  },

  async updateConversation(
    id: string,
    title: string,
    preview: string
  ): Promise<void> {
    console.log("DEBUG updateConversation: Updating conversation ID:", id);
    const { error } = await supabase
      .from("conversations")
      .update({
        title,
        preview,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Error updating conversation:",
        error.message || JSON.stringify(error)
      );
      throw error;
    }
    console.log("DEBUG updateConversation: Conversation updated successfully.");
  },

  // NEW: Method to update only user preferences for a conversation
  async updateConversationPreferences(
    conversationId: string,
    userPreferences: UserPreferences
  ): Promise<void> {
    console.log(
      "DEBUG updateConversationPreferences: Updating preferences for conversation ID:",
      conversationId
    );
    console.log(
      "DEBUG updateConversationPreferences: New preferences:",
      userPreferences
    );

    const { error } = await supabase
      .from("conversations")
      .update({
        user_preferences: userPreferences,
        updated_at: new Date().toISOString(), // Also update the timestamp
      })
      .eq("id", conversationId);

    if (error) {
      console.error(
        "Error updating conversation preferences:",
        error.message || JSON.stringify(error)
      );
      throw error;
    }
    console.log(
      "DEBUG updateConversationPreferences: Preferences updated successfully."
    );
  },

  async getMessages(conversationId: string): Promise<ChatStoreMessage[]> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("DEBUG getMessages: User not authenticated:", userError);
      return [];
    }
    console.log("DEBUG getMessages: Current User UID:", userData.user.id);
    console.log(
      "DEBUG getMessages: Fetching messages for conversation ID:",
      conversationId
    );

    const { data, error } = await supabase
      .from("messages")
      .select("id, content, sender_type, image_url, mood, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "Error fetching messages:",
        error.message || JSON.stringify(error)
      );
      throw error;
    }
    console.log("DEBUG getMessages: Fetched messages data:", data);
    return data.map((msg: MessageFromDB) => ({
      id: msg.id,
      text: msg.content,
      sender: msg.sender_type,
      timestamp: new Date(msg.created_at),
      image: msg.image_url || undefined,
      mood: msg.mood as any,
    }));
  },

  async saveMessage(
    conversationId: string,
    message: ChatStoreMessage
  ): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("DEBUG saveMessage: User not authenticated:", userError);
      throw new Error("User not authenticated");
    }
    console.log("DEBUG saveMessage: Current User UID:", userData.user.id);
    console.log(
      "DEBUG saveMessage: Saving message for conversationId:",
      conversationId
    );
    console.log("DEBUG saveMessage: Message object to save:", message);

    const { error } = await supabase.from("messages").insert({
      id: message.id,
      conversation_id: conversationId,
      content: message.text,
      sender_type: message.sender,
      image_url: message.image || null,
      mood: message.mood || null,
      created_at: message.timestamp.toISOString(),
    });

    if (error) {
      console.error(
        "Error saving message:",
        error.message || JSON.stringify(error)
      );
      throw error;
    }
    console.log("DEBUG saveMessage: Message saved successfully.");
  },
};
