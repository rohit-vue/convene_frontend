<template>
  <div>
    <NuxtLink
      :to="backTarget.to"
      class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      {{ backTarget.label }}
    </NuxtLink>

    <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      Meeting not found.
    </div>

    <div v-else-if="meeting" class="space-y-6">
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Meeting</p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-800">{{ form.project_name || 'Untitled meeting' }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ form.client_name || '—' }}</p>
            <p v-if="meeting.employee_name" class="mt-2 text-sm text-slate-500">
              Employee: <span class="font-medium text-slate-700">{{ meeting.employee_name }}</span>
            </p>
          </div>
          <span
            v-if="currentOutcome"
            class="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
          >
            {{ meetingOutcomeLabel(currentOutcome) }}
          </span>
        </div>
      </div>

      <MeetingDetailSections
        v-model:selected-update-id="selectedUpdateId"
        read-only
        :form="form"
        :meeting-updates="meetingUpdates || []"
      />
    </div>

    <div v-else class="text-sm text-slate-400">Loading…</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const { getMeeting, getMeetingUpdates } = useEmployees()

const backTarget = computed(() => {
  if (route.query.from === 'meetings') {
    return { to: '/meetings', label: 'Back to meetings' }
  }
  if (route.query.from === 'projects') {
    return { to: '/projects', label: 'Back to projects' }
  }
  return {
    to: `/employees/${route.params.id}`,
    label: 'Back to employee',
  }
})

const employeeId = computed(() => String(route.params.id))
const meetingId = computed(() => String(route.params.meetingId))

const { data: meeting, error } = await useAsyncData(
  () => `admin-meeting-${employeeId.value}-${meetingId.value}`,
  () => getMeeting(employeeId.value, meetingId.value),
  { server: false },
)

const { data: meetingUpdates } = await useAsyncData(
  () => `admin-meeting-updates-${employeeId.value}-${meetingId.value}`,
  () => getMeetingUpdates(employeeId.value, meetingId.value),
  { server: false, default: () => [] },
)

const selectedUpdateId = ref<string | null>(null)

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

function fillProject(m: typeof meeting.value) {
  const next = blankProjectForm()
  if (m) {
    for (const key of Object.keys(next) as (keyof typeof next)[]) {
      if (m[key] !== null && m[key] !== undefined) next[key] = m[key] as string
    }
  }
  Object.assign(form, next)
}

watch(meeting, (m) => { if (m) fillProject(m) }, { immediate: true })

const currentOutcome = computed(() => {
  const updates = meetingUpdates.value || []
  const selected = updates.find((item) => item.id === selectedUpdateId.value) || updates[0]
  return selected?.meeting_outcome || meeting.value?.meeting_outcome || null
})
</script>
