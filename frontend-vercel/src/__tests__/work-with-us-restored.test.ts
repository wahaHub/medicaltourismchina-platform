import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { workWithUsContent } from '../pages/workWithUsContent';

const root = path.resolve(__dirname, '..');

describe('work-with-us partnership entrypoints', () => {
  it('keeps the overview and all three application routes registered', () => {
    const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
    for (const route of ['/work-with-us', '/work-with-us/hospitals/apply', '/work-with-us/referral-partners/apply', '/work-with-us/travel-services/apply']) {
      expect(app).toContain(`path="${route}"`);
    }
  });

  it('provides localized partnership overview copy for every URL locale', () => {
    for (const locale of ['en', 'zh', 'es', 'fr', 'de', 'ru', 'ar', 'id'] as const) {
      expect(workWithUsContent[locale].tabs).toHaveLength(3);
      expect(workWithUsContent[locale].title).toBeTruthy();
    }
  });
});
