/**
 * Examination Hall-Ticket Statutory Gating Engine (FR-ADM-09)
 * Enforces automatic barring of < 75% defaulters from semester finals
 * with administrative medical/sports concession waiver workflows.
 */

import type { StudentRecord } from '../types/index.ts';

export type ExamClearanceStatus =
  | 'CLEARED_FOR_EXAM'
  | 'CONDITIONAL_WAIVER_APPROVED'
  | 'BARRED_FROM_EXAMINATION';

export interface MedicalWaiverRecord {
  waiverId: string;
  studentId: string;
  concessionPercentage: number; // e.g. 10.0% max statutory allowance
  reasonCategory: 'MEDICAL_HOSPITALIZATION' | 'UNIVERSITY_SPORTS' | 'BEREAVEMENT';
  supportingDocumentRef: string;
  approvedByActorName: string;
  approvalDate: string;
}

export interface HallTicketClearance {
  studentId: string;
  rollNo: string;
  studentName: string;
  department: string;
  semester: number;
  rawAttendanceRate: number;
  effectiveAttendanceRate: number;
  status: ExamClearanceStatus;
  hallTicketNumber?: string;
  qrVerificationPayload?: string;
  concessionApplied?: MedicalWaiverRecord;
  debarmentReason?: string;
}

/**
 * Evaluates whether a student is cleared to sit for semester examinations.
 * Under University statutes:
 * - >= 75.0%: Unconditional clearance.
 * - 65.0% - 74.9%: Clearance permitted ONLY IF statutory waiver is approved by Academic Dean.
 * - < 65.0% OR < 75.0% without approved waiver: Barred from examinations.
 */
export function evaluateExamClearance(
  student: StudentRecord,
  waiver?: MedicalWaiverRecord
): HallTicketClearance {
  const rawRate = student.attendanceRate;

  if (rawRate >= 75.0) {
    const hallTicketNo = `HT-2026-SEM6-${student.rollNo}`;
    return {
      studentId: student.id,
      rollNo: student.rollNo,
      studentName: student.name,
      department: student.department,
      semester: student.semester,
      rawAttendanceRate: rawRate,
      effectiveAttendanceRate: rawRate,
      status: 'CLEARED_FOR_EXAM',
      hallTicketNumber: hallTicketNo,
      qrVerificationPayload: `VERIFIED_HT:${hallTicketNo}:${student.rollNo}:STATUS=CLEARED`,
    };
  }

  // Check if waiver can bridge the gap
  if (waiver) {
    const effectiveRate = Math.round((rawRate + waiver.concessionPercentage) * 10) / 10;
    if (effectiveRate >= 75.0 && rawRate >= 65.0) {
      const hallTicketNo = `HT-2026-SEM6-COND-${student.rollNo}`;
      return {
        studentId: student.id,
        rollNo: student.rollNo,
        studentName: student.name,
        department: student.department,
        semester: student.semester,
        rawAttendanceRate: rawRate,
        effectiveAttendanceRate: effectiveRate,
        status: 'CONDITIONAL_WAIVER_APPROVED',
        hallTicketNumber: hallTicketNo,
        qrVerificationPayload: `VERIFIED_HT:${hallTicketNo}:${student.rollNo}:STATUS=WAIVER_APPROVED`,
        concessionApplied: waiver,
      };
    }
  }

  return {
    studentId: student.id,
    rollNo: student.rollNo,
    studentName: student.name,
    department: student.department,
    semester: student.semester,
    rawAttendanceRate: rawRate,
    effectiveAttendanceRate: rawRate,
    status: 'BARRED_FROM_EXAMINATION',
    debarmentReason: `Attendance rate of ${rawRate}% is below the mandatory 75.0% statutory threshold without an approved compensatory waiver.`,
  };
}

