<script setup lang="ts">
import { computed } from 'vue'
import { renderChatMarkdown } from '@/utils/markdown'

const props = defineProps<{
  content: string
  role?: string
}>()

const renderedHtml = computed(() => renderChatMarkdown(props.content))
</script>

<template>
  <div
    class="chat-message-markdown"
    :class="role === 'user' ? 'chat-message-markdown--user' : 'chat-message-markdown--assistant'"
    v-html="renderedHtml"
  />
</template>

<style scoped>
.chat-message-markdown {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.chat-message-markdown :deep(p) {
  margin: 0 0 0.75rem;
}

.chat-message-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.chat-message-markdown :deep(h1),
.chat-message-markdown :deep(h2),
.chat-message-markdown :deep(h3),
.chat-message-markdown :deep(h4),
.chat-message-markdown :deep(h5),
.chat-message-markdown :deep(h6) {
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.chat-message-markdown :deep(ul),
.chat-message-markdown :deep(ol) {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
}

.chat-message-markdown :deep(li) {
  margin-bottom: 0.25rem;
}

.chat-message-markdown :deep(blockquote) {
  margin: 0 0 0.75rem;
  padding-left: 0.75rem;
  border-left: 3px solid rgba(0, 0, 0, 0.2);
}

.chat-message-markdown :deep(hr) {
  margin: 0.75rem 0;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
}

.chat-message-markdown :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.08);
}

.chat-message-markdown :deep(pre) {
  margin: 0 0 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.08);
}

.chat-message-markdown :deep(pre code) {
  padding: 0;
  background: transparent;
}

.chat-message-markdown :deep(table) {
  display: block;
  width: 100%;
  margin: 0 0 0.75rem;
  overflow-x: auto;
  border-collapse: collapse;
}

.chat-message-markdown :deep(th),
.chat-message-markdown :deep(td) {
  padding: 0.35rem 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  text-align: left;
}

.chat-message-markdown :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.chat-message-markdown--user :deep(code),
.chat-message-markdown--user :deep(pre) {
  background: rgba(255, 255, 255, 0.15);
}

.chat-message-markdown--user :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.45);
}

.chat-message-markdown--user :deep(hr),
.chat-message-markdown--user :deep(th),
.chat-message-markdown--user :deep(td) {
  border-color: rgba(255, 255, 255, 0.25);
}

.dark .chat-message-markdown--assistant :deep(code),
.dark .chat-message-markdown--assistant :deep(pre) {
  background: rgba(255, 255, 255, 0.08);
}

.dark .chat-message-markdown--assistant :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.35);
}

.dark .chat-message-markdown--assistant :deep(hr),
.dark .chat-message-markdown--assistant :deep(th),
.dark .chat-message-markdown--assistant :deep(td) {
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
