<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 class="text-lg font-semibold text-slate-800">{{ isEdit ? 'Edit project' : 'New project' }}</h2>
        <button class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <form class="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5" @submit.prevent="save">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Project name <span class="text-red-500">*</span></label>
          <input v-model="form.name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Client</label>
            <input v-model="form.client_name" type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select v-model="form.status" :class="inputClass">
              <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Priority</label>
            <select v-model="form.priority" :class="inputClass">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Start date</label>
            <input v-model="form.start_date" type="date" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Due date</label>
            <input v-model="form.due_date" type="date" :class="inputClass" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Details / description</label>
          <textarea v-model="form.description" rows="4" placeholder="Goals, scope, key notes…" :class="inputClass" />
        </div>

        <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>
      </form>

      <div class="flex items-center gap-3 border-t border-slate-100 px-6 py-4">
        <button
          v-if="isEdit"
          type="button"
          :disabled="loading"
          class="rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          @click="remove"
        >
          Delete
        </button>
        <div class="ml-auto flex items-center gap-3">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100" @click="close">
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
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  project: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

const statuses = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const { apiFetch } = useApi()

const loading = ref(false)
const error = ref('')

const isEdit = computed(() => Boolean(props.project?.id))

function blankForm() {
  return {
    name: '',
    client_name: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    due_date: '',
    description: '',
  }
}

const form = reactive(blankForm())

function hydrate() {
  if (props.project) {
    Object.assign(form, {
      name: props.project.name ?? '',
      client_name: props.project.client_name ?? '',
      status: props.project.status ?? 'planning',
      priority: props.project.priority ?? 'medium',
      start_date: props.project.start_date ?? '',
      due_date: props.project.due_date ?? '',
      description: props.project.description ?? '',
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
    return
  }
  loading.value = true
  error.value = ''
  try {
    if (isEdit.value) {
      await apiFetch(`/api/projects/${props.project.id}`, { method: 'PATCH', body: { ...form } })
    } else {
      await apiFetch('/api/projects', { method: 'POST', body: { ...form } })
    }
    emit('saved')
  } catch (e) {
    error.value = e?.data?.error || e?.message || 'Failed to save project.'
  } finally {
    loading.value = false
  }
}

async function remove() {
  if (!isEdit.value) return
  if (!window.confirm('Delete this project? This cannot be undone.')) return
  loading.value = true
  error.value = ''
  try {
    await apiFetch(`/api/projects/${props.project.id}`, { method: 'DELETE' })
    emit('saved')
  } catch (e) {
    error.value = e?.data?.error || e?.message || 'Failed to delete project.'
  } finally {
    loading.value = false
  }
}

// Load fresh values each time the modal opens (create vs edit).
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) hydrate()
  },
)
</script>
