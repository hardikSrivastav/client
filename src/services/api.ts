/**
 * API service for connecting to the rForms backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Handles API responses and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `API Error: ${response.status} ${response.statusText}`
    );
  }
  return response.json() as Promise<T>;
}

// Check if we're running on the client
const isClient = typeof window !== 'undefined';

/**
 * API client for the rForms backend
 */
export const apiClient = {
  /**
   * Test the API connection
   */
  testConnection: async () => {
    if (!isClient) {
      throw new Error('API calls can only be made from the client');
    }
    
    const response = await fetch(`${API_BASE_URL}/test`);
    return handleResponse<{
      message: string;
      status: string;
      data: {
        metrics: Array<{
          id: number;
          name: string;
          type: string;
        }>;
      };
    }>(response);
  },

  /**
   * Check API health
   */
  checkHealth: async () => {
    if (!isClient) {
      throw new Error('API calls can only be made from the client');
    }
    
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<{
      status: string;
      version: string;
      service: string;
    }>(response);
  },
};

export default apiClient; 