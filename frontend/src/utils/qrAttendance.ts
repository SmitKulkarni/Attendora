/**
 * Anti-Proxy Dynamic Rolling QR Code Engine (FR-FAC-04 & FR-STU-04)
 * Generates and validates time-based rotating tokens (10-second window)
 * with classroom GPS geo-fencing and single-use replay attack protection.
 */

export interface ClassroomGeoFence {
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number; // default 50 meters
}

export interface QrTokenPayload {
  sessionId: string;
  courseCode: string;
  token: string;
  timestamp: number;
  expiresAt: number;
  timeRemainingSeconds: number;
}

export interface StudentGeoLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface ScanValidationResult {
  isValid: boolean;
  code: 'SUCCESS' | 'EXPIRED_TOKEN' | 'OUTSIDE_GEOFENCE' | 'ALREADY_SCANNED' | 'INVALID_SIGNATURE';
  message: string;
  distanceMeters?: number;
}

// In-memory single-use nonce cache to prevent photo/screenshot sharing
const usedScanNonces = new Set<string>();

/**
 * Generates a rolling 10-second pseudo-TOTP token for a course session.
 */
export function generateRollingQrToken(sessionId: string, courseCode: string, windowSeconds: number = 10): QrTokenPayload {
  const now = Date.now();
  const currentStep = Math.floor(now / (windowSeconds * 1000));
  const expiresAt = (currentStep + 1) * windowSeconds * 1000;
  const timeRemainingSeconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));

  // Deterministic hash-like token from session, course, and step
  const rawToken = `${sessionId}-${courseCode}-${currentStep}`;
  let hash = 0;
  for (let i = 0; i < rawToken.length; i++) {
    hash = (hash << 5) - hash + rawToken.charCodeAt(i);
    hash |= 0;
  }
  const tokenHex = Math.abs(hash).toString(16).padStart(8, '0');

  return {
    sessionId,
    courseCode,
    token: `ATD-${tokenHex.toUpperCase()}`,
    timestamp: now,
    expiresAt,
    timeRemainingSeconds,
  };
}

/**
 * Computes distance between two coordinates using the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // Round to 0.1 meters
}

/**
 * Validates a student QR scan against rolling token, geo-fence, and single-use rules.
 */
export function validateStudentQrScan(
  scannedToken: string,
  expectedTokenPayload: QrTokenPayload,
  studentId: string,
  studentLocation?: StudentGeoLocation,
  classroomLocation?: ClassroomGeoFence
): ScanValidationResult {
  const now = Date.now();

  // 1. Verify token match & expiration
  if (now > expectedTokenPayload.expiresAt + 2000) { // 2s grace for network latency
    return {
      isValid: false,
      code: 'EXPIRED_TOKEN',
      message: 'QR code has expired. Please scan the current code on the projector screen.',
    };
  }

  if (scannedToken !== expectedTokenPayload.token) {
    return {
      isValid: false,
      code: 'INVALID_SIGNATURE',
      message: 'Invalid QR token signature.',
    };
  }

  // 2. Verify single-use per student per token window
  const scanKey = `${studentId}-${expectedTokenPayload.sessionId}-${expectedTokenPayload.token}`;
  if (usedScanNonces.has(scanKey)) {
    return {
      isValid: false,
      code: 'ALREADY_SCANNED',
      message: 'This attendance mark was already verified for this session.',
    };
  }

  // 3. Verify classroom geo-fence proximity (if configured)
  let distanceMeters: number | undefined;
  if (studentLocation && classroomLocation) {
    distanceMeters = calculateHaversineDistance(
      studentLocation.latitude,
      studentLocation.longitude,
      classroomLocation.latitude,
      classroomLocation.longitude
    );

    if (distanceMeters > classroomLocation.allowedRadiusMeters) {
      return {
        isValid: false,
        code: 'OUTSIDE_GEOFENCE',
        message: `Location verification failed: You are ${Math.round(distanceMeters)}m away (maximum allowed radius is ${classroomLocation.allowedRadiusMeters}m).`,
        distanceMeters,
      };
    }
  }

  usedScanNonces.add(scanKey);
  return {
    isValid: true,
    code: 'SUCCESS',
    message: 'Attendance successfully verified and recorded.',
    distanceMeters,
  };
}

