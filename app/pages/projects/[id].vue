<template>
  <div>
    <NuxtLink to="/projects" class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition hover:text-fg">
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
        <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h1 class="text-xl font-bold tracking-tight sm:text-2xl">{{ form.name || 'Untitled project' }}</h1>
              <p class="mt-1 text-sm text-fg-muted">{{ form.client_name || 'No client set' }}</p>
            </div>
            <span class="shrink-0 rounded-full px-3 py-1 text-xs font-medium" :class="statusMeta[project.status]?.badge">
              {{ statusMeta[project.status]?.label }}
            </span>
          </div>

          <div v-if="canEditProject" class="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              :disabled="deleting || loading"
              class="rounded-xl border border-red-200 bg-surface px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
              @click="openDeleteModal"
            >
              {{ deleting ? 'Deleting…' : 'Delete project' }}
            </button>
            <button
              type="submit"
              :disabled="loading || deleting"
              class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {{ loading ? 'Saving…' : 'Save changes' }}
            </button>
          </div>

        </div>

        <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Overview</h2>
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
              <DatePicker
                v-model="form.start_date"
                :disabled="!canEditProject"
                placeholder="Select date"
                :input-class="inputClass"
                full-width
              />
            </div>
            <div class="sm:col-span-3">
              <label :class="labelClass">Job description</label>
              <textarea v-model="form.job_description" :disabled="!canEditProject" rows="5" placeholder="Role / scope of work…" :class="inputClass" />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Upwork</h2>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label :class="labelClass">Upwork account</label>
              <AppSelect
                v-model="form.upwork_account"
                :options="projectUpworkAccountOptions"
                placeholder="Select…"
                :input-class="inputClass"
                :disabled="!canEditProject"
              />
            </div>
            <div>
              <label :class="labelClass">Upwork link</label>
              <input
                v-model="form.link_url"
                :disabled="!canEditProject || isInhouseProject"
                type="url"
                placeholder="https://www.upwork.com/…"
                :class="inputClass"
              />
            </div>
            <div>
              <label :class="labelClass">Job type</label>
              <AppSelect
                v-model="form.job_type"
                :options="jobTypeOptions"
                placeholder="Select…"
                :input-class="inputClass"
                :disabled="!canEditProject || isInhouseProject"
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
          <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
            <label :class="labelClass">Requirements</label>
            <textarea v-model="form.requirements" :disabled="!canEditProject" rows="5" placeholder="Client requirements, deliverables…" :class="inputClass" />
          </div>

          <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
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
          :start-date="form.start_date || project.start_date || ''"
          :read-only="!canEditProject"
          @updated="onStatusUpdated"
        />

        <ProjectDailyLogsSection
          :project-id="route.params.id"
          :job-type="form.job_type"
          :can-edit-logs="canEditLogs"
          :can-manage-all-logs="canEditProject"
        />
      </form>
    </div>

    <div v-else class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <ContentLoader variant="table" :rows="8" :columns="4" />
    </div>

    <ConfirmDeleteModal
      :open="showDeleteModal"
      title="Delete this project?"
      message="This action cannot be undone. All project data will be permanently removed."
      confirm-label="Delete project"
      :loading="deleting"
      :error="deleteError"
      @close="closeDeleteModal"
      @confirm="confirmDeleteProject"
    >
      <div v-if="project" class="rounded-xl border border-border bg-elevated px-4 py-3 text-sm">
        <p class="font-medium text-fg">{{ form.name || project.name }}</p>
        <p v-if="form.client_name || project.client_name" class="mt-1 text-fg-muted">
          {{ form.client_name || project.client_name }}
        </p>
      </div>
    </ConfirmDeleteModal>
  </div>
</template>

<script setup lang="ts">
import { formInputClass as inputClass } from '~/utils/ui'
definePageMeta({ middleware: 'employee' })

const route = useRoute()
const router = useRouter()
const { getById, update, remove } = useProjects()

const { data: project, error, refresh } = await useAsyncData(
  `project-${route.params.id}`,
  () => getById(route.params.id as string),
  { server: false },
)

const labelClass = 'mb-1 block text-sm font-medium text-fg'

const statusMeta = {
  planning: { label: 'Planning', badge: 'bg-elevated text-fg-muted' },
  active: { label: 'Active', badge: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' },
  on_hold: { label: 'On hold', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' },
}

const loading = ref(false)
const deleting = ref(false)
const showDeleteModal = ref(false)
const deleteError = ref('')
const toast = useToast()

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

const isInhouseProject = computed(() => isInhouseUpworkAccount(form.upwork_account))

function fill(p) {
  const next = blankForm()
  if (p) {
    for (const key of Object.keys(next)) {
      if (key === 'hourly_rate') {
        next.hourly_rate = p.hourly_rate != null ? String(p.hourly_rate) : ''
      } else if (key === 'start_date' && p[key]) {
        next.start_date = String(p[key]).slice(0, 10)
      } else if (p[key] !== null && p[key] !== undefined) {
        next[key] = p[key]
      }
    }
    if (!next.job_description && p.description) next.job_description = p.description
  }
  Object.assign(form, next)
}

watch(project, (p) => { if (p) fill(p) }, { immediate: true })

watch(
  () => form.upwork_account,
  (value) => {
    if (isInhouseUpworkAccount(value)) {
      form.job_type = ''
      form.link_url = ''
      form.hourly_rate = ''
    }
  },
)

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
    toast.error('Project name is required.')
    return
  }
  loading.value = true
  try {
    const { hourly_rate: _hourlyRate, ...rest } = form
    const payload = {
      ...rest,
      ...(isInhouseProject.value
        ? { job_type: '', link_url: '', hourly_rate: '' }
        : form.job_type === 'hourly'
          ? {
              hourly_rate: form.hourly_rate
                ? sanitizeBudgetInput(form.hourly_rate)
                : '',
            }
          : {}),
    }
    await update(route.params.id as string, payload)
    toast.success('Changes saved.')
    await refresh()
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to save changes.'))
  } finally {
    loading.value = false
  }
}

function openDeleteModal() {
  if (!canEditProject.value) return
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
  deleteError.value = ''
}

async function confirmDeleteProject() {
  if (!canEditProject.value || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await remove(route.params.id as string)
    showDeleteModal.value = false
    await router.push('/projects')
  } catch (e) {
    deleteError.value = toastErrorMessage(e, 'Failed to delete project.')
    toast.error(deleteError.value)
  } finally {
    deleting.value = false
  }
}
</script>
