<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 class="text-lg font-semibold text-slate-800">New Meeting</h2>
        <button class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <!-- Form -->
      <form class="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5" @submit.prevent="save">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Project name <span class="text-red-500">*</span></label>
            <input v-model="form.project_name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Client name</label>
            <input v-model="form.client_name" type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Meeting title <span class="text-red-500">*</span></label>
          <input v-model="form.title" required type="text" placeholder="e.g. Weekly sync" :class="inputClass" />
        </div>

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
            <label class="mb-1 block text-sm font-medium text-slate-700">Meeting type</label>
            <select v-model="form.meeting_type" :class="inputClass">
              <option value="">Select…</option>
              <option value="client_call">Client call</option>
              <option value="internal_sync">Internal sync</option>
              <option value="status_update">Status update</option>
              <option value="kickoff">Kickoff</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Attendees</label>
          <input v-model="form.attendees" type="text" placeholder="Comma-separated names" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Notes</label>
          <textarea v-model="form.notes" rows="3" placeholder="What was discussed…" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Outcome / decisions made</label>
          <textarea v-model="form.outcome" rows="2" placeholder="What was decided…" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Action items</label>
          <textarea v-model="form.action_items" rows="2" placeholder="One per line, optionally with owner / due date…" :class="inputClass" />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Attachment / link</label>
            <input v-model="form.attachment_url" type="url" placeholder="https://…" :class="inputClass" />
          </div>
          <label class="flex items-center gap-2 sm:mt-7">
            <input v-model="form.follow_up_needed" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span class="text-sm font-medium text-slate-700">Follow-up needed?</span>
          </label>
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
          {{ loading ? 'Saving…' : 'Save meeting' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'saved'])

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

const { apiFetch } = useApi()

const loading = ref(false)
const error = ref('')

function blankForm() {
  return {
    project_name: '',
    client_name: '',
    title: '',
    meeting_at: '',
    duration_minutes: '',
    meeting_type: '',
    attendees: '',
    notes: '',
    outcome: '',
    action_items: '',
    attachment_url: '',
    follow_up_needed: false,
  }
}

const form = reactive(blankForm())

function reset() {
  Object.assign(form, blankForm())
  error.value = ''
}

function close() {
  emit('close')
}

async function save() {
  if (!form.project_name || !form.title || !form.meeting_at) {
    error.value = 'Project name, meeting title and date & time are required.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await apiFetch('/api/meetings', {
      method: 'POST',
      body: {
        ...form,
        meeting_at: new Date(form.meeting_at).toISOString(),
      },
    })
    reset()
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
