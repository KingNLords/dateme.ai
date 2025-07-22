// // Chat.tsx
// import { useState, useEffect, useRef } from "react";
// import { useSnapshot } from "valtio";
// import { chatState, Message, Conversation } from "@/store/chatStore"; // Import Conversation type
// import { ChatBubble } from "@/components/ChatBubble";
// import { TypingDots } from "@/components/TypingDots";
// import { ChatHeader } from "@/components/ChatHeader";
// import { Sidebar } from "@/components/Sidebar";
// import { QuickPrompts } from "@/components/QuickPrompts";
// import { ImageUploader } from "@/components/ImageUploader";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Send, Paperclip } from "lucide-react";
// import { OpenAIService } from "@/utils/openai";
// import { conversationService } from "@/services/conversationService";
// import { useLocation, useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabase";
// import { OpenAIMessage } from "@/utils/openai";
// import { v4 as uuidv4 } from "uuid";

// const Chat = () => {
//   const state = useSnapshot(chatState);
//   const [selectedImage, setSelectedImage] = useState<string>("");
//   const [showImageUploader, setShowImageUploader] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const message = state.currentInput;
//   const location = useLocation();
//   const navigate = useNavigate();

//   const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
//   const aiService = new OpenAIService(apiKey);

//   // Set Supabase session if auth tokens exist in URL
//   useEffect(() => {
//     const hash = location.hash;
//     if (hash.includes("access_token")) {
//       const params = new URLSearchParams(hash.slice(1));
//       const access_token = params.get("access_token");
//       const refresh_token = params.get("refresh_token");

//       if (access_token && refresh_token) {
//         supabase.auth
//           .setSession({ access_token, refresh_token })
//           .then(() => navigate("/chat", { replace: true }))
//           .catch((err) => console.error("Session setup failed", err));
//       }
//     }
//   }, [location, navigate]);

//   // Scroll to bottom when messages change or typing state changes
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [
//     state.conversations[state.currentConversationId]?.messages,
//     state.isTyping,
//     state.isLoadingMessages,
//   ]);

//   // Adjust text area height
//   const adjustTextareaHeight = () => {
//     if (!textareaRef.current) return;
//     textareaRef.current.style.height = "auto";
//     textareaRef.current.style.height =
//       Math.min(textareaRef.current.scrollHeight, 200) + "px";
//   };

//   useEffect(() => {
//     adjustTextareaHeight();
//   }, [message]);

//   // Handle sending a message
//   const handleSendMessage = async () => {
//     const currentConversationId = chatState.currentConversationId;
//     const currentConversation = chatState.conversations[currentConversationId];

//     if (!message.trim() && !selectedImage) return;
//     if (!currentConversation) return;

//     const mood = currentConversation.userPreferences.mood;
//     const userPreferences = currentConversation.userPreferences; // Get user preferences

//     const userMessage: Message = {
//       id: uuidv4(),
//       text: message,
//       sender: "user",
//       timestamp: new Date(),
//       image: selectedImage || undefined,
//       mood,
//     };

//     chatState.conversations[currentConversationId].messages.push(userMessage);
//     chatState.isTyping = true;
//     setMessage("");
//     setSelectedImage("");
//     setShowImageUploader(false);

//     const openAIMessages: OpenAIMessage[] = [
//       {
//         role: "user",
//         content: selectedImage
//           ? [
//               {
//                 type: "text",
//                 text: message || "What do you think about this image?",
//               },
//               {
//                 type: "image_url",
//                 image_url: {
//                   url: selectedImage,
//                   detail: "auto",
//                 },
//               },
//             ]
//           : message,
//       },
//     ];

//     try {
//       // Pass userPreferences to sendMessage
//       const aiResponseText = await aiService.sendMessage(
//         openAIMessages,
//         mood,
//         userPreferences
//       );

//       const assistantMessage: Message = {
//         id: uuidv4(),
//         text: aiResponseText,
//         sender: "assistant",
//         timestamp: new Date(),
//         mood,
//       };

//       chatState.conversations[currentConversationId].messages.push(
//         assistantMessage
//       );
//       chatState.isTyping = false;

//       await conversationService.saveMessage(currentConversationId, userMessage);
//       await conversationService.saveMessage(
//         currentConversationId,
//         assistantMessage
//       );
//       await conversationService.updateConversation(
//         currentConversationId,
//         userMessage.text.slice(0, 50) + "...",
//         assistantMessage.text.slice(0, 100) + "..."
//       );
//     } catch (err: any) {
//       console.error(
//         "Failed to send message:",
//         err.message || JSON.stringify(err)
//       );
//       chatState.isTyping = false;
//     }
//   };

//   const setMessage = (text: string) => {
//     chatState.currentInput = text;
//   };

//   const handlePromptSelect = (prompt: string) => {
//     setMessage(prompt);
//     textareaRef.current?.focus();
//   };

//   const handleConversationSelect = async (conversationId: string) => {
//     if (!chatState.conversations[conversationId]) {
//       console.error(
//         `Conversation with ID ${conversationId} not found in state.`
//       );
//       return;
//     }

//     chatState.isLoadingMessages = true;
//     try {
//       const messages = await conversationService.getMessages(conversationId);
//       chatState.conversations[conversationId].messages = messages;
//       chatState.currentConversationId = conversationId;
//     } catch (error: any) {
//       console.error(
//         "Failed to load conversation messages:",
//         error.message || JSON.stringify(error)
//       );
//     } finally {
//       chatState.isLoadingMessages = false;
//     }
//   };

//   const handleNewConversation = async () => {
//     const newConversationId = uuidv4();
//     const now = new Date();

//     const initialAssistantMessage: Message = {
//       id: uuidv4(),
//       text: "Hi there! I'm your AI dating assistant. How can I help you strengthen your relationship today?",
//       sender: "assistant",
//       timestamp: now,
//       mood: "Supportive",
//     };

//     const newConversation: Conversation = {
//       id: newConversationId,
//       messages: [initialAssistantMessage],
//       userPreferences: {
//         name: "You",
//         partnerName: "Your Partner",
//         tone: "romantic",
//         mood: "Romantic",
//         loveLanguage: "Words of Affirmation",
//         mbtiType: null, // Initialize new fields
//         partnerMbtiType: null, // Initialize new fields
//       },
//       title: "New Chat",
//       preview: "Start a new conversation!",
//       updated_at: now.toISOString(),
//       created_at: now.toISOString(),
//     };

//     try {
//       chatState.conversations[newConversationId] = newConversation;
//       chatState.currentConversationId = newConversationId;
//       chatState.currentInput = "";
//       setSelectedImage(""); // Ensure selectedImage is reset
//       setShowImageUploader(false); // Ensure showImageUploader is reset
//       chatState.isTyping = false;

//       await conversationService.saveConversation(newConversation);
//       await conversationService.saveMessage(
//         newConversationId,
//         initialAssistantMessage
//       );
//     } catch (error: any) {
//       console.error(
//         "Failed to create new conversation:",
//         error.message || JSON.stringify(error)
//       );
//       delete chatState.conversations[newConversationId];
//     }
//   };

//   const currentConversation = state.conversations[state.currentConversationId];

//   if (!currentConversation) {
//     return (
//       <div className="flex flex-col h-screen items-center justify-center">
//         <div className="mt-2 ">
//           <TypingDots />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gradient-chat dark:bg-gray-900">
//       <div className="flex flex-col flex-1 overflow-hidden">
//         <ChatHeader
//           currentMood={currentConversation.userPreferences.mood}
//           onMoodChange={(mood) => {
//             chatState.conversations[
//               chatState.currentConversationId
//             ].userPreferences.mood = mood;
//           }}
//           onSidebarToggle={() =>
//             (chatState.sidebarOpen = !chatState.sidebarOpen)
//           }
//         >
//           {state.sidebarOpen && (
//             <Sidebar
//               isOpen={state.sidebarOpen}
//               onToggle={() => (chatState.sidebarOpen = !chatState.sidebarOpen)}
//               onConversationSelect={handleConversationSelect}
//               onNewConversation={handleNewConversation}
//             />
//           )}
//         </ChatHeader>

//         <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 flex flex-col items-center max-h-full  dark:bg-gray-900">
//           {state.isLoadingMessages ? (
//             <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
//               <TypingDots />
//               <p className="mt-2">Loading conversation...</p>
//             </div>
//           ) : (
//             currentConversation.messages.map((msg) => (
//               <ChatBubble key={msg.id} message={msg} />
//             ))
//           )}
//           {state.isTyping && !state.isLoadingMessages && <TypingDots />}
//           <div ref={messagesEndRef} />
//         </div>

//         <div className="w-full px-4 pb-4 z-40  dark:bg-gray-900">
//           <div className="max-w-4xl mx-auto mb-2">
//             <QuickPrompts onPromptSelect={handlePromptSelect} />
//           </div>
//           <div className="max-w-4xl mx-auto rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-shadow p-2">
//             <div className="flex items-end gap-2 px-2">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setShowImageUploader(!showImageUploader)}
//                 className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
//               >
//                 <Paperclip className="w-5 h-5" />
//               </Button>
//               <div className="flex-1 flex flex-col gap-1">
//                 {showImageUploader && (
//                   <div className="p-4 dark:border-gray-700 bg-pink-25 dark:bg-gray-800 z-10">
//                     <ImageUploader
//                       onImageSelect={setSelectedImage}
//                       onImageRemove={() => setSelectedImage("")}
//                       selectedImage={selectedImage}
//                     />
//                   </div>
//                 )}
//                 <Textarea
//                   ref={textareaRef}
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   onInput={adjustTextareaHeight}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && !e.shiftKey) {
//                       e.preventDefault();
//                       handleSendMessage();
//                     }
//                   }}
//                   placeholder="Type your message..."
//                   rows={1}
//                   className="flex max-h-[200px] overflow-y-auto resize-none transition-all duration-200 border-none focus:outline-none focus:ring-0 bg-transparent dark:bg-gray-700 dark:text-white px-3 py-2"
//                 />
//               </div>
//               <Button
//                 onClick={handleSendMessage}
//                 disabled={!message.trim() && !selectedImage}
//                 className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
//                 size="icon"
//               >
//                 <Send className="w-5 h-5" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;

// Chat.tsx
import { useState, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { chatState, Message, Conversation } from "@/store/chatStore";
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
import { OpenAIMessage } from "@/utils/openai";
import { v4 as uuidv4 } from "uuid";
import { MbtiQuiz } from "@/components/MbtiQuiz"; // Import MbtiQuiz
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Shadcn Dialog components

const Chat = () => {
  const state = useSnapshot(chatState);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showImageUploader, setShowImageUploader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const message = state.currentInput;
  const location = useLocation();
  const navigate = useNavigate();

  // NEW STATE FOR MBTI QUIZ MODAL
  const [isMbtiQuizModalOpen, setIsMbtiQuizModalOpen] = useState(false);
  const [quizForType, setQuizForType] = useState<"user" | "partner">("user"); // To pass to MbtiQuiz

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const aiService = new OpenAIService(apiKey);

  // Set Supabase session if auth tokens exist in URL
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

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    state.conversations[state.currentConversationId]?.messages,
    state.isTyping,
    state.isLoadingMessages,
  ]);

  // Adjust text area height
  const adjustTextareaHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 200) + "px";
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Handle sending a message
  const handleSendMessage = async () => {
    const currentConversationId = chatState.currentConversationId;
    const currentConversation = chatState.conversations[currentConversationId];

    if (!message.trim() && !selectedImage) return;
    if (!currentConversation) return;

    const mood = currentConversation.userPreferences.mood;
    const userPreferences = currentConversation.userPreferences;

    const userMessage: Message = {
      id: uuidv4(),
      text: message,
      sender: "user",
      timestamp: new Date(),
      image: selectedImage || undefined,
      mood,
    };

    chatState.conversations[currentConversationId].messages.push(userMessage);
    chatState.isTyping = true;
    setMessage("");
    setSelectedImage("");
    setShowImageUploader(false);

    const openAIMessages: OpenAIMessage[] = [
      {
        role: "user",
        content: selectedImage
          ? [
              {
                type: "text",
                text: message || "What do you think about this image?",
              },
              {
                type: "image_url",
                image_url: {
                  url: selectedImage,
                  detail: "auto",
                },
              },
            ]
          : message,
      },
    ];

    try {
      const aiResponseText = await aiService.sendMessage(
        openAIMessages,
        mood,
        userPreferences
      );

      const assistantMessage: Message = {
        id: uuidv4(),
        text: aiResponseText,
        sender: "assistant",
        timestamp: new Date(),
        mood,
      };

      chatState.conversations[currentConversationId].messages.push(
        assistantMessage
      );
      chatState.isTyping = false;

      await conversationService.saveMessage(currentConversationId, userMessage);
      await conversationService.saveMessage(
        currentConversationId,
        assistantMessage
      );
      await conversationService.updateConversation(
        currentConversationId,
        userMessage.text.slice(0, 50) + "...",
        assistantMessage.text.slice(0, 100) + "..."
      );
    } catch (err: any) {
      console.error(
        "Failed to send message:",
        err.message || JSON.stringify(err)
      );
      chatState.isTyping = false;
    }
  };

  const setMessage = (text: string) => {
    chatState.currentInput = text;
  };

  const handlePromptSelect = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  const handleConversationSelect = async (conversationId: string) => {
    if (!chatState.conversations[conversationId]) {
      console.error(
        `Conversation with ID ${conversationId} not found in state.`
      );
      return;
    }

    chatState.isLoadingMessages = true;
    try {
      const messages = await conversationService.getMessages(conversationId);
      chatState.conversations[conversationId].messages = messages;
      chatState.currentConversationId = conversationId;
    } catch (error: any) {
      console.error(
        "Failed to load conversation messages:",
        error.message || JSON.stringify(error)
      );
    } finally {
      chatState.isLoadingMessages = false;
    }
  };

  const handleNewConversation = async () => {
    const newConversationId = uuidv4();
    const now = new Date();

    const initialAssistantMessage: Message = {
      id: uuidv4(),
      text: "Hi there! I'm your AI dating assistant. How can I help you strengthen your relationship today?",
      sender: "assistant",
      timestamp: now,
      mood: "Supportive",
    };

    const newConversation: Conversation = {
      id: newConversationId,
      messages: [initialAssistantMessage],
      userPreferences: {
        name: "You",
        partnerName: "Your Partner",
        tone: "romantic",
        mood: "Romantic",
        loveLanguage: "Words of Affirmation",
        mbtiType: null,
        partnerMbtiType: null,
      },
      title: "New Chat",
      preview: "Start a new conversation!",
      updated_at: now.toISOString(),
      created_at: now.toISOString(),
    };

    try {
      chatState.conversations[newConversationId] = newConversation;
      chatState.currentConversationId = newConversationId;
      chatState.currentInput = "";
      setSelectedImage("");
      setShowImageUploader(false);
      chatState.isTyping = false;

      await conversationService.saveConversation(newConversation);
      await conversationService.saveMessage(
        newConversationId,
        initialAssistantMessage
      );
    } catch (error: any) {
      console.error(
        "Failed to create new conversation:",
        error.message || JSON.stringify(error)
      );
      delete chatState.conversations[newConversationId];
    }
  };

  // NEW: Function to open the MBTI quiz modal
  const handleOpenMbtiQuiz = (quizFor: "user" | "partner") => {
    setQuizForType(quizFor);
    setIsMbtiQuizModalOpen(true);
    // Optionally close sidebar when modal opens
    chatState.sidebarOpen = false;
  };

  // NEW: Function to handle MBTI quiz completion from the modal
  const handleMbtiQuizComplete = async (
    type: "user" | "partner",
    mbti: string
  ) => {
    const currentConversationId = chatState.currentConversationId;
    const currentConversation = chatState.conversations[currentConversationId];

    if (!currentConversation) {
      console.error("No current conversation to save MBTI to.");
      return;
    }

    const newPreferences = { ...currentConversation.userPreferences };
    if (type === "user") {
      newPreferences.mbtiType = mbti;
    } else {
      newPreferences.partnerMbtiType = mbti;
    }

    // Update Valtio state
    chatState.conversations[currentConversationId].userPreferences =
      newPreferences;

    // Persist to database
    try {
      await conversationService.updateConversationPreferences(
        currentConversationId,
        newPreferences
      );
      // Toast message will be handled by MbtiQuiz component
    } catch (error) {
      console.error("Failed to save MBTI preferences after quiz:", error);
      // Show error toast
    } finally {
      setIsMbtiQuizModalOpen(false); // Close modal
    }
  };

  // NEW: Function to handle MBTI quiz cancellation
  const handleMbtiQuizCancel = () => {
    setIsMbtiQuizModalOpen(false); // Close modal
  };

  const currentConversation = state.conversations[state.currentConversationId];

  if (!currentConversation) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-chat dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        <TypingDots />
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-chat dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader
          currentMood={currentConversation.userPreferences.mood}
          onMoodChange={(mood) => {
            chatState.conversations[
              chatState.currentConversationId
            ].userPreferences.mood = mood;
          }}
          onSidebarToggle={() =>
            (chatState.sidebarOpen = !chatState.sidebarOpen)
          }
        >
          {state.sidebarOpen && (
            <Sidebar
              isOpen={state.sidebarOpen}
              onToggle={() => (chatState.sidebarOpen = !chatState.sidebarOpen)}
              onConversationSelect={handleConversationSelect}
              onNewConversation={handleNewConversation}
              onOpenMbtiQuiz={handleOpenMbtiQuiz} // Pass the new prop down
            />
          )}
        </ChatHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 flex flex-col items-center max-h-full  dark:bg-gray-900">
          {state.isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <TypingDots />
              <p className="mt-2">Loading conversation...</p>
            </div>
          ) : (
            currentConversation.messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))
          )}
          {state.isTyping && !state.isLoadingMessages && <TypingDots />}
          <div ref={messagesEndRef} />
        </div>

        <div className="w-full px-4 pb-4 z-40  dark:bg-gray-900">
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
                disabled={!message.trim() && !selectedImage}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                size="icon"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: MBTI Quiz Modal */}
      <Dialog open={isMbtiQuizModalOpen} onOpenChange={setIsMbtiQuizModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-lg dark:bg-gray-800 border-none">
          {/* MbtiQuiz component already has its own Card, so no need for DialogHeader/Title here */}
          <MbtiQuiz
            onQuizComplete={handleMbtiQuizComplete}
            onCancel={handleMbtiQuizCancel}
            quizFor={quizForType}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
