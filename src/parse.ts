import type { RuntimeRule } from './type'
import * as utils from './utils'

const placeholder = '__KKOPITE_AWESOME_HOVER_COLON'
const placeholderRegex = new RegExp(placeholder, 'g')

export function parseFuncAndParma(str: string) {
  // 确保参数中传递可以传递 ":"
  const tempStr = str.replace(/\\:/g, placeholder)
  // 如何 escape ":"
  const [name, ...params] = tempStr.split(':')
  return {
    name,
    params: params.map(item => item.replace(placeholderRegex, ':'))
  }
}

export function parseBody(hoverString: string, rule: RuntimeRule) {

  const {
    regexIns,
    body,
  } = rule

  const result = regexIns.exec(hoverString)

  if (!result) return ''

  const values = typeof body === 'string' ? [body] : body

  return values.map((item) => {
    return item.replace(/\$\{(.+?)\}/g, (_, template) => {
      const [index, ...arr] = template.split('/') as string[]
      return arr.reduce((prev, item) => {
        const {
          name,
          params
        } = parseFuncAndParma(item)
        // @ts-expect-error do it
        if (name in utils && typeof utils[name] === 'function') {
          // @ts-expect-error do it
          return utils[name](prev, ...params)
        }
        return prev
      }, result[index as any])
    })
  }).join('\n')
}
