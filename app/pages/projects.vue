<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Projects</h1>
        <p class="mt-1 text-sm text-slate-500">Create projects, set their status, and keep the details in one place.</p>
      </div>
      <button
        class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        @click="openCreate"
      >
        + New Project
      </button>
    </div>

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
        class="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
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
          {{ p.description || 'No details added yet.' }}
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span class="rounded-full px-2.5 py-1 font-medium" :class="priorityMeta[p.priority].badge">
            {{ priorityMeta[p.priority].label }} priority
          </span>
          <span v-if="p.due_date" class="inline-flex items-center gap-1 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            Due {{ formatDate(p.due_date) }}
          </span>
        </div>

        <div class="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
          <select
            :value="p.status"
            class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            :disabled="busyId === p.id"
            @change="updateStatus(p, $event.target.value)"
          >
            <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
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
  </div>
</template>

<script setup>
const { apiFetch } = useApi()

const showModal = ref(false)
const editing = ref(null)
const activeFilter = ref('all')
const busyId = ref(null)

const { data: projects, refresh } = await useAsyncData(
  'projects',
  () => apiFetch('/api/projects'),
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

const priorityMeta = {
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-500' },
  medium: { label: 'Medium', badge: 'bg-violet-50 text-violet-700' },
  high: { label: 'High', badge: 'bg-red-50 text-red-600' },
}

const filters = [
  { value: 'all', label: 'All' },
  ...statuses,
]

const filteredProjects = computed(() => {
  const list = projects.value || []
  if (activeFilter.value === 'all') return list
  return list.filter((p) => p.status === activeFilter.value)
})

function countFor(value) {
  const list = projects.value || []
  const n = value === 'all' ? list.length : list.filter((p) => p.status === value).length
  return ` (${n})`
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

async function updateStatus(project, status) {
  if (status === project.status) return
  busyId.value = project.id
  try {
    await apiFetch(`/api/projects/${project.id}`, { method: 'PATCH', body: { status } })
  } finally {
    busyId.value = null
    await refresh()
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
