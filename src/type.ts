export interface Rule {
  regex: string
  body: string | string[]
  name: string
  scope?: string
  description?: string
}

export interface RuntimeRule extends Rule {
  regexIns: RegExp
}
