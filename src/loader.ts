import { Buffer } from 'node:buffer'
import vm from 'node:vm'
import { type ExtensionContext, Uri, commands, window, workspace } from 'vscode'
import { COMMAND_LOAD_JS_FILE, COMMAND_OPEN_JS_FILE } from './constant'

const FILENAME = 'awesome-loader.js'

export class JSFileLoader {
  private ctx: ExtensionContext
  private jsUri: Uri
  private module: any
  constructor(ctx: ExtensionContext) {
    this.ctx = ctx
    this.jsUri = this.getJSUri()
    this.loadModule()
  }

  init() {
    // 指令
    this.ctx.subscriptions.push(
      commands.registerCommand(COMMAND_OPEN_JS_FILE, () => this.openJSFile()),
      commands.registerCommand(COMMAND_LOAD_JS_FILE, () => this.loadModule()),
      // workspace.onDidChangeTextDocument((e) => {
      //   if (e.document.uri.toString() === this.jsUri.toString()) {
      //     // log.appendLine(`js file changed${e.document.getText()}`)
      //   }
      // }),
    )
  }

  getJSUri() {
    return Uri.joinPath(
      this.ctx.globalStorageUri,
      FILENAME,
    )
  }

  async load(): Promise<string | undefined> {
    try {
      const jsUri = this.getJSUri()
      const jsContent = await workspace.fs.readFile(jsUri)
      return jsContent.toString()
    }
    catch {}
  }

  openJSFile(tryWrite = true) {
    const jsUri = this.getJSUri()

    return workspace.openTextDocument(jsUri)
      .then((doc) => {
        window.showTextDocument(doc)
      }, () => {
        if (tryWrite) {
          // 写入一个空字符串
          workspace.fs.writeFile(jsUri, new Uint8Array(Buffer.from('')))
            .then(() => this.openJSFile(false))
        }
      })
  }

  async loadModule() {
    const jsContent = await this.load()
    if (jsContent) {
      const sandbox = { module: { exports: {} }, exports: {} }
      const context = vm.createContext(sandbox)

      // 创建一个新的脚本
      const script = new vm.Script(jsContent)

      // 在沙盒上下文中执行脚本
      script.runInContext(context)

      // 从沙盒中获取导出的模块
      this.module = sandbox.module.exports
    }
  }

  getModules() {
    return this.module || {}
  }
}
