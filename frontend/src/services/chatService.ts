
import { apiConfig } from '../config/apiConfig';

interface ChatRequest {
  conversation_id?: string;
  message: string;
}

interface ChatResponse {
  conversation_id: string;
  response: string;
  tool_calls: Array<{
    name: string;
    arguments: Record<string, any>;
    result: any;
  }>;
}

class ChatService {
  constructor(_baseUrl: string = '') {
    // baseUrl parameter is ignored; using configured URL from apiConfig
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(apiConfig.endpoints.chat.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${response.statusText}, ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in chat service:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check if the backend is running and accessible.');
      }
      throw error;
    }
  }

  // Helper method to format messages for display
  formatResponse(response: ChatResponse): string {
    return response.response;
  }
}

export default ChatService;
export type { ChatRequest, ChatResponse };