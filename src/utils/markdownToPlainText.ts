import { renderChatMarkdown } from '@/utils/markdown'

function collapseWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

export function markdownToPlainText(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) {
    return ''
  }

  const html = renderChatMarkdown(trimmed)
  const template = document.createElement('template')
  template.innerHTML = html

  const plainText = template.content.textContent ?? ''
  return collapseWhitespace(plainText)
}
