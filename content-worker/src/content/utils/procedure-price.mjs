const CURRENCY_PATTERNS = [
  ['CNY', /\b(?:CNY|RMB)\b|CN¥|¥/i],
  ['USD', /\bUSD\b|US\$|\$/i],
  ['EUR', /\bEUR\b|€/i],
  ['GBP', /\bGBP\b|£/i],
  ['JPY', /\bJPY\b|JP¥/i],
  ['KRW', /\bKRW\b|₩/i],
  ['RUB', /\bRUB\b|₽/i],
]

function parseAmounts(value) {
  return String(value || '')
    .match(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g)
    ?.map((amount) => Number(amount.replace(/,/g, '')))
    .filter(Number.isFinite) || []
}

function detectCurrency(value, fallbackCurrency) {
  const text = String(value || '')
  const matched = CURRENCY_PATTERNS.find(([, pattern]) => pattern.test(text))
  return matched?.[0] || fallbackCurrency
}

export function parseProcedurePrice(value, fallbackCurrency = 'USD') {
  const display = String(value || '').trim()
  const amounts = parseAmounts(display)

  if (!display || amounts.length === 0) {
    return {
      display,
      amount: null,
      minAmount: null,
      maxAmount: null,
      currency: null,
    }
  }

  const minAmount = Math.min(...amounts)
  const maxAmount = Math.max(...amounts)

  return {
    display,
    amount: amounts.length === 1 ? amounts[0] : null,
    minAmount,
    maxAmount,
    currency: detectCurrency(display, fallbackCurrency),
  }
}
