<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Meetings</h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ isAdmin ? 'View and assign meetings across the team.' : 'Track and manage all your meetings.' }}
        </p>
      </div>
      <div v-if="isAdmin" class="flex items-center gap-3">
        <button
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="downloading"
          @click="downloadAllMeetings"
        >
          {{ downloading ? 'Exporting…' : 'Export' }}
        </button>
        <button
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          @click="showAssignModal = true"
        >
          + Assign Meeting
        </button>
      </div>
      <button
        v-else
        class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        @click="showModal = true"
      >
        + New Meeting
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div v-if="isAdmin" class="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label :class="filterLabelClass">Date</label>
            <DateFilterPicker v-model="filterDate" :marked-dates="markedDates" :input-class="filterInputClass" />
          </div>
          <div>
            <label :class="filterLabelClass">Sort by date</label>
            <AppSelect
              v-model="dateSortOrder"
              :options="dateSortOptions"
              :input-class="filterInputClass"
              :full-width="false"
            />
          </div>
          <div>
            <label :class="filterLabelClass">Upwork account</label>
            <AppSelect
              v-model="filterUpworkAccount"
              :options="upworkFilterOptions"
              placeholder="All accounts"
              :input-class="filterInputClass"
              :full-width="false"
            />
          </div>
          <div>
            <label :class="filterLabelClass">Employee</label>
            <AppSelect
              v-model="filterEmployeeId"
              :options="employeeFilterOptions"
              placeholder="All employees"
              :input-class="filterInputClass"
              :full-width="false"
            />
          </div>
          <div>
            <label :class="filterLabelClass">Status</label>
            <AppSelect
              v-model="filterStatus"
              :options="statusFilterOptions"
              placeholder="All statuses"
              :input-class="filterInputClass"
              :full-width="false"
            />
          </div>
        </div>
      </div>

      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-6 py-4 font-medium">Project</th>
            <th class="px-6 py-4 font-medium">Client</th>
            <th v-if="isAdmin" class="px-6 py-4 font-medium">Employee</th>
            <th v-if="!isAdmin" class="px-6 py-4 font-medium">Upwork type</th>
            <th class="px-6 py-4 font-medium">Upwork account</th>
            <th class="px-6 py-4 font-medium">Date &amp; time</th>
            <th v-if="isAdmin" class="px-6 py-4 font-medium">Status</th>
            <th v-if="!isAdmin" class="px-6 py-4 font-medium">Outcome</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="m in displayedMeetings"
            :key="m.id"
            class="cursor-pointer transition hover:bg-slate-50"
            @click="openMeeting(m)"
          >
            <td class="px-6 py-4 font-medium text-slate-800">{{ m.project_name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ m.client_name || '—' }}</td>
            <td v-if="isAdmin" class="px-6 py-4 text-slate-600">{{ m.employee_name || '—' }}</td>
            <td v-if="!isAdmin" class="px-6 py-4 text-slate-600">{{ projectTypeLabel(m.project_type) }}</td>
            <td class="px-6 py-4 text-slate-600">{{ upworkAccountLabel(m.upwork_account) }}</td>
            <td class="px-6 py-4 text-slate-600">{{ formatDate(m.meeting_at) }}</td>
            <td v-if="isAdmin" class="px-6 py-4">
              <span
                class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="statusBadgeClass(m.assignment_status)"
              >
                {{ assignmentStatusLabel(m.assignment_status) }}
              </span>
            </td>
            <td v-if="!isAdmin" class="px-6 py-4 text-slate-600">{{ meetingOutcomeLabel(m.meeting_outcome) }}</td>
          </tr>

          <tr v-if="meetings && displayedMeetings.length === 0">
            <td :colspan="isAdmin ? 6 : 6" class="px-6 py-12 text-center text-sm text-slate-400">
              {{ emptyMeetingsMessage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <MeetingFormModal v-if="isEmployee" :open="showModal" @close="showModal = false" @saved="onSaved" />
    <AdminAssignMeetingModal v-if="isAdmin" :open="showAssignModal" @close="showAssignModal = false" @saved="onAssignSaved" />
  </div>
</template>

<script setup>
import { downloadMeetingsExcel } from '~/utils/exportMeetingsExcel'

const { isAdmin, isEmployee, fetchProfile } = useProfile()
const { list, exportAll } = useMeetings()

await fetchProfile()

if (!isAdmin.value && !isEmployee.value) {
  await navigateTo('/')
}

const showModal = ref(false)
const showAssignModal = ref(false)
const downloading = ref(false)

const filterDate = ref('')
const dateSortOrder = ref('desc')
const filterUpworkAccount = ref('')
const filterEmployeeId = ref('')
const filterStatus = ref('')

const filterLabelClass = 'mb-1 block text-xs font-medium text-slate-500'
const filterInputClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

const dateSortOptions = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

const upworkFilterOptions = computed(() => [
  { value: '', label: 'All accounts' },
  ...upworkAccountOptions,
])

const statusFilterOptions = computed(() => [
  { value: '', label: 'All statuses' },
  ...assignmentStatusOptions,
])

const { data: meetings, refresh } = await useAsyncData(
  'meetings',
  () => list(),
  { server: false, default: () => [] },
)

const employeeOptions = computed(() => {
  const seen = new Map()
  for (const m of meetings.value || []) {
    if (m.employee_id && m.employee_name) {
      seen.set(m.employee_id, m.employee_name)
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

const markedDates = computed(() => collectDateKeys((meetings.value || []).map((m) => m.meeting_at)))

const hasActiveFilters = computed(() =>
  Boolean(filterDate.value || filterUpworkAccount.value || filterEmployeeId.value || filterStatus.value),
)

const displayedMeetings = computed(() => {
  const items = meetings.value || []
  if (!isAdmin.value) return items

  let filtered = [...items]

  if (filterDate.value) {
    filtered = filtered.filter((m) => m.meeting_at?.slice(0, 10) === filterDate.value)
  }
  if (filterUpworkAccount.value) {
    filtered = filtered.filter((m) => m.upwork_account === filterUpworkAccount.value)
  }
  if (filterEmployeeId.value) {
    filtered = filtered.filter((m) => m.employee_id === filterEmployeeId.value)
  }
  if (filterStatus.value) {
    filtered = filtered.filter((m) => m.assignment_status === filterStatus.value)
  }

  filtered.sort((a, b) => {
    const aTime = a.meeting_at ? new Date(a.meeting_at).getTime() : 0
    const bTime = b.meeting_at ? new Date(b.meeting_at).getTime() : 0
    return dateSortOrder.value === 'asc' ? aTime - bTime : bTime - aTime
  })

  return filtered
})

const emptyMeetingsMessage = computed(() => {
  if (!isAdmin.value) {
    return 'No meetings yet. Click "+ New Meeting" to add one.'
  }
  if (hasActiveFilters.value) {
    return 'No meetings match the selected filters.'
  }
  return 'No meetings yet. Click "+ Assign Meeting" to add one.'
})

async function onSaved() {
  showModal.value = false
  await refresh()
}

async function onAssignSaved() {
  showAssignModal.value = false
  await refresh()
}

async function downloadAllMeetings() {
  if (downloading.value) return
  downloading.value = true
  try {
    const rows = await exportAll()
    downloadMeetingsExcel(rows)
  } catch (err) {
    console.error('Failed to download meetings:', err)
  } finally {
    downloading.value = false
  }
}

function openMeeting(m) {
  if (isAdmin.value && m.employee_id) {
    navigateTo(`/employees/${m.employee_id}/meetings/${m.id}`)
  } else {
    navigateTo(`/meetings/${m.id}`)
  }
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function statusBadgeClass(status) {
  if (status === 'accepted') return 'bg-emerald-50 text-emerald-700'
  if (status === 'pending') return 'bg-amber-50 text-amber-700'
  if (status === 'declined') return 'bg-red-50 text-red-700'
  return 'bg-slate-100 text-slate-600'
}
</script>
