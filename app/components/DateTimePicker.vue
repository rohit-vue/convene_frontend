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
        @click.stop="onPanelClick"
      >
        <CalendarMonthYearNav
          ref="monthYearNav"
          :year="viewYear"
          :month="viewMonth"
          @update:year="viewYear = $event"
          @update:month="viewMonth = $event"
          @prev="prevMonth"
          @next="nextMonth"
        />

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
          </button>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500">Hour</label>
            <AppSelect
              v-model="selectedHour"
              :options="hourOptions"
              :input-class="timeInputClass"
              @update:model-value="emitValue"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500">Minute</label>
            <AppSelect
              v-model="selectedMinute"
              :options="minuteOptions"
              :input-class="timeInputClass"
              @update:model-value="emitValue"
            />
          </div>
        </div>

        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
            :disabled="!selectedDate"
            @click="confirm"
          >
            Done
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  buildCalendarDays,
  formatDateTimeInputDisplay,
  getPanelWidth,
  isDateKeyDisabled,
  parseDateKey,
  todayDateKey,
} from '~/utils/dates'

const PANEL_HEIGHT_ESTIMATE = 420

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Select date & time' },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  inputClass: {
    type: String,
    default:
      'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
  },
})

const emit = defineEmits(['update:modelValue'])

const { openExclusive, closeExclusive } = useExclusiveDropdown()

const timeInputClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

const root = ref(null)
const trigger = ref(null)
const panel = ref(null)
const monthYearNav = ref(null)
const open = ref(false)
const panelStyle = ref({})
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())
const selectedDate = ref('')
const selectedHour = ref('09')
const selectedMinute = ref('00')

const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: String(i).padStart(2, '0'),
}))
const minuteOptions = Array.from({ length: 60 }, (_, i) => {
  const m = String(i).padStart(2, '0')
  return { value: m, label: m }
})

const todayKey = computed(() => todayDateKey())
const displayValue = computed(() => formatDateTimeInputDisplay(props.modelValue, props.placeholder))
const calendarDays = computed(() => buildCalendarDays(viewYear.value, viewMonth.value))

function parseModel(value) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  return { date: match[1], hour: match[2], minute: match[3] }
}

function syncFromModel() {
  const parsed = parseModel(props.modelValue)
  if (parsed) {
    selectedDate.value = parsed.date
    selectedHour.value = parsed.hour
    selectedMinute.value = parsed.minute
    const date = parseDateKey(parsed.date)
    if (date) {
      viewYear.value = date.getFullYear()
      viewMonth.value = date.getMonth()
    }
    return
  }
  selectedDate.value = ''
  const now = new Date()
  viewYear.value = now.getFullYear()
  viewMonth.value = now.getMonth()
  selectedHour.value = String(now.getHours()).padStart(2, '0')
  selectedMinute.value = String(now.getMinutes()).padStart(2, '0')
}

function dayCellClass(cell) {
  const disabled = isDateKeyDisabled(cell.dateKey, props.min, props.max)
  if (disabled) return 'cursor-not-allowed text-slate-300'
  if (cell.dateKey === selectedDate.value) return 'bg-indigo-600 font-medium text-white'
  if (cell.dateKey === todayKey.value) {
    return cell.outside
      ? 'text-slate-300 ring-1 ring-indigo-100'
      : 'font-medium text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50'
  }
  if (cell.outside) return 'text-slate-300 hover:bg-slate-50'
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

function close() {
  if (!open.value) return
  monthYearNav.value?.closePickers?.()
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
  selectedDate.value = dateKey
  emitValue()
}

function emitValue() {
  if (!selectedDate.value) return
  emit('update:modelValue', `${selectedDate.value}T${selectedHour.value}:${selectedMinute.value}`)
}

function confirm() {
  emitValue()
  close()
}

function onPanelClick() {
  monthYearNav.value?.closePickers?.()
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

watch(() => props.modelValue, () => {
  if (!open.value) syncFromModel()
})

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
