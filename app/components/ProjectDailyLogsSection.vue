<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Daily logs</h2>
        <p class="mt-1 text-sm text-slate-500">
          {{ isHourly
            ? 'Record tasks completed and tracker time for this project.'
            : 'Record tasks completed for this project.' }}
        </p>
      </div>
      <div v-if="isHourly && totalTrackerMinutes > 0" class="rounded-xl bg-indigo-50 px-3 py-2 text-right">
        <p class="text-xs font-medium uppercase tracking-wide text-indigo-400">Total tracked</p>
        <p class="text-sm font-semibold text-indigo-700">{{ formatTrackerMinutes(totalTrackerMinutes) }}</p>
      </div>
    </div>

    <div v-if="!readOnly" class="mt-5 space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div class="grid grid-cols-1 gap-4" :class="isHourly ? 'sm:grid-cols-2' : ''">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Date <span class="text-red-500">*</span>
          </label>
          <input v-model="logDate" type="date" :class="inputClass" />
        </div>
        <div v-if="isHourly">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Tracker time (hours) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="trackerHours"
            type="number"
            min="0"
            step="0.25"
            placeholder="e.g. 2.5"
            :class="inputClass"
          />
          <p v-if="trackerHours > 0" class="mt-1 text-xs text-slate-400">
            {{ formatTrackerMinutes(Math.round(trackerHours * 60)) }}
          </p>
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">
          Tasks done <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="tasksDone"
          rows="4"
          placeholder="What did you work on today?"
          :class="inputClass"
        />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          :disabled="!canSubmit || saving"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="submitLog"
        >
          {{ saving ? 'Saving…' : editingId ? 'Update log' : 'Add log' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="cancelEdit"
        >
          Cancel
        </button>
        <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
        <p v-else-if="saveOk" class="text-sm text-emerald-700">
          {{ editingId ? 'Log updated.' : 'Log added.' }}
        </p>
      </div>
    </div>

    <div class="mt-6">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400">Log history</h3>
      <div v-if="logsLoading" class="mt-3 text-sm text-slate-400">Loading logs…</div>
      <div v-else-if="!logs?.length" class="mt-3 text-sm text-slate-400">No daily logs yet.</div>
      <ol v-else class="mt-4 space-y-0">
        <li
          v-for="(entry, index) in logs"
          :key="entry.id"
          class="relative flex gap-4 pb-6 pl-6 ml-2"
          :class="index < logs.length - 1 ? 'border-l border-slate-200' : ''"
        >
          <span class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-slate-800">{{ formatLogDate(entry.log_date) }}</span>
              <span
                v-if="isHourly"
                class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
              >
                {{ formatTrackerMinutes(entry.tracker_minutes) }}
              </span>
              <span v-if="entry.updated_at && entry.updated_at !== entry.created_at" class="text-xs text-slate-400">
                edited {{ formatDateTime(entry.updated_at) }}
              </span>
            </div>
            <p class="mt-2 whitespace-pre-wrap text-sm text-slate-600">{{ entry.tasks_done }}</p>
            <p v-if="entry.logged_by_name" class="mt-2 text-xs text-slate-400">
              by {{ entry.logged_by_name }}
            </p>
            <button
              v-if="!readOnly"
              type="button"
              class="mt-2 text-xs font-medium text-indigo-600 transition hover:text-indigo-700"
              @click="startEdit(entry)"
            >
              Edit
            </button>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  projectId: { type: String, required: true },
  jobType: { type: String, default: '' },
  readOnly: { type: Boolean, default: false },
  adminEmployeeId: { type: String, default: '' },
})

const { getDailyLogs, createDailyLog, updateDailyLog, getAdminDailyLogs } = useProjects()

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

const isHourly = computed(() => props.jobType === 'hourly')

const logsPathKey = computed(() =>
  props.adminEmployeeId
    ? `admin-${props.adminEmployeeId}-${props.projectId}`
    : props.projectId,
)

const fetchLogs = () =>
  props.adminEmployeeId
    ? getAdminDailyLogs(props.adminEmployeeId, props.projectId)
    : getDailyLogs(props.projectId)

const logDate = ref(new Date().toISOString().slice(0, 10))
const tasksDone = ref('')
const trackerHours = ref(0)
const editingId = ref(null)
const saving = ref(false)
const saveError = ref('')
const saveOk = ref(false)

const { data: logs, pending: logsLoading, refresh: refreshLogs } = await useAsyncData(
  () => `project-daily-logs-${logsPathKey.value}`,
  () => fetchLogs(),
  { server: false, default: () => [] },
)

const totalTrackerMinutes = computed(() =>
  (logs.value || []).reduce((sum, entry) => sum + (entry.tracker_minutes || 0), 0),
)

const canSubmit = computed(() => {
  const hasTasks = Boolean(logDate.value && tasksDone.value.trim())
  if (!hasTasks) return false
  if (!isHourly.value) return true
  return Number.isFinite(trackerHours.value) && trackerHours.value >= 0
})

function resetForm() {
  logDate.value = new Date().toISOString().slice(0, 10)
  tasksDone.value = ''
  trackerHours.value = 0
  editingId.value = null
}

function startEdit(entry) {
  editingId.value = entry.id
  logDate.value = entry.log_date
  tasksDone.value = entry.tasks_done
  trackerHours.value = isHourly.value
    ? Math.round((entry.tracker_minutes / 60) * 100) / 100
    : 0
  saveError.value = ''
  saveOk.value = false
}

function cancelEdit() {
  resetForm()
  saveError.value = ''
  saveOk.value = false
}

async function submitLog() {
  if (!canSubmit.value) return
  saving.value = true
  saveError.value = ''
  saveOk.value = false

  const body = {
    log_date: logDate.value,
    tasks_done: tasksDone.value.trim(),
    tracker_minutes: isHourly.value ? Math.round(trackerHours.value * 60) : 0,
  }

  try {
    if (editingId.value) {
      await updateDailyLog(props.projectId, editingId.value, body)
    } else {
      await createDailyLog(props.projectId, body)
    }
    saveOk.value = true
    resetForm()
    await refreshLogs()
  } catch (e) {
    saveError.value = e?.data?.error || e?.message || 'Failed to save daily log.'
  } finally {
    saving.value = false
  }
}

function formatLogDate(value) {
  if (!value) return '—'
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatTrackerMinutes(minutes) {
  const total = Number(minutes) || 0
  if (total <= 0) return '0h'
  const hours = Math.floor(total / 60)
  const mins = total % 60
  if (hours && mins) return `${hours}h ${mins}m`
  if (hours) return `${hours}h`
  return `${mins}m`
}
</script>
