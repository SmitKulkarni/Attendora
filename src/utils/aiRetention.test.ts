import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeStudentRetentionRisk, analyzeCohortRetention } from './aiRetention.ts';
import type { StudentRecord, CourseDetail } from '../types/index.ts';

const mockStudents: StudentRecord[] = [
  {
    id: 'stu-safe',
    rollNo: '20000001',
    name: 'Safe Student',
    email: 'safe@test.edu',
    department: 'Computer Sci.',
    semester: 6,
    section: 'A',
    avatar: '',
    totalConducted: 40,
    totalAttended: 36,
    attendanceRate: 90.0,
    status: 'Present',
  },
  {
    id: 'stu-critical',
    rollNo: '20000004',
    name: 'Defaulter Student',
    email: 'defaulter@test.edu',
    department: 'Computer Sci.',
    semester: 6,
    section: 'A',
    avatar: '',
    totalConducted: 40,
    totalAttended: 27,
    attendanceRate: 67.5,
    status: 'Low Rate',
  },
];

const mockCourses: CourseDetail[] = [
  {
    id: 'crs-1',
    code: 'CS604',
    name: 'Algorithms',
    shortName: 'Algo',
    facultyName: 'Prof. Iyer',
    department: 'Computer Sci.',
    semester: 6,
    totalConducted: 25,
    totalAttended: 17,
    percentage: 68.0,
    status: 'Critical',
    room: 'LH-205',
    nextLectureSlot: 'Friday',
  },
];

test('analyzeStudentRetentionRisk classifies critical defaulter correctly', () => {
  const assessment = analyzeStudentRetentionRisk(mockStudents[1], mockCourses);
  assert.equal(assessment.riskLevel, 'CRITICAL_DROPOUT_RISK');
  assert.equal(assessment.predictedExamDebarment, true);
  assert.ok(assessment.riskProbabilityScore >= 0.7);
  assert.ok(assessment.recommendedIntervention.includes('faculty mentor session'));
});

test('analyzeStudentRetentionRisk classifies compliant student with low risk', () => {
  const assessment = analyzeStudentRetentionRisk(mockStudents[0], mockCourses);
  assert.equal(assessment.riskLevel, 'STABLE_COMPLIANT');
  assert.equal(assessment.predictedExamDebarment, false);
  assert.ok(assessment.riskProbabilityScore < 0.2);
});

test('analyzeCohortRetention computes cohort summary statistics', () => {
  const cohort = analyzeCohortRetention(mockStudents, mockCourses);
  assert.equal(cohort.totalEvaluated, 2);
  assert.equal(cohort.criticalCount, 1);
  assert.equal(cohort.stableCount, 1);
  assert.equal(cohort.predictedDebarmentRate, 50.0);
});

