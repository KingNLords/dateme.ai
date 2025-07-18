import { useState, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { chatState, Message } from "@/store/chatStore";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingDots } from "@/components/TypingDots";
import { ChatHeader } from "@/components/ChatHeader";
import { Sidebar } from "@/components/Sidebar";
import { QuickPrompts } from "@/components/QuickPrompts";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { OpenAIService } from "@/utils/openai";
import { conversationService } from "@/services/conversationService";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Chat = () => {
  const state = useSnapshot(chatState);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const aiService = new OpenAIService(apiKey);

  useEffect(() => {
    const hash = location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.slice(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(() => navigate("/chat", { replace: true }))
          .catch((err) => console.error("Session setup failed", err));
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedImage) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
      image: selectedImage || undefined,
      mood: state.userPreferences.mood,
    };

    chatState.messages.push(newMessage);
    chatState.isTyping = true;

    if (currentConversationId) {
      await conversationService.saveMessage(currentConversationId, newMessage);
    } else {
      const conversationId = await conversationService.createConversation(
        message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        message
      );
      setCurrentConversationId(conversationId);
    }

    setMessage("");
    setSelectedImage("");
    setShowImageUploader(false);

    try {
      const openAIMessages = [
        {
          role: "user" as const,
          content: selectedImage
            ? [
                {
                  type: "text" as const,
                  text: message || "What do you think about this image?",
                },
                {
                  type: "image_url" as const,
                  image_url: { url: selectedImage, detail: "auto" as const },
                },
              ]
            : message,
        },
      ];

      const response = await aiService.sendMessage(
        openAIMessages,
        state.userPreferences.mood
      );

      chatState.isTyping = false;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date(),
        mood: state.userPreferences.mood,
      };

      chatState.messages.push(aiMessage);

      if (currentConversationId) {
        await conversationService.saveMessage(currentConversationId, aiMessage);
        await conversationService.updateConversation(
          currentConversationId,
          chatState.messages[0]?.text.slice(0, 50) + "..." ||
            "New conversation",
          response.slice(0, 100) + (response.length > 100 ? "..." : "")
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      chatState.isTyping = false;
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  const handleConversationSelect = async (conversationId: string) => {
    const messages = await conversationService.getMessages(conversationId);
    chatState.messages = messages;
    setCurrentConversationId(conversationId);
  };

  const adjustTextareaHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 200) + "px";
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    // <div className="flex h-screen bg-gradient-chat dark:bg-gray-900">
    <div className="flex flex-col h-screen bg-gradient-chat dark:bg-gray-900">
      {/* <div className="flex-1 flex flex-col dark:bg-gray-900"> */}
      <div className="flex flex-col flex-1 overflow-hidden dark:bg-gray-900">
        {/* <Sidebar
          isOpen={state.sidebarOpen}
          onToggle={() => (chatState.sidebarOpen = !chatState.sidebarOpen)}
          onConversationSelect={handleConversationSelect}
        />
        <ChatHeader
          currentMood={state.userPreferences.mood}
          onMoodChange={(mood) => (chatState.userPreferences.mood = mood)}
          onSidebarToggle={() =>
            (chatState.sidebarOpen = !chatState.sidebarOpen)
          }
        /> */}
        <ChatHeader
          currentMood={state.userPreferences.mood}
          onMoodChange={(mood) => (chatState.userPreferences.mood = mood)}
          onSidebarToggle={() =>
            (chatState.sidebarOpen = !chatState.sidebarOpen)
          }
        >
          {state.sidebarOpen && (
            <Sidebar
              isOpen={state.sidebarOpen}
              onToggle={() => (chatState.sidebarOpen = !chatState.sidebarOpen)}
              onConversationSelect={handleConversationSelect}
            />
          )}
        </ChatHeader>

        {/* <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-[140px] flex flex-col items-center"> */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 flex flex-col items-center max-h-full">
          {state.messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {state.isTyping && <TypingDots />}
          <div ref={messagesEndRef} />
        </div>

        <div className="w-full px-4 pb-4 z-40">
          <div className="max-w-4xl mx-auto mb-2">
            <QuickPrompts onPromptSelect={handlePromptSelect} />
          </div>
          <div className="max-w-4xl mx-auto rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-shadow p-2">
            <div className="flex items-end gap-2 px-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImageUploader(!showImageUploader)}
                className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <div className="flex-1 flex flex-col gap-1">
                {showImageUploader && (
                  <div className="p-4 dark:border-gray-700 bg-pink-25 dark:bg-gray-800 z-10">
                    <ImageUploader
                      onImageSelect={setSelectedImage}
                      onImageRemove={() => setSelectedImage("")}
                      selectedImage={selectedImage}
                    />
                  </div>
                )}
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onInput={adjustTextareaHeight}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex max-h-[200px] overflow-y-auto resize-none transition-all duration-200 border-none focus:outline-none focus:ring-0 bg-transparent dark:bg-gray-700 dark:text-white px-3 py-2"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                size="icon"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
