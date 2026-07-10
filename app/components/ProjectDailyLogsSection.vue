<template>
  <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Daily logs</h2>
        <p class="mt-1 text-sm text-fg-muted">
          {{ isHourly
            ? 'Record tasks completed and tracker time for this project.'
            : 'Record tasks completed for this project.' }}
        </p>
      </div>
      <div class="flex flex-col items-stretch gap-3 sm:items-end">
        <div v-if="logs?.length" class="w-full sm:w-auto">
          <label class="mb-1 block text-xs font-medium text-fg-muted sm:text-right">Filter by date</label>
          <DateFilterPicker
            v-model="filterDate"
            :marked-dates="markedDates"
            placeholder="All dates"
            :input-class="filterInputClass"
          />
        </div>
        <div v-if="isHourly && totalTrackerMinutes > 0" class="w-full rounded-xl bg-indigo-50 dark:bg-indigo-950 px-3 py-2 text-left sm:w-auto sm:text-right">
          <p class="text-xs font-medium uppercase tracking-wide text-indigo-400">Total tracked</p>
          <p class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{{ formatTrackerMinutes(totalTrackerMinutes) }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="canEditLogs && !readOnly"
      ref="formSection"
      class="mt-5 space-y-4 rounded-xl border border-border bg-elevated/60 p-4"
      :class="editingId ? 'border-indigo-200 ring-1 ring-indigo-100' : ''"
    >
      <p
        v-if="editingId"
        class="rounded-lg bg-indigo-50 dark:bg-indigo-950 px-3 py-2 text-sm text-indigo-800"
      >
        Editing log for <strong>{{ formatLogDate(editingLogDate) }}</strong>. You can only update the task description below.
      </p>
      <div v-if="!editingId" class="grid grid-cols-1 gap-4" :class="isHourly ? 'sm:grid-cols-2' : ''">
        <div>
          <label class="mb-1 block text-sm font-medium text-fg">
            Date <span class="text-red-500">*</span>
          </label>
          <DatePicker
            v-model="logDate"
            :max="maxLogDate"
            placeholder="Select date"
            :input-class="inputClass"
            full-width
          />
          <p v-if="isFutureLogDate" class="mt-1 text-xs text-red-600">
            You cannot add a log for a future date.
          </p>
        </div>
        <div v-if="isHourly">
          <label class="mb-1 block text-sm font-medium text-fg">
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
          <p v-if="trackerHours > 0" class="mt-1 text-xs text-fg-subtle">
            {{ formatTrackerMinutes(Math.round(trackerHours * 60)) }}
          </p>
        </div>
      </div>
      <div v-else-if="isHourly" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg-muted">
        <span class="text-fg-muted">Tracked time:</span>
        {{ formatTrackerMinutes(editingTrackerMinutes) }}
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-fg">
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
          class="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-elevated"
          @click="cancelEdit"
        >
          Cancel
        </button>
      </div>
    </div>

    <div class="mt-6">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Log history</h3>
      <div v-if="logsLoading" class="mt-3">
        <ContentLoader variant="table" :rows="3" :columns="3" />
      </div>
      <div v-else-if="!logs?.length" class="mt-3 text-sm text-fg-subtle">No daily logs yet.</div>
      <div v-else-if="!displayedLogs.length" class="mt-3 text-sm text-fg-subtle">
        No log for the selected date.
      </div>
      <ol v-else class="mt-4 space-y-0">
        <li
          v-for="(entry, index) in displayedLogs"
          :key="entry.id"
          class="relative flex gap-4 pb-6 pl-6 ml-2"
          :class="index < displayedLogs.length - 1 ? 'border-l border-border' : ''"
        >
          <span class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-surface" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-fg">{{ formatLogDate(entry.log_date) }}</span>
              <span
                v-if="isHourly"
                class="rounded-full bg-elevated px-2 py-0.5 text-xs font-medium text-fg-muted"
              >
                {{ formatTrackerMinutes(entry.tracker_minutes) }}
              </span>
              <span v-if="entry.updated_at && entry.updated_at !== entry.created_at" class="text-xs text-fg-subtle">
                edited {{ formatDateTime(entry.updated_at) }}
              </span>
            </div>
            <p class="mt-2 whitespace-pre-wrap text-sm text-fg-muted">{{ entry.tasks_done }}</p>
            <p v-if="entry.logged_by_name" class="mt-2 text-xs text-fg-subtle">
              by {{ entry.logged_by_name }}
            </p>
            <div v-if="canManageLog(entry)" class="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300"
                @click="startEdit(entry)"
              >
                Edit
              </button>
              <button
                type="button"
                class="text-xs font-medium text-red-600 transition hover:text-red-700"
                @click="openDeleteModal(entry)"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      </ol>
    </div>

    <ConfirmDeleteModal
      :open="showDeleteModal"
      title="Delete this daily log?"
      message="This action cannot be undone. The log entry will be permanently removed."
      confirm-label="Delete log"
      :loading="deleting"
      :error="deleteError"
      @close="closeDeleteModal"
      @confirm="confirmDeleteLog"
    >
      <div v-if="logToDelete" class="rounded-xl border border-border bg-elevated px-4 py-3 text-sm">
        <p class="font-medium text-fg">{{ formatLogDate(logToDelete.log_date) }}</p>
        <p class="mt-2 line-clamp-3 whitespace-pre-wrap text-fg-muted">{{ logToDelete.tasks_done }}</p>
      </div>
    </ConfirmDeleteModal>
  </div>
</template>

<script setup lang="ts">
import { filterInputClass, formInputClass as inputClass } from '~/utils/ui'
import type { ProjectDailyLog } from '~/types/projects'

const props = defineProps({
  projectId: { type: String, required: true },
  jobType: { type: String, default: '' },
  readOnly: { type: Boolean, default: false },
  canEditLogs: { type: Boolean, default: true },
  canManageAllLogs: { type: Boolean, default: false },
  adminEmployeeId: { type: String, default: '' },
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const sessionUserId = ref('')
const formSection = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!user.value?.id) {
    const { data } = await supabase.auth.getSession()
    sessionUserId.value = data.session?.user?.id ?? ''
  }
})

const currentUserId = computed(() => user.value?.id ?? sessionUserId.value)

const { getDailyLogs, createDailyLog, updateDailyLog, deleteDailyLog, getAdminDailyLogs } = useProjects()



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

const logDate = ref(todayDateKey())
const filterDate = ref('')
const tasksDone = ref('')
const trackerHours = ref(0)
const editingId = ref<string | null>(null)
const editingLogDate = ref('')
const editingTrackerMinutes = ref(0)
const saving = ref(false)
const toast = useToast()
const showDeleteModal = ref(false)
const logToDelete = ref<ProjectDailyLog | null>(null)
const deleting = ref(false)
const deleteError = ref('')

const { data: logs, pending: logsLoading, refresh: refreshLogs } = await useAsyncData(
  () => `project-daily-logs-${logsPathKey.value}`,
  () => fetchLogs(),
  { server: false, default: () => [] },
)

const totalTrackerMinutes = computed(() =>
  (logs.value || []).reduce((sum, entry) => sum + (entry.tracker_minutes || 0), 0),
)

const markedDates = computed(() => collectDateKeys((logs.value || []).map((entry) => entry.log_date)))

const displayedLogs = computed(() => {
  const items = logs.value || []
  if (!filterDate.value) return items
  return items.filter((entry) => entry.log_date?.slice(0, 10) === filterDate.value)
})

const maxLogDate = computed(() => todayDateKey())

const isFutureLogDate = computed(() => isFutureDateKey(logDate.value))

const canSubmit = computed(() => {
  if (editingId.value) return Boolean(tasksDone.value.trim())
  const hasTasks = Boolean(logDate.value && tasksDone.value.trim())
  if (!hasTasks || isFutureLogDate.value) return false
  if (!isHourly.value) return true
  return Number.isFinite(trackerHours.value) && trackerHours.value >= 0
})

function canManageLog(entry: ProjectDailyLog) {
  if (!props.canEditLogs || props.readOnly) return false
  if (props.canManageAllLogs) return true
  return Boolean(currentUserId.value && entry.created_by === currentUserId.value)
}

function normalizeLogDate(value: string) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function resetForm() {
  logDate.value = todayDateKey()
  tasksDone.value = ''
  trackerHours.value = 0
  editingId.value = null
  editingLogDate.value = ''
  editingTrackerMinutes.value = 0
}

function startEdit(entry: ProjectDailyLog) {
  editingId.value = entry.id
  editingLogDate.value = normalizeLogDate(entry.log_date)
  editingTrackerMinutes.value = entry.tracker_minutes || 0
  logDate.value = editingLogDate.value
  tasksDone.value = entry.tasks_done
  trackerHours.value = isHourly.value
    ? Math.round(((entry.tracker_minutes || 0) / 60) * 100) / 100
    : 0
  nextTick(() => {
    formSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function cancelEdit() {
  resetForm()
}

async function submitLog() {
  if (!canSubmit.value) return
  if (!editingId.value && isFutureDateKey(logDate.value)) {
    toast.error('You cannot add a log for a future date.')
    return
  }
  saving.value = true

  const body = editingId.value
    ? { tasks_done: tasksDone.value.trim() }
    : {
        log_date: logDate.value,
        tasks_done: tasksDone.value.trim(),
        tracker_minutes: isHourly.value ? Math.round(trackerHours.value * 60) : 0,
      }

  try {
    if (editingId.value) {
      await updateDailyLog(props.projectId, editingId.value, body)
      toast.success('Log updated.')
    } else {
      await createDailyLog(props.projectId, body)
      toast.success('Log added.')
    }
    resetForm()
    await refreshLogs()
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to save daily log.'))
  } finally {
    saving.value = false
  }
}

function openDeleteModal(entry: ProjectDailyLog) {
  if (editingId.value === entry.id) cancelEdit()
  logToDelete.value = entry
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
  logToDelete.value = null
  deleteError.value = ''
}

async function confirmDeleteLog() {
  if (!logToDelete.value || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await deleteDailyLog(props.projectId, logToDelete.value.id)
    showDeleteModal.value = false
    logToDelete.value = null
    await refreshLogs()
  } catch (e) {
    deleteError.value = toastErrorMessage(e, 'Failed to delete daily log.')
    toast.error(deleteError.value)
  } finally {
    deleting.value = false
  }
}

function formatLogDate(value) {
  if (!value) return '—'
  const dateKey = normalizeLogDate(value)
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return '—'
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
