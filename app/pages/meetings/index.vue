<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Meetings</h1>
        <p class="mt-1 text-sm text-slate-500">Track and manage all your meetings.</p>
      </div>
      <button
        class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        @click="showModal = true"
      >
        + New Meeting
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-6 py-4 font-medium">Title</th>
            <th class="px-6 py-4 font-medium">Project</th>
            <th class="px-6 py-4 font-medium">Client</th>
            <th class="px-6 py-4 font-medium">Date &amp; time</th>
            <th class="px-6 py-4 font-medium">Type</th>
            <th class="px-6 py-4 font-medium">Follow-up</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="m in meetings"
            :key="m.id"
            class="cursor-pointer transition hover:bg-slate-50"
            @click="navigateTo(`/meetings/${m.id}`)"
          >
            <td class="px-6 py-4 font-medium text-slate-800">{{ m.title }}</td>
            <td class="px-6 py-4 text-slate-600">{{ m.project_name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ m.client_name || '—' }}</td>
            <td class="px-6 py-4 text-slate-600">{{ formatDate(m.meeting_at) }}</td>
            <td class="px-6 py-4">
              <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {{ typeLabel(m.meeting_type) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                v-if="m.follow_up_needed"
                class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-amber-500" /> Needed
              </span>
              <span v-else class="text-xs text-slate-400">—</span>
            </td>
          </tr>

          <tr v-if="meetings && meetings.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-sm text-slate-400">
              No meetings yet. Click “+ New Meeting” to add one.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <MeetingFormModal :open="showModal" @close="showModal = false" @saved="onSaved" />
  </div>
</template>

<script setup>
const { apiFetch } = useApi()

const showModal = ref(false)

const { data: meetings, refresh } = await useAsyncData(
  'meetings',
  () => apiFetch('/api/meetings'),
  { server: false, default: () => [] },
)

async function onSaved() {
  showModal.value = false
  await refresh()
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
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
  return typeLabels[type] || '—'
}
</script>
