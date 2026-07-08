<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      @click.self="close"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-bids-title"
      >
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="export-bids-title" class="text-lg font-semibold text-slate-800">Export bids</h2>
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            :disabled="loading"
            @click="close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="space-y-4 px-6 py-5">
          <p class="text-sm text-slate-500">
            Choose a quick period, a single day, or a custom date range for the Excel download.
          </p>

          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500">Export type</label>
            <AppSelect
              v-model="exportType"
              :options="exportTypeOptions"
              :input-class="inputClass"
              :full-width="true"
            />
          </div>

          <div v-if="exportType === 'period'">
            <label class="mb-1 block text-xs font-medium text-slate-500">Period</label>
            <AppSelect
              v-model="period"
              :options="periodOptions"
              :input-class="inputClass"
              :full-width="true"
            />
          </div>

          <div v-else-if="exportType === 'day'">
            <label class="mb-1 block text-xs font-medium text-slate-500">Date</label>
            <DatePicker
              v-model="singleDate"
              placeholder="Select date"
              :max="today"
              :full-width="true"
              :input-class="inputClass"
            />
          </div>

          <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-500">From</label>
              <DatePicker
                v-model="fromDate"
                placeholder="Start date"
                :max="toDate || today"
                :full-width="true"
                :input-class="inputClass"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-500">To</label>
              <DatePicker
                v-model="toDate"
                placeholder="End date"
                :min="fromDate"
                :max="today"
                :full-width="true"
                :input-class="inputClass"
              />
            </div>
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </div>

        <div class="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            class="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            :disabled="loading"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading || !canExport"
            @click="confirm"
          >
            {{ loading ? 'Exporting…' : 'Download Excel' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { toLocalDateKey, todayDateKey } from '~/utils/dates'

export type BidsExportRange = {
  from: string
  to: string
}

const props = withDefaults(
  defineProps<{
    open: boolean
    loading?: boolean
    error?: string
  }>(),
  {
    loading: false,
    error: '',
  },
)

const emit = defineEmits<{
  close: []
  export: [range: BidsExportRange]
}>()

const exportType = ref<'period' | 'day' | 'range'>('period')
const period = ref('7')
const singleDate = ref('')
const fromDate = ref('')
const toDate = ref('')

const today = todayDateKey()

const exportTypeOptions = [
  { value: 'period', label: 'Quick period' },
  { value: 'day', label: 'Specific day' },
  { value: 'range', label: 'Custom range' },
]

const periodOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '15', label: 'Last 15 days' },
  { value: '30', label: 'Last 30 days' },
]

const inputClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

const canExport = computed(() => {
  if (exportType.value === 'period') return Boolean(period.value)
  if (exportType.value === 'day') return Boolean(singleDate.value)
  return Boolean(fromDate.value && toDate.value && fromDate.value <= toDate.value)
})

function periodStartDateKey(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - (days - 1))
  return toLocalDateKey(date)
}

function resolveRange(): BidsExportRange | null {
  if (exportType.value === 'period') {
    const days = Number(period.value)
    if (!days) return null
    return { from: periodStartDateKey(days), to: todayDateKey() }
  }
  if (exportType.value === 'day') {
    if (!singleDate.value) return null
    return { from: singleDate.value, to: singleDate.value }
  }
  if (!fromDate.value || !toDate.value || fromDate.value > toDate.value) return null
  return { from: fromDate.value, to: toDate.value }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    exportType.value = 'period'
    period.value = '7'
    singleDate.value = ''
    fromDate.value = ''
    toDate.value = ''
  },
)

function close() {
  if (props.loading) return
  emit('close')
}

function confirm() {
  if (props.loading || !canExport.value) return
  const range = resolveRange()
  if (!range) return
  emit('export', range)
}
</script>
