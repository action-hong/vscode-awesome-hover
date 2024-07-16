export function hex2Decimal(hex: string) {
  return Number.parseInt(hex, 16)
}

export function decimal2Hex(decimal: number) {
  return decimal.toString(16)
}
