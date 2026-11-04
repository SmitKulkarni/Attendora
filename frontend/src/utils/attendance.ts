/**
 * Core attendance calculation and compliance rules for Attendora
 * Implements FR-STU-01, FR-STU-03, FR-FAC-02, and FR-ADM-03
 */

export type ComplianceTier = 'COMPLIANT' | 'WARNING' | 'CRITICAL';

export interface ComplianceConfig {
  thresholdCompliant: number; // default 75.0%
  thresholdWarning: number;   // default 70.0%
}

export const DEFAULT_COMPLIANCE_CONFIG: ComplianceConfig = {
  thresholdCompliant: 75.0,
  thresholdWarning: 70.0,
};

/**
 * Calculates attendance percentage rounded to 1 decimal place.
 * Safely handles 0 conducted sessions without Div/0 crash.
 */
export function calculateAttendancePercentage(attended: number, conducted: number): number {
  if (conducted <= 0) return 100.0;
  if (attended < 0) attended = 0;
  if (attended > conducted) attended = conducted;
  const raw = (attended / conducted) * 100;
  return Math.round(raw * 10) / 10;
}

/**
 * Evaluates compliance tier against institutional statutory boundaries
 * - Compliant: >= 75.0%
 * - Warning: 70.0% - 74.9%
 * - Critical: < 70.0%
 */
export function getComplianceStatus(
  percentage: number,
  config: ComplianceConfig = DEFAULT_COMPLIANCE_CONFIG
): ComplianceTier {
  if (percentage >= config.thresholdCompliant) {
    return 'COMPLIANT';
  }
  if (percentage >= config.thresholdWarning) {
    return 'WARNING';
  }
  return 'CRITICAL';
}

/**
 * FR-STU-03 Shortage Recovery Calculator:
 * Computes how many consecutive future classes a student must attend
 * to bring their cumulative attendance back to the target threshold (default 75%).
 * Formula: ceil((threshold * conducted - attended) / (1 - threshold))
 */
export function calculateRecoveryClasses(
  attended: number,
  conducted: number,
  targetThreshold: number = 0.75
): number {
  if (conducted <= 0) return 0;
  const currentRatio = attended / conducted;
  if (currentRatio >= targetThreshold) return 0;

  const needed = (targetThreshold * conducted - attended) / (1 - targetThreshold);
  return Math.max(0, Math.ceil(needed));
}

/**
 * Computes how many upcoming classes a student can afford to miss
 * while remaining at or above the target threshold (default 75%).
 * Formula: floor((attended - threshold * conducted) / threshold)
 */
export function calculateAffordableAbsences(
  attended: number,
  conducted: number,
  targetThreshold: number = 0.75
): number {
  if (conducted <= 0) return 0;
  const currentRatio = attended / conducted;
  if (currentRatio < targetThreshold) return 0;

  const margin = (attended - targetThreshold * conducted) / targetThreshold;
  return Math.max(0, Math.floor(margin));
}

export interface CsvValidationResult {
  validRows: {
    rollNo: string;
    fullName: string;
    email: string;
    department: string;
    year: string;
    section: string;
  }[];
  errors: { row: number; reason: string }[];
}

/**
 * FR-ADM-01 Batch CSV pre-validation logic
 * Required headers: [RollNo, FullName, Email, Department, Year, Section]
 */
export function validateCsvRoster(rawRows: string[][]): CsvValidationResult {
  const errors: { row: number; reason: string }[] = [];
  const validRows: CsvValidationResult['validRows'] = [];
  const seenRolls = new Set<string>();

  if (rawRows.length === 0) {
    return { validRows: [], errors: [{ row: 0, reason: 'File is empty' }] };
  }

  const header = rawRows[0].map(h => h.trim().toLowerCase());
  const required = ['rollno', 'fullname', 'email', 'department', 'year', 'section'];
  const hasHeaders = required.every(req => header.some(h => h.replace(/[^a-z]/g, '') === req));

  if (!hasHeaders) {
    errors.push({
      row: 1,
      reason: 'Missing required headers: RollNo, FullName, Email, Department, Year, Section',
    });
    return { validRows: [], errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (row.length === 0 || row.every(c => !c.trim())) continue; // skip blank lines

    const rollNo = (row[0] || '').trim();
    const fullName = (row[1] || '').trim();
    const email = (row[2] || '').trim();
    const department = (row[3] || '').trim();
    const year = (row[4] || '').trim();
    const section = (row[5] || '').trim();

    if (!rollNo) {
      errors.push({ row: i + 1, reason: 'Roll Number is missing' });
      continue;
    }
    if (seenRolls.has(rollNo)) {
      errors.push({ row: i + 1, reason: `Duplicate Roll Number: ${rollNo}` });
      continue;
    }
    if (!fullName) {
      errors.push({ row: i + 1, reason: 'Full Name is missing' });
      continue;
    }
    if (!email || !emailRegex.test(email)) {
      errors.push({ row: i + 1, reason: `Invalid email address syntax: ${email || 'empty'}` });
      continue;
    }
    if (!department) {
      errors.push({ row: i + 1, reason: 'Department is missing' });
      continue;
    }

    seenRolls.add(rollNo);
    validRows.push({
      rollNo,
      fullName,
      email,
      department,
      year: year || 'TE',
      section: section || 'A',
    });
  }

  return { validRows, errors };
}

/**
 * Generates a shareable canonical deep link to a student's course attendance report
 */
export function generateAttendanceReportDeepLink(
  baseUrl: string,
  studentId: string,
  studentName: string,
  courseCode: string
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const params = new URLSearchParams({
    view: 'report',
    course: courseCode,
    studentId: studentId,
    student: studentName,
    t: Date.now().toString(36),
  });
  return `${cleanBase}/?${params.toString()}`;
}

