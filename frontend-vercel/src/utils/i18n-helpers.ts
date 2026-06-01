// Helper functions for extracting multi-language data from database responses
// Supports fallback logic: requested locale -> Chinese -> first available -> default value

import type { Surgeon, ProcedureCase, CoreSpecialty } from '@/types/hospital-extended';

/**
 * Get translated text with fallback logic
 * @param translations - JSONB translations object from database
 * @param field - Field name to extract
 * @param locale - Requested locale (en, zh, fr, de, es)
 * @param defaultValue - Default value if no translation found
 * @returns Translated text or default value
 */
export function getTranslatedText(
  translations: Record<string, any> | undefined,
  field: string,
  locale: string,
  defaultValue: string = ''
): string {
  if (!translations) return defaultValue;

  // Try requested locale
  if (translations[locale]?.[field]) {
    return translations[locale][field];
  }

  // Fallback to Chinese
  if (locale !== 'zh' && translations['zh']?.[field]) {
    return translations['zh'][field];
  }

  // Fallback to English
  if (locale !== 'en' && translations['en']?.[field]) {
    return translations['en'][field];
  }

  // Fallback to first available translation
  const firstLocale = Object.keys(translations)[0];
  if (firstLocale && translations[firstLocale]?.[field]) {
    return translations[firstLocale][field];
  }

  return defaultValue;
}

/**
 * Get translated array (like specialties, education, certifications)
 * @param translations - JSONB translations object
 * @param field - Field name to extract
 * @param locale - Requested locale
 * @param defaultValue - Default array if no translation found
 * @returns Translated array or default value
 */
export function getTranslatedArray(
  translations: Record<string, any> | undefined,
  field: string,
  locale: string,
  defaultValue: string[] = []
): string[] {
  if (!translations) return defaultValue;

  // Try requested locale
  if (translations[locale]?.[field] && Array.isArray(translations[locale][field])) {
    return translations[locale][field];
  }

  // Fallback to Chinese
  if (locale !== 'zh' && translations['zh']?.[field] && Array.isArray(translations['zh'][field])) {
    return translations['zh'][field];
  }

  // Fallback to English
  if (locale !== 'en' && translations['en']?.[field] && Array.isArray(translations['en'][field])) {
    return translations['en'][field];
  }

  // Fallback to first available
  const firstLocale = Object.keys(translations)[0];
  if (firstLocale && translations[firstLocale]?.[field] && Array.isArray(translations[firstLocale][field])) {
    return translations[firstLocale][field];
  }

  return defaultValue;
}

/**
 * Get translated surgeon name
 */
export function getSurgeonName(surgeon: Surgeon, locale: string): string {
  return getTranslatedText(surgeon.translations, 'name', locale, surgeon.name);
}

/**
 * Get translated surgeon title
 */
export function getSurgeonTitle(surgeon: Surgeon, locale: string): string {
  return getTranslatedText(surgeon.translations, 'title', locale, surgeon.title || '');
}

/**
 * Get translated surgeon bio section
 */
export function getSurgeonBio(surgeon: Surgeon, locale: string, section: 'intro' | 'expertise' | 'philosophy' | 'achievements'): string {
  const bioPath = `bio.${section}`;
  const translatedBio =
    getTranslatedText(surgeon.translations, bioPath, locale, '') ||
    getTranslatedText(surgeon.translations, section, locale, '');

  // If not found in translations, try original bio object
  if (!translatedBio && surgeon.bio?.[section]) {
    return surgeon.bio[section];
  }

  return translatedBio;
}

/**
 * Get translated surgeon specialties
 */
export function getSurgeonSpecialties(surgeon: Surgeon, locale: string): string[] {
  return getTranslatedArray(surgeon.translations, 'specialties', locale, surgeon.specialties || []);
}

/**
 * Get translated surgeon education
 */
export function getSurgeonEducation(surgeon: Surgeon, locale: string): string[] {
  return getTranslatedArray(surgeon.translations, 'education', locale, surgeon.education || []);
}

/**
 * Get translated surgeon certifications
 */
export function getSurgeonCertifications(surgeon: Surgeon, locale: string): string[] {
  return getTranslatedArray(surgeon.translations, 'certifications', locale, surgeon.certifications || []);
}

/**
 * Get translated procedure case name
 */
export function getProcedureCaseName(procedureCase: ProcedureCase, locale: string): string {
  return getTranslatedText(procedureCase.translations, 'procedure_name', locale, procedureCase.procedure_name || '');
}

/**
 * Get translated procedure case description
 */
export function getProcedureCaseDescription(procedureCase: ProcedureCase, locale: string): string {
  return getTranslatedText(procedureCase.translations, 'description', locale, procedureCase.description || '');
}

/**
 * Get translated core specialty name
 */
export function getCoreSpecialtyName(specialty: CoreSpecialty, locale: string): string {
  // CoreSpecialty objects are already locale-specific from hospital_i18n table
  // They come pre-translated from the API based on the requested locale
  return specialty.name;
}

/**
 * Get translated core specialty description
 */
export function getCoreSpecialtyDescription(specialty: CoreSpecialty, locale: string): string {
  // Same as above - already locale-specific
  return specialty.description;
}

/**
 * Get translated clinical capability description
 */
export function getClinicalCapabilityDescription(
  descriptions: Record<string, string> | undefined,
  capability: 'icu' | 'emergency' | 'mdt' | 'imaging_center' | 'lab' | 'complex_case'
): string {
  if (!descriptions) return '';
  return descriptions[capability] || '';
}
