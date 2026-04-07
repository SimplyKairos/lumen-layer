export function formatReceiptTime(value: number) {
  return new Date(value).toLocaleString()
}

export function truncateReceiptValue(value: string, start = 12, end = 10) {
  if (value.length <= start + end + 3) {
    return value
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`
}

export function formatTechnicalValue(value: boolean | number | string | null | undefined) {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return String(value)
}
