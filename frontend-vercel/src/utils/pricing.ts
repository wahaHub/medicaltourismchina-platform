import type { FeaturedTreatmentCard } from '@/types';

/**
 * Get currency symbol based on locale
 */
export const getCurrencySymbol = (locale: string): string => {
  switch (locale) {
    case 'zh':
      return '¥';
    case 'en':
      return '$';
    case 'de':
    case 'fr':
    case 'es':
      return '€';
    default:
      return '$';
  }
};

/**
 * Get currency code based on locale
 */
export const getCurrencyCode = (locale: string): 'CNY' | 'USD' | 'EUR' => {
  switch (locale) {
    case 'zh':
      return 'CNY';
    case 'en':
      return 'USD';
    case 'de':
    case 'fr':
    case 'es':
      return 'EUR';
    default:
      return 'USD';
  }
};

/**
 * Format price based on locale with appropriate currency
 */
export const formatTreatmentPrice = (
  treatment: FeaturedTreatmentCard,
  locale: string
): string | null => {
  const currencyCode = getCurrencyCode(locale);
  const symbol = getCurrencySymbol(locale);

  let price: number | undefined;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  // Get prices based on currency
  switch (currencyCode) {
    case 'CNY':
      price = treatment.price_cny;
      minPrice = treatment.price_cny_min;
      maxPrice = treatment.price_cny_max;
      break;
    case 'USD':
      price = treatment.price_usd;
      minPrice = treatment.price_usd_min;
      maxPrice = treatment.price_usd_max;
      break;
    case 'EUR':
      price = treatment.price_eur;
      minPrice = treatment.price_eur_min;
      maxPrice = treatment.price_eur_max;
      break;
  }

  // If we have a single price
  if (price) {
    return `${symbol}${price.toLocaleString()}`;
  }

  // If we have a price range
  if (minPrice && maxPrice && minPrice !== maxPrice) {
    return `${symbol}${minPrice.toLocaleString()}–${symbol}${maxPrice.toLocaleString()}`;
  }

  // If we only have min price
  if (minPrice) {
    return `${symbol}${minPrice.toLocaleString()}`;
  }

  // Fallback to legacy pricing fields
  if (treatment.price_locally) {
    return `$${treatment.price_locally.toLocaleString()}`;
  }

  if (treatment.price_range) {
    const { min_price, max_price } = treatment.price_range;
    if (max_price && max_price !== min_price) {
      return `$${min_price.toLocaleString()}–$${max_price.toLocaleString()}`;
    }
    return `$${min_price.toLocaleString()}`;
  }

  return null;
};
