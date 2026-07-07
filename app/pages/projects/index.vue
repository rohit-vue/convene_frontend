<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Projects</h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ isAdmin ? 'View projects across the team.' : 'Create projects, set their status, and keep the details in one place.' }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="isAdmin"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          @click="showAssignModal = true"
        >
          + Assign Project
        </button>
        <button
          v-if="isAdmin"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="exporting"
          @click="exportAllProjects"
        >
          {{ exporting ? 'Exporting…' : 'Export' }}
        </button>
        <button
          v-else-if="isEmployee"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          @click="openCreate"
        >
          + New Project
        </button>
      </div>
    </div>

    <!-- Admin table view -->
    <template v-if="isAdmin">
      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
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
            <div>
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

        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-6 py-4 font-medium">Project</th>
              <th class="px-6 py-4 font-medium">Client</th>
              <th class="px-6 py-4 font-medium">Employee</th>
              <th class="px-6 py-4 font-medium">Assignment</th>
              <th class="px-6 py-4 font-medium">Status</th>
              <th class="px-6 py-4 font-medium">Start date</th>
              <th class="px-6 py-4 font-medium">Project type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="p in adminFilteredProjects"
              :key="p.id"
              class="cursor-pointer transition hover:bg-slate-50"
              @click="openProject(p)"
            >
              <td class="px-6 py-4 font-medium text-slate-800">{{ p.name }}</td>
              <td class="px-6 py-4 text-slate-600">{{ p.client_name || '—' }}</td>
              <td class="px-6 py-4 text-slate-600">{{ p.assignee_name || '—' }}</td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="assignmentBadgeClass(p.assignment_status)"
                >
                  {{ assignmentStatusLabel(p.assignment_status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="statusMeta[p.status]?.badge || 'bg-slate-100 text-slate-600'"
                >
                  {{ projectStatusLabel(p.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-600">{{ formatDate(p.start_date) }}</td>
              <td class="px-6 py-4 text-slate-600">{{ jobTypeLabel(p.job_type) }}</td>
            </tr>
            <tr v-if="projects && adminFilteredProjects.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-sm text-slate-400">
                {{ adminEmptyMessage }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Employee card view -->
    <template v-else>
      <div v-if="projects && projects.length" class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          class="rounded-full px-3 py-1.5 text-xs font-medium transition"
          :class="activeFilter === f.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span :class="activeFilter === f.value ? 'text-white/70' : 'text-slate-400'">{{ countFor(f.value) }}</span>
        </button>
      </div>

      <div v-if="filteredProjects.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="p in filteredProjects"
          :key="p.id"
          class="flex cursor-pointer flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-indigo-100 hover:shadow-md"
          @click="openProject(p)"
        >
            <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="truncate font-semibold text-slate-800">{{ p.name }}</h3>
              <p v-if="p.client_name" class="mt-0.5 truncate text-sm text-slate-500">{{ p.client_name }}</p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-1.5">
              <span class="rounded-full px-3 py-1 text-xs font-medium" :class="statusMeta[p.status].badge">
                {{ statusMeta[p.status].label }}
              </span>
              <span
                v-if="p.is_shared"
                class="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700"
              >
                {{ p.can_edit_logs ? 'Shared' : 'Shared · view only' }}
              </span>
            </div>
          </div>

          <p class="mt-3 line-clamp-3 flex-1 text-sm text-slate-600">
            {{ p.job_description || p.description || 'No details added yet.' }}
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span v-if="p.job_type" class="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              {{ jobTypeLabel(p.job_type) }}
            </span>
            <span v-if="p.job_category" class="rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700">
              {{ jobCategoryLabel(p.job_category) }}
            </span>
            <span v-if="p.due_date" class="inline-flex items-center gap-1 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
              Due {{ formatDate(p.due_date) }}
            </span>
          </div>
        </div>
      </div>

      <div v-else-if="projects" class="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <h3 class="mt-4 font-semibold text-slate-800">{{ activeFilter === 'all' ? 'No projects yet' : 'No projects in this status' }}</h3>
        <p class="mt-1 text-sm text-slate-500">
          {{ activeFilter === 'all' ? 'Create your first project to start tracking status and details.' : 'Try a different filter or create a new project.' }}
        </p>
        <button
          class="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          @click="openCreate"
        >
          + New Project
        </button>
      </div>

      <ProjectFormModal :open="showModal" @close="closeModal" @saved="onSaved" />
    </template>

    <AdminAssignProjectModal
      v-if="isAdmin"
      :open="showAssignModal"
      @close="showAssignModal = false"
      @saved="onAssignSaved"
    />
  </div>
</template>

<script setup>
import { downloadProjectsExcel } from '~/utils/exportProjectsExcel'

const { isAdmin, isEmployee, fetchProfile } = useProfile()
const { list, exportAll } = useProjects()

await fetchProfile()

if (!isAdmin.value && !isEmployee.value) {
  await navigateTo('/')
}

const showModal = ref(false)
const showAssignModal = ref(false)
const activeFilter = ref('all')
const exporting = ref(false)

const filterDate = ref('')
const dateSortOrder = ref('desc')
const filterEmployeeId = ref('')
const filterStatus = ref('')
const filterProjectType = ref('')

const filterLabelClass = 'mb-1 block text-xs font-medium text-slate-500'
const filterInputClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

const dateSortOptions = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

const statusFilterOptions = computed(() => [
  { value: '', label: 'All statuses' },
  ...projectStatusOptions,
])

const projectTypeFilterOptions = computed(() => [
  { value: '', label: 'All types' },
  ...jobTypeOptions,
])

const { data: projects, refresh } = await useAsyncData(
  'projects',
  () => list(),
  { server: false, default: () => [] },
)

const statuses = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusMeta = {
  planning: { label: 'Planning', badge: 'bg-slate-100 text-slate-600' },
  active: { label: 'Active', badge: 'bg-indigo-50 text-indigo-700' },
  on_hold: { label: 'On hold', badge: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600' },
}

const filters = [
  { value: 'all', label: 'All' },
  ...statuses,
]

const employeeOptions = computed(() => {
  const seen = new Map()
  for (const p of projects.value || []) {
    if (p.assigned_to && p.assignee_name) {
      seen.set(p.assigned_to, p.assignee_name)
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

const markedDates = computed(() => collectDateKeys((projects.value || []).map((p) => p.start_date)))

const hasAdminFilters = computed(() =>
  Boolean(filterDate.value || filterEmployeeId.value || filterStatus.value || filterProjectType.value),
)

const adminFilteredProjects = computed(() => {
  let items = [...(projects.value || [])]

  if (filterDate.value) {
    items = items.filter((p) => p.start_date?.slice(0, 10) === filterDate.value)
  }
  if (filterEmployeeId.value) {
    items = items.filter((p) => p.assigned_to === filterEmployeeId.value)
  }
  if (filterStatus.value) {
    items = items.filter((p) => p.status === filterStatus.value)
  }
  if (filterProjectType.value) {
    items = items.filter((p) => p.job_type === filterProjectType.value)
  }

  items.sort((a, b) => {
    const aTime = a.start_date ? new Date(a.start_date).getTime() : 0
    const bTime = b.start_date ? new Date(b.start_date).getTime() : 0
    return dateSortOrder.value === 'asc' ? aTime - bTime : bTime - aTime
  })

  return items
})

const adminEmptyMessage = computed(() => {
  if (hasAdminFilters.value) return 'No projects match the selected filters.'
  return 'No projects yet.'
})

const filteredProjects = computed(() => {
  const items = projects.value || []
  if (activeFilter.value === 'all') return items
  return items.filter((p) => p.status === activeFilter.value)
})

function countFor(value) {
  const items = projects.value || []
  const n = value === 'all' ? items.length : items.filter((p) => p.status === value).length
  return ` (${n})`
}

function openProject(p) {
  if (isAdmin.value && p.assigned_to) {
    navigateTo(`/employees/${p.assigned_to}/projects/${p.id}?from=projects`)
  } else if (!isAdmin.value) {
    navigateTo(`/projects/${p.id}`)
  }
}

function openCreate() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function onSaved() {
  closeModal()
  await refresh()
}

async function onAssignSaved() {
  showAssignModal.value = false
  await refresh()
}

function assignmentBadgeClass(status) {
  if (status === 'pending') return 'bg-amber-50 text-amber-700'
  if (status === 'accepted') return 'bg-emerald-50 text-emerald-700'
  if (status === 'declined') return 'bg-red-50 text-red-600'
  return 'bg-slate-100 text-slate-600'
}

async function exportAllProjects() {
  if (exporting.value) return
  exporting.value = true
  try {
    const rows = await exportAll()
    downloadProjectsExcel(rows)
  } catch (err) {
    console.error('Failed to export projects:', err)
  } finally {
    exporting.value = false
  }
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
