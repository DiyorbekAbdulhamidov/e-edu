import test from 'node:test';
import assert from 'node:assert/strict';
import { middleware } from '../src/middleware.ts';

const makeRequest = (url: string, cookie?: string) => ({
  url,
  nextUrl: new URL(url),
  cookies: {
    get: (name: string) =>
      cookie && name === '__session' ? { value: cookie } : undefined,
  },
});

test('middleware redirects unauthenticated users to login', () => {
  const request = makeRequest('http://localhost/admin');
  const response = middleware(request);

  const location = response?.headers.get('location');
  assert.ok(location?.includes('/login'));
  assert.ok(location?.includes('redirect=%2Fadmin'));
});

test('middleware allows public routes without redirect', () => {
  const request = makeRequest('http://localhost/login');
  const response = middleware(request);

  assert.equal(response?.headers.get('location'), null);
});
