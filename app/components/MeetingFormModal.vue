<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 class="text-lg font-semibold text-slate-800">{{ isEdit ? 'Edit Meeting' : 'New Meeting' }}</h2>
        <button class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <!-- Form -->
      <form class="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5" @submit.prevent="save">
        <!-- Project & client -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Project Title <span class="text-red-500">*</span></label>
            <input v-model="form.project_name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Client name <span class="text-red-500">*</span></label>
            <input v-model="form.client_name" required type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Project type</label>
            <select v-model="form.project_type" :class="inputClass">
              <option value="">Select…</option>
              <option v-for="opt in projectTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Upwork account</label>
            <select v-model="form.upwork_account" :class="inputClass">
              <option value="">Select…</option>
              <option v-for="opt in upworkAccountOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Upwork Link</label>
            <input v-model="form.link_url" type="url" placeholder="https://…" :class="inputClass" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Job description</label>
          <textarea v-model="form.job_description" rows="3" placeholder="Role / scope of work…" :class="inputClass" />
        </div>

        <!-- Meeting details -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Date &amp; time <span class="text-red-500">*</span></label>
            <input v-model="form.meeting_at" required type="datetime-local" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Duration (min)</label>
            <input v-model="form.duration_minutes" type="number" min="0" placeholder="30" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Meeting outcome <span class="text-red-500">*</span></label>
            <select v-model="form.meeting_outcome" required :class="inputClass">
              <option value="">Select…</option>
              <option v-for="opt in meetingOutcomeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>

        <!-- Commercials -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Budget discussed</label>
            <input v-model="form.budget_discussed" type="text" placeholder="e.g. $10,000" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Deadline / expected timeline</label>
            <input v-model="form.deadline" type="text" placeholder="e.g. 6 weeks" :class="inputClass" />
          </div>
        </div>

        <!-- Discussion -->
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Notes / meeting summary</label>
          <textarea v-model="form.notes" rows="3" placeholder="What was discussed…" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Requirements discussed</label>
          <textarea v-model="form.requirements_discussed" rows="2" placeholder="Client requirements…" :class="inputClass" />
        </div>

        <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>
      </form>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100" @click="close">
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          @click="save"
        >
          {{ loading ? 'Saving…' : isEdit ? 'Save changes' : 'Save meeting' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  meeting: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.meeting?.id)

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

const { create, update } = useMeetings()
const { getOptions } = useEmployees()

const { data: employees } = await useAsyncData(
  'employees-for-meetings',
  () => getOptions(),
  { server: false, default: () => [] },
)

const loading = ref(false)
const error = ref('')

function blankForm() {
  return {
    project_name: '',
    client_name: '',
    project_type: '',
    upwork_account: '',
    job_description: '',
    meeting_at: '',
    duration_minutes: '',
    meeting_outcome: '',
    budget_discussed: '',
    deadline: '',
    notes: '',
    requirements_discussed: '',
    link_url: '',
  }
}

const form = reactive(blankForm())

// Convert an ISO timestamp to the value a datetime-local input expects (local time).
function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function reset() {
  const next = blankForm()
  if (props.meeting) {
    for (const key of Object.keys(next)) {
      if (key === 'meeting_at') {
        next[key] = toLocalInput(props.meeting.meeting_at)
      } else if (props.meeting[key] !== null && props.meeting[key] !== undefined) {
        next[key] = props.meeting[key]
      }
    }
  }
  Object.assign(form, next)
  error.value = ''
}

function close() {
  emit('close')
}

async function save() {
  if (
    !form.project_name ||
    !form.client_name ||
    !form.meeting_at ||
    !form.meeting_outcome
  ) {
    error.value = 'Please fill in all required (*) fields.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const body = {
      ...form,
      meeting_at: new Date(form.meeting_at).toISOString(),
    }
    if (isEdit.value) {
      await update(props.meeting.id, body)
    } else {
      await create(body)
      reset()
    }
    emit('saved')
  } catch (e) {
    error.value = e?.data?.error || e?.message || 'Failed to save meeting.'
  } finally {
    loading.value = false
  }
}

// Reset the form whenever the modal is reopened.
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) reset()
  },
)
</script>
