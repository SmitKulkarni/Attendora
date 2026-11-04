import { apiClient } from './client.ts';
import { StudentRecord } from '../types/index.ts';

export interface DefaulterStudent extends StudentRecord {
  shortfall: number;
  statutoryThreshold: number;
  tier: 'WARNING' | 'CRITICAL';
}

export async function fetchDefaultersReport(threshold: number = 75.0, department?: string): Promise<{
  threshold: number;
  defaultersCount: number;
  totalEvaluated: number;
  defaulters: DefaulterStudent[];
}> {
  const query = new URLSearchParams({ threshold: threshold.toString() });
  if (department && department !== 'All') query.set('department', department);

  const res = await apiClient.get<{
    success: boolean;
    threshold: number;
    defaultersCount: number;
    totalEvaluated: number;
    defaulters: DefaulterStudent[];
  }>(`/reports/defaulters?${query.toString()}`);

  if (res.data?.success) {
    return {
      threshold: res.data.threshold,
      defaultersCount: res.data.defaultersCount,
      totalEvaluated: res.data.totalEvaluated,
      defaulters: res.data.defaulters,
    };
  }

  return { threshold, defaultersCount: 0, totalEvaluated: 0, defaulters: [] };
}

export async function exportDefaultersCsv(threshold: number = 75.0): Promise<string | null> {
  const res = await apiClient.post<string>('/reports/export-csv', { threshold });
  if (res.data) {
    return res.data;
  }
  return null;
}

