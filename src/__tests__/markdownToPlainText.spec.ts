import { describe, expect, it } from 'vitest'
import { markdownToPlainText } from '../utils/markdownToPlainText'

describe('markdownToPlainText', () => {
  it('returns plain text for inline code and fenced blocks', () => {
    const inline = markdownToPlainText('Run `npm install` now.')
    expect(inline).toContain('npm install')
    expect(inline).not.toContain('`')

    const fenced = markdownToPlainText('```ts\nconst value = 1\n```')
    expect(fenced).toContain('const value = 1')
    expect(fenced).not.toContain('```')
  })

  it('returns plain text for lists and links', () => {
    const html = markdownToPlainText(`- alpha
- beta

[docs](https://example.com)`)

    expect(html).toContain('alpha')
    expect(html).toContain('beta')
    expect(html).toContain('docs')
    expect(html).not.toContain('[')
    expect(html).not.toContain('](https://example.com)')
  })

  it('collapses whitespace and handles empty input', () => {
    expect(markdownToPlainText('')).toBe('')
    expect(markdownToPlainText('   ')).toBe('')
    expect(markdownToPlainText('hello\n\nworld')).toBe('hello world')
  })
})
