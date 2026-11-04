import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendancePercentage,
  getComplianceStatus,
  calculateRecoveryClasses,
  calculateAffordableAbsences,
  validateCsvRoster,
  generateAttendanceReportDeepLink,
} from './attendance.ts';


test('calculateAttendancePercentage handles normal, zero, and boundary cases', () => {
  assert.equal(calculateAttendancePercentage(82, 100), 82.0);
  assert.equal(calculateAttendancePercentage(148, 180), 82.2);
  assert.equal(calculateAttendancePercentage(0, 0), 100.0, 'Zero conducted classes should return 100.0% (no crash)');
  assert.equal(calculateAttendancePercentage(0, 10), 0.0);
  assert.equal(calculateAttendancePercentage(15, 20), 75.0);
});

test('getComplianceStatus classifies compliance boundaries correctly', () => {
  assert.equal(getComplianceStatus(85.0), 'COMPLIANT');
  assert.equal(getComplianceStatus(75.0), 'COMPLIANT');
  assert.equal(getComplianceStatus(74.9), 'WARNING');
  assert.equal(getComplianceStatus(70.0), 'WARNING');
  assert.equal(getComplianceStatus(69.9), 'CRITICAL');
  assert.equal(getComplianceStatus(50.0), 'CRITICAL');
});

test('calculateRecoveryClasses computes exact required consecutive attendance', () => {
  // If conducted = 20, attended = 10 (50%):
  // ceil((0.75 * 20 - 10) / 0.25) = ceil((15 - 10) / 0.25) = ceil(5 / 0.25) = 20 classes
  // Checking: (10 + 20) / (20 + 20) = 30 / 40 = 75%
  assert.equal(calculateRecoveryClasses(10, 20), 20);

  // If conducted = 20, attended = 14 (70%):
  // ceil((15 - 14) / 0.25) = ceil(1 / 0.25) = 4 classes
  // Checking: (14 + 4) / (20 + 4) = 18 / 24 = 75%
  assert.equal(calculateRecoveryClasses(14, 20), 4);

  // If already >= 75%:
  assert.equal(calculateRecoveryClasses(16, 20), 0);
});

test('calculateAffordableAbsences computes safe cushion for student', () => {
  // If conducted = 20, attended = 18 (90%):
  // floor((18 - 0.75 * 20) / 0.75) = floor((18 - 15) / 0.75) = floor(3 / 0.75) = 4
  // If misses 4 upcoming classes: attended = 18, conducted = 24. 18 / 24 = 75%
  assert.equal(calculateAffordableAbsences(18, 20), 4);

  // If exactly 75%:
  assert.equal(calculateAffordableAbsences(15, 20), 0);

  // If below 75%:
  assert.equal(calculateAffordableAbsences(14, 20), 0);
});

test('validateCsvRoster flags missing headers, bad emails, and duplicate rolls', () => {
  const badHeaders = [['Name', 'Roll']];
  const res1 = validateCsvRoster(badHeaders);
  assert.equal(res1.validRows.length, 0);
  assert.ok(res1.errors.length > 0);

  const goodData = [
    ['RollNo', 'FullName', 'Email', 'Department', 'Year', 'Section'],
    ['20000001', 'Heuren Name', 'heuren@college.edu', 'Computer Sci', 'TE', 'A'],
    ['20000002', 'Kenrii Anay', 'kenrii@college.edu', 'Computer Sci', 'TE', 'A'],
    ['20000002', 'Duplicate Student', 'dup@college.edu', 'Computer Sci', 'TE', 'A'], // duplicate roll
    ['20000003', 'Bad Email Student', 'not-an-email', 'Computer Sci', 'TE', 'A'],    // invalid email
  ];
  const res2 = validateCsvRoster(goodData);
  assert.equal(res2.validRows.length, 2);
  assert.equal(res2.errors.length, 2);
  assert.ok(res2.errors[0].reason.includes('Duplicate Roll Number'));
  assert.ok(res2.errors[1].reason.includes('Invalid email'));
});

test('generateAttendanceReportDeepLink produces valid URL with params', () => {
  const url = generateAttendanceReportDeepLink('https://attendora.edu', '20000001', 'Sneha Kulkarni', 'CS601');
  assert.ok(url.startsWith('https://attendora.edu/?view=report'));
  assert.ok(url.includes('course=CS601'));
  assert.ok(url.includes('studentId=20000001'));
  assert.ok(url.includes('student=Sneha+Kulkarni') || url.includes('student=Sneha%20Kulkarni'));
});

