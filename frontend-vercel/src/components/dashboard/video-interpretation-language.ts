export const VIDEO_INTERPRETATION_LANGUAGES = [
  'zh', 'en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ja', 'ko', 'hi', 'id', 'vi',
] as const;

export type VideoInterpretationLanguage = (typeof VIDEO_INTERPRETATION_LANGUAGES)[number];

const LANGUAGE_SET = new Set<string>(VIDEO_INTERPRETATION_LANGUAGES);
const TRANSLATION_TRACK_PREFIX = 'medora-translation-';

export function normalizeVideoInterpretationLanguage(
  language: string | null | undefined,
): VideoInterpretationLanguage | null {
  if (!language) return null;
  const normalized = language.trim().toLowerCase();
  const alias = normalized === 'chinese' ? 'zh' : normalized === 'english' ? 'en' : normalized;
  const base = alias.split('-')[0] ?? '';
  return LANGUAGE_SET.has(base) ? base as VideoInterpretationLanguage : null;
}

export function translationTrackLanguage(trackName: string): VideoInterpretationLanguage | null {
  if (!trackName.startsWith(TRANSLATION_TRACK_PREFIX)) return null;
  return normalizeVideoInterpretationLanguage(trackName.slice(TRANSLATION_TRACK_PREFIX.length));
}

export function isPatientTranslationTarget(
  targetLanguage: unknown,
  preferredLanguage: string | null | undefined,
): boolean {
  const preferred = normalizeVideoInterpretationLanguage(preferredLanguage);
  return preferred !== null && targetLanguage === preferred;
}

export function isPatientTranslationTrack(
  trackName: string,
  preferredLanguage: string | null | undefined,
): boolean {
  const preferred = normalizeVideoInterpretationLanguage(preferredLanguage);
  return preferred !== null && translationTrackLanguage(trackName) === preferred;
}
