import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExamClearance, type MedicalWaiverRecord } from './hallTicketGating.ts';
import type { StudentRecord } from '../types/index.ts';

const safeStudent: StudentRecord = {
  id: 'stu-safe',
  rollNo: '20000001',
  name: 'Safe Student',
  email: 'safe@test.edu',
  department: 'Computer Sci.',
  semester: 6,
  section: 'A',
  avatar: '',
  totalConducted: 40,
  totalAttended: 35,
  attendanceRate: 87.5,
  status: 'Present',
};

const borderlineStudent: StudentRecord = {
  id: 'stu-borderline',
  rollNo: '20000004',
  name: 'Borderline Student',
  email: 'border@test.edu',
  department: 'Computer Sci.',
  semester: 6,
  section: 'A',
  avatar: '',
  totalConducted: 40,
  totalAttended: 27,
  attendanceRate: 67.5,
  status: 'Low Rate',
};

test('evaluateExamClearance grants unconditional clearance to >= 75% students', () => {
  const clearance = evaluateExamClearance(safeStudent);
  assert.equal(clearance.status, 'CLEARED_FOR_EXAM');
  assert.ok(clearance.hallTicketNumber?.startsWith('HT-2026-SEM6-20000001'));
  assert.ok(clearance.qrVerificationPayload?.includes('STATUS=CLEARED'));
});

test('evaluateExamClearance bars defaulter without waiver', () => {
  const clearance = evaluateExamClearance(borderlineStudent);
  assert.equal(clearance.status, 'BARRED_FROM_EXAMINATION');
  assert.equal(clearance.hallTicketNumber, undefined);
  assert.ok(clearance.debarmentReason?.includes('mandatory 75.0%'));
});

test('evaluateExamClearance approves conditional clearance with statutory medical waiver', () => {
  const waiver: MedicalWaiverRecord = {
    waiverId: 'waiver-01',
    studentId: borderlineStudent.id,
    concessionPercentage: 10.0, // Bridges 67.5% -> 77.5%
    reasonCategory: 'MEDICAL_HOSPITALIZATION',
    supportingDocumentRef: 'DOC-HOSP-2026-99',
    approvedByActorName: 'Dr. Anita Roy (Dean)',
    approvalDate: '2026-11-04',
  };

  const clearance = evaluateExamClearance(borderlineStudent, waiver);
  assert.equal(clearance.status, 'CONDITIONAL_WAIVER_APPROVED');
  assert.equal(clearance.effectiveAttendanceRate, 77.5);
  assert.ok(clearance.hallTicketNumber?.includes('COND'));
  assert.ok(clearance.qrVerificationPayload?.includes('STATUS=WAIVER_APPROVED'));
});

