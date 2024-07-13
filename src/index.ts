/* eslint-disable no-console */
import * as vscode from 'vscode'
import { EX_NAME, EX_RULES } from './constant'
import type { Rule, RuntimeRule } from './type'
import { parseBody } from './parse'

// const myRegex = /([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/

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
      console.log('refresh rules', rules)
    }
    catch (error) {
      console.log('refreshing rules error', error)
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

        // eslint-disable-next-line array-callback-return
        const result = rules.map((item) => {
          const match = item.regexIns.exec(word)
          if (match) {
            // todo: 解析
            return parseBody(item.body, match)
          }
        }).filter(Boolean)
          .join('\n-----')

        if (result)
          return new vscode.Hover(result)

        // const result = word.match(myRegex)

        //         if (result) {
        //           // todo: 解析
        //           return new vscode.Hover(`
        // |key|value|
        // |---|-----|
        // |开关|${result[1] === '01'}|
        // |开始时间|${result[2]}:${result[3]}|
        // |持续时间|${result[4]}:${result[5]}|
        // |灯光开关|${result[6] === '01'}|
        // |灯光|${result[7]}|
        // |倒计时环开关|${result[8]}|
        // |夜灯开关|${result[9]}|
        // |音乐开关|${result[10]}|
        // |音乐|${result[11]}|
        // |结束奖励|${result[12]}|
        // |图标|${result[13]}|
        // |动画|${result[14]}|
        //             `,
        //           )
        // return new vscode.Hover(`hello **${word}**`)
        // }
      },
    }),
  )
}

export function deactivate() {

}
