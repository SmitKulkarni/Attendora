import { apiClient } from './client.ts';
import { AuditLogEntry } from '../types/index.ts';

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await apiClient.get<{ success: boolean; logs: AuditLogEntry[] }>('/audit/logs');
  if (res.data?.success) {
    return res.data.logs;
  }
  return [];
}

export async function postAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry | null> {
  const res = await apiClient.post<{ success: boolean; log: AuditLogEntry }>('/audit/logs', entry);
  if (res.data?.success) {
    return res.data.log;
  }
  return null;
}

