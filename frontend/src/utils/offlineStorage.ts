/**
 * Offline Attendance Queue & Background Sync Engine (FR-ADM-06)
 * Enables seamless roll-call recording in zero-connectivity basement lecture halls
 * with automatic conflict resolution upon network reconnection.
 */

import type { AttendanceSession } from '../types/index.ts';

export interface PendingSyncItem {
  id: string;
  type: 'ROLLCALL_SESSION' | 'STUDENT_RATE_OVERRIDE';
  payload: AttendanceSession | { studentId: string; rate: number; reason: string };
  enqueuedAt: string;
  retryCount: number;
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
}

const STORAGE_KEY = 'attendora_offline_sync_queue';

class OfflineStorageManager {
  private queue: PendingSyncItem[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: ((isOnline: boolean, pendingCount: number) => void)[] = [];

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch {
      this.queue = [];
    }
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage quota or private browsing safeguard
    }
    this.notifyListeners();
  }

  private handleNetworkChange(online: boolean): void {
    this.isOnline = online;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const pendingCount = this.getPendingCount();
    this.listeners.forEach((fn) => fn(this.isOnline, pendingCount));
  }

  onStatusChange(fn: (isOnline: boolean, pendingCount: number) => void): () => void {
    this.listeners.push(fn);
    fn(this.isOnline, this.getPendingCount());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  getPendingCount(): number {
    return this.queue.filter((item) => item.syncStatus === 'PENDING').length;
  }

  getQueue(): PendingSyncItem[] {
    return [...this.queue];
  }

  enqueueOfflineSession(session: AttendanceSession): PendingSyncItem {
    const item: PendingSyncItem = {
      id: `queue-${Date.now()}-${session.id}`,
      type: 'ROLLCALL_SESSION',
      payload: session,
      enqueuedAt: new Date().toISOString(),
      retryCount: 0,
      syncStatus: 'PENDING',
    };
    this.queue.push(item);
    this.persistToStorage();
    return item;
  }

  markSynced(queueId: string): void {
    this.queue = this.queue.filter((item) => item.id !== queueId);
    this.persistToStorage();
  }

  markFailed(queueId: string, error: string): void {
    const item = this.queue.find((q) => q.id === queueId);
    if (item) {
      item.retryCount += 1;
      item.syncStatus = 'FAILED';
      item.errorMessage = error;
      this.persistToStorage();
    }
  }

  /**
   * Flushes and synchronizes all pending offline roll-call submissions.
   */
  async flushQueue(
    syncHandler: (item: PendingSyncItem) => Promise<boolean>
  ): Promise<{ synced: number; failed: number }> {
    const pending = this.queue.filter((item) => item.syncStatus === 'PENDING' || item.syncStatus === 'FAILED');
    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      item.syncStatus = 'SYNCING';
      this.persistToStorage();

      try {
        const success = await syncHandler(item);
        if (success) {
          this.markSynced(item.id);
          synced += 1;
        } else {
          this.markFailed(item.id, 'API submission rejected');
          failed += 1;
        }
      } catch (err: unknown) {
        this.markFailed(item.id, err instanceof Error ? err.message : 'Network failure');
        failed += 1;
      }
    }

    return { synced, failed };
  }

  clearQueue(): void {
    this.queue = [];
    this.persistToStorage();
  }
}

export const offlineStorage = new OfflineStorageManager();
