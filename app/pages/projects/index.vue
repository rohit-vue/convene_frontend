<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Projects</h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ isAdmin ? 'View projects across the team.' : 'Create projects, set their status, and keep the details in one place.' }}
        </p>
      </div>
      <button
        v-if="isEmployee"
        class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        @click="openCreate"
      >
        + New Project
      </button>
    </div>

    <!-- Admin table view -->
    <template v-if="isAdmin">
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

      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-6 py-4 font-medium">Project</th>
              <th class="px-6 py-4 font-medium">Client</th>
              <th class="px-6 py-4 font-medium">Employee</th>
              <th class="px-6 py-4 font-medium">Status</th>
              <th class="px-6 py-4 font-medium">Start date</th>
              <th class="px-6 py-4 font-medium">Category</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="p in filteredProjects"
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
                  :class="statusMeta[p.status]?.badge || 'bg-slate-100 text-slate-600'"
                >
                  {{ projectStatusLabel(p.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-600">{{ formatDate(p.start_date) }}</td>
              <td class="px-6 py-4 text-slate-600">{{ jobCategoryLabel(p.job_category) }}</td>
            </tr>
            <tr v-if="projects && filteredProjects.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-slate-400">
                {{ activeFilter === 'all' ? 'No projects yet.' : 'No projects in this status.' }}
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
            <span class="shrink-0 rounded-full px-3 py-1 text-xs font-medium" :class="statusMeta[p.status].badge">
              {{ statusMeta[p.status].label }}
            </span>
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

          <div class="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4" @click.stop>
            <button
              class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
              @click="openEdit(p)"
            >
              Edit
            </button>
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

      <ProjectFormModal :open="showModal" :project="editing" @close="closeModal" @saved="onSaved" />
    </template>
  </div>
</template>

<script setup>
const { isAdmin, isEmployee, fetchProfile } = useProfile()
const { list } = useProjects()

await fetchProfile()

if (!isAdmin.value && !isEmployee.value) {
  await navigateTo('/')
}

const showModal = ref(false)
const editing = ref(null)
const activeFilter = ref('all')

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
    navigateTo(`/employees/${p.assigned_to}/projects/${p.id}`)
  } else if (!isAdmin.value) {
    navigateTo(`/projects/${p.id}`)
  }
}

function openCreate() {
  editing.value = null
  showModal.value = true
}

function openEdit(project) {
  editing.value = project
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
}

async function onSaved() {
  closeModal()
  await refresh()
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
