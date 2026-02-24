'use client';

import React, { useState, useRef } from 'react';
import ChatBotUI, { Message as BotMessage } from './ChatBotUI';
import ChatService from '../services/chatService';

interface ChatInterfaceProps {
  onTaskUpdated?: () => void;
  showNotification?: (type: string, message: string) => void;
}

// Define the old message type to handle mapping
interface OldMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onTaskUpdated, showNotification }) => {
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    // Add user message to chat
    const userMessage: BotMessage = {
      role: 'user',
      text: text,
    };

    setMessages(prev => [...prev, userMessage]);

    // Create a temporary "typing" message to show the bot is responding
    const typingMessage: BotMessage = {
      role: 'bot',
      text: '',
      isStreaming: true
    };

    setMessages(prev => [...prev, typingMessage]);
    setLoading(true);

    try {
      // Prepare the request with conversation_id if available
      const request = {
        message: text,
        ...(conversationId && { conversation_id: conversationId }),
      };

      // Call the chat API endpoint using the service
      const chatService = new ChatService();
      const data = await chatService.sendMessage(request);

      // Update conversation ID if it's the first message
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      // Update the typing message with the actual response
      setMessages(prev => {
        const updatedMessages = [...prev];
        // Replace the last message (typing message) with the actual response
        updatedMessages[updatedMessages.length - 1] = {
          role: 'bot',
          text: data.response,
          isStreaming: false
        };
        return updatedMessages;
      });

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

      // Update the typing message with the error message
      setMessages(prev => {
        const updatedMessages = [...prev];
        // Replace the last message (typing message) with the error message
        updatedMessages[updatedMessages.length - 1] = {
          role: 'bot',
          text: error instanceof Error ? error.message : 'Sorry, I encountered an error processing your request. Please try again.',
          isStreaming: false
        };
        return updatedMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatBotUI
      messages={messages}
      onSend={handleSend}
      loading={loading}
    />
  );
};

export default ChatInterface;