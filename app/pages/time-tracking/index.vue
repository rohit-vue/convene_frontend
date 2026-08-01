<template>
  <div>
    <!-- Admin view -->
    <template v-if="isAdmin">
      <div class="mb-6 sm:mb-8">
        <h1 class="text-xl font-bold tracking-tight sm:text-2xl">Time tracking</h1>
        <p class="mt-1 text-sm text-fg-muted">
          Review work and lunch time logged by all employees.
        </p>
      </div>

      <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div class="border-b border-border bg-elevated px-4 py-4 sm:px-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
            <div class="w-full sm:w-auto">
              <label :class="filterLabelClass">Date</label>
              <DateFilterPicker
                v-model="filterDate"
                :marked-dates="markedDates"
                placeholder="All dates"
                :input-class="filterInputClass"
              />
            </div>
            <div class="w-full sm:w-auto">
              <label :class="filterLabelClass">Sort by date</label>
              <AppSelect
                v-model="dateSortOrder"
                :options="dateSortOptions"
                :input-class="filterInputClass"
                :full-width="false"
              />
            </div>
            <div class="w-full sm:w-auto">
              <label :class="filterLabelClass">Employee</label>
              <AppSelect
                v-model="filterEmployeeId"
                :options="employeeFilterOptions"
                placeholder="All employees"
                :input-class="filterInputClass"
                :full-width="false"
              />
            </div>
          </div>
        </div>

        <ContentLoader v-if="adminLoading" variant="table" :rows="6" :columns="6" />

        <!-- Mobile cards -->
        <div v-else class="space-y-3 p-4 sm:hidden">
          <div
            v-for="entry in displayedAdminEntries"
            :key="entry.id || `${entry.user_id}-${entry.work_date}`"
            class="rounded-xl border border-border bg-elevated/40 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-fg">{{ entry.employee_name || '—' }}</p>
                <p class="mt-0.5 text-sm text-fg-muted">{{ formatDay(entry.work_date) }}</p>
              </div>
              <span class="shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusBadge(entry)">
                {{ entry.is_on_lunch ? 'On lunch' : entry.is_working ? 'Working' : 'Stopped' }}
              </span>
            </div>
            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
              <div class="rounded-lg bg-surface px-2 py-2">
                <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">Work</p>
                <p class="mt-0.5 text-sm font-semibold text-fg">{{ formatMinutes(entry.work_minutes) }}</p>
              </div>
              <div class="rounded-lg bg-surface px-2 py-2">
                <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">Lunch</p>
                <p class="mt-0.5 text-sm font-semibold text-fg">{{ formatMinutes(entry.lunch_minutes) }}</p>
              </div>
              <div class="rounded-lg bg-surface px-2 py-2">
                <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">Total</p>
                <p class="mt-0.5 text-sm font-semibold text-fg">{{ formatMinutes(entry.total_minutes) }}</p>
              </div>
            </div>
          </div>
          <p v-if="!displayedAdminEntries.length" class="py-10 text-center text-sm text-fg-subtle">
            {{ adminEmptyMessage }}
          </p>
        </div>

        <!-- Desktop table -->
        <div v-if="!adminLoading" class="hidden overflow-x-auto sm:block">
          <table class="w-full min-w-200 text-sm">
            <thead class="bg-elevated text-left text-xs uppercase tracking-wide text-fg-muted">
              <tr>
                <th class="px-4 py-4 font-medium sm:px-6">Date</th>
                <th class="px-4 py-4 font-medium sm:px-6">Employee</th>
                <th class="px-4 py-4 font-medium sm:px-6">Work</th>
                <th class="px-4 py-4 font-medium sm:px-6">Lunch</th>
                <th class="px-4 py-4 font-medium sm:px-6">Total</th>
                <th class="px-4 py-4 font-medium sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="entry in displayedAdminEntries" :key="entry.id || `${entry.user_id}-${entry.work_date}`">
                <td class="whitespace-nowrap px-4 py-4 text-fg-muted sm:px-6">
                  {{ formatDay(entry.work_date) }}
                </td>
                <td class="px-4 py-4 font-medium text-fg sm:px-6">{{ entry.employee_name || '—' }}</td>
                <td class="px-4 py-4 text-fg-muted sm:px-6">{{ formatMinutes(entry.work_minutes) }}</td>
                <td class="px-4 py-4 text-fg-muted sm:px-6">{{ formatMinutes(entry.lunch_minutes) }}</td>
                <td class="px-4 py-4 text-fg-muted sm:px-6">{{ formatMinutes(entry.total_minutes) }}</td>
                <td class="px-4 py-4 sm:px-6">
                  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusBadge(entry)">
                    {{ entry.is_on_lunch ? 'On lunch' : entry.is_working ? 'Working' : 'Stopped' }}
                  </span>
                </td>
              </tr>
              <tr v-if="!displayedAdminEntries.length">
                <td colspan="6" class="px-4 py-12 text-center text-sm text-fg-subtle sm:px-6">
                  {{ adminEmptyMessage }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Employee view -->
    <template v-else-if="isEmployee">
      <div class="mb-4 flex items-start justify-between gap-3 sm:mb-8">
        <div class="min-w-0">
          <h1 class="text-xl font-bold tracking-tight sm:text-2xl">Time tracking</h1>
          <p class="mt-1 text-sm text-fg-muted">Track your work and lunch time for each day.</p>
        </div>
        <button
          type="button"
          class="hidden shrink-0 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-fg shadow-sm transition hover:bg-elevated sm:inline-flex"
          @click="openAdd"
        >
          + Add entry
        </button>
      </div>

      <!-- Clock card -->
      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div class="flex flex-col items-center text-center sm:items-start sm:text-left">
          <p class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Today</p>
          <p class="mt-1 text-base font-semibold text-fg sm:text-lg">{{ formatDay(todayEntry?.work_date) }}</p>

          <span
            class="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            :class="liveStatusBadgeClass"
          >
            {{ liveStatusText }}
          </span>

          <p class="mt-4 font-mono text-4xl font-bold tracking-tight text-fg tabular-nums sm:text-5xl">
            {{ activeClockDisplay }}
          </p>
          <p class="mt-2 max-w-sm text-sm text-fg-muted">{{ statusLabel }}</p>
        </div>

        <!-- Desktop action row -->
        <div class="mt-6 hidden gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            class="min-h-11 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isMutating || isWorking || isOnLunch"
            @click="runAction('startWork')"
          >
            Start work
          </button>
          <button
            type="button"
            class="min-h-11 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg shadow-sm transition hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isMutating || !isWorking"
            @click="runAction('stopWork')"
          >
            Stop work
          </button>
          <button
            type="button"
            class="min-h-11 rounded-xl border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-700 shadow-sm transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
            :disabled="isMutating || isOnLunch"
            @click="runAction('startLunch')"
          >
            Start lunch
          </button>
          <button
            type="button"
            class="min-h-11 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg shadow-sm transition hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isMutating || !isOnLunch"
            @click="runAction('stopLunch')"
          >
            Stop lunch
          </button>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          <div class="rounded-xl border border-border bg-elevated/60 px-2 py-3 text-center sm:px-4 sm:text-left">
            <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle sm:text-xs">Work</p>
            <p class="mt-1 text-sm font-semibold text-fg sm:text-lg">{{ formatMinutes(todayTotals.work) }}</p>
          </div>
          <div class="rounded-xl border border-border bg-elevated/60 px-2 py-3 text-center sm:px-4 sm:text-left">
            <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle sm:text-xs">Lunch</p>
            <p class="mt-1 text-sm font-semibold text-fg sm:text-lg">{{ formatMinutes(todayTotals.lunch) }}</p>
          </div>
          <div class="rounded-xl border border-border bg-elevated/60 px-2 py-3 text-center sm:px-4 sm:text-left">
            <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle sm:text-xs">Total</p>
            <p class="mt-1 text-sm font-semibold text-fg sm:text-lg">{{ formatMinutes(todayTotals.total) }}</p>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="mt-6 mb-24 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:mb-0">
        <div class="flex items-center justify-between gap-3 border-b border-border bg-elevated px-4 py-4 sm:px-6">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Daily list</h2>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 sm:hidden dark:text-indigo-300 dark:hover:bg-indigo-950"
            @click="openAdd"
          >
            + Add
          </button>
        </div>

        <!-- Mobile cards -->
        <div class="space-y-3 p-4 sm:hidden">
          <div
            v-for="entry in entries"
            :key="entry.id || entry.work_date"
            class="rounded-xl border border-border bg-elevated/40 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-fg">{{ formatDay(entry.work_date) }}</p>
                <span class="mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusBadge(entry)">
                  {{ entry.is_on_lunch ? 'On lunch' : entry.is_working ? 'Working' : 'Stopped' }}
                </span>
              </div>
              <button
                type="button"
                class="min-h-10 shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-950"
                :disabled="entry.is_working || entry.is_on_lunch || !entry.id"
                @click="openEdit(entry)"
              >
                Edit
              </button>
            </div>
            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
              <div class="rounded-lg bg-surface px-2 py-2">
                <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">Work</p>
                <p class="mt-0.5 text-sm font-semibold text-fg">{{ formatMinutes(entry.work_minutes) }}</p>
              </div>
              <div class="rounded-lg bg-surface px-2 py-2">
                <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">Lunch</p>
                <p class="mt-0.5 text-sm font-semibold text-fg">{{ formatMinutes(entry.lunch_minutes) }}</p>
              </div>
              <div class="rounded-lg bg-surface px-2 py-2">
                <p class="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">Total</p>
                <p class="mt-0.5 text-sm font-semibold text-fg">{{ formatMinutes(entry.total_minutes) }}</p>
              </div>
            </div>
          </div>
          <p v-if="!entries.length" class="py-8 text-center text-sm text-fg-subtle">No time entries yet.</p>
        </div>

        <!-- Desktop table -->
        <div class="hidden overflow-x-auto sm:block">
          <table class="w-full min-w-135 text-sm">
            <thead class="bg-elevated text-left text-xs uppercase tracking-wide text-fg-muted">
              <tr>
                <th class="px-4 py-4 font-medium sm:px-6">Date</th>
                <th class="px-4 py-4 font-medium sm:px-6">Work</th>
                <th class="px-4 py-4 font-medium sm:px-6">Lunch</th>
                <th class="px-4 py-4 font-medium sm:px-6">Total</th>
                <th class="px-4 py-4 font-medium sm:px-6">Status</th>
                <th class="px-4 py-4 font-medium sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="entry in entries" :key="entry.id || entry.work_date">
                <td class="px-4 py-4 font-medium text-fg sm:px-6">{{ formatDay(entry.work_date) }}</td>
                <td class="px-4 py-4 text-fg-muted sm:px-6">{{ formatMinutes(entry.work_minutes) }}</td>
                <td class="px-4 py-4 text-fg-muted sm:px-6">{{ formatMinutes(entry.lunch_minutes) }}</td>
                <td class="px-4 py-4 text-fg-muted sm:px-6">{{ formatMinutes(entry.total_minutes) }}</td>
                <td class="px-4 py-4 sm:px-6">
                  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusBadge(entry)">
                    {{ entry.is_on_lunch ? 'On lunch' : entry.is_working ? 'Working' : 'Stopped' }}
                  </span>
                </td>
                <td class="px-4 py-4 sm:px-6">
                  <button
                    type="button"
                    class="rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-indigo-950"
                    :disabled="entry.is_working || entry.is_on_lunch || !entry.id"
                    :title="entry.is_working || entry.is_on_lunch ? 'Stop the running timer first' : 'Edit entry'"
                    @click="openEdit(entry)"
                  >
                    Edit
                  </button>
                </td>
              </tr>
              <tr v-if="!entries.length">
                <td colspan="6" class="px-4 py-10 text-center text-sm text-fg-subtle sm:px-6">
                  No time entries yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sticky mobile clock controls -->
      <div
        class="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 p-3 backdrop-blur sm:hidden"
        style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
      >
        <div class="mx-auto flex max-w-lg gap-2">
          <button
            v-if="primaryAction"
            type="button"
            class="flex min-h-12 flex-1 items-center justify-center rounded-xl px-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            :class="primaryAction.class"
            :disabled="isMutating"
            @click="runAction(primaryAction.action)"
          >
            {{ isMutating ? 'Updating…' : primaryAction.label }}
          </button>
          <button
            v-if="secondaryAction"
            type="button"
            class="flex min-h-12 flex-1 items-center justify-center rounded-xl px-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            :class="secondaryAction.class"
            :disabled="isMutating"
            @click="runAction(secondaryAction.action)"
          >
            {{ secondaryAction.label }}
          </button>
        </div>
      </div>

      <TimeEntryFormModal
        :open="showModal"
        :entry="editingEntry"
        @close="closeModal"
        @saved="onSaved"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AdminTimeEntry, TimeEntry, TimeSegment } from '~/types/timeTracking'
import { collectDateKeys } from '~/utils/dates'
import { filterInputClass, filterLabelClass } from '~/utils/ui'
import { toastErrorMessage } from '~/composables/useToast'

type TimerAction = 'startWork' | 'stopWork' | 'startLunch' | 'stopLunch'

const { isAdmin, isEmployee, profile, fetchProfile } = useProfile()
const timeTracking = useTimeTracking()
const toast = useToast()

await fetchProfile()

if (profile.value && !isAdmin.value && !isEmployee.value) {
  await navigateTo('/')
}

const filterDate = ref('')
const dateSortOrder = ref('desc')
const filterEmployeeId = ref('')
const dateSortOptions = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

const { data: adminData, status: adminStatus, refresh: refreshAdmin } = await useAuthenticatedAsyncData<AdminTimeEntry[]>(
  'time-tracking-admin-list',
  async () => {
    if (!isAdmin.value) return []
    return timeTracking.listAdmin({ limit: 120 })
  },
  { default: () => [], watch: [isAdmin] },
)

const adminLoading = computed(() => adminStatus.value !== 'success' && adminStatus.value !== 'error')

const adminEntries = computed(() => adminData.value || [])

const employeeFilterOptions = computed(() => {
  const seen = new Map<string, string>()
  for (const entry of adminEntries.value) {
    if (entry.user_id && entry.employee_name) {
      seen.set(entry.user_id, entry.employee_name)
    }
  }
  return [
    { value: '', label: 'All employees' },
    ...[...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ]
})

const markedDates = computed(() => collectDateKeys(adminEntries.value.map((e) => e.work_date)))

const hasAdminFilters = computed(() => Boolean(filterDate.value || filterEmployeeId.value))

const displayedAdminEntries = computed(() => {
  let items = [...adminEntries.value]
  if (filterDate.value) {
    items = items.filter((entry) => entry.work_date?.slice(0, 10) === filterDate.value)
  }
  if (filterEmployeeId.value) {
    items = items.filter((entry) => entry.user_id === filterEmployeeId.value)
  }
  items.sort((a, b) => {
    const aKey = a.work_date?.slice(0, 10) || ''
    const bKey = b.work_date?.slice(0, 10) || ''
    return dateSortOrder.value === 'asc' ? aKey.localeCompare(bKey) : bKey.localeCompare(aKey)
  })
  return items
})

const adminEmptyMessage = computed(() => {
  if (hasAdminFilters.value) return 'No time entries match the selected filters.'
  return 'No time entries yet.'
})

const { data: todayData, refresh: refreshToday } = await useAuthenticatedAsyncData<TimeEntry | null>(
  'time-tracking-today',
  async () => {
    if (!isEmployee.value) return null
    return timeTracking.today()
  },
  { default: () => null, watch: [isEmployee] },
)

const { data: listData, refresh: refreshList, pending } = await useAuthenticatedAsyncData<TimeEntry[]>(
  'time-tracking-list',
  async () => {
    if (!isEmployee.value) return []
    return timeTracking.list({ limit: 45 })
  },
  { default: () => [], watch: [isEmployee] },
)

const nowMs = ref(Date.now())
const isMutating = ref(false)
const showModal = ref(false)
const editingEntry = ref<TimeEntry | null>(null)

const todayEntry = computed(() => todayData.value)
const entries = computed(() => listData.value || [])
const isWorking = computed(() => Boolean(todayEntry.value?.is_working))
const isOnLunch = computed(() => Boolean(todayEntry.value?.is_on_lunch))

const activeWorkSegment = computed(() => runningSegment(todayEntry.value?.work_segments || []))
const activeLunchSegment = computed(() => runningSegment(todayEntry.value?.lunch_segments || []))

const todayTotals = computed(() => {
  const baseWork = Number(todayEntry.value?.work_minutes) || 0
  const baseLunch = Number(todayEntry.value?.lunch_minutes) || 0

  const liveWork = activeWorkSegment.value
    ? Math.max(0, Math.floor((nowMs.value - new Date(activeWorkSegment.value.start).getTime()) / 60000))
    : 0
  const liveLunch = activeLunchSegment.value
    ? Math.max(0, Math.floor((nowMs.value - new Date(activeLunchSegment.value.start).getTime()) / 60000))
    : 0

  const work = baseWork + liveWork
  const lunch = baseLunch + liveLunch
  return {
    work,
    lunch,
    total: work + lunch,
  }
})

const activeClockDisplay = computed(() => {
  if (activeLunchSegment.value) return formatDurationFrom(activeLunchSegment.value.start)
  if (activeWorkSegment.value) return formatDurationFrom(activeWorkSegment.value.start)
  return '00:00:00'
})

const liveStatusText = computed(() => {
  if (isOnLunch.value) return 'On lunch'
  if (isWorking.value) return 'Working'
  return 'Idle'
})

const liveStatusBadgeClass = computed(() => {
  if (isOnLunch.value) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
  if (isWorking.value) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
  return 'bg-elevated text-fg-muted'
})

const statusLabel = computed(() => {
  if (isOnLunch.value) return 'Lunch timer is currently running.'
  if (isWorking.value) return 'Work timer is currently running.'
  if (pending.value) return 'Loading today entry...'
  return 'Start work when your day begins.'
})

const primaryAction = computed(() => {
  if (isOnLunch.value) {
    return {
      action: 'stopLunch' as TimerAction,
      label: 'Stop lunch',
      class: 'border border-border bg-surface text-fg hover:bg-elevated',
    }
  }
  if (isWorking.value) {
    return {
      action: 'stopWork' as TimerAction,
      label: 'Stop work',
      class: 'bg-indigo-600 text-white hover:bg-indigo-700',
    }
  }
  return {
    action: 'startWork' as TimerAction,
    label: 'Start work',
    class: 'bg-indigo-600 text-white hover:bg-indigo-700',
  }
})

const secondaryAction = computed(() => {
  if (isOnLunch.value) return null
  if (isWorking.value) {
    return {
      action: 'startLunch' as TimerAction,
      label: 'Start lunch',
      class:
        'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    }
  }
  return null
})

function runningSegment(segments: TimeSegment[]) {
  return segments.find((segment) => segment.start && !segment.end) || null
}

function formatDurationFrom(start: string) {
  const delta = Math.max(0, nowMs.value - new Date(start).getTime())
  const total = Math.floor(delta / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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

function formatDay(value?: string | null) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusBadge(entry: TimeEntry) {
  if (entry.is_on_lunch) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
  if (entry.is_working) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
  return 'bg-elevated text-fg-muted'
}

function openAdd() {
  editingEntry.value = null
  showModal.value = true
}

function openEdit(entry: TimeEntry) {
  if (!entry.id || entry.is_working || entry.is_on_lunch) return
  editingEntry.value = entry
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingEntry.value = null
}

async function onSaved() {
  await Promise.all([refreshToday(), refreshList()])
}

async function runAction(action: TimerAction) {
  if (isMutating.value) return
  isMutating.value = true
  try {
    if (action === 'startWork') await timeTracking.startWork()
    if (action === 'stopWork') await timeTracking.stopWork()
    if (action === 'startLunch') await timeTracking.startLunch()
    if (action === 'stopLunch') await timeTracking.stopLunch()

    await Promise.all([refreshToday(), refreshList()])
  } catch (error) {
    toast.error(toastErrorMessage(error, 'Failed to update timer.'))
  } finally {
    isMutating.value = false
  }
}

async function refreshOnVisible() {
  if (document.visibilityState !== 'visible') return
  nowMs.value = Date.now()
  if (isEmployee.value) {
    await Promise.all([refreshToday(), refreshList()])
  } else if (isAdmin.value) {
    await refreshAdmin()
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
  if (import.meta.client) {
    document.addEventListener('visibilitychange', refreshOnVisible)
  }
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (import.meta.client) {
    document.removeEventListener('visibilitychange', refreshOnVisible)
  }
})
</script>
