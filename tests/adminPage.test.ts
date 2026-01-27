import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('admin page module exists with default export', async () => {
  const contents = await readFile('src/app/(dashboard)/admin/page.tsx', 'utf8');
  assert.ok(contents.includes('export default'));
});
