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

      <!-- Details -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Details</h2>
        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label :class="labelClass">Project name <span class="text-red-500">*</span></label>
            <input v-model="form.project_name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Client name <span class="text-red-500">*</span></label>
            <input v-model="form.client_name" required type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Employee <span class="text-red-500">*</span></label>
            <select v-model="form.employee_id" required :class="inputClass">
              <option value="">Select…</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.name }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Upwork project type</label>
            <select v-model="form.project_type" :class="inputClass">
              <option value="">Select…</option>
              <option v-for="opt in projectTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Upwork account</label>
            <select v-model="form.upwork_account" :class="inputClass">
              <option value="">Select…</option>
              <option v-for="opt in upworkAccountOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Meeting outcome <span class="text-red-500">*</span></label>
            <select v-model="form.meeting_outcome" required :class="inputClass">
              <option value="">Select…</option>
              <option v-for="opt in meetingOutcomeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Date &amp; time <span class="text-red-500">*</span></label>
            <input v-model="form.meeting_at" required type="datetime-local" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Duration (min)</label>
            <input v-model="form.duration_minutes" type="number" min="0" placeholder="30" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Budget discussed</label>
            <input v-model="form.budget_discussed" type="text" placeholder="e.g. $10,000" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Deadline / expected timeline</label>
            <input v-model="form.deadline" type="text" placeholder="e.g. 6 weeks" :class="inputClass" />
          </div>
        </div>
      </div>

      <!-- Content sections -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <label :class="labelClass">Job description</label>
          <textarea v-model="form.job_description" rows="3" placeholder="Role / scope of work…" :class="inputClass" />
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <label :class="labelClass">Upwork Link</label>
          <input v-model="form.link_url" type="url" placeholder="https://…" :class="inputClass" />
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <label :class="labelClass">Notes / meeting summary</label>
          <textarea v-model="form.notes" rows="3" placeholder="What was discussed…" :class="inputClass" />
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <label :class="labelClass">Requirements discussed</label>
          <textarea v-model="form.requirements_discussed" rows="3" placeholder="Client requirements…" :class="inputClass" />
        </div>
      </div>
    </form>

    <div v-else class="text-sm text-slate-400">Loading…</div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'employee' })

const route = useRoute()
const { apiFetch } = useApi()

const { data: meeting, error, refresh } = await useAsyncData(
  `meeting-${route.params.id}`,
  () => apiFetch(`/api/meetings/${route.params.id}`),
  { server: false },
)

const { data: employees } = await useAsyncData(
  'employees-for-meeting-detail',
  () => apiFetch('/api/employees/options'),
  { server: false, default: () => [] },
)

const labelClass = 'mb-1 block text-sm font-medium text-slate-700'
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

const loading = ref(false)
const saveError = ref('')
const saveOk = ref(false)

function blankForm() {
  return {
    project_name: '',
    client_name: '',
    employee_id: '',
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

function fill(m) {
  const next = blankForm()
  if (m) {
    for (const key of Object.keys(next)) {
      if (key === 'meeting_at') next[key] = toLocalInput(m.meeting_at)
      else if (m[key] !== null && m[key] !== undefined) next[key] = m[key]
    }
  }
  Object.assign(form, next)
}

watch(meeting, (m) => { if (m) fill(m) }, { immediate: true })

async function save() {
  if (
    !form.project_name ||
    !form.client_name ||
    !form.employee_id ||
    !form.meeting_at ||
    !form.meeting_outcome
  ) {
    saveError.value = 'Please fill in all required (*) fields.'
    saveOk.value = false
    return
  }
  loading.value = true
  saveError.value = ''
  saveOk.value = false
  try {
    await apiFetch(`/api/meetings/${route.params.id}`, {
      method: 'PUT',
      body: {
        ...form,
        meeting_at: new Date(form.meeting_at).toISOString(),
      },
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
