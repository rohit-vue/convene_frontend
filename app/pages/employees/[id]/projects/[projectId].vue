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
      Project not found.
    </div>

    <div v-else-if="project" class="space-y-6">
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Project</p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-800">{{ project.name }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ project.client_name || 'No client set' }}</p>
          </div>
          <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
            :class="statusMeta[project.status]?.badge || 'bg-slate-100 text-slate-600'"
          >
            {{ projectStatusLabel(project.status) }}
          </span>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Overview</h2>
        <dl class="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Start date</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ formatDate(project.start_date) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Created</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ formatDate(project.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Priority</dt>
            <dd class="mt-1 text-sm capitalize text-slate-800">{{ project.priority || '—' }}</dd>
          </div>
        </dl>
        <div class="mt-5">
          <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Job description</dt>
          <dd class="mt-2 whitespace-pre-wrap text-sm text-slate-700">{{ project.job_description || project.description || '—' }}</dd>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Upwork</h2>
        <dl class="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Upwork account</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ upworkAccountLabel(project.upwork_account) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Job type</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ jobTypeLabel(project.job_type) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Job category</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ jobCategoryLabel(project.job_category) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Upwork link</dt>
            <dd class="mt-1 text-sm">
              <a
                v-if="project.link_url"
                :href="project.link_url"
                target="_blank"
                rel="noopener noreferrer"
                class="break-all font-medium text-indigo-600 hover:text-indigo-700"
              >
                {{ project.link_url }}
              </a>
              <span v-else class="text-slate-800">—</span>
            </dd>
          </div>
        </dl>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Requirements</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ project.requirements || '—' }}</p>
        </div>

        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Notes</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-slate-700">{{ project.notes || '—' }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Status history</h2>
        <div v-if="historyLoading" class="mt-4 text-sm text-slate-400">Loading history…</div>
        <div v-else-if="!history?.length" class="mt-4 text-sm text-slate-400">No status history yet.</div>
        <ol v-else class="mt-4 space-y-0">
          <li
            v-for="(entry, index) in history"
            :key="entry.id"
            class="relative flex gap-4 pb-6 pl-6 ml-2"
            :class="index < history.length - 1 ? 'border-l border-slate-200' : ''"
          >
            <span
              class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white"
              :class="statusMeta[entry.to_status]?.dot || 'bg-slate-400'"
            />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span v-if="entry.from_status" class="text-sm text-slate-400">
                  {{ projectStatusLabel(entry.from_status) }}
                  <span class="mx-1">→</span>
                </span>
                <span class="text-sm font-semibold text-slate-800">
                  {{ projectStatusLabel(entry.to_status) }}
                </span>
                <span class="text-xs text-slate-400">{{ formatDateTime(entry.created_at) }}</span>
              </div>
              <p class="mt-1 text-sm text-slate-600">{{ entry.comment }}</p>
              <p v-if="entry.changed_by_name" class="mt-1 text-xs text-slate-400">
                by {{ entry.changed_by_name }}
              </p>
            </div>
          </li>
        </ol>
      </div>

      <ProjectDailyLogsSection
        :project-id="route.params.projectId"
        :job-type="project.job_type"
        read-only
        :fetch-path="`/api/employees/${route.params.id}/projects/${route.params.projectId}/daily-logs`"
      />
    </div>

    <div v-else class="text-sm text-slate-400">Loading…</div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const { apiFetch } = useApi()

const { data: project, error } = await useAsyncData(
  `admin-project-${route.params.id}-${route.params.projectId}`,
  () => apiFetch(`/api/employees/${route.params.id}/projects/${route.params.projectId}`),
  { server: false },
)

const { data: history, pending: historyLoading } = await useAsyncData(
  `admin-project-history-${route.params.id}-${route.params.projectId}`,
  () => apiFetch(`/api/employees/${route.params.id}/projects/${route.params.projectId}/status-history`),
  { server: false, default: () => [] },
)

const statusMeta = {
  planning: { label: 'Planning', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  active: { label: 'Active', badge: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500' },
  on_hold: { label: 'On hold', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>
