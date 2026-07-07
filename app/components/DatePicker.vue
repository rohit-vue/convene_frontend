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
      <span class="truncate" :class="modelValue ? 'text-slate-700' : 'text-slate-400'">
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
        class="shrink-0 text-slate-400"
      >
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panel"
        class="fixed z-[200] max-w-[calc(100vw-1rem)] rounded-xl border border-slate-100 bg-white p-4 shadow-xl"
        :style="panelStyle"
        @click.stop
      >
        <div class="mb-3 flex items-center justify-between">
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            @click="prevMonth"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <span class="text-sm font-semibold text-slate-800">{{ monthLabel }}</span>
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            @click="nextMonth"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>

        <div class="mb-1 grid grid-cols-7 gap-1">
          <span
            v-for="day in weekDays"
            :key="day"
            class="py-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-400"
          >
            {{ day }}
          </span>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="cell in calendarDays"
            :key="cell.dateKey"
            type="button"
            :disabled="isDateKeyDisabled(cell.dateKey, min, max)"
            class="relative grid h-9 w-9 place-items-center rounded-lg text-sm transition"
            :class="dayCellClass(cell)"
            @click="selectDate(cell.dateKey)"
          >
            {{ cell.day }}
            <span
              v-if="markedSet.has(cell.dateKey)"
              class="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
              :class="cell.dateKey === modelValue ? 'bg-white' : 'bg-indigo-500'"
            />
          </button>
        </div>

        <div
          v-if="showMarkedLegend || (allowClear && modelValue)"
          class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"
        >
          <div v-if="showMarkedLegend" class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="h-1 w-1 rounded-full bg-indigo-500" />
            Has data
          </div>
          <span v-else />
          <button
            v-if="allowClear && modelValue"
            type="button"
            class="text-xs font-medium text-indigo-600 transition hover:text-indigo-700"
            @click="clear"
          >
            Clear
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  buildCalendarDays,
  formatDateKeyDisplay,
  getPanelWidth,
  isDateKeyDisabled,
  parseDateKey,
  todayDateKey,
} from '~/utils/dates'

const PANEL_HEIGHT_ESTIMATE = 360

const props = defineProps({
  modelValue: { type: String, default: '' },
  markedDates: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select date' },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  allowClear: { type: Boolean, default: false },
  showMarkedLegend: { type: Boolean, default: false },
  inputClass: {
    type: String,
    default:
      'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
  },
})

const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const trigger = ref(null)
const panel = ref(null)
const open = ref(false)
const panelStyle = ref({})
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())

const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const markedSet = computed(() => new Set(props.markedDates))
const todayKey = computed(() => todayDateKey())

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  }),
)

const displayValue = computed(() => formatDateKeyDisplay(props.modelValue, props.placeholder))
const calendarDays = computed(() => buildCalendarDays(viewYear.value, viewMonth.value))

function dayCellClass(cell) {
  const disabled = isDateKeyDisabled(cell.dateKey, props.min, props.max)
  if (disabled) {
    return 'cursor-not-allowed text-slate-300'
  }
  if (cell.dateKey === props.modelValue) {
    return 'bg-indigo-600 font-medium text-white'
  }
  if (cell.dateKey === todayKey.value) {
    return cell.outside
      ? 'text-slate-300 ring-1 ring-indigo-100'
      : 'font-medium text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50'
  }
  if (cell.outside) {
    return 'text-slate-300 hover:bg-slate-50'
  }
  return 'text-slate-700 hover:bg-slate-100'
}

function updatePosition() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const margin = 8
  const panelWidth = getPanelWidth()

  let left = rect.left
  if (left + panelWidth > window.innerWidth - margin) {
    left = Math.max(margin, rect.right - panelWidth)
  }
  left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin))

  const spaceBelow = window.innerHeight - rect.bottom - margin
  const spaceAbove = rect.top - margin
  const openUpward = spaceBelow < PANEL_HEIGHT_ESTIMATE && spaceAbove > spaceBelow

  panelStyle.value = {
    left: `${left}px`,
    top: openUpward ? `${rect.top - margin}px` : `${rect.bottom + 4}px`,
    width: `${panelWidth}px`,
    transform: openUpward ? 'translateY(-100%)' : undefined,
  }
}

function syncViewToSelection() {
  const date = parseDateKey(props.modelValue)
  if (date) {
    viewYear.value = date.getFullYear()
    viewMonth.value = date.getMonth()
    return
  }
  const now = new Date()
  viewYear.value = now.getFullYear()
  viewMonth.value = now.getMonth()
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    syncViewToSelection()
    nextTick(() => updatePosition())
  }
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

function selectDate(dateKey) {
  if (isDateKeyDisabled(dateKey, props.min, props.max)) return
  emit('update:modelValue', dateKey)
  open.value = false
}

function clear() {
  emit('update:modelValue', '')
  open.value = false
}

function onDocumentClick(e) {
  if (!open.value) return
  if (root.value?.contains(e.target) || panel.value?.contains(e.target)) return
  open.value = false
}

function onViewportChange() {
  if (!open.value) return
  updatePosition()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
  onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
  })
})
</script>
