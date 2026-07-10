<template>
  <div ref="root" class="relative" :class="fullWidth ? 'w-full' : ''">
    <button
      ref="trigger"
      type="button"
      :disabled="disabled"
      :class="[
        inputClass,
        fullWidth ? 'w-full' : 'w-full min-w-0 sm:w-auto sm:min-w-[10.5rem]',
        'flex items-center justify-between gap-2 text-left',
        disabled ? 'cursor-not-allowed opacity-60' : '',
        open ? 'border-indigo-500 ring-2 ring-indigo-500/20' : '',
      ]"
      @click.stop="toggle"
    >
      <span class="truncate" :class="modelValue ? 'text-fg' : 'text-fg-subtle'">
        {{ displayValue }}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="shrink-0 text-fg-subtle"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panel"
        class="fixed z-[200] w-56 rounded-xl border border-border bg-surface p-4 shadow-xl"
        :style="panelStyle"
        @click.stop
      >
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-fg-muted">Hour</label>
            <AppSelect
              v-model="selectedHour"
              :options="hourOptions"
              :input-class="selectClass"
              @update:model-value="emitValue"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-fg-muted">Minute</label>
            <AppSelect
              v-model="selectedMinute"
              :options="minuteOptions"
              :input-class="selectClass"
              @update:model-value="emitValue"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { formatTimeDisplay } from '~/utils/dates'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Select time' },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  inputClass: {
    type: String,
    default:
      'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
  },
})

const emit = defineEmits(['update:modelValue'])

const { openExclusive, closeExclusive } = useExclusiveDropdown()

const selectClass =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

const root = ref(null)
const trigger = ref(null)
const panel = ref(null)
const open = ref(false)
const panelStyle = ref({})
const selectedHour = ref('09')
const selectedMinute = ref('00')

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: String(i).padStart(2, '0'),
}))
const minuteOptions = Array.from({ length: 60 }, (_, i) => {
  const m = String(i).padStart(2, '0')
  return { value: m, label: m }
})

const displayValue = computed(() => formatTimeDisplay(props.modelValue, props.placeholder))

function syncFromModel() {
  const match = /^(\d{2}):(\d{2})$/.exec(props.modelValue)
  if (match) {
    selectedHour.value = match[1]
    selectedMinute.value = match[2]
  }
}

function updatePosition() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const margin = 8
  const panelWidth = 224

  let left = rect.left
  if (left + panelWidth > window.innerWidth - margin) {
    left = Math.max(margin, rect.right - panelWidth)
  }

  const spaceBelow = window.innerHeight - rect.bottom - margin
  const spaceAbove = rect.top - margin
  const openUpward = spaceBelow < 120 && spaceAbove > spaceBelow

  panelStyle.value = {
    left: `${left}px`,
    top: openUpward ? `${rect.top - margin}px` : `${rect.bottom + 4}px`,
    transform: openUpward ? 'translateY(-100%)' : undefined,
  }
}

function close() {
  if (!open.value) return
  open.value = false
  closeExclusive(close)
}

function toggle() {
  if (props.disabled) return
  if (open.value) {
    close()
    return
  }
  openExclusive(close)
  open.value = true
  syncFromModel()
  nextTick(() => updatePosition())
}

function emitValue() {
  emit('update:modelValue', `${selectedHour.value}:${selectedMinute.value}`)
}

function onDocumentClick(e) {
  if (!open.value) return
  if (root.value?.contains(e.target) || panel.value?.contains(e.target)) return
  close()
}

function onViewportChange() {
  if (!open.value) return
  updatePosition()
}

watch(() => props.modelValue, syncFromModel)

onMounted(() => {
  syncFromModel()
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
  onUnmounted(() => {
    closeExclusive(close)
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
  })
})
</script>
