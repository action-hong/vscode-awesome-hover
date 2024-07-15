import { describe, expect, it } from 'vitest'
import { parseBody, parseFuncAndParma } from '../src/parse'
import rules from './preset.json'

const presetRules = rules.map(rule => ({
  ...rule,
  regexIns: new RegExp(rule.regex),
}))

describe('should work', () => {
  it('should work for get function name and params', () => {
    expect(parseFuncAndParma('foo:1:2:3')).toMatchInlineSnapshot(`
      {
        "name": "foo",
        "params": [
          "1",
          "2",
          "3",
        ],
      }
    `)
  })

  it('escpae colon', () => {
    expect(parseFuncAndParma('bar:1\\:2')).toMatchInlineSnapshot(`
      {
        "name": "bar",
        "params": [
          "1:2",
        ],
      }
    `)
  })

  it('should work for evil raw', () => {
    const hoverString = '0114000a2d010301010000000101'
    const rule = presetRules.find(item => item.name === 'evil')
    expect(parseBody(hoverString, rule!)).toMatchInlineSnapshot(`
      "## evil

      |key|value|
      |---|-----|
      |开关|01|
      |开始时间|20:00|
      |持续时间|10:45|
      |灯光开关|01|
      |灯光|03|
      |倒计时环开关|01|
      |夜灯开关|01|
      |音乐开关|00|
      |音乐|00|
      |结束奖励|00|
      |图标|01|
      |动画|01|"
    `)
  })

  it('should work for format time', () => {
    const time = '1721051317521'
    const rule = presetRules.find(item => item.name === 'timestamp')
    expect(parseBody(time, rule!)).toMatchInlineSnapshot(`
      "##timestamp

      2024-07-15 21:48:37"
    `)
  })
})
