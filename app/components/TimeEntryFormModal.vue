<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-lg rounded-2xl bg-surface shadow-xl">
      <div class="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 class="text-lg font-semibold text-fg">{{ isEdit ? 'Edit time entry' : 'Add time entry' }}</h2>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-lg text-fg-subtle transition hover:bg-elevated hover:text-fg-muted"
          @click="close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <form class="space-y-5 px-6 py-5" @submit.prevent="save">
        <div>
          <label class="mb-1 block text-sm font-medium text-fg">
            Date <span class="text-red-500">*</span>
          </label>
          <DatePicker
            v-model="form.work_date"
            placeholder="Select date"
            :max="maxDate"
            :input-class="inputClass"
            full-width
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">
              Work (hours) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.work_hours"
              type="number"
              min="0"
              step="0.25"
              placeholder="e.g. 7.5"
              :class="inputClass"
            />
            <p v-if="workMinutesPreview >= 0" class="mt-1 text-xs text-fg-subtle">
              {{ formatMinutes(workMinutesPreview) }}
            </p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">
              Lunch (hours) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.lunch_hours"
              type="number"
              min="0"
              step="0.25"
              placeholder="e.g. 0.75"
              :class="inputClass"
            />
            <p v-if="lunchMinutesPreview >= 0" class="mt-1 text-xs text-fg-subtle">
              {{ formatMinutes(lunchMinutesPreview) }}
            </p>
          </div>
        </div>

        <p class="text-xs text-fg-subtle">
          Manual entry replaces timer segments for that day. Stop any running timer first.
        </p>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium text-fg-muted hover:bg-elevated"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add entry' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formInputClass as inputClass } from '~/utils/ui'
import { todayDateKey } from '~/utils/dates'
import type { TimeEntry } from '~/types/timeTracking'
import { toastErrorMessage } from '~/composables/useToast'

const props = defineProps<{
  open: boolean
  entry?: TimeEntry | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { upsertManual, updateManual } = useTimeTracking()
const toast = useToast()

const loading = ref(false)
const error = ref('')
const maxDate = todayDateKey()
const isEdit = computed(() => Boolean(props.entry?.id))

function blankForm() {
  return {
    work_date: todayDateKey(),
    work_hours: 0,
    lunch_hours: 0,
  }
}

const form = reactive(blankForm())

const workMinutesPreview = computed(() => Math.round(Number(form.work_hours) * 60) || 0)
const lunchMinutesPreview = computed(() => Math.round(Number(form.lunch_hours) * 60) || 0)

function hydrate() {
  if (props.entry) {
    Object.assign(form, {
      work_date: props.entry.work_date?.slice(0, 10) || todayDateKey(),
      work_hours: Number(((Number(props.entry.work_minutes) || 0) / 60).toFixed(2)),
      lunch_hours: Number(((Number(props.entry.lunch_minutes) || 0) / 60).toFixed(2)),
    })
  } else {
    Object.assign(form, blankForm())
  }
  error.value = ''
}

watch(
  () => [props.open, props.entry] as const,
  ([isOpen]) => {
    if (isOpen) hydrate()
  },
)

function close() {
  emit('close')
}

function formatMinutes(minutes: number) {
  const total = Math.max(0, Number(minutes) || 0)
  if (!total) return '0m'
  const hours = Math.floor(total / 60)
  const mins = total % 60
  if (hours && mins) return `${hours}h ${mins}m`
  if (hours) return `${hours}h`
  return `${mins}m`
}

async function save() {
  if (!form.work_date) {
    error.value = 'Date is required.'
    toast.error(error.value)
    return
  }
  if (!Number.isFinite(Number(form.work_hours)) || Number(form.work_hours) < 0) {
    error.value = 'Work hours must be a non-negative number.'
    toast.error(error.value)
    return
  }
  if (!Number.isFinite(Number(form.lunch_hours)) || Number(form.lunch_hours) < 0) {
    error.value = 'Lunch hours must be a non-negative number.'
    toast.error(error.value)
    return
  }

  loading.value = true
  error.value = ''

  const payload = {
    work_date: form.work_date,
    work_minutes: Math.round(Number(form.work_hours) * 60),
    lunch_minutes: Math.round(Number(form.lunch_hours) * 60),
  }

  try {
    if (isEdit.value && props.entry?.id) {
      await updateManual(props.entry.id, payload)
      toast.success('Time entry updated.')
    } else {
      await upsertManual(payload)
      toast.success('Time entry saved.')
    }
    emit('saved')
    close()
  } catch (e) {
    error.value = toastErrorMessage(e, `Failed to ${isEdit.value ? 'update' : 'add'} time entry.`)
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>
