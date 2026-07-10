<template>
  <div
    v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-2xl rounded-2xl bg-surface shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 class="text-lg font-semibold text-fg">{{ isEdit ? 'Edit Meeting' : 'New Meeting' }}</h2>
        <button class="grid h-8 w-8 place-items-center rounded-lg text-fg-subtle transition hover:bg-elevated hover:text-fg-muted" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <!-- Form -->
      <form class="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5" @submit.prevent="save">
        <!-- Project & client -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Project Title <span class="text-red-500">*</span></label>
            <input v-model="form.project_name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Upwork account <span class="text-red-500">*</span></label>
            <AppSelect
              v-model="form.upwork_account"
              :options="upworkAccountOptions"
              placeholder="Select…"
              :input-class="inputClass"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Project type <span class="text-red-500">*</span></label>
            <AppSelect
              v-model="form.project_type"
              :options="projectTypeOptions"
              placeholder="Select…"
              :input-class="inputClass"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Client name <span class="text-red-500">*</span></label>
            <input v-model="form.client_name" required type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Upwork Link</label>
          <input v-model="form.link_url" type="url" placeholder="https://…" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Job description</label>
          <textarea v-model="form.job_description" rows="3" placeholder="Role / scope of work…" :class="inputClass" />
        </div>

        <!-- Meeting details -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Date &amp; time <span class="text-red-500">*</span></label>
            <DateTimePicker
              v-model="form.meeting_at"
              placeholder="Select date & time"
              :input-class="inputClass"
              full-width
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Duration (min)</label>
            <NumberInput
              v-model="form.duration_minutes"
              :min="0"
              placeholder="30"
              :input-class="inputClass"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Meeting outcome <span class="text-red-500">*</span></label>
            <AppSelect
              v-model="form.meeting_outcome"
              :options="meetingOutcomeOptions"
              placeholder="Select…"
              :input-class="inputClass"
            />
          </div>
        </div>

        <!-- Commercials -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Budget discussed</label>
            <BudgetInput v-model="form.budget_discussed" :input-class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Deadline / expected timeline</label>
            <input v-model="form.deadline" type="text" placeholder="e.g. 6 weeks" :class="inputClass" />
          </div>
        </div>

        <!-- Discussion -->
        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Notes / meeting summary</label>
          <textarea v-model="form.notes" rows="3" placeholder="What was discussed…" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Requirements discussed</label>
          <textarea v-model="form.requirements_discussed" rows="2" placeholder="Client requirements…" :class="inputClass" />
        </div>

        <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>
      </form>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
        <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-elevated" @click="close">
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
import { formInputClass as inputClass } from '~/utils/ui'
import { toLocalDateTimeInput } from '~/utils/dates'

const props = defineProps({
  open: { type: Boolean, default: false },
  meeting: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.meeting?.id)

const { create, update } = useMeetings()
const { getOptions } = useEmployees()
const toast = useToast()

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

function reset() {
  const next = blankForm()
  if (props.meeting) {
    for (const key of Object.keys(next)) {
      if (key === 'meeting_at') {
        next[key] = toLocalDateTimeInput(props.meeting.meeting_at)
      } else if (key === 'budget_discussed') {
        next[key] = normalizeBudgetValue(props.meeting[key])
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
    !form.upwork_account ||
    !form.project_type ||
    !form.meeting_at ||
    !form.meeting_outcome
  ) {
    error.value = 'Please fill in all required (*) fields.'
    toast.error(error.value)
    return
  }
  loading.value = true
  error.value = ''
  try {
    const body = {
      ...form,
      meeting_at: new Date(form.meeting_at).toISOString(),
      budget_discussed: sanitizeBudgetInput(form.budget_discussed) || undefined,
    }
    if (isEdit.value) {
      await update(props.meeting.id, body)
      toast.success('Meeting updated.')
    } else {
      await create(body)
      toast.success('Meeting created.')
      reset()
    }
    emit('saved')
  } catch (e) {
    error.value = toastErrorMessage(e, 'Failed to save meeting.')
    toast.error(error.value)
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
