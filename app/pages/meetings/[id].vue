<template>
  <div>
    <NuxtLink to="/meetings" class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to meetings
    </NuxtLink>

    <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      {{ error.statusCode === 403 ? 'You do not have access to this meeting.' : 'Meeting not found.' }}
    </div>

    <form v-else-if="meeting" class="space-y-6" @submit.prevent="save">
      <!-- Header -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">{{ form.project_name || 'Untitled meeting' }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ form.client_name || '—' }}</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              @click="openCreateModal"
            >
              Follow-up meeting
            </button>
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

      <MeetingDetailSections
        v-model:selected-update-id="selectedUpdateId"
        :form="form"
        :logistics-form="logisticsForm"
        :meeting-updates="meetingUpdates || []"
      />
    </form>

    <div v-else class="text-sm text-slate-400">Loading…</div>

    <div v-if="showCreateModal" class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm" @click.self="showCreateModal = false">
      <div class="my-8 w-full max-w-2xl rounded-2xl border border-slate-100 bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Create follow-up meeting</h3>
            <p class="mt-1 text-sm text-slate-500">Add a new meeting update and keep the logistics history in one place.</p>
          </div>
          <button type="button" class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" @click="showCreateModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="space-y-5 px-6 py-5">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label :class="labelClass">Date &amp; time <span class="text-red-500">*</span></label>
              <input v-model="createForm.meeting_at" required type="datetime-local" :class="inputClass" />
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

        <div class="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100" @click="showCreateModal = false">
            Cancel
          </button>
          <button type="button" :disabled="createLoading" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60" @click="saveFollowUpMeeting">
            {{ createLoading ? 'Saving…' : 'Save update' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'employee' })

const route = useRoute()
const { getById, update, listUpdates, createUpdate, updateUpdate } = useMeetings()

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

const labelClass = 'mb-1 block text-sm font-medium text-slate-700'
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

const loading = ref(false)
const saveError = ref('')
const saveOk = ref(false)
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

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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
    next.meeting_at = source.meeting_at ? toLocalInput(source.meeting_at) : ''
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
  if (!form.project_name || !form.client_name) {
    saveError.value = 'Please fill in all required (*) project fields.'
    saveOk.value = false
    return
  }

  if (!selectedUpdate.value) {
    saveError.value = 'No meeting update selected to save.'
    saveOk.value = false
    return
  }

  if (!logisticsForm.meeting_at) {
    saveError.value = 'Please provide a date & time for the meeting.'
    saveOk.value = false
    return
  }

  loading.value = true
  saveError.value = ''
  saveOk.value = false
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

    saveOk.value = true
    await refresh()
    await refreshUpdates()
  } catch (e) {
    saveError.value = e?.data?.error || e?.message || 'Failed to save changes.'
  } finally {
    loading.value = false
  }
}

async function saveFollowUpMeeting() {
  if (!createForm.meeting_at || !createForm.meeting_outcome) {
    createError.value = 'Please fill in the required fields.'
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
  } catch (e) {
    createError.value = e?.data?.error || e?.message || 'Failed to create follow-up meeting.'
  } finally {
    createLoading.value = false
  }
}
</script>
