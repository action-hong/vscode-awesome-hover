import * as utils from './utils'

export function parseBody(body: string[] | string, result: RegExpExecArray) {
  const values = typeof body ==='string'? [body] : body

  return values.map(item => {
    // TODO: 内置函数： ${1/foo/boo} 等等
    return item.replace(/\$\{(.+?)\}/g, (_, template) => {
      const [index, ...arr] = template.split('/') as string[]
      return arr.reduce((prev, item) => {
        // @ts-expect-error do it
        if (item in utils && typeof utils[item] === 'function') {
          // @ts-expect-error do it
          return utils[item](prev)
        }
        return prev
      }, result[index as any])
    })
  }).join('\n')
}