/**
 * Attendora Enterprise API Client
 * Supports real-time backend communication, Bearer JWT injection,
 * automatic tenant context headers, and transparent offline/mock fallback.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private tenantId: string = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  private isOnlineBackendAvailable: boolean | null = null;

  constructor() {
    // Read from Vite environment variable or fall back dynamically
    const envApiUrl = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_API_URL as string) : undefined;
    this.baseUrl = envApiUrl || (typeof window !== 'undefined' && window.location.port === '3000'
      ? 'http://localhost:5000/api/v1'
      : '/api/v1');

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('attendora_access_token');
      const savedTenant = localStorage.getItem('attendora_tenant_id') || (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_DEFAULT_TENANT_ID as string) : null);
      if (savedTenant) this.tenantId = savedTenant;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('attendora_access_token', token);
      else localStorage.removeItem('attendora_access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('attendora_tenant_id', tenantId);
    }
  }

  getTenantId(): string {
    return this.tenantId;
  }

  /**
   * Health check to detect if live backend service is online.
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.baseUrl.replace('/api/v1', '')}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this.isOnlineBackendAvailable = res.ok;
      return res.ok;
    } catch {
      this.isOnlineBackendAvailable = false;
      return false;
    }
  }

  get isBackendOnline(): boolean | null {
    return this.isOnlineBackendAvailable;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    headers.set('X-Tenant-ID', this.tenantId);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.token) {
        // Token expired - clear and return unauthorized error
        this.setToken(null);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await response.json();
        if (!response.ok) {
          return {
            data: null,
            error: body.error || { code: 'HTTP_ERROR', message: `Request failed with status ${response.status}` },
            status: response.status,
          };
        }
        return { data: body, error: null, status: response.status };
      }

      if (response.ok) {
        return { data: (await response.text()) as unknown as T, error: null, status: response.status };
      }

      return {
        data: null,
        error: { code: 'HTTP_ERROR', message: `Request failed with status ${response.status}` },
        status: response.status,
      };
    } catch (err: unknown) {
      return {
        data: null,
        error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network error' },
        status: 0,
      };
    }
  }

  get<T>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

