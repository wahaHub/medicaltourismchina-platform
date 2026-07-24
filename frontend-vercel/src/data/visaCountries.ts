// China 240-hour (10-day) visa-free transit countries
// Updated as of 2024 - includes 54 countries

export type VisaStatus = 'visa_free_240' | 'visa_free_other' | 'visa_required';

export interface CountryVisaInfo {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  visaStatus: VisaStatus;
  details?: string;
}

// 240-hour (10-day) visa-free transit eligible countries
export const visaFree240Countries: string[] = [
  // Europe (39 countries)
  'AT', // Austria
  'BE', // Belgium
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IS', // Iceland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  'CH', // Switzerland
  'MC', // Monaco
  'RU', // Russia
  'GB', // United Kingdom
  'IE', // Ireland
  'CY', // Cyprus
  'BG', // Bulgaria
  'RO', // Romania
  'UA', // Ukraine
  'RS', // Serbia
  'HR', // Croatia
  'BA', // Bosnia and Herzegovina
  'ME', // Montenegro
  'MK', // North Macedonia
  'AL', // Albania
  'BY', // Belarus

  // Americas (6 countries)
  'US', // United States
  'CA', // Canada
  'BR', // Brazil
  'MX', // Mexico
  'AR', // Argentina
  'CL', // Chile

  // Oceania (2 countries)
  'AU', // Australia
  'NZ', // New Zealand

  // Asia (6 countries)
  'JP', // Japan
  'KR', // South Korea
  'SG', // Singapore
  'BN', // Brunei
  'AE', // United Arab Emirates
  'QA', // Qatar
];

// Countries that may have other visa-free arrangements (not 240-hour transit)
export const visaFreeOtherCountries: string[] = [
  'MY', // Malaysia (30 days)
  'TH', // Thailand (30 days)
  // Add more as needed
];

// Country name translations (for display)
export const countryNames: Record<string, Record<string, string>> = {
  'US': { en: 'United States', zh: '美国', de: 'Vereinigte Staaten', fr: 'États-Unis', es: 'Estados Unidos' },
  'GB': { en: 'United Kingdom', zh: '英国', de: 'Vereinigtes Königreich', fr: 'Royaume-Uni', es: 'Reino Unido' },
  'CA': { en: 'Canada', zh: '加拿大', de: 'Kanada', fr: 'Canada', es: 'Canadá' },
  'AU': { en: 'Australia', zh: '澳大利亚', de: 'Australien', fr: 'Australie', es: 'Australia' },
  'NZ': { en: 'New Zealand', zh: '新西兰', de: 'Neuseeland', fr: 'Nouvelle-Zélande', es: 'Nueva Zelanda' },
  'DE': { en: 'Germany', zh: '德国', de: 'Deutschland', fr: 'Allemagne', es: 'Alemania' },
  'FR': { en: 'France', zh: '法国', de: 'Frankreich', fr: 'France', es: 'Francia' },
  'ES': { en: 'Spain', zh: '西班牙', de: 'Spanien', fr: 'Espagne', es: 'España' },
  'IT': { en: 'Italy', zh: '意大利', de: 'Italien', fr: 'Italie', es: 'Italia' },
  'JP': { en: 'Japan', zh: '日本', de: 'Japan', fr: 'Japon', es: 'Japón' },
  'KR': { en: 'South Korea', zh: '韩国', de: 'Südkorea', fr: 'Corée du Sud', es: 'Corea del Sur' },
  'SG': { en: 'Singapore', zh: '新加坡', de: 'Singapur', fr: 'Singapour', es: 'Singapur' },
  'NL': { en: 'Netherlands', zh: '荷兰', de: 'Niederlande', fr: 'Pays-Bas', es: 'Países Bajos' },
  'BE': { en: 'Belgium', zh: '比利时', de: 'Belgien', fr: 'Belgique', es: 'Bélgica' },
  'CH': { en: 'Switzerland', zh: '瑞士', de: 'Schweiz', fr: 'Suisse', es: 'Suiza' },
  'AT': { en: 'Austria', zh: '奥地利', de: 'Österreich', fr: 'Autriche', es: 'Austria' },
  'SE': { en: 'Sweden', zh: '瑞典', de: 'Schweden', fr: 'Suède', es: 'Suecia' },
  'NO': { en: 'Norway', zh: '挪威', de: 'Norwegen', fr: 'Norvège', es: 'Noruega' },
  'DK': { en: 'Denmark', zh: '丹麦', de: 'Dänemark', fr: 'Danemark', es: 'Dinamarca' },
  'FI': { en: 'Finland', zh: '芬兰', de: 'Finnland', fr: 'Finlande', es: 'Finlandia' },
  'PL': { en: 'Poland', zh: '波兰', de: 'Polen', fr: 'Pologne', es: 'Polonia' },
  'PT': { en: 'Portugal', zh: '葡萄牙', de: 'Portugal', fr: 'Portugal', es: 'Portugal' },
  'GR': { en: 'Greece', zh: '希腊', de: 'Griechenland', fr: 'Grèce', es: 'Grecia' },
  'CZ': { en: 'Czech Republic', zh: '捷克', de: 'Tschechien', fr: 'République tchèque', es: 'República Checa' },
  'HU': { en: 'Hungary', zh: '匈牙利', de: 'Ungarn', fr: 'Hongrie', es: 'Hungría' },
  'IE': { en: 'Ireland', zh: '爱尔兰', de: 'Irland', fr: 'Irlande', es: 'Irlanda' },
  'RU': { en: 'Russia', zh: '俄罗斯', de: 'Russland', fr: 'Russie', es: 'Rusia' },
  'BR': { en: 'Brazil', zh: '巴西', de: 'Brasilien', fr: 'Brésil', es: 'Brasil' },
  'MX': { en: 'Mexico', zh: '墨西哥', de: 'Mexiko', fr: 'Mexique', es: 'México' },
  'AR': { en: 'Argentina', zh: '阿根廷', de: 'Argentinien', fr: 'Argentine', es: 'Argentina' },
  'CL': { en: 'Chile', zh: '智利', de: 'Chile', fr: 'Chili', es: 'Chile' },
  'AE': { en: 'United Arab Emirates', zh: '阿联酋', de: 'Vereinigte Arabische Emirate', fr: 'Émirats arabes unis', es: 'Emiratos Árabes Unidos' },
  'QA': { en: 'Qatar', zh: '卡塔尔', de: 'Katar', fr: 'Qatar', es: 'Catar' },
  'BN': { en: 'Brunei', zh: '文莱', de: 'Brunei', fr: 'Brunei', es: 'Brunéi' },
  'MY': { en: 'Malaysia', zh: '马来西亚', de: 'Malaysia', fr: 'Malaisie', es: 'Malasia' },
  'TH': { en: 'Thailand', zh: '泰国', de: 'Thailand', fr: 'Thaïlande', es: 'Tailandia' },
  'IN': { en: 'India', zh: '印度', de: 'Indien', fr: 'Inde', es: 'India' },
  'PH': { en: 'Philippines', zh: '菲律宾', de: 'Philippinen', fr: 'Philippines', es: 'Filipinas' },
  'ID': { en: 'Indonesia', zh: '印度尼西亚', de: 'Indonesien', fr: 'Indonésie', es: 'Indonesia' },
  'VN': { en: 'Vietnam', zh: '越南', de: 'Vietnam', fr: 'Viêt Nam', es: 'Vietnam' },
  'ZA': { en: 'South Africa', zh: '南非', de: 'Südafrika', fr: 'Afrique du Sud', es: 'Sudáfrica' },
  'EG': { en: 'Egypt', zh: '埃及', de: 'Ägypten', fr: 'Égypte', es: 'Egipto' },
  'NG': { en: 'Nigeria', zh: '尼日利亚', de: 'Nigeria', fr: 'Nigéria', es: 'Nigeria' },
  'PK': { en: 'Pakistan', zh: '巴基斯坦', de: 'Pakistan', fr: 'Pakistan', es: 'Pakistán' },
  'BD': { en: 'Bangladesh', zh: '孟加拉国', de: 'Bangladesch', fr: 'Bangladesh', es: 'Bangladés' },
  'IS': { en: 'Iceland', zh: '冰岛', de: 'Island', fr: 'Islande', es: 'Islandia' },
  'LU': { en: 'Luxembourg', zh: '卢森堡', de: 'Luxemburg', fr: 'Luxembourg', es: 'Luxemburgo' },
  'MT': { en: 'Malta', zh: '马耳他', de: 'Malta', fr: 'Malte', es: 'Malta' },
  'CY': { en: 'Cyprus', zh: '塞浦路斯', de: 'Zypern', fr: 'Chypre', es: 'Chipre' },
  'EE': { en: 'Estonia', zh: '爱沙尼亚', de: 'Estland', fr: 'Estonie', es: 'Estonia' },
  'LV': { en: 'Latvia', zh: '拉脱维亚', de: 'Lettland', fr: 'Lettonie', es: 'Letonia' },
  'LT': { en: 'Lithuania', zh: '立陶宛', de: 'Litauen', fr: 'Lituanie', es: 'Lituania' },
  'SK': { en: 'Slovakia', zh: '斯洛伐克', de: 'Slowakei', fr: 'Slovaquie', es: 'Eslovaquia' },
  'SI': { en: 'Slovenia', zh: '斯洛文尼亚', de: 'Slowenien', fr: 'Slovénie', es: 'Eslovenia' },
  'BG': { en: 'Bulgaria', zh: '保加利亚', de: 'Bulgarien', fr: 'Bulgarie', es: 'Bulgaria' },
  'RO': { en: 'Romania', zh: '罗马尼亚', de: 'Rumänien', fr: 'Roumanie', es: 'Rumania' },
  'HR': { en: 'Croatia', zh: '克罗地亚', de: 'Kroatien', fr: 'Croatie', es: 'Croacia' },
  'RS': { en: 'Serbia', zh: '塞尔维亚', de: 'Serbien', fr: 'Serbie', es: 'Serbia' },
  'UA': { en: 'Ukraine', zh: '乌克兰', de: 'Ukraine', fr: 'Ukraine', es: 'Ucrania' },
  'BY': { en: 'Belarus', zh: '白俄罗斯', de: 'Belarus', fr: 'Biélorussie', es: 'Bielorrusia' },
  'MC': { en: 'Monaco', zh: '摩纳哥', de: 'Monaco', fr: 'Monaco', es: 'Mónaco' },
  'BA': { en: 'Bosnia and Herzegovina', zh: '波黑', de: 'Bosnien und Herzegowina', fr: 'Bosnie-Herzégovine', es: 'Bosnia y Herzegovina' },
  'ME': { en: 'Montenegro', zh: '黑山', de: 'Montenegro', fr: 'Monténégro', es: 'Montenegro' },
  'MK': { en: 'North Macedonia', zh: '北马其顿', de: 'Nordmazedonien', fr: 'Macédoine du Nord', es: 'Macedonia del Norte' },
  'AL': { en: 'Albania', zh: '阿尔巴尼亚', de: 'Albanien', fr: 'Albanie', es: 'Albania' },
};

type RegionDisplayNames = {
  of: (regionCode: string) => string | undefined;
};

type RegionDisplayNamesConstructor = new (
  locales: string | string[],
  options: { type: 'region' },
) => RegionDisplayNames;

const regionDisplayNamesCache = new Map<string, RegionDisplayNames | null>();

function getRegionDisplayNames(language: string): RegionDisplayNames | null {
  const locale = language || 'en';
  if (regionDisplayNamesCache.has(locale)) {
    return regionDisplayNamesCache.get(locale) || null;
  }

  try {
    const DisplayNames = (
      Intl as unknown as { DisplayNames?: RegionDisplayNamesConstructor }
    ).DisplayNames;
    const formatter = DisplayNames
      ? new DisplayNames(locale, { type: 'region' })
      : null;
    regionDisplayNamesCache.set(locale, formatter);
    return formatter;
  } catch {
    regionDisplayNamesCache.set(locale, null);
    return null;
  }
}

// Get visa status for a country
export function getVisaStatus(countryCode: string): VisaStatus {
  if (visaFree240Countries.includes(countryCode)) {
    return 'visa_free_240';
  }
  if (visaFreeOtherCountries.includes(countryCode)) {
    return 'visa_free_other';
  }
  return 'visa_required';
}

// Get country name in specified language
export function getCountryName(countryCode: string, language: string): string {
  const names = countryNames[countryCode];
  if (!names) {
    return countryCode;
  }

  if (names[language]) {
    return names[language];
  }

  return getRegionDisplayNames(language)?.of(countryCode)
    || names['en']
    || countryCode;
}
