import test from 'node:test';
import assert from 'node:assert/strict';
import { Timestamp } from 'firebase/firestore';
import {
  buildStudentCreatePayload,
  buildStudentUpdatePayload,
} from '../src/lib/services/studentService.ts';

test('buildStudentCreatePayload formats student data', () => {
  const dateOfBirth = new Date('2005-01-01');
  const enrollmentDate = new Date('2024-01-10');
  const payload = buildStudentCreatePayload(
    {
      firstName: 'Ali',
      lastName: 'Valiyev',
      phone: '+998901234567',
      parentPhone: '+998901111111',
      dateOfBirth,
      enrollmentDate,
      address: 'Toshkent',
      photo: '',
      notes: '',
    },
    'center-1',
    'user-1'
  );

  assert.equal(payload.centerId, 'center-1');
  assert.equal(payload.createdBy, 'user-1');
  assert.ok(payload.dateOfBirth instanceof Timestamp);
  assert.ok(payload.enrollmentDate instanceof Timestamp);
  assert.ok(payload.createdAt);
  assert.ok(payload.updatedAt);
});

test('buildStudentUpdatePayload converts date fields', () => {
  const dateOfBirth = new Date('2006-05-10');
  const enrollmentDate = new Date('2024-02-15');
  const payload = buildStudentUpdatePayload({ dateOfBirth, enrollmentDate });

  assert.ok(payload.updatedAt);
  assert.ok(payload.dateOfBirth instanceof Timestamp);
  assert.ok(payload.enrollmentDate instanceof Timestamp);
});
