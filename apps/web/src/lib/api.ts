const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API endpoints
export const api = {
  // Auth
  auth: {
    healthCheck: () => apiClient.get('/auth/health'),
  },

  // Tenants
  tenants: {
    list: () => apiClient.get('/tenants'),
    get: (id: string) => apiClient.get(`/tenants/${id}`),
  },

  // Assessments
  assessments: {
    healthCheck: () => apiClient.get('/assessments/health'),
    getQuestions: (params?: { scope?: string; dimension?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.scope) queryParams.set('scope', params.scope);
      if (params?.dimension) queryParams.set('dimension', params.dimension);
      const query = queryParams.toString();
      return apiClient.get(`/assessments/questions${query ? `?${query}` : ''}`);
    },
    get: (id: string) => apiClient.get(`/assessments/${id}`),
    getScore: (id: string) => apiClient.get(`/assessments/${id}/score`),
  },
};
