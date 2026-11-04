import test from 'node:test';
import assert from 'node:assert/strict';
import { offlineStorage, type PendingSyncItem } from './offlineStorage.ts';
import type { AttendanceSession } from '../types/index.ts';

test('offlineStorage enqueues, counts, and flushes pending roll-call items', async () => {
  offlineStorage.clearQueue();
  assert.equal(offlineStorage.getPendingCount(), 0);

  const sampleSession: AttendanceSession = {
    id: 'offline-sess-1',
    subjectCode: 'CS603',
    subjectName: 'DBMS',
    department: 'Computer Sci.',
    semester: 6,
    section: 'A',
    facultyId: 'faculty-1',
    facultyName: 'Prof. Deshmukh',
    date: '2026-11-04',
    timeSlot: '02:00 PM - 03:00 PM',
    totalEnrolled: 1,
    presentCount: 1,
    absentCount: 0,
    records: [{ studentId: 'stu-1', rollNo: '20000001', studentName: 'Heuren', status: 'Present' }],
    createdAt: new Date().toISOString(),
  };

  // Enqueue session
  const item = offlineStorage.enqueueOfflineSession(sampleSession);
  assert.equal(item.syncStatus, 'PENDING');
  assert.equal(offlineStorage.getPendingCount(), 1);

  // Flush queue with mock handler
  const result = await offlineStorage.flushQueue(async (syncItem: PendingSyncItem) => {
    return syncItem.id === item.id;
  });

  assert.equal(result.synced, 1);
  assert.equal(result.failed, 0);
  assert.equal(offlineStorage.getPendingCount(), 0);
});
