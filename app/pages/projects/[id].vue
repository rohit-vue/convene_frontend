<template>
  <div>
    <NuxtLink to="/projects" class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to projects
    </NuxtLink>

    <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      {{ error.statusCode === 403 ? 'You do not have access to this project.' : 'Project not found.' }}
    </div>

    <div v-else-if="project" class="space-y-6">
      <form class="space-y-6" @submit.prevent="save">
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">{{ form.name || 'Untitled project' }}</h1>
              <p class="mt-1 text-sm text-slate-500">{{ form.client_name || 'No client set' }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="rounded-full px-3 py-1 text-xs font-medium" :class="statusMeta[project.status]?.badge">
                {{ statusMeta[project.status]?.label }}
              </span>
              <button
                type="submit"
                :disabled="loading"
                class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {{ loading ? 'Saving…' : 'Save changes' }}
              </button>
            </div>
          </div>

          <p v-if="saveError" class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ saveError }}</p>
          <p v-else-if="saveOk" class="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Changes saved.</p>
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Overview</h2>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label :class="labelClass">Project name <span class="text-red-500">*</span></label>
              <input v-model="form.name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Client name</label>
              <input v-model="form.client_name" type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Start date</label>
              <input v-model="form.start_date" type="date" :class="inputClass" />
            </div>
            <div class="sm:col-span-3">
              <label :class="labelClass">Job description</label>
              <textarea v-model="form.job_description" rows="5" placeholder="Role / scope of work…" :class="inputClass" />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Upwork</h2>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label :class="labelClass">Upwork account</label>
              <select v-model="form.upwork_account" :class="inputClass">
                <option value="">Select…</option>
                <option v-for="opt in upworkAccountOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Upwork link</label>
              <input v-model="form.link_url" type="url" placeholder="https://www.upwork.com/…" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Job type</label>
              <select v-model="form.job_type" :class="inputClass">
                <option value="">Select…</option>
                <option v-for="opt in jobTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Job category</label>
              <select v-model="form.job_category" :class="inputClass">
                <option value="">Select…</option>
                <option v-for="opt in jobCategoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <label :class="labelClass">Requirements</label>
            <textarea v-model="form.requirements" rows="5" placeholder="Client requirements, deliverables…" :class="inputClass" />
          </div>

          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <label :class="labelClass">Notes</label>
            <textarea v-model="form.notes" rows="5" placeholder="Internal notes, context, follow-ups…" :class="inputClass" />
          </div>
        </div>

        <ProjectStatusSection
          :project-id="route.params.id"
          :current-status="project.status"
          @updated="onStatusUpdated"
        />
      </form>
    </div>

    <div v-else class="text-sm text-slate-400">Loading…</div>
  </div>
</template>

<script setup>
const route = useRoute()
const { apiFetch } = useApi()

const { data: project, error, refresh } = await useAsyncData(
  `project-${route.params.id}`,
  () => apiFetch(`/api/projects/${route.params.id}`),
  { server: false },
)

const labelClass = 'mb-1 block text-sm font-medium text-slate-700'
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

const statusMeta = {
  planning: { label: 'Planning', badge: 'bg-slate-100 text-slate-600' },
  active: { label: 'Active', badge: 'bg-indigo-50 text-indigo-700' },
  on_hold: { label: 'On hold', badge: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600' },
}

const loading = ref(false)
const saveError = ref('')
const saveOk = ref(false)

function blankForm() {
  return {
    name: '',
    client_name: '',
    start_date: '',
    job_category: '',
    job_type: '',
    upwork_account: '',
    link_url: '',
    job_description: '',
    requirements: '',
    notes: '',
  }
}

const form = reactive(blankForm())

function fill(p) {
  const next = blankForm()
  if (p) {
    for (const key of Object.keys(next)) {
      if (p[key] !== null && p[key] !== undefined) next[key] = p[key]
    }
    if (!next.job_description && p.description) next.job_description = p.description
  }
  Object.assign(form, next)
}

watch(project, (p) => { if (p) fill(p) }, { immediate: true })

async function onStatusUpdated() {
  await refresh()
}

async function save() {
  if (!form.name.trim()) {
    saveError.value = 'Project name is required.'
    saveOk.value = false
    return
  }
  loading.value = true
  saveError.value = ''
  saveOk.value = false
  try {
    await apiFetch(`/api/projects/${route.params.id}`, {
      method: 'PATCH',
      body: { ...form },
    })
    saveOk.value = true
    await refresh()
  } catch (e) {
    saveError.value = e?.data?.error || e?.message || 'Failed to save changes.'
  } finally {
    loading.value = false
  }
}
</script>
