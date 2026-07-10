<template>
  <div>
    <NuxtLink to="/meetings" class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition hover:text-fg">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to meetings
    </NuxtLink>

    <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      {{ error.statusCode === 403 ? 'You do not have access to this meeting.' : 'Meeting not found.' }}
    </div>

    <form v-else-if="meeting" class="space-y-6" @submit.prevent="save">
      <!-- Header -->
      <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <h1 class="text-xl font-bold tracking-tight sm:text-2xl">{{ form.project_name || 'Untitled meeting' }}</h1>
            <p class="mt-1 text-sm text-fg-muted">{{ form.client_name || '—' }}</p>
          </div>
          <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            <button
              type="button"
              :disabled="deleting || loading"
              class="rounded-xl border border-red-200 bg-surface px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
              @click="openDeleteModal"
            >
              {{ deleting ? 'Deleting…' : 'Delete meeting' }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-fg shadow-sm transition hover:bg-elevated"
              @click="openCreateModal"
            >
              Follow-up meeting
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

      </div>

      <MeetingDetailSections
        v-model:selected-update-id="selectedUpdateId"
        :form="form"
        :logistics-form="logisticsForm"
        :meeting-updates="meetingUpdates || []"
      />
    </form>

    <div v-else class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <ContentLoader variant="table" :rows="8" :columns="4" />
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm dark:bg-black/60" @click.self="showCreateModal = false">
      <div class="my-8 w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl">
        <div class="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 class="text-lg font-semibold text-fg">Create follow-up meeting</h3>
            <p class="mt-1 text-sm text-fg-muted">Add a new meeting update and keep the logistics history in one place.</p>
          </div>
          <button type="button" class="grid h-8 w-8 place-items-center rounded-lg text-fg-subtle transition hover:bg-elevated hover:text-fg-muted" @click="showCreateModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="space-y-5 px-6 py-5">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label :class="labelClass">Date &amp; time <span class="text-red-500">*</span></label>
              <DateTimePicker
                v-model="createForm.meeting_at"
                placeholder="Select date & time"
                :input-class="inputClass"
                full-width
              />
            </div>
            <div>
              <label :class="labelClass">Meeting outcome <span class="text-red-500">*</span></label>
              <AppSelect
                v-model="createForm.meeting_outcome"
                :options="meetingOutcomeOptions"
                placeholder="Select…"
                :input-class="inputClass"
              />
            </div>
            <div>
              <label :class="labelClass">Duration (min)</label>
              <input v-model="createForm.duration_minutes" type="number" min="0" placeholder="30" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Budget discussed</label>
              <BudgetInput v-model="createForm.budget_discussed" :input-class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Deadline / expected timeline</label>
              <input v-model="createForm.deadline" type="text" placeholder="e.g. 6 weeks" :class="inputClass" />
            </div>
          </div>

          <div>
            <label :class="labelClass">Notes / meeting summary</label>
            <textarea v-model="createForm.notes" rows="4" placeholder="What was discussed…" :class="inputClass" />
          </div>

          <div>
            <label :class="labelClass">Requirements discussed</label>
            <textarea v-model="createForm.requirements_discussed" rows="4" placeholder="Client requirements…" :class="inputClass" />
          </div>

          <p v-if="createError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ createError }}</p>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-elevated" @click="showCreateModal = false">
            Cancel
          </button>
          <button type="button" :disabled="createLoading" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60" @click="saveFollowUpMeeting">
            {{ createLoading ? 'Saving…' : 'Save update' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDeleteModal
      :open="showDeleteModal"
      title="Delete this meeting?"
      message="This action cannot be undone. All meeting updates will be permanently removed."
      confirm-label="Delete meeting"
      :loading="deleting"
      :error="deleteError"
      @close="closeDeleteModal"
      @confirm="confirmDeleteMeeting"
    >
      <div v-if="meeting" class="rounded-xl border border-border bg-elevated px-4 py-3 text-sm">
        <p class="font-medium text-fg">{{ form.project_name || meeting.project_name }}</p>
        <p v-if="form.client_name || meeting.client_name" class="mt-1 text-fg-muted">
          {{ form.client_name || meeting.client_name }}
        </p>
      </div>
    </ConfirmDeleteModal>
  </div>
</template>

<script setup lang="ts">
import { formInputClass as inputClass } from '~/utils/ui'
import { toLocalDateTimeInput } from '~/utils/dates'

definePageMeta({ middleware: 'employee' })

const route = useRoute()
const router = useRouter()
const { getById, update, listUpdates, createUpdate, updateUpdate, remove } = useMeetings()

const { data: meeting, error, refresh } = await useAsyncData(
  `meeting-${route.params.id}`,
  () => getById(route.params.id as string),
  { server: false },
)

const { data: meetingUpdates, refresh: refreshUpdates } = await useAsyncData(
  `meeting-updates-${route.params.id}`,
  () => listUpdates(route.params.id as string),
  { server: false, default: () => [] },
)

const labelClass = 'mb-1 block text-sm font-medium text-fg'

const loading = ref(false)
const deleting = ref(false)
const showDeleteModal = ref(false)
const deleteError = ref('')
const toast = useToast()
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')
const createForm = reactive({
  meeting_at: '',
  duration_minutes: '',
  meeting_outcome: '',
  budget_discussed: '',
  deadline: '',
  notes: '',
  requirements_discussed: '',
})
const selectedUpdateId = ref(null)
const logisticsForm = reactive({
  meeting_at: '',
  duration_minutes: '',
  budget_discussed: '',
  deadline: '',
  notes: '',
  requirements_discussed: '',
})

function blankProjectForm() {
  return {
    project_name: '',
    client_name: '',
    project_type: '',
    upwork_account: '',
    job_description: '',
    link_url: '',
  }
}

const form = reactive(blankProjectForm())

function fillProject(m) {
  const next = blankProjectForm()
  if (m) {
    for (const key of Object.keys(next)) {
      if (m[key] !== null && m[key] !== undefined) next[key] = m[key]
    }
  }
  Object.assign(form, next)
}

function syncLogisticsForm(source) {
  const next = {
    meeting_at: '',
    duration_minutes: '',
    budget_discussed: '',
    deadline: '',
    notes: '',
    requirements_discussed: '',
  }

  if (source) {
    next.meeting_at = source.meeting_at ? toLocalDateTimeInput(source.meeting_at) : ''
    next.duration_minutes = source.duration_minutes ?? ''
    next.budget_discussed = normalizeBudgetValue(source.budget_discussed)
    next.deadline = source.deadline ?? ''
    next.notes = source.notes ?? ''
    next.requirements_discussed = source.requirements_discussed ?? ''
  }

  Object.assign(logisticsForm, next)
}

function resetCreateForm() {
  const latest = meetingUpdates.value?.[0]
  Object.assign(createForm, {
    meeting_at: '',
    duration_minutes: latest?.duration_minutes ?? '',
    meeting_outcome: '',
    budget_discussed: normalizeBudgetValue(latest?.budget_discussed),
    deadline: latest?.deadline ?? '',
    notes: '',
    requirements_discussed: '',
  })
  createError.value = ''
}

function openCreateModal() {
  resetCreateForm()
  showCreateModal.value = true
}

const selectedUpdate = computed(() => {
  if (!meetingUpdates.value?.length) return null
  if (!selectedUpdateId.value) return meetingUpdates.value[0]
  return meetingUpdates.value.find((item) => item.id === selectedUpdateId.value) || meetingUpdates.value[0]
})

watch(meeting, (m) => { if (m) fillProject(m) }, { immediate: true })

watch(selectedUpdate, (item) => {
  syncLogisticsForm(item)
}, { immediate: true })

function buildUpdateBody(includeOutcome = true) {
  const body = {
    meeting_at: new Date(logisticsForm.meeting_at).toISOString(),
    duration_minutes: logisticsForm.duration_minutes ? Number(logisticsForm.duration_minutes) : null,
    budget_discussed: sanitizeBudgetInput(logisticsForm.budget_discussed) || null,
    deadline: logisticsForm.deadline || null,
    notes: logisticsForm.notes || null,
    requirements_discussed: logisticsForm.requirements_discussed || null,
  }
  if (includeOutcome && selectedUpdate.value?.meeting_outcome) {
    body.meeting_outcome = selectedUpdate.value.meeting_outcome
  }
  return body
}

async function save() {
  if (!form.project_name || !form.client_name || !form.upwork_account || !form.project_type) {
    toast.error('Please fill in all required (*) project fields.')
    return
  }

  if (!selectedUpdate.value) {
    toast.error('No meeting update selected to save.')
    return
  }

  if (!logisticsForm.meeting_at) {
    toast.error('Please provide a date & time for the meeting.')
    return
  }

  loading.value = true
  try {
    await update(route.params.id as string, {
      project_name: form.project_name,
      client_name: form.client_name,
      project_type: form.project_type,
      upwork_account: form.upwork_account,
      job_description: form.job_description,
      link_url: form.link_url,
    })

    await updateUpdate(
      route.params.id as string,
      selectedUpdate.value.id,
      buildUpdateBody(),
    )

    toast.success('Changes saved.')
    await refresh()
    await refreshUpdates()
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to save changes.'))
  } finally {
    loading.value = false
  }
}

async function saveFollowUpMeeting() {
  if (!createForm.meeting_at || !createForm.meeting_outcome) {
    createError.value = 'Please fill in the required fields.'
    toast.error(createError.value)
    return
  }

  createLoading.value = true
  createError.value = ''
  try {
    const body = {
      meeting_at: new Date(createForm.meeting_at).toISOString(),
      duration_minutes: createForm.duration_minutes ? Number(createForm.duration_minutes) : null,
      meeting_outcome: createForm.meeting_outcome,
      budget_discussed: sanitizeBudgetInput(createForm.budget_discussed) || null,
      deadline: createForm.deadline || null,
      notes: createForm.notes || null,
      requirements_discussed: createForm.requirements_discussed || null,
    }

    const created = await createUpdate(route.params.id as string, body)

    showCreateModal.value = false
    await refresh()
    await refreshUpdates()
    selectedUpdateId.value = created.id
    resetCreateForm()
    toast.success('Follow-up meeting saved.')
  } catch (e) {
    createError.value = toastErrorMessage(e, 'Failed to create follow-up meeting.')
    toast.error(createError.value)
  } finally {
    createLoading.value = false
  }
}

function openDeleteModal() {
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
  deleteError.value = ''
}

async function confirmDeleteMeeting() {
  if (deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await remove(route.params.id as string)
    showDeleteModal.value = false
    await router.push('/meetings')
  } catch (e) {
    deleteError.value = toastErrorMessage(e, 'Failed to delete meeting.')
    toast.error(deleteError.value)
  } finally {
    deleting.value = false
  }
}
</script>
