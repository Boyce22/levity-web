/**
 * Global API Client with 401 Interceptor
 * 
 * Provides a standardized way to perform network requests with automatic
 * session expiration handling.
 */

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : endpoint;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          console.warn('Unauthorized request detected. Redirecting to login for security.');
          
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
        }
        return response;
      }

      return response;
    } catch (error) {
      console.error('Network layer failure:', error);
      throw error;
    }
  }

  async get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, body: any, options?: RequestInit) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint: string, body: any, options?: RequestInit) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
