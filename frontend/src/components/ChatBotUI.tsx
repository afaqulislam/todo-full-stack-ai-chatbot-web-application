"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";

export type Message = {
  role: "user" | "bot";
  text: string;
  isStreaming?: boolean;
};

type ChatBotUIProps = {
  messages: Message[];
  onSend: (message: string) => void;
  loading?: boolean;
  title?: string;
  logo?: string;
};

export default function ChatBotUI({
  messages,
  onSend,
  loading = false,
  title = "Taskory Assistant",
  logo,
}: ChatBotUIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    onSend(input);
    setInput("");
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-[60px] h-[60px] rounded-full bg-muted flex items-center justify-center cursor-pointer z-[9999] shadow-lg border border-primary transition-colors"
      >
        {logo ? (
          <img src={logo} alt="Taskory Assistant" className="w-8 h-8" />
        ) : (
          <img src="/favicon.ico" alt="Taskory Assistant" className="w-8 h-8" />
        )}

        {!isOpen && (
          <div className="absolute -top-[42px] translate-x-[-30%] bg-popover text-primary text-sm font-medium px-3 py-[6px] rounded-md shadow-md whitespace-nowrap pointer-events-none animate-pulse shadow-primary/20">
            Try Taskory Assistant
            <div className="absolute -bottom-1 left-[80%] w-2 h-2 bg-popover translate-x-[-50%] rotate-45"></div>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[min(380px,calc(100vw-32px))] h-[min(600px,calc(100vh-140px))] bg-popover rounded-xl border border-border flex flex-col overflow-hidden shadow-xl z-[9999]">
          {/* Header */}
          <div className="px-[14px] py-3 bg-primary text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-[18px]">🤖</span>
              <span>{title}</span>
            </div>
            <button
              onClick={toggleChat}
              className="text-white text-[18px] hover:text-muted transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto overscroll-contain flex flex-col">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 max-w-[80%] px-3 py-2 rounded-xl relative transition-all duration-300 ${
                  msg.role === "user"
                    ? "self-end bg-primary text-white"
                    : `self-start bg-muted ${
                        msg.isStreaming
                          ? "border-l-2 border-primary"
                          : ""
                      }`
                }`}
              >
                {msg.text}

                {msg.isStreaming && (
                  <div className="inline-flex gap-1 ml-[6px]">
                    <span className="w-[6px] h-[6px] bg-primary rounded-full animate-pulse"></span>
                    <span className="w-[6px] h-[6px] bg-primary rounded-full animate-pulse delay-150"></span>
                    <span className="w-[6px] h-[6px] bg-primary rounded-full animate-pulse delay-300"></span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex border-t border-border bg-popover p-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              disabled={loading}
              className="flex-1 p-2 outline-none bg-background text-foreground rounded-l-md border border-border border-r-0 px-3 focus:ring-2 focus:ring-ring focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}