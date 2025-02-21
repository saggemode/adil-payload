export const formatNumberWithDecimal = (num: number): string => {
  const parts = num.toString().split('.')
  const int = parts[0]
  const decimal = parts[1] ? parts[1].padEnd(2, '0') : '00'
  return `${int}.${decimal}`
}

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US')

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number)
}


