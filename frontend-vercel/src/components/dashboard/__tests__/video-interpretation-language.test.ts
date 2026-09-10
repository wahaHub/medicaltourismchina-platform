import { describe, expect, it } from 'vitest';
import {
  isPatientTranslationTarget,
  isPatientTranslationTrack,
  normalizeVideoInterpretationLanguage,
  translationTrackLanguage,
} from '../video-interpretation-language';

describe('patient interpretation language filtering', () => {
  it('normalizes supported locale variants and aliases', () => {
    expect(normalizeVideoInterpretationLanguage('fr-CA')).toBe('fr');
    expect(normalizeVideoInterpretationLanguage('Chinese')).toBe('zh');
    expect(normalizeVideoInterpretationLanguage('ar')).toBeNull();
  });

  it('accepts only captions translated into the patient preference', () => {
    expect(isPatientTranslationTarget('fr', 'fr-CA')).toBe(true);
    expect(isPatientTranslationTarget('zh', 'fr-CA')).toBe(false);
  });

  it('accepts only the translated audio track for the patient preference', () => {
    expect(translationTrackLanguage('medora-translation-ja')).toBe('ja');
    expect(isPatientTranslationTrack('medora-translation-ja', 'ja')).toBe(true);
    expect(isPatientTranslationTrack('medora-translation-zh', 'ja')).toBe(false);
    expect(isPatientTranslationTrack('doctor-microphone', 'ja')).toBe(false);
  });
});
