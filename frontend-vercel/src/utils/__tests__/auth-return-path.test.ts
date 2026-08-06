import { describe, expect, it } from 'vitest';
import { resolveSafeAuthReturnPath } from '../auth-return-path';

describe('resolveSafeAuthReturnPath', () => {
  it('keeps a local intake URL including its query string', () => {
    expect(resolveSafeAuthReturnPath('/medical-case-intake?token=abc')).toBe(
      '/medical-case-intake?token=abc',
    );
  });

  it.each([
    'https://malicious.example/path',
    '//malicious.example/path',
    'medical-case-intake',
    '',
  ])('rejects unsafe or non-local return path %s', (value) => {
    expect(resolveSafeAuthReturnPath(value)).toBe('/dashboard');
  });
});
