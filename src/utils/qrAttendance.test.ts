import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRollingQrToken,
  calculateHaversineDistance,
  validateStudentQrScan,
} from './qrAttendance.ts';

test('generateRollingQrToken produces valid 10s window payload', () => {
  const token = generateRollingQrToken('sess-100', 'CS603', 10);
  assert.equal(token.sessionId, 'sess-100');
  assert.equal(token.courseCode, 'CS603');
  assert.ok(token.token.startsWith('ATD-'));
  assert.ok(token.timeRemainingSeconds <= 10 && token.timeRemainingSeconds >= 0);
  assert.ok(token.expiresAt > token.timestamp);
});

test('calculateHaversineDistance computes accurate ground distance in meters', () => {
  // LH-201 Classroom Coordinates: Pune Engineering College
  const classroomLat = 18.5204;
  const classroomLon = 73.8567;

  // Same location -> 0 meters
  const distZero = calculateHaversineDistance(classroomLat, classroomLon, classroomLat, classroomLon);
  assert.equal(distZero, 0);

  // Point ~30 meters away
  const studentNearbyLat = 18.5206;
  const studentNearbyLon = 73.8567;
  const distNearby = calculateHaversineDistance(classroomLat, classroomLon, studentNearbyLat, studentNearbyLon);
  assert.ok(distNearby > 15 && distNearby < 35, `Expected ~22m, got ${distNearby}m`);

  // Point ~500 meters away (outside college gate)
  const studentDistantLat = 18.5250;
  const studentDistantLon = 73.8567;
  const distDistant = calculateHaversineDistance(classroomLat, classroomLon, studentDistantLat, studentDistantLon);
  assert.ok(distDistant > 450 && distDistant < 550, `Expected ~511m, got ${distDistant}m`);
});

test('validateStudentQrScan enforces token match, geo-fence and replay prevention', () => {
  const token = generateRollingQrToken('sess-200', 'CS601', 10);
  const classroom = { latitude: 18.5204, longitude: 73.8567, allowedRadiusMeters: 50 };

  // 1. Valid scan inside classroom
  const validScan = validateStudentQrScan(
    token.token,
    token,
    'stu-001',
    { latitude: 18.5205, longitude: 73.8567 },
    classroom
  );
  assert.equal(validScan.isValid, true);
  assert.equal(validScan.code, 'SUCCESS');

  // 2. Replay attack: Scanning same token twice with same student ID
  const replayScan = validateStudentQrScan(
    token.token,
    token,
    'stu-001',
    { latitude: 18.5205, longitude: 73.8567 },
    classroom
  );
  assert.equal(replayScan.isValid, false);
  assert.equal(replayScan.code, 'ALREADY_SCANNED');

  // 3. Invalid token signature
  const badTokenScan = validateStudentQrScan(
    'ATD-FAKE123',
    token,
    'stu-002',
    { latitude: 18.5205, longitude: 73.8567 },
    classroom
  );
  assert.equal(badTokenScan.isValid, false);
  assert.equal(badTokenScan.code, 'INVALID_SIGNATURE');

  // 4. Outside geo-fence (proxy scan from dorms ~400m away)
  const proxyScan = validateStudentQrScan(
    token.token,
    token,
    'stu-003',
    { latitude: 18.5240, longitude: 73.8567 },
    classroom
  );
  assert.equal(proxyScan.isValid, false);
  assert.equal(proxyScan.code, 'OUTSIDE_GEOFENCE');
  assert.ok(proxyScan.message.includes('Location verification failed'));
});

