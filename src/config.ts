import { type ExtensionContext, workspace } from 'vscode'
import { EX_NAME } from './constant'

interface MarkdownStringConfiguration {
  supportHtml: boolean
  supportThemeIcons: boolean
  isTrusted: boolean | string[]
}

export class ConfigManager {
  private ctx: ExtensionContext
  private markdownConfiguration: MarkdownStringConfiguration = {
    supportHtml: false,
    supportThemeIcons: false,
    isTrusted: false,
  }

  constructor(ctx: ExtensionContext) {
    this.ctx = ctx
  }

  init() {
    this.initMarkdownConfiguration()

    this.ctx.subscriptions.push(workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(`markdown`)) {
        this.initMarkdownConfiguration()
      }
    }))
  }

  private initMarkdownConfiguration() {
    const config = workspace.getConfiguration(EX_NAME).get<MarkdownStringConfiguration>('markdown')
    if (config) {
      this.markdownConfiguration = config
    }
  }

  getMarkdownConfiguration() {
    return this.markdownConfiguration
  }
}
