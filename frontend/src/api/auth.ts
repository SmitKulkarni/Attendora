import { apiClient } from './client.ts';
import { UserProfile } from '../types/index.ts';

export interface LoginResponse {
  success: boolean;
  access_token: string;
  user: UserProfile & { tenant_id: string };
}

export async function loginUser(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
  const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });
  if (res.data?.success && res.data.access_token) {
    apiClient.setToken(res.data.access_token);
    apiClient.setTenantId(res.data.user.tenant_id);
    return { user: res.data.user, error: null };
  }
  return { user: null, error: res.error?.message || 'Authentication failed' };
}

export async function logoutUser(): Promise<void> {
  await apiClient.post('/auth/logout');
  apiClient.setToken(null);
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const res = await apiClient.get<{ success: boolean; user: UserProfile }>('/auth/me');
  if (res.data?.success) {
    return res.data.user;
  }
  return null;
}

