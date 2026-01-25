import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCsvContent,
  calculateAttendanceRate,
} from '../src/lib/services/reportService.ts';

test('calculateAttendanceRate computes percentage', () => {
  assert.equal(calculateAttendanceRate(1, 2), 50);
  assert.equal(calculateAttendanceRate(0, 0), 0);
});

test('buildCsvContent formats CSV output', () => {
  const csv = buildCsvContent([
    {
      groupId: 'group-1',
      groupName: 'Group 1',
      totalStudents: 10,
      averageAttendance: 50,
    },
  ]);

  assert.ok(csv.includes('groupId,groupName,totalStudents,averageAttendance'));
  assert.ok(csv.includes('"group-1","Group 1","10","50"'));
});
