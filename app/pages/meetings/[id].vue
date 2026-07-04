<template>
  <div>
    <NuxtLink to="/meetings" class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to meetings
    </NuxtLink>

    <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      {{ error.statusCode === 403 ? 'You do not have access to this meeting.' : 'Meeting not found.' }}
    </div>

    <div v-else-if="meeting" class="space-y-6">
      <!-- Header -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">{{ meeting.project_name }}</h1>
            <p v-if="meeting.client_name" class="mt-1 text-sm text-slate-500">{{ meeting.client_name }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-if="meeting.project_type"
              class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {{ projectTypeLabel(meeting.project_type) }}
            </span>
            <span class="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {{ meetingStatusLabel(meeting.meeting_status) }}
            </span>
            <span class="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {{ meetingOutcomeLabel(meeting.meeting_outcome) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Details</h2>
        <dl class="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Project name</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ meeting.project_name || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Client name</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ meeting.client_name || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Employee name</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ meeting.employee_name || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Upwork project type</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ projectTypeLabel(meeting.project_type) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Meeting status</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ meetingStatusLabel(meeting.meeting_status) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Meeting outcome</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ meetingOutcomeLabel(meeting.meeting_outcome) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Date &amp; time</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ formatDate(meeting.meeting_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Duration (min)</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ meeting.duration_minutes ? meeting.duration_minutes + ' min' : '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Budget discussed</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ meeting.budget_discussed || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Deadline / expected timeline</dt>
            <dd class="mt-1 text-sm text-slate-700">{{ meeting.deadline || '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Content sections -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Job description</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.job_description || 'No job description.' }}</p>
        </section>

        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Notes / meeting summary</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.notes || 'No notes recorded.' }}</p>
        </section>

        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Requirements discussed</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.requirements_discussed || 'None recorded.' }}</p>
        </section>
      </div>
    </div>

    <div v-else class="text-sm text-slate-400">Loading…</div>
  </div>
</template>

<script setup>
const route = useRoute()
const { apiFetch } = useApi()

const { data: meeting, error } = await useAsyncData(
  `meeting-${route.params.id}`,
  () => apiFetch(`/api/meetings/${route.params.id}`),
  { server: false },
)

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}
</script>
