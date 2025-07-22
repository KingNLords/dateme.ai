export const TypingDots = () => {
  return (
    <div className="flex w-full mb-4 justify-start animate-fade-in">
      <div className="bg-white border border-pink-100  dark:bg-gray-900 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce-dots"></div>
          <div
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce-dots"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce-dots"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
