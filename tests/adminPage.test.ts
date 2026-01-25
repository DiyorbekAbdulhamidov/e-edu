import test from 'node:test';
import assert from 'node:assert/strict';
import AdminPage from '../src/app/(dashboard)/admin/page.tsx';

test('admin page module loads', () => {
  assert.equal(typeof AdminPage, 'function');
});
