<template>
  <div class="relative">
    <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-fg-muted">$</span>
    <input
      ref="inputEl"
      :value="displayValue"
      type="tel"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="placeholder"
      :class="[inputClass, 'pl-7']"
      @keydown="onKeydown"
      @input="onInput"
      @paste="onPaste"
    />
  </div>
</template>

<script setup lang="ts">
import { sanitizeBudgetInput } from '~/utils/meetings'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '10000',
  },
  inputClass: {
    type: String,
    default:
      'w-full rounded-xl border border-border bg-elevated px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-surface focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40',
  },
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputEl = ref<HTMLInputElement | null>(null)

const displayValue = computed(() => sanitizeBudgetInput(props.modelValue))

const allowedKeys = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
])

function applyValue(raw: string) {
  const sanitized = sanitizeBudgetInput(raw)
  if (inputEl.value) inputEl.value.value = sanitized
  if (sanitized !== props.modelValue) {
    emit('update:modelValue', sanitized)
  }
  return sanitized
}

function onKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) return
  if (allowedKeys.has(event.key)) return
  if (/^\d$/.test(event.key)) return
  event.preventDefault()
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  applyValue(input.value)
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const input = inputEl.value
  if (!input) return

  const pasted = event.clipboardData?.getData('text') ?? ''
  const start = input.selectionStart ?? input.value.length
  const end = input.selectionEnd ?? input.value.length
  const next = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`
  applyValue(next)
}
</script>
