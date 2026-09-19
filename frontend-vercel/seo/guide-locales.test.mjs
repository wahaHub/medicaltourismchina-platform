import { describe, expect, it } from 'vitest';
import { guideContentLocale, guideFilename, parseGuideFilename } from '../src/lib/guide-locales.mjs';

describe('published guide language resolution', () => {
  it('uses actual translated bodies for all supported languages', () => {
    for (const locale of ['en', 'zh', 'es', 'fr', 'de', 'ru', 'ar', 'id']) {
      expect(parseGuideFilename(guideFilename('example-guide', locale))).toEqual({slug:'example-guide',locale});
      expect(guideContentLocale(locale, ['en', locale])).toBe(locale);
    }
  });
  it('falls back explicitly when no translated body has been published', () => {
    expect(guideContentLocale('ru', ['en', 'zh'])).toBe('en');
    expect(guideContentLocale('fr', ['zh'])).toBe('zh');
    expect(() => parseGuideFilename('example.pt.md')).toThrow();
  });
});
