'use client';

import { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatService from '../../services/chatService';
import type { Message } from './types';

interface ChatWidgetProps {
  initialOpen?: boolean;
  onTaskUpdated?: () => void; // Callback to notify parent when a task is updated
  showNotification?: (type: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number) => void; // Function to show notifications
}

const ChatWidget = ({ initialOpen = false, onTaskUpdated, showNotification }: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare the request with conversation_id if available
      const request = {
        message: message,
        ...(conversationId && { conversation_id: conversationId }),
      };

      // Call the chat API endpoint using the service
      const chatService = new ChatService();
      const data = await chatService.sendMessage(request);

      // Update conversation ID if it's the first message
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Define responseText once for use in both notification and refresh logic
      const responseText = data.response.toLowerCase();

      // Show notification only for actual task operations (not for all responses)
      if (showNotification) {
        // Check if this is a task operation response that deserves a notification
        const isTaskOperation = [
          'task', 'added', 'created', 'deleted', 'removed', 'updated', 'completed',
          'marked', 'done', 'finished', 'changed', 'renamed', 'modified'
        ].some(word => responseText.includes(word));

        // Only show notifications for clear task operations
        if (isTaskOperation) {
          // Determine notification type based on the operation
          let notificationType: 'success' | 'error' | 'info' | 'warning' = 'success';

          if (responseText.includes('error') || responseText.includes('sorry')) {
            notificationType = 'error';
          }
          // For task operations, use success type
          else if (responseText.includes('added') ||
                   responseText.includes('deleted') || responseText.includes('removed') ||
                   responseText.includes('updated') || responseText.includes('changed') ||
                   responseText.includes('completed') || responseText.includes('marked as')) {
            notificationType = 'success';
          }

          showNotification(notificationType, data.response);
        }
      }

      // Check if the response indicates a task operation and refresh todos if needed
      const isTaskOperationForRefresh = [
        'task', 'added', 'created', 'deleted', 'removed', 'updated', 'completed',
        'marked', 'done', 'finished', 'changed', 'renamed', 'modified'
      ].some(word => responseText.includes(word));

      if (isTaskOperationForRefresh && onTaskUpdated) {
        // Small delay to ensure the backend has processed the changes
        setTimeout(() => {
          onTaskUpdated();
        }, 300);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          <ChatHeader onClose={handleClose} />
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default ChatWidget;