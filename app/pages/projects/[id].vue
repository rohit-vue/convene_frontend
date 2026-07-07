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
      <div
        v-if="isShared"
        class="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800"
      >
        <span class="font-medium">Shared with you</span>
        <span v-if="!canEditLogs"> · view only (you can see project details and logs, but cannot add or edit logs)</span>
        <span v-else> · you can view project details and add your own daily logs</span>
      </div>

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
                v-if="canEditProject"
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
              <label :class="labelClass">Project name <span v-if="canEditProject" class="text-red-500">*</span></label>
              <input v-model="form.name" :required="canEditProject" :disabled="!canEditProject" type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Client name</label>
              <input v-model="form.client_name" :disabled="!canEditProject" type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Start date</label>
              <input v-model="form.start_date" :disabled="!canEditProject" type="date" :class="inputClass" />
            </div>
            <div class="sm:col-span-3">
              <label :class="labelClass">Job description</label>
              <textarea v-model="form.job_description" :disabled="!canEditProject" rows="5" placeholder="Role / scope of work…" :class="inputClass" />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Upwork</h2>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label :class="labelClass">Upwork account</label>
              <AppSelect
                v-model="form.upwork_account"
                :options="upworkAccountOptions"
                placeholder="Select…"
                :input-class="inputClass"
                :disabled="!canEditProject"
              />
            </div>
            <div>
              <label :class="labelClass">Upwork link</label>
              <input v-model="form.link_url" :disabled="!canEditProject" type="url" placeholder="https://www.upwork.com/…" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Job type</label>
              <AppSelect
                v-model="form.job_type"
                :options="jobTypeOptions"
                placeholder="Select…"
                :input-class="inputClass"
                :disabled="!canEditProject"
              />
            </div>
            <div>
              <label :class="labelClass">Job category</label>
              <AppSelect
                v-model="form.job_category"
                :options="jobCategoryOptions"
                placeholder="Select…"
                :input-class="inputClass"
                :disabled="!canEditProject"
              />
            </div>
            <div v-if="form.job_type === 'hourly'">
              <label :class="labelClass">Hourly rate</label>
              <BudgetInput v-if="canEditProject" v-model="form.hourly_rate" :input-class="inputClass" placeholder="50" />
              <input v-else :value="form.hourly_rate" disabled type="text" :class="inputClass" />
            </div>
          </div>
        </div>

        <ProjectMilestoneCostSection
          v-if="form.job_type === 'contract'"
          :project-id="route.params.id as string"
          :project-status="project.status"
          :read-only="!canEditProject"
          @updated="onPricingUpdated"
        />

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <label :class="labelClass">Requirements</label>
            <textarea v-model="form.requirements" :disabled="!canEditProject" rows="5" placeholder="Client requirements, deliverables…" :class="inputClass" />
          </div>

          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <label :class="labelClass">Notes</label>
            <textarea v-model="form.notes" :disabled="!canEditProject" rows="5" placeholder="Internal notes, context, follow-ups…" :class="inputClass" />
          </div>
        </div>

        <ProjectShareSection
          v-if="isOwner"
          :project-id="route.params.id as string"
        />

        <ProjectStatusSection
          :project-id="route.params.id"
          :current-status="project.status"
          :read-only="!canEditProject"
          @updated="onStatusUpdated"
        />

        <ProjectDailyLogsSection
          :project-id="route.params.id"
          :job-type="form.job_type"
          :can-edit-logs="canEditLogs"
        />
      </form>
    </div>

    <div v-else class="text-sm text-slate-400">Loading…</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'employee' })

const route = useRoute()
const { getById, update } = useProjects()

const { data: project, error, refresh } = await useAsyncData(
  `project-${route.params.id}`,
  () => getById(route.params.id as string),
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
    hourly_rate: '',
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
      if (key === 'hourly_rate') {
        next.hourly_rate = p.hourly_rate != null ? String(p.hourly_rate) : ''
      } else if (p[key] !== null && p[key] !== undefined) {
        next[key] = p[key]
      }
    }
    if (!next.job_description && p.description) next.job_description = p.description
  }
  Object.assign(form, next)
}

watch(project, (p) => { if (p) fill(p) }, { immediate: true })

const isOwner = computed(() => project.value?.access?.role === 'owner')
const isShared = computed(() => Boolean(project.value?.access?.is_shared))
const canEditProject = computed(() => project.value?.access?.can_edit_project ?? true)
const canEditLogs = computed(() => project.value?.access?.can_edit_logs ?? true)

async function onStatusUpdated() {
  await refresh()
}

async function onPricingUpdated() {
  await refresh()
}

async function save() {
  if (!canEditProject.value) return
  if (!form.name.trim()) {
    saveError.value = 'Project name is required.'
    saveOk.value = false
    return
  }
  loading.value = true
  saveError.value = ''
  saveOk.value = false
  try {
    const { hourly_rate: _hourlyRate, ...rest } = form
    const payload = {
      ...rest,
      ...(form.job_type === 'hourly'
        ? {
            hourly_rate: form.hourly_rate
              ? sanitizeBudgetInput(form.hourly_rate)
              : '',
          }
        : {}),
    }
    await update(route.params.id as string, payload)
    saveOk.value = true
    await refresh()
  } catch (e) {
    saveError.value = e?.data?.error || e?.message || 'Failed to save changes.'
  } finally {
    loading.value = false
  }
}
</script>
