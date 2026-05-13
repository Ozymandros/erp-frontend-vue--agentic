import DOMPurify from 'dompurify'
import { marked } from 'marked'

const ZERO_WIDTH_PREFIX = /^[\u200B\u200C\u200D\u200E\u200F\uFEFF]+/

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'del',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'hr',
  'pre',
  'code',
  'a',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]

const ALLOWED_ATTR = ['href', 'target', 'rel']

marked.setOptions({
  gfm: true,
  breaks: true,
})

function stripZeroWidthPrefix(content: string) {
  return content.replace(ZERO_WIDTH_PREFIX, '')
}

function hardenLinks(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('a[href]').forEach((anchor) => {
    anchor.setAttribute('target', '_blank')
    anchor.setAttribute('rel', 'noopener noreferrer')
  })

  return template.innerHTML
}

export function renderChatMarkdown(content: string): string {
  const normalized = stripZeroWidthPrefix(content)
  const rawHtml = marked.parse(normalized) as string

  const sanitized = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })

  return hardenLinks(sanitized)
}
