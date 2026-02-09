import { useRouter } from 'next/navigation';
import { apiConfig } from '@/src/config/apiConfig';

// Production-ready API utility functions with centralized authentication handling
export const apiCall = async (
  url: string,
  options: RequestInit = {},
  handleUnauthorized: () => void
): Promise<Response> => {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Critical for cookie-based authentication
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Handle unauthorized access
      handleUnauthorized();
      let errorDetail = 'Session expired. Please log in again.';
      try {
        const errorResponse = await response.clone().json();
        errorDetail = errorResponse.detail || errorDetail;
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorDetail);
    }

    return response;
  } catch (error: any) {
    // Only log errors in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.error(`API call failed to ${url}:`, error);
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check if the backend is running and accessible.');
    }
    throw error;
  }
};

// Specific API utility functions with improved error handling
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      // Only log in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('Making login request to:', apiConfig.endpoints.auth.login);
      }

      const response = await fetch(apiConfig.endpoints.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: 'include' // Include credentials to receive cookies
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, create a generic error object
          errorData = { detail: `Login failed with status ${response.status}` };
        }
        const errorMessage =
          errorData.detail ||
          errorData.message ||
          `Login failed with status ${response.status}`;

        throw new Error(errorMessage);
      }

      // Since backend sets token in cookie, we don't need to store it manually
      const data = await response.json();

      // Small delay to ensure the cookie is properly set before subsequent requests
      await new Promise(resolve => setTimeout(resolve, 100));

      return data;
    } catch (error: any) {
      // Only log errors in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.error('Login API call failed:', error);
      }

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // This indicates a network/CORS error
        throw new Error('Network error: Unable to connect to the authentication server. This may be a CORS issue or the backend server is not running. Please check if the backend is running.');
      } else if (error.name === 'TypeError') {
        // Other network errors
        throw new Error('Network error: Unable to connect to the server. Please check if the backend is running and accessible.');
      }

      // Re-throw other errors
      throw error;
    }
  },

  register: async (userData: { email: string; password: string; firstName?: string; lastName?: string }) => {
    try {
      // Only log in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('Making register request to:', apiConfig.endpoints.auth.register);
      }

      const response = await fetch(apiConfig.endpoints.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName
        }),
        credentials: 'include' // Include credentials to receive cookies if any are set
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, create a generic error object
          errorData = { detail: `Registration failed with status ${response.status}` };
        }
        throw new Error(
          errorData.detail ||
          errorData.message ||
          `Registration failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error: any) {
      // Only log errors in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.error('Register API call failed:', error);
      }

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // This indicates a network/CORS error
        throw new Error('Network error: Unable to connect to the authentication server. This may be a CORS issue or the backend server is not running. Please check if the backend is running.');
      } else if (error.name === 'TypeError') {
        // Other network errors
        throw new Error('Network error: Unable to connect to the server. Please check if the backend is running and accessible.');
      }
      throw error;
    }
  },

  getUser: async () => {
    try {
      // Only log in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('Making getUser request to:', apiConfig.endpoints.auth.me);
      }

      const response = await fetch(apiConfig.endpoints.auth.me, {
        credentials: 'include' // Include cookies in the request
      });

      // Handle 401 specifically - this means user is not authenticated, which is normal
      if (response.status === 401) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('User not authenticated (401 received)');
        }
        return null; // User is not authenticated, return null
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, create a generic error object
          errorData = { detail: `Failed to get user data with status ${response.status}` };
        }
        throw new Error(
          errorData.detail ||
          errorData.message ||
          `Failed to get user data with status ${response.status}`
        );
      }

      const userData = await response.json();
      // Only log in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('User data retrieved successfully:', userData);
      }
      return userData;
    } catch (error: any) {
      // Only log errors in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.error('getUser API call failed:', error);
      }

      // Check if it's a network error specifically
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // This is a network error - the server might be down or unreachable
        // Return null to indicate user is not authenticated due to network issue
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Network error during auth check - backend may be unreachable:', error);
        }
        return null; // Don't throw, just return null indicating no user
      } else if (error.name === 'TypeError') {
        // Other network errors
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Network error during auth check:', error);
        }
        return null; // Don't throw, just return null indicating no user
      }

      // For any other error, log it but don't break the auth flow
      if (process.env.NODE_ENV !== 'production') {
        console.error('getUser API call failed with non-network error:', error);
      }
      return null; // Return null to indicate user is not authenticated
    }
  },

  logout: async () => {
    try {
      // Only log in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('Making logout request to:', apiConfig.endpoints.auth.logout);
      }

      const response = await fetch(apiConfig.endpoints.auth.logout, {
        method: 'POST',
        credentials: 'include' // Include credentials to send cookies for deletion
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, create a generic error object
          errorData = { detail: `Logout failed with status ${response.status}` };
        }
        throw new Error(
          errorData.detail ||
          errorData.message ||
          `Logout failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error: any) {
      // Only log errors in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.error('Logout API call failed:', error);
      }

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // This indicates a network/CORS error
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Network error during logout - backend may be unreachable:', error);
        }
        // For logout, we can still clear local state even if server request fails
        return { message: "Logged out locally" };
      } else if (error.name === 'TypeError') {
        // Other network errors
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Network error during logout:', error);
        }
        // For logout, we can still clear local state even if server request fails
        return { message: "Logged out locally" };
      }

      throw error;
    }
  },
};

export const todoApi = {
  getTodos: async (handleUnauthorized: () => void) => {
    const response = await apiCall(apiConfig.endpoints.todos.base, {}, handleUnauthorized);

    if (!response.ok) {
      throw new Error(`Failed to fetch todos with status ${response.status}`);
    }

    return await response.json();
  },

  createTodo: async (todoData: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; status?: 'todo' | 'in-progress' | 'completed' }, handleUnauthorized: () => void) => {
    const response = await apiCall(
      apiConfig.endpoints.todos.base,
      {
        method: 'POST',
        body: JSON.stringify(todoData),
      },
      handleUnauthorized
    );

    if (!response.ok) {
      throw new Error(`Failed to create todo with status ${response.status}`);
    }

    return await response.json();
  },

  updateTodo: async (id: string, todoData: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; status?: 'todo' | 'in-progress' | 'completed' }, handleUnauthorized: () => void) => {
    const response = await apiCall(
      apiConfig.endpoints.todos.getById(id),
      {
        method: 'PUT',
        body: JSON.stringify(todoData),
      },
      handleUnauthorized
    );

    if (!response.ok) {
      throw new Error(`Failed to update todo with status ${response.status}`);
    }

    return await response.json();
  },

  toggleTodo: async (id: string, handleUnauthorized: () => void) => {
    const response = await apiCall(
      apiConfig.endpoints.todos.toggle(id),
      {
        method: 'POST',
      },
      handleUnauthorized
    );

    if (!response.ok) {
      throw new Error(`Failed to toggle todo with status ${response.status}`);
    }

    return await response.json();
  },

  deleteTodo: async (id: string, handleUnauthorized: () => void) => {
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Attempting to delete todo with ID: ${id}`);
    }

    const url = apiConfig.endpoints.todos.getById(id);

    const response = await apiCall(
      url,
      {
        method: 'DELETE',
      },
      handleUnauthorized
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Only log errors in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.error(`DELETE request failed with status ${response.status}:`, errorText);
      }
      throw new Error(`Failed to delete todo with status ${response.status}: ${errorText}`);
    }

    // Handle 204 No Content response properly - don't try to parse JSON
    if (response.status === 204) {
      // Only log in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('Todo deleted successfully (204 No Content)');
      }
      return; // No content to return
    }

    // For other successful responses, try to parse JSON
    const result = await response.json();
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log('DELETE response data:', result);
    }
    return result;
  },
};