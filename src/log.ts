import { window } from 'vscode'
import { EX_NAME } from './constant'

export const log = window.createOutputChannel(EX_NAME)
