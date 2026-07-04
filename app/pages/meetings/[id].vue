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
            <h1 class="text-2xl font-bold tracking-tight">{{ meeting.title }}</h1>
            <p class="mt-1 text-sm text-slate-500">
              {{ meeting.project_name }}<span v-if="meeting.client_name"> · {{ meeting.client_name }}</span>
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {{ typeLabel(meeting.meeting_type) }}
            </span>
            <span
              v-if="meeting.follow_up_needed"
              class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-amber-500" /> Follow-up needed
            </span>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
          <div><span class="text-slate-400">When:</span> {{ formatDate(meeting.meeting_at) }}</div>
          <div v-if="meeting.duration_minutes"><span class="text-slate-400">Duration:</span> {{ meeting.duration_minutes }} min</div>
          <div v-if="meeting.attendees"><span class="text-slate-400">Attendees:</span> {{ meeting.attendees }}</div>
        </div>
      </div>

      <!-- Content sections -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Notes</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.notes || 'No notes recorded.' }}</p>
        </section>

        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Outcome / decisions</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.outcome || 'No outcome recorded.' }}</p>
        </section>

        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Action items</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ meeting.action_items || 'No action items.' }}</p>
        </section>

        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Attachment / link</h2>
          <a
            v-if="meeting.attachment_url"
            :href="meeting.attachment_url"
            target="_blank"
            rel="noopener"
            class="mt-3 inline-block break-all text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {{ meeting.attachment_url }}
          </a>
          <p v-else class="mt-3 text-sm text-slate-700">No attachment.</p>
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

const typeLabels = {
  client_call: 'Client call',
  internal_sync: 'Internal sync',
  status_update: 'Status update',
  kickoff: 'Kickoff',
  other: 'Other',
}
function typeLabel(type) {
  return typeLabels[type] || 'Meeting'
}
</script>
