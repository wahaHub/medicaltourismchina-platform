import { t as translateText, type TranslationKey, type TranslationParams } from '@/i18n';

export type ChatWidgetTranslate = (key: TranslationKey, params?: TranslationParams) => string;

export function createChatWidgetTranslator(languageCode: string): ChatWidgetTranslate {
  return (key, params) => translateText(key, params, languageCode);
}

export function getGenderOptions(translate: ChatWidgetTranslate) {
  return [
    { value: 'male', label: translate('chatWidget.form.gender.male') },
    { value: 'female', label: translate('chatWidget.form.gender.female') },
    { value: 'other', label: translate('chatWidget.form.gender.other') },
  ] as const;
}

export function getCountryOptions(translate: ChatWidgetTranslate) {
  return [
    { value: 'China', label: translate('chatWidget.form.country.china') },
    { value: 'United States', label: translate('chatWidget.form.country.us') },
    { value: 'Canada', label: translate('chatWidget.form.country.canada') },
    { value: 'United Kingdom', label: translate('chatWidget.form.country.uk') },
    { value: 'Australia', label: translate('chatWidget.form.country.australia') },
    { value: 'Singapore', label: translate('chatWidget.form.country.singapore') },
    { value: 'Malaysia', label: translate('chatWidget.form.country.malaysia') },
    { value: 'Thailand', label: translate('chatWidget.form.country.thailand') },
    { value: 'India', label: translate('chatWidget.form.country.india') },
    { value: 'Other', label: translate('chatWidget.form.country.other') },
  ] as const;
}

export function getDestinationOptions(translate: ChatWidgetTranslate) {
  return [
    { value: 'Shanghai', label: translate('chatWidget.form.destination.shanghai') },
    { value: 'Beijing', label: translate('chatWidget.form.destination.beijing') },
    { value: 'Guangzhou', label: translate('chatWidget.form.destination.guangzhou') },
    { value: 'Shenzhen', label: translate('chatWidget.form.destination.shenzhen') },
    { value: 'Hong Kong', label: translate('chatWidget.form.destination.hongKong') },
    { value: 'No preference', label: translate('chatWidget.form.destination.noPreference') },
  ] as const;
}

export function parseDestinationSelection(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDestinationSelection(values: string[]): string {
  return values.join(', ');
}

export function getTreatmentTimeOptions(translate: ChatWidgetTranslate) {
  return [
    { value: 'ASAP', label: translate('chatWidget.form.treatmentTime.asap') },
    { value: 'Within 1 month', label: translate('chatWidget.form.treatmentTime.within1Month') },
    { value: '1-3 months', label: translate('chatWidget.form.treatmentTime.oneToThreeMonths') },
    { value: '3-6 months', label: translate('chatWidget.form.treatmentTime.threeToSixMonths') },
    { value: 'Flexible', label: translate('chatWidget.form.treatmentTime.flexible') },
  ] as const;
}

export function localizeGender(value: string, translate: ChatWidgetTranslate): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'male') {
    return translate('chatWidget.form.gender.male');
  }
  if (normalized === 'female') {
    return translate('chatWidget.form.gender.female');
  }
  if (normalized === 'other') {
    return translate('chatWidget.form.gender.other');
  }
  return value;
}

export function localizeCountry(value: string, translate: ChatWidgetTranslate): string {
  const option = getCountryOptions(translate).find((item) => item.value === value);
  return option?.label ?? value;
}

export function localizeDestination(value: string, translate: ChatWidgetTranslate): string {
  const destinations = parseDestinationSelection(value);
  if (destinations.length > 1) {
    return destinations.map((destination) => localizeDestination(destination, translate)).join(', ');
  }

  const option = getDestinationOptions(translate).find((item) => item.value === value.trim());
  return option?.label ?? value;
}

export function localizeTreatmentTime(value: string, translate: ChatWidgetTranslate): string {
  const option = getTreatmentTimeOptions(translate).find((item) => item.value === value);
  return option?.label ?? value;
}

export function getPhaseLabel(phase: string, translate: ChatWidgetTranslate): string {
  if (phase === 'collect-profile') {
    return translate('chatWidget.phase.collectProfile');
  }
  if (phase === 'select-hospitals') {
    return translate('chatWidget.phase.selectHospitals');
  }
  if (phase === 'messages-ready') {
    return translate('chatWidget.phase.messagesReady');
  }
  if (phase === 'bootstrap-error') {
    return translate('chatWidget.phase.bootstrapError');
  }
  return phase.replace(/-/g, ' ');
}
