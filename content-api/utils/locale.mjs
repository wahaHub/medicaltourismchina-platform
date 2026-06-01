// utils/locale.mjs

// Normalize locale codes like zh-CN/en-US -> zh/en to match DB locales
export const normalizeLocale = (input) => {
  const raw = String(input || '').trim().toLowerCase()
  if (!raw) return 'en'
  const base = raw.split(/[-_]/)[0]
  switch (base) {
    case 'zh':
    case 'en':
    case 'fr':
    case 'es':
    case 'de':
      return base
    default:
      return base
  }
}