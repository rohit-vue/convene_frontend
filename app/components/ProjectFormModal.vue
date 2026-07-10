<template>
  <div
    v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-3xl rounded-2xl bg-surface shadow-xl">
      <div class="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 class="text-lg font-semibold text-fg">{{ isEdit ? 'Edit project' : 'New project' }}</h2>
        <button class="grid h-8 w-8 place-items-center rounded-lg text-fg-subtle transition hover:bg-elevated hover:text-fg-muted" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <form class="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5" @submit.prevent="save">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Project name <span class="text-red-500">*</span></label>
            <input v-model="form.name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Upwork account <span class="text-red-500">*</span></label>
            <AppSelect
              v-model="form.upwork_account"
              :options="projectUpworkAccountOptions"
              placeholder="Select…"
              :input-class="inputClass"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">
              Client name
              <span v-if="!isInhouseProject" class="text-red-500">*</span>
            </label>
            <input
              v-model="form.client_name"
              type="text"
              placeholder="e.g. Acme Corp"
              :class="inputClass"
              :disabled="isInhouseProject"
            />
          </div>
          <div v-if="!isEdit">
            <label class="mb-1 block text-sm font-medium text-fg">Status <span class="text-red-500">*</span></label>
            <AppSelect v-model="form.status" :options="projectStatusOptions" :input-class="inputClass" />
          </div>
          <div v-else>
            <label class="mb-1 block text-sm font-medium text-fg">Start date <span class="text-red-500">*</span></label>
            <DatePicker
              v-model="form.start_date"
              placeholder="Select date"
              :input-class="inputClass"
              full-width
            />
          </div>
        </div>

        <div v-if="!isEdit">
          <label class="mb-1 block text-sm font-medium text-fg">Start date <span class="text-red-500">*</span></label>
          <DatePicker
            v-model="form.start_date"
            placeholder="Select date"
            :input-class="inputClass"
            full-width
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Job category</label>
            <AppSelect
              v-model="form.job_category"
              :options="jobCategoryOptions"
              placeholder="Select…"
              :input-class="inputClass"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">
              Job type
              <span v-if="!isInhouseProject" class="text-red-500">*</span>
            </label>
            <AppSelect
              v-model="form.job_type"
              :options="jobTypeOptions"
              placeholder="Select…"
              :input-class="inputClass"
              :disabled="isInhouseProject"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Upwork link</label>
          <input
            v-model="form.link_url"
            type="url"
            placeholder="https://www.upwork.com/…"
            :class="inputClass"
            :disabled="isInhouseProject"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Job description</label>
          <textarea v-model="form.job_description" rows="4" placeholder="Role / scope of work…" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Requirements</label>
          <textarea v-model="form.requirements" rows="3" placeholder="Client requirements, deliverables…" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Notes</label>
          <textarea v-model="form.notes" rows="3" placeholder="Internal notes, context, follow-ups…" :class="inputClass" />
        </div>

        <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>
      </form>

      <div class="flex items-center gap-3 border-t border-border px-6 py-4">
        <button
          v-if="isEdit"
          type="button"
          :disabled="loading || deleting"
          class="rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          @click="openDeleteModal"
        >
          Delete
        </button>
        <div class="ml-auto flex items-center gap-3">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-elevated" @click="close">
            Cancel
          </button>
          <button
            type="button"
            :disabled="loading"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            @click="save"
          >
            {{ loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create project' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <ConfirmDeleteModal
    :open="showDeleteModal"
    title="Delete this project?"
    message="This action cannot be undone. All project data will be permanently removed."
    confirm-label="Delete project"
    :loading="deleting"
    :error="deleteError"
    @close="closeDeleteModal"
    @confirm="confirmDelete"
  >
    <div v-if="project" class="rounded-xl border border-border bg-elevated px-4 py-3 text-sm">
      <p class="font-medium text-fg">{{ form.name || project.name }}</p>
      <p v-if="form.client_name || project.client_name" class="mt-1 text-fg-muted">
        {{ form.client_name || project.client_name }}
      </p>
    </div>
  </ConfirmDeleteModal>
</template>

<script setup>
import { formInputClass as inputClass } from '~/utils/ui'
const props = defineProps({
  open: { type: Boolean, default: false },
  project: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { create, update, remove: deleteProject } = useProjects()
const toast = useToast()

const loading = ref(false)
const deleting = ref(false)
const showDeleteModal = ref(false)
const error = ref('')
const deleteError = ref('')

const isEdit = computed(() => Boolean(props.project?.id))

function blankForm() {
  return {
    name: '',
    client_name: '',
    status: 'planning',
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

const isInhouseProject = computed(() => isInhouseUpworkAccount(form.upwork_account))

function hydrate() {
  if (props.project) {
    Object.assign(form, {
      name: props.project.name ?? '',
      client_name: props.project.client_name ?? '',
      status: props.project.status ?? 'planning',
      start_date: props.project.start_date ?? '',
      job_category: props.project.job_category ?? '',
      job_type: props.project.job_type ?? '',
      upwork_account: props.project.upwork_account ?? '',
      link_url: props.project.link_url ?? '',
      job_description: props.project.job_description ?? props.project.description ?? '',
      requirements: props.project.requirements ?? '',
      notes: props.project.notes ?? '',
    })
  } else {
    Object.assign(form, blankForm())
  }
  error.value = ''
}

function close() {
  emit('close')
}

async function save() {
  if (!form.name.trim()) {
    error.value = 'Project name is required.'
    toast.error(error.value)
    return
  }
  if (!form.upwork_account) {
    error.value = 'Upwork account is required.'
    toast.error(error.value)
    return
  }
  if (!isInhouseProject.value && !form.client_name.trim()) {
    error.value = 'Client name is required.'
    toast.error(error.value)
    return
  }
  if (!isEdit.value && !form.status) {
    error.value = 'Status is required.'
    toast.error(error.value)
    return
  }
  if (!form.start_date) {
    error.value = 'Start date is required.'
    toast.error(error.value)
    return
  }
  if (!isInhouseProject.value && !form.job_type) {
    error.value = 'Job type is required.'
    toast.error(error.value)
    return
  }
  loading.value = true
  error.value = ''
  try {
    const payload = { ...form }
    if (isInhouseUpworkAccount(payload.upwork_account)) {
      payload.client_name = ''
      payload.job_type = ''
      payload.link_url = ''
    }
    if (isEdit.value) {
      const { status, ...body } = payload
      await update(props.project.id, body)
      toast.success('Project updated.')
    } else {
      await create(payload)
      toast.success('Project created.')
    }
    emit('saved')
  } catch (e) {
    error.value = toastErrorMessage(e, 'Failed to save project.')
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

function openDeleteModal() {
  if (!isEdit.value) return
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
  deleteError.value = ''
}

async function confirmDelete() {
  if (!isEdit.value || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await deleteProject(props.project.id)
    showDeleteModal.value = false
    emit('saved')
  } catch (e) {
    deleteError.value = toastErrorMessage(e, 'Failed to delete project.')
    toast.error(deleteError.value)
  } finally {
    deleting.value = false
  }
}

watch(
  () => form.upwork_account,
  (value) => {
    if (isInhouseUpworkAccount(value)) {
      form.client_name = ''
      form.job_type = ''
      form.link_url = ''
    }
  },
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) hydrate()
  },
)
</script>
