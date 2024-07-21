import * as vscode from 'vscode'
import { EX_NAME, EX_RULES } from './constant'
import type { Rule, RuntimeRule } from './type'
import { parseBody } from './parse'
import { JSFileLoader } from './loader'
import { log } from './log'
import { ConfigManager } from './config'

// 1. 模板形式字符串(参考 vscode snippet 的语法)
// 2. 模块化，自定义js方法返回md内容

export function activate(ctx: vscode.ExtensionContext) {
  // 读取配置
  let rules: RuntimeRule[] = []
  refresh()

  const loader = new JSFileLoader(ctx)
  loader.init()

  const configuration = new ConfigManager(ctx)
  configuration.init()

  function refresh() {
    try {
      rules = (vscode.workspace.getConfiguration(EX_NAME).get<Rule[]>('rules') || [])
        .map(item => ({
          ...item,
          regexIns: new RegExp(item.regex),
        }))
    }
    catch (error) {
      log.appendLine('refreshing rules error')
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

        const module = loader.getModules()
        log.appendLine(`module ${Object.keys(module).length}`)

        const moduleResult = Object.entries(module).map(([_, value]) => {
          if (typeof value === 'function') {
            return value(word) || ''
          }
          return ''
        }).filter(Boolean).join('\n-----')

        // 配置规则
        const ruleResult = rules.map((item) => {
          return parseBody(word, item)
        }).filter(Boolean)
          .join('\n-----')

        if (moduleResult || ruleResult) {
          log.appendLine('module result:')
          log.appendLine(moduleResult)
          log.appendLine('rule result:')
          log.appendLine(ruleResult)
          const config = configuration.getMarkdownConfiguration()
          const ms = new vscode.MarkdownString(`${moduleResult}\n${ruleResult}`, config.supportThemeIcons)
          ms.supportHtml = config.supportHtml
          const it = config.isTrusted
          if (typeof it === 'boolean') {
            ms.isTrusted = it
          }
          else {
            ms.isTrusted = {
              enabledCommands: it,
            }
          }
          return new vscode.Hover(ms)
        }
      },
    }),
  )
}
