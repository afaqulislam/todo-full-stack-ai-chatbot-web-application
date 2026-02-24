'use client';

import React, { useState } from 'react';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any); // Type assertion to avoid event typing issues
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
      <div className="flex">
        <input
          type="text"
          value={inputValue}
          onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => handleKeyDown(e as any)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;