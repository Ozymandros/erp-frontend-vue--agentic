import { describe, expect, it } from 'vitest'
import { renderChatMarkdown } from '../utils/markdown'

describe('renderChatMarkdown', () => {
  it('renders inline code and fenced code blocks', () => {
    const inline = renderChatMarkdown('Use `npm install` to install.')
    expect(inline).toContain('<code>npm install</code>')

    const fenced = renderChatMarkdown('```ts\nconst x = 1\n```')
    expect(fenced).toContain('<pre>')
    expect(fenced).toContain('<code>')
    expect(fenced).toContain('const x = 1')
  })

  it('renders headings, lists, blockquotes, and tables', () => {
    const html = renderChatMarkdown(`# Title

- one
- two

> quoted

| a | b |
| - | - |
| 1 | 2 |`)

    expect(html).toContain('<h1>')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<table>')
    expect(html).toContain('<th>')
    expect(html).toContain('<td>')
  })

  it('sanitizes unsafe html and event handlers', () => {
    const html = renderChatMarkdown('<img src="x" onerror="alert(1)"> safe text')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('onerror')
    expect(html).toContain('safe text')
  })

  it('adds safe external link attributes', () => {
    const html = renderChatMarkdown('[docs](https://example.com)')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('renders plain text when no markdown is present', () => {
    const html = renderChatMarkdown('Hello world')
    expect(html).toContain('Hello world')
  })

  it('strips leading zero-width characters before parsing', () => {
    const html = renderChatMarkdown('\uFEFF**bold**')
    expect(html).toContain('<strong>bold</strong>')
  })
})
