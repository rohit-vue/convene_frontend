<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl font-bold tracking-tight sm:text-2xl">Daily logs</h1>
        <p class="mt-1 text-sm text-fg-muted">
          Review logs submitted by employees across all projects.
        </p>
      </div>
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
          <div class="w-full sm:w-auto">
            <label :class="filterLabelClass">Project type</label>
            <AppSelect
              v-model="filterProjectType"
              :options="projectTypeFilterOptions"
              placeholder="All types"
              :input-class="filterInputClass"
              :full-width="false"
            />
          </div>
        </div>
      </div>

      <ContentLoader v-if="isLoading" variant="table" :rows="6" :columns="6" />

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[800px] text-sm">
          <thead class="bg-elevated text-left text-xs uppercase tracking-wide text-fg-muted">
            <tr>
              <th class="px-4 py-4 font-medium sm:px-6">Date</th>
              <th class="px-4 py-4 font-medium sm:px-6">Employee</th>
              <th class="px-4 py-4 font-medium sm:px-6">Project</th>
              <th class="px-4 py-4 font-medium sm:px-6">Client</th>
              <th class="px-4 py-4 font-medium sm:px-6">Tasks done</th>
              <th class="px-4 py-4 font-medium sm:px-6">Tracker</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="entry in displayedLogs"
              :key="entry.id"
              class="cursor-pointer transition hover:bg-elevated"
              @click="openLog(entry)"
            >
              <td class="whitespace-nowrap px-4 py-4 text-fg-muted sm:px-6">
                {{ formatLogDate(entry.log_date) }}
              </td>
              <td class="px-4 py-4 text-fg-muted sm:px-6">{{ entry.logged_by_name || '—' }}</td>
              <td class="px-4 py-4 font-medium text-fg sm:px-6">{{ entry.project_name || '—' }}</td>
              <td class="px-4 py-4 text-fg-muted sm:px-6">{{ entry.client_name || '—' }}</td>
              <td class="max-w-xs px-4 py-4 text-fg-muted sm:px-6">
                <p class="line-clamp-2 whitespace-pre-wrap">{{ entry.tasks_done || '—' }}</p>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-fg-muted sm:px-6">
                {{ entry.job_type === 'hourly' ? formatTrackerMinutes(entry.tracker_minutes) : '—' }}
              </td>
            </tr>
            <tr v-if="!displayedLogs.length">
              <td colspan="6" class="px-4 py-12 text-center text-sm text-fg-subtle sm:px-6">
                {{ emptyMessage }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminDailyLog } from '~/types/projects'
import { collectDateKeys } from '~/utils/dates'
import { jobTypeOptions } from '~/utils/projects'
import { filterInputClass, filterLabelClass } from '~/utils/ui'

definePageMeta({ middleware: 'admin' })

const { listAllDailyLogs } = useProjects()

const filterDate = ref('')
const dateSortOrder = ref('desc')
const filterEmployeeId = ref('')
const filterProjectType = ref('')

const dateSortOptions = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

const projectTypeFilterOptions = computed(() => [
  { value: '', label: 'All types' },
  ...jobTypeOptions,
])

const { data: logs, status } = await useAsyncData(
  'admin-daily-logs',
  () => listAllDailyLogs(),
  { server: false, default: () => [] },
)

const isLoading = computed(() => status.value !== 'success' && status.value !== 'error')

const employeeOptions = computed(() => {
  const seen = new Map<string, string>()
  for (const entry of logs.value || []) {
    if (entry.created_by && entry.logged_by_name) {
      seen.set(entry.created_by, entry.logged_by_name)
    }
  }
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const employeeFilterOptions = computed(() => [
  { value: '', label: 'All employees' },
  ...employeeOptions.value,
])

const markedDates = computed(() => collectDateKeys((logs.value || []).map((entry) => entry.log_date)))

const hasActiveFilters = computed(() =>
  Boolean(filterDate.value || filterEmployeeId.value || filterProjectType.value),
)

const displayedLogs = computed(() => {
  let items = [...(logs.value || [])]

  if (filterDate.value) {
    items = items.filter((entry) => entry.log_date?.slice(0, 10) === filterDate.value)
  }
  if (filterEmployeeId.value) {
    items = items.filter((entry) => entry.created_by === filterEmployeeId.value)
  }
  if (filterProjectType.value) {
    items = items.filter((entry) => entry.job_type === filterProjectType.value)
  }

  items.sort((a, b) => {
    const aKey = a.log_date?.slice(0, 10) || ''
    const bKey = b.log_date?.slice(0, 10) || ''
    if (aKey !== bKey) {
      return dateSortOrder.value === 'asc' ? aKey.localeCompare(bKey) : bKey.localeCompare(aKey)
    }
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateSortOrder.value === 'asc' ? aTime - bTime : bTime - aTime
  })

  return items
})

const emptyMessage = computed(() => {
  if (hasActiveFilters.value) return 'No daily logs match the selected filters.'
  return 'No daily logs yet.'
})

function openLog(entry: AdminDailyLog) {
  if (entry.assigned_to && entry.project_id) {
    navigateTo(`/employees/${entry.assigned_to}/projects/${entry.project_id}?from=daily-logs`)
    return
  }
  if (entry.created_by && entry.project_id) {
    navigateTo(`/employees/${entry.created_by}/projects/${entry.project_id}?from=daily-logs`)
  }
}

function formatLogDate(value?: string | null) {
  if (!value) return '—'
  const dateKey = value.slice(0, 10)
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return '—'
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTrackerMinutes(minutes?: number | null) {
  const total = Number(minutes) || 0
  if (total <= 0) return '0h'
  const hours = Math.floor(total / 60)
  const mins = total % 60
  if (hours && mins) return `${hours}h ${mins}m`
  if (hours) return `${hours}h`
  return `${mins}m`
}
</script>
