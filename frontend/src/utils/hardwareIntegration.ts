/**
 * Campus Hardware & IoT Ingestion Reconciliation Engine (FR-ADM-05)
 * Ingests physical RFID turnstile taps and biometric scanner punches,
 * reconciling hardware timestamps with academic timetable slots.
 */

export interface RfidCardPunch {
  punchId: string;
  cardUid: string;
  gateId: string;
  gateName: string;
  timestamp: string; // ISO timestamp
  direction: 'ENTRY' | 'EXIT';
}

export interface BiometricFingerprintPunch {
  punchId: string;
  scannerId: string;
  biometricToken: string;
  timestamp: string;
  confidenceScore: number; // 0.0 - 1.0
}

export interface HardwareMapping {
  hardwareId: string; // RFID UID or Biometric Token
  studentId: string;
  rollNo: string;
  studentName: string;
}

export interface ReconciledAttendancePunch {
  punchId: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  courseCode: string;
  scheduledSlot: string;
  punchTime: string;
  status: 'RECONCILED_PRESENT' | 'LATE_ENTRY' | 'MISMATCH_TIME' | 'UNKNOWN_STUDENT';
  remarks: string;
}

// Baseline hardware registration table
export const DEFAULT_HARDWARE_MAPPINGS: HardwareMapping[] = [
  { hardwareId: 'RFID-9A4B12', studentId: 'stu-1', rollNo: '20000001', studentName: 'Heuren Name' },
  { hardwareId: 'RFID-7C8D34', studentId: 'stu-2', rollNo: '20000002', studentName: 'Kenrii Anay' },
  { hardwareId: 'RFID-1F2E56', studentId: 'stu-3', rollNo: '20000003', studentName: 'Karey Matton' },
  { hardwareId: 'RFID-8B9C78', studentId: 'stu-4', rollNo: '20000004', studentName: 'Samoh Baiin' },
  { hardwareId: 'BIO-FP-0091', studentId: 'stu-1', rollNo: '20000001', studentName: 'Heuren Name' },
];

/**
 * Reconciles an RFID or biometric punch against the scheduled lecture timetable.
 * Allows a 15-minute grace window before and after lecture start.
 */
export function reconcileHardwarePunch(
  hardwareId: string,
  punchIsoString: string,
  targetCourseCode: string = 'CS603',
  slotStartTime: string = '14:00', // 2:00 PM
  slotEndTime: string = '15:00',
  mappings: HardwareMapping[] = DEFAULT_HARDWARE_MAPPINGS
): ReconciledAttendancePunch {
  const punchDate = new Date(punchIsoString);
  const mapping = mappings.find((m) => m.hardwareId.toUpperCase() === hardwareId.toUpperCase());

  if (!mapping) {
    return {
      punchId: `rec-${Date.now()}`,
      studentId: 'unknown',
      rollNo: 'UNKNOWN',
      studentName: 'Unregistered Card Holder',
      courseCode: targetCourseCode,
      scheduledSlot: `${slotStartTime} - ${slotEndTime}`,
      punchTime: punchIsoString,
      status: 'UNKNOWN_STUDENT',
      remarks: `Card UID ${hardwareId} is not mapped to any registered student in database.`,
    };
  }

  // Parse slot hours & minutes
  const [startHour, startMin] = slotStartTime.split(':').map(Number);
  const [endHour, endMin] = slotEndTime.split(':').map(Number);

  const punchMinutesFromMidnight = punchDate.getHours() * 60 + punchDate.getMinutes();
  const slotStartMinutes = startHour * 60 + startMin;
  const slotEndMinutes = endHour * 60 + endMin;

  // Window: 15 minutes before start up to 10 minutes after start = PRESENT
  // 10 minutes to 30 minutes after start = LATE_ENTRY
  // Outside = MISMATCH_TIME
  if (
    punchMinutesFromMidnight >= slotStartMinutes - 15 &&
    punchMinutesFromMidnight <= slotStartMinutes + 10
  ) {
    return {
      punchId: `rec-${Date.now()}-${mapping.rollNo}`,
      studentId: mapping.studentId,
      rollNo: mapping.rollNo,
      studentName: mapping.studentName,
      courseCode: targetCourseCode,
      scheduledSlot: `${slotStartTime} - ${slotEndTime}`,
      punchTime: punchIsoString,
      status: 'RECONCILED_PRESENT',
      remarks: 'Verified on-time gate punch automatically registered as Present.',
    };
  }

  if (
    punchMinutesFromMidnight > slotStartMinutes + 10 &&
    punchMinutesFromMidnight <= slotStartMinutes + 30
  ) {
    return {
      punchId: `rec-${Date.now()}-${mapping.rollNo}`,
      studentId: mapping.studentId,
      rollNo: mapping.rollNo,
      studentName: mapping.studentName,
      courseCode: targetCourseCode,
      scheduledSlot: `${slotStartTime} - ${slotEndTime}`,
      punchTime: punchIsoString,
      status: 'LATE_ENTRY',
      remarks: 'Student punched in > 10 minutes after lecture start; recorded as Late Entry.',
    };
  }

  return {
    punchId: `rec-${Date.now()}-${mapping.rollNo}`,
    studentId: mapping.studentId,
    rollNo: mapping.rollNo,
    studentName: mapping.studentName,
    courseCode: targetCourseCode,
    scheduledSlot: `${slotStartTime} - ${slotEndTime}`,
    punchTime: punchIsoString,
    status: 'MISMATCH_TIME',
    remarks: 'Punch timestamp does not correspond to an active lecture slot for this batch.',
  };
}

