import * as vscode from 'vscode'
import { COMMAND_FORMAT, EX_HOVER, EX_INLAY_HINTS, EX_NAME, EX_RULES } from './constant'
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
  let hover = true
  let inlayHints = true
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
      hover = vscode.workspace.getConfiguration(EX_NAME).get<boolean>('hover') || true
      inlayHints = vscode.workspace.getConfiguration(EX_NAME).get<boolean>('inlayHints') || true
    }
    catch (error) {
      log.appendLine('refreshing rules error')
    }
  }

  ctx.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EX_RULES)
        || e.affectsConfiguration(EX_HOVER)
        || e.affectsConfiguration(EX_INLAY_HINTS)) {
        refresh()
      }
    }),
  )

  ctx.subscriptions.push(
    vscode.languages.registerHoverProvider('*', {
      provideHover(document, position) {
        if (!hover)
          return
        const range = document.getWordRangeAtPosition(position)
        const word = document.getText(range)

        const module = loader.getModules()

        const moduleResult = module.hover && typeof module.hover === 'function'
          ? module.hover(word) || ''
          : ''

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

  ctx.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_FORMAT, () => {
      const textEditor = vscode.window.activeTextEditor
      if (!textEditor)
        return

      const module = loader.getModules()
      if (module.format && typeof module.format === 'function') {
        const selection = textEditor.selection
        const selectionText = textEditor.document.getText(selection)

        const result = module.format(selectionText)
        if (result) {
          textEditor.edit((editBuilder) => {
            editBuilder.replace(selection, result)
          })
        }
      }
    }),
  )

  ctx.subscriptions.push(
    vscode.languages.registerInlayHintsProvider('*', {
      provideInlayHints(document, range) {
        if (!inlayHints)
          return
        const module = loader.getModules()
        if (module.inlayHints && typeof module.inlayHints === 'function') {
          return module.inlayHints(document, range)
        }
      },
    }),
  )
}
