import { Message } from "@/store/chatStore";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-fade-in px-4", // added px-4 for spacing and containment
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative rounded-2xl px-4 py-3 shadow-sm overflow-hidden",
          "max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[60%]",
          "break-words whitespace-pre-wrap",
          isUser
            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md"
            : "bg-white border border-pink-100 text-gray-800 rounded-bl-md dark:bg-gray-800 dark:border-pink-800 dark:text-white"
        )}
      >
        {message.image && (
          <img
            src={message.image}
            alt="Shared image"
            className="w-full max-w-full sm:max-w-sm rounded-lg mb-2"
          />
        )}
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
        <div
          className={cn(
            "text-xs mt-1 opacity-70",
            isUser ? "text-pink-100" : "text-gray-500"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};
