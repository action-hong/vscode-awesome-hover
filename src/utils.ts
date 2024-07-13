export function hex2Decimal(hex: string) {
  return Number.parseInt(hex, 16)
}

export function decimal2Hex(decimal: number) {
  return decimal.toString(16)
}

export function upcase(str: string) {
  return str.toUpperCase()
}

export function downcase(str: string) {
  return str.toLowerCase()
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function snakeCase(str: string) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export function camelCase(str: string) {
  return str.replace(/(_\w)/g, (_, c) => c.toUpperCase().replace('_', ''))
}

export function kebabCase(str: string) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export function pascalCase(str: string) {
  return str.replace(/([-_]\w)/g, (_, c) => c.toUpperCase().replace('-', '').replace('_', ''))
}

// TODO: 模板输入长度？
export function padTwoZero(num: number) {
  return num.toString().padStart(2, '0')
}