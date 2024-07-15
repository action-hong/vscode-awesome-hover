import * as vscode from 'vscode'
import { EX_NAME, EX_RULES } from './constant'
import type { Rule, RuntimeRule } from './type'
import { parseBody } from './parse'

// 1. 模板形式字符串(参考 vscode snippet 的语法)
// 2. 模块化，自定义js方法返回md内容

export function activate(ctx: vscode.ExtensionContext) {
  // 读取配置
  let rules: RuntimeRule[] = []
  refresh()

  function refresh() {
    try {
      rules = (vscode.workspace.getConfiguration(EX_NAME).get<Rule[]>('rules') || [])
        .map(item => ({
          ...item,
          regexIns: new RegExp(item.regex),
        }))
    }
    catch (error) {
      console.error('refreshing rules error', error)
    }
  }

  ctx.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EX_RULES)) {
        refresh()
      }
    }),
  )

  ctx.subscriptions.push(
    vscode.languages.registerHoverProvider('*', {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position)
        const word = document.getText(range)

        const result = rules.map((item) => {
          return parseBody(word, item)
        }).filter(Boolean)
          .join('\n-----')

        if (result)
          return new vscode.Hover(result)
      },
    }),
  )
}
