<template>
  <div>
    <NuxtLink
      :to="`/employees/${route.params.id}`"
      class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to employee
    </NuxtLink>

    <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      Meeting not found.
    </div>

    <div v-else-if="meeting" class="space-y-6">
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Meeting</p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-800">{{ meeting.project_name }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ meeting.client_name || '—' }}</p>
          </div>
          <span class="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {{ meetingOutcomeLabel(meeting.meeting_outcome) }}
          </span>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Details</h2>
        <dl class="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Employee</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ meeting.employee_name || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Upwork project type</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ projectTypeLabel(meeting.project_type) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Upwork account</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ upworkAccountLabel(meeting.upwork_account) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Date &amp; time</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ formatDateTime(meeting.meeting_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Duration</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ meeting.duration_minutes ? `${meeting.duration_minutes} min` : '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Budget discussed</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ meeting.budget_discussed || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Timeline</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ meeting.deadline || '—' }}</dd>
          </div>
        </dl>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Job description</h2>
        <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.job_description || '—' }}</p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Upwork link</h2>
          <p class="mt-3 text-sm">
            <a
              v-if="meeting.link_url"
              :href="meeting.link_url"
              target="_blank"
              rel="noopener noreferrer"
              class="break-all font-medium text-indigo-600 hover:text-indigo-700"
            >
              {{ meeting.link_url }}
            </a>
            <span v-else class="text-slate-700">—</span>
          </p>
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Notes / meeting summary</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.notes || '—' }}</p>
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Requirements discussed</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.requirements_discussed || '—' }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-sm text-slate-400">Loading…</div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const { apiFetch } = useApi()

const { data: meeting, error } = await useAsyncData(
  `admin-meeting-${route.params.id}-${route.params.meetingId}`,
  () => apiFetch(`/api/employees/${route.params.id}/meetings/${route.params.meetingId}`),
  { server: false },
)

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>
