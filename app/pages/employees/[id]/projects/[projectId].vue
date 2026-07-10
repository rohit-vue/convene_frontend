<template>
  <div>
    <NuxtLink
      :to="backTarget.to"
      class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition hover:text-fg"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      {{ backTarget.label }}
    </NuxtLink>

    <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      Project not found.
    </div>

    <div v-else-if="project" class="space-y-6">
      <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Project</p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight text-fg">{{ project.name }}</h1>
            <p class="mt-1 text-sm text-fg-muted">{{ project.client_name || 'No client set' }}</p>
          </div>
          <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
            :class="statusMeta[project.status]?.badge || 'bg-elevated text-fg-muted'"
          >
            {{ projectStatusLabel(project.status) }}
          </span>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Overview</h2>
        <dl class="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Start date</dt>
            <dd class="mt-1 text-sm text-fg">{{ formatDate(project.start_date) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Created</dt>
            <dd class="mt-1 text-sm text-fg">{{ formatDate(project.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Priority</dt>
            <dd class="mt-1 text-sm capitalize text-fg">{{ project.priority || '—' }}</dd>
          </div>
        </dl>
        <div class="mt-5">
          <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Job description</dt>
          <dd class="mt-2 whitespace-pre-wrap text-sm text-fg">{{ project.job_description || project.description || '—' }}</dd>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Upwork</h2>
        <dl class="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Upwork account</dt>
            <dd class="mt-1 text-sm text-fg">{{ upworkAccountLabel(project.upwork_account) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Job type</dt>
            <dd class="mt-1 text-sm text-fg">{{ jobTypeLabel(project.job_type) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Job category</dt>
            <dd class="mt-1 text-sm text-fg">{{ jobCategoryLabel(project.job_category) }}</dd>
          </div>
          <div v-if="project.job_type === 'hourly'">
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Hourly rate</dt>
            <dd class="mt-1 text-sm text-fg">{{ formatHourlyRateLabel(project.hourly_rate) }}</dd>
          </div>
          <div v-if="project.job_type === 'contract'">
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Current milestone</dt>
            <dd class="mt-1 text-sm text-fg">
              <template v-if="activeMilestone">
                Milestone {{ activeMilestone.milestone_number }} · {{ formatMilestoneCostLabel(activeMilestone.amount) }}
              </template>
              <template v-else>—</template>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-fg-subtle">Upwork link</dt>
            <dd class="mt-1 text-sm">
              <a
                v-if="project.link_url"
                :href="project.link_url"
                target="_blank"
                rel="noopener noreferrer"
                class="break-all font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
              >
                {{ project.link_url }}
              </a>
              <span v-else class="text-fg">—</span>
            </dd>
          </div>
        </dl>
      </div>

      <ProjectMilestoneCostSection
        v-if="project.job_type === 'contract'"
        :project-id="route.params.projectId as string"
        :project-status="project.status"
        :admin-employee-id="route.params.id as string"
        read-only
      />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Requirements</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-fg">{{ project.requirements || '—' }}</p>
        </div>

        <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Notes</h2>
          <p class="mt-3 whitespace-pre-wrap text-sm text-fg">{{ project.notes || '—' }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Status history</h2>
        <div v-if="historyLoading" class="mt-4">
          <ContentLoader variant="table" :rows="3" :columns="3" />
        </div>
        <div v-else-if="!history?.length" class="mt-4 text-sm text-fg-subtle">No status history yet.</div>
        <ol v-else class="mt-4 space-y-0">
          <li
            v-for="(entry, index) in history"
            :key="entry.id"
            class="relative flex gap-4 pb-6 pl-6 ml-2"
            :class="index < history.length - 1 ? 'border-l border-border' : ''"
          >
            <span
              class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white"
              :class="statusMeta[entry.to_status]?.dot || 'bg-slate-400'"
            />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span v-if="entry.from_status" class="text-sm text-fg-subtle">
                  {{ projectStatusLabel(entry.from_status) }}
                  <span class="mx-1">→</span>
                </span>
                <span class="text-sm font-semibold text-fg">
                  {{ projectStatusLabel(entry.to_status) }}
                </span>
                <span class="text-xs text-fg-subtle">{{ formatStatusHistoryWhen(entry, history || [], project.start_date) }}</span>
              </div>
              <p class="mt-1 text-sm text-fg-muted">{{ entry.comment }}</p>
              <p v-if="entry.changed_by_name" class="mt-1 text-xs text-fg-subtle">
                by {{ entry.changed_by_name }}
              </p>
            </div>
          </li>
        </ol>
      </div>

      <ProjectDailyLogsSection
        :project-id="route.params.projectId"
        :job-type="project.job_type"
        :admin-employee-id="route.params.id"
        read-only
      />
    </div>

    <div v-else class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <ContentLoader variant="table" :rows="8" :columns="4" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const { getAdminProject, getAdminStatusHistory, getAdminMilestones } = useProjects()

const backTarget = computed(() => {
  if (route.query.from === 'meetings') {
    return { to: '/meetings', label: 'Back to meetings' }
  }
  if (route.query.from === 'projects') {
    return { to: '/projects', label: 'Back to projects' }
  }
  if (route.query.from === 'daily-logs') {
    return { to: '/daily-logs', label: 'Back to daily logs' }
  }
  return {
    to: `/employees/${route.params.id}`,
    label: 'Back to employee',
  }
})

const { data: project, error } = await useAsyncData(
  `admin-project-${route.params.id}-${route.params.projectId}`,
  () => getAdminProject(route.params.id as string, route.params.projectId as string),
  { server: false },
)

const { data: milestones } = await useAsyncData(
  `admin-project-milestones-${route.params.id}-${route.params.projectId}`,
  () => getAdminMilestones(route.params.id as string, route.params.projectId as string),
  { server: false, default: () => [] },
)

const activeMilestone = computed(() =>
  (milestones.value || []).find((entry) => entry.status === 'active') || null,
)

const { data: history, pending: historyLoading } = await useAsyncData(
  `admin-project-history-${route.params.id}-${route.params.projectId}`,
  () => getAdminStatusHistory(route.params.id as string, route.params.projectId as string),
  { server: false, default: () => [] },
)

const statusMeta = {
  planning: { label: 'Planning', badge: 'bg-elevated text-fg-muted', dot: 'bg-slate-400' },
  active: { label: 'Active', badge: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  on_hold: { label: 'On hold', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', dot: 'bg-amber-500' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400', dot: 'bg-red-500' },
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
