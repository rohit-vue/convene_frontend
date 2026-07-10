<template>
  <div class="relative">
    <input
      ref="inputEl"
      :value="displayValue"
      type="text"
      :inputmode="allowDecimal ? 'decimal' : 'numeric'"
      autocomplete="off"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[inputClass, 'pr-9']"
      @keydown="onKeydown"
      @input="onInput"
      @blur="onBlur"
      @paste="onPaste"
    />
    <div
      class="absolute inset-y-1 right-1 flex w-7 flex-col overflow-hidden rounded-lg border border-border bg-elevated"
      :class="disabled ? 'pointer-events-none opacity-50' : ''"
    >
      <button
        type="button"
        tabindex="-1"
        class="grid flex-1 place-items-center text-fg-muted transition hover:bg-surface hover:text-fg disabled:opacity-40"
        :disabled="disabled || isAtMax"
        aria-label="Increase"
        @mousedown.prevent
        @click="stepBy(1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
      <div class="h-px bg-border" />
      <button
        type="button"
        tabindex="-1"
        class="grid flex-1 place-items-center text-fg-muted transition hover:bg-surface hover:text-fg disabled:opacity-40"
        :disabled="disabled || isAtMin"
        aria-label="Decrease"
        @mousedown.prevent
        @click="stepBy(-1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formInputClass } from '~/utils/ui'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    placeholder?: string
    min?: number | string
    max?: number | string
    step?: number | string
    disabled?: boolean
    /** Emit numeric values instead of strings (for v-model.number-style usage). */
    asNumber?: boolean
    inputClass?: string
  }>(),
  {
    modelValue: '',
    placeholder: '',
    min: undefined,
    max: undefined,
    step: 1,
    disabled: false,
    asNumber: false,
    inputClass: formInputClass,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputEl = ref<HTMLInputElement | null>(null)

const stepSize = computed(() => {
  const n = Number(props.step)
  return Number.isFinite(n) && n > 0 ? n : 1
})

const allowDecimal = computed(() => {
  const step = stepSize.value
  return !Number.isInteger(step) || String(props.step).includes('.')
})

const minValue = computed(() => {
  if (props.min === undefined || props.min === '') return null
  const n = Number(props.min)
  return Number.isFinite(n) ? n : null
})

const maxValue = computed(() => {
  if (props.max === undefined || props.max === '') return null
  const n = Number(props.max)
  return Number.isFinite(n) ? n : null
})

const displayValue = computed(() => {
  if (props.modelValue == null || props.modelValue === '') return ''
  return String(props.modelValue)
})

const currentNumber = computed(() => {
  const raw = String(props.modelValue ?? '').trim()
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

const isAtMin = computed(() => {
  if (minValue.value == null || currentNumber.value == null) return false
  return currentNumber.value <= minValue.value
})

const isAtMax = computed(() => {
  if (maxValue.value == null || currentNumber.value == null) return false
  return currentNumber.value >= maxValue.value
})

function decimalPlaces(value: number): number {
  const text = String(value)
  const idx = text.indexOf('.')
  return idx === -1 ? 0 : text.length - idx - 1
}

function roundToStep(value: number): number {
  const places = Math.max(decimalPlaces(stepSize.value), allowDecimal.value ? 2 : 0)
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function clamp(value: number): number {
  let next = value
  if (minValue.value != null) next = Math.max(minValue.value, next)
  if (maxValue.value != null) next = Math.min(maxValue.value, next)
  return roundToStep(next)
}

function emitValue(raw: string) {
  if (props.asNumber) {
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') {
      emit('update:modelValue', raw === '' ? 0 : Number(raw) || 0)
      return
    }
    const n = Number(raw)
    emit('update:modelValue', Number.isFinite(n) ? n : 0)
    return
  }
  emit('update:modelValue', raw)
}

function sanitizeTyped(raw: string): string {
  let text = raw.replace(/[^\d.-]/g, '')
  if (!allowDecimal.value) {
    text = text.replace(/\./g, '')
  }

  const negative = text.startsWith('-')
  text = text.replace(/-/g, '')
  if (negative && (minValue.value == null || minValue.value < 0)) {
    text = `-${text}`
  }

  if (allowDecimal.value) {
    const parts = text.split('.')
    if (parts.length > 2) {
      text = `${parts[0]}.${parts.slice(1).join('')}`
    }
  }

  return text
}

function applyRaw(raw: string) {
  const sanitized = sanitizeTyped(raw)
  if (inputEl.value) inputEl.value.value = sanitized
  emitValue(sanitized)
}

function stepBy(direction: 1 | -1) {
  if (props.disabled) return
  const base = currentNumber.value ?? (minValue.value ?? 0)
  const next = clamp(base + direction * stepSize.value)
  const text = String(next)
  if (inputEl.value) inputEl.value.value = text
  emitValue(props.asNumber ? next : text)
}

const allowedKeys = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'Enter',
])

function onKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) return
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    stepBy(1)
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    stepBy(-1)
    return
  }
  if (allowedKeys.has(event.key)) return
  if (/^\d$/.test(event.key)) return
  if (event.key === '.' && allowDecimal.value) return
  if (event.key === '-' && (minValue.value == null || minValue.value < 0)) return
  event.preventDefault()
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  applyRaw(input.value)
}

function onBlur() {
  const raw = String(props.modelValue ?? '').trim()
  if (!raw || raw === '-' || raw === '.' || raw === '-.') {
    if (props.asNumber) emit('update:modelValue', minValue.value ?? 0)
    else if (inputEl.value) inputEl.value.value = ''
    return
  }
  const n = Number(raw)
  if (!Number.isFinite(n)) return
  const next = clamp(n)
  const text = String(next)
  if (inputEl.value) inputEl.value.value = text
  emitValue(props.asNumber ? next : text)
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const input = inputEl.value
  if (!input) return
  const pasted = event.clipboardData?.getData('text') ?? ''
  const start = input.selectionStart ?? input.value.length
  const end = input.selectionEnd ?? input.value.length
  applyRaw(`${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`)
}
</script>
