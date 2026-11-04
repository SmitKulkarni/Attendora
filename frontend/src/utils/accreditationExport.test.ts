import test from 'node:test';
import assert from 'node:assert/strict';
import { createLti13Launch, syncEnterpriseSis } from './lmsIntegration.ts';
import { generateAccreditationPackage } from './accreditationExport.ts';
import type { StudentRecord, CourseDetail } from '../types/index.ts';

test('createLti13Launch produces compliant IMS Global LTI 1.3 payload', () => {
  const launch = createLti13Launch('CANVAS', 'CS603', 'Database Systems', 'FACULTY');
  assert.equal(launch.version, '1.3.0');
  assert.equal(launch.messageType, 'LtiResourceLinkRequest');
  assert.ok(launch.roles[0].includes('Instructor'));
  assert.equal(launch.context.label, 'CS603');
  assert.equal(launch.custom.statutory_threshold, '75.0');
});

test('syncEnterpriseSis returns positive synchronization telemetry', () => {
  const sync = syncEnterpriseSis('MOODLE');
  assert.equal(sync.status, 'COMPLETED_SUCCESS');
  assert.ok(sync.syncedCoursesCount > 0);
  assert.ok(sync.syncedStudentsCount > 0);
});

test('generateAccreditationPackage creates verifiable NBA and NAAC packages with digital seal', () => {
  const mockStudents: StudentRecord[] = [
    {
      id: 'stu-1',
      rollNo: '20000001',
      name: 'Student One',
      email: 's1@test.edu',
      department: 'Computer Sci.',
      semester: 6,
      section: 'A',
      avatar: '',
      totalConducted: 40,
      totalAttended: 35,
      attendanceRate: 87.5,
      status: 'Present',
    },
    {
      id: 'stu-2',
      rollNo: '20000002',
      name: 'Student Two',
      email: 's2@test.edu',
      department: 'Computer Sci.',
      semester: 6,
      section: 'A',
      avatar: '',
      totalConducted: 40,
      totalAttended: 26,
      attendanceRate: 65.0,
      status: 'Low Rate',
    },
  ];

  const nbaPackage = generateAccreditationPackage(
    'NBA_CRITERION_2',
    mockStudents,
    [],
    'Computer Science & Engineering',
    '2025-2026'
  );

  assert.equal(nbaPackage.body, 'NBA_CRITERION_2');
  assert.equal(nbaPackage.totalStudentsEnrolled, 2);
  assert.equal(nbaPackage.statutoryCompliantCount, 1);
  assert.equal(nbaPackage.statutoryCompliantPercentage, 50.0);
  assert.ok(nbaPackage.digitalSealHash.startsWith('SEAL-GOV-'));
  assert.ok(nbaPackage.digitalSealHash.includes('VERIFIED'));
});

