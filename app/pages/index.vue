<template>
  <div>
    <div class="mb-6 sm:mb-8">
      <h1 class="text-xl font-bold tracking-tight sm:text-2xl">Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">Welcome back, here's what's happening today.</p>
    </div>

    <!-- Primary stats -->
    <div :class="statsGridClass">
      <div
        v-for="card in primaryCards"
        :key="card.label"
        class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
          <span class="grid h-9 w-9 place-items-center rounded-xl" :class="card.iconBg" v-html="card.icon" />
        </div>
        <p class="mt-4 text-3xl font-bold tracking-tight">{{ card.value }}</p>
        <div v-if="card.badges?.length" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="badge in card.badges"
            :key="badge.label"
            class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[10px] font-medium leading-4"
            :class="badge.class"
          >
            <span class="font-semibold tabular-nums">{{ badge.count }}</span>
            {{ badge.label }}
          </span>
        </div>
        <p v-else class="mt-1 text-xs font-medium text-slate-400">{{ card.trend }}</p>
      </div>
    </div>

    <!-- Breakdowns -->
    <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 class="text-lg font-semibold text-slate-800">Project status</h2>
        <p class="mt-0.5 text-sm text-slate-500">{{ scopeLabel }} projects by status</p>
        <div class="mt-4 space-y-3">
          <div v-for="item in projectBreakdown" :key="item.key" class="flex items-center gap-2 sm:gap-3">
            <span class="w-16 shrink-0 text-xs text-slate-600 sm:w-24 sm:text-sm">{{ item.label }}</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full transition-all"
                :class="item.barClass"
                :style="{ width: `${item.pct}%` }"
              />
            </div>
            <span class="w-8 shrink-0 text-right text-sm font-semibold text-slate-800">{{ item.count }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 class="text-lg font-semibold text-slate-800">Meeting outcomes</h2>
        <p class="mt-0.5 text-sm text-slate-500">{{ scopeLabel }} meetings by outcome</p>
        <div class="mt-4 space-y-3">
          <div v-for="item in meetingBreakdown" :key="item.key" class="flex items-center gap-2 sm:gap-3">
            <span class="min-w-0 w-20 shrink-0 text-xs leading-tight text-slate-600 sm:w-32 sm:text-sm">{{ item.label }}</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full transition-all"
                :class="item.barClass"
                :style="{ width: `${item.pct}%` }"
              />
            </div>
            <span class="w-8 shrink-0 text-right text-sm font-semibold text-slate-800">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity & quick links -->
    <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
        <h2 class="text-lg font-semibold">Recent Activity</h2>
        <ul v-if="overview?.activity?.length" class="mt-4 space-y-4">
          <li v-for="(a, i) in overview.activity" :key="`${a.at}-${i}`" class="flex items-start gap-3">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
            <div>
              <p class="text-sm text-slate-700">{{ a.text }}</p>
              <p class="text-xs text-slate-400">{{ formatActivityTime(a.at) }}</p>
            </div>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-slate-400">No recent activity yet.</p>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 class="text-lg font-semibold">
          {{ isEmployee ? 'Assignments to Accept' : 'Quick Links' }}
        </h2>

        <!-- Employee: pending assignments -->
        <div v-if="isEmployee" class="mt-4 space-y-3">
          <div
            v-for="m in pendingMeetings"
            :key="`meeting-${m.id}`"
            class="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
          >
            <p class="text-xs font-medium uppercase tracking-wide text-amber-700">Meeting</p>
            <p class="mt-1 text-sm font-medium text-slate-800">{{ m.project_name }}</p>
            <p class="mt-0.5 text-xs text-slate-500">{{ m.client_name }} · {{ formatMeetingTime(m.meeting_at) }}</p>
            <button
              class="mt-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              :disabled="acceptingMeetingId === m.id"
              @click="acceptMeeting(m.id)"
            >
              {{ acceptingMeetingId === m.id ? 'Accepting…' : 'Accept' }}
            </button>
          </div>

          <div
            v-for="p in pendingProjects"
            :key="`project-${p.id}`"
            class="rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3"
          >
            <p class="text-xs font-medium uppercase tracking-wide text-sky-700">Project</p>
            <p class="mt-1 text-sm font-medium text-slate-800">{{ p.name }}</p>
            <p class="mt-0.5 text-xs text-slate-500">
              {{ p.client_name || 'No client' }}
              <template v-if="p.start_date"> · Starts {{ formatProjectDate(p.start_date) }}</template>
            </p>
            <button
              class="mt-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              :disabled="acceptingProjectId === p.id"
              @click="acceptProject(p.id)"
            >
              {{ acceptingProjectId === p.id ? 'Accepting…' : 'Accept' }}
            </button>
          </div>

          <p v-if="!pendingMeetings.length && !pendingProjects.length" class="text-sm text-slate-400">
            No assignments awaiting acceptance.
          </p>
        </div>

        <!-- Admin: quick links -->
        <div v-else class="mt-4 space-y-3">
          <NuxtLink
            to="/meetings"
            class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            View all meetings <span>&rarr;</span>
          </NuxtLink>
          <NuxtLink
            to="/projects"
            class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            View all projects <span>&rarr;</span>
          </NuxtLink>
          <NuxtLink
            to="/employees"
            class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Manage employees <span>&rarr;</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { isAdmin, isEmployee } = useProfile()
const { getOverview } = useDashboard()
const { accept: acceptMeetingRequest } = useMeetings()
const { accept: acceptProjectRequest } = useProjects()
const toast = useToast()

const { data: overview, refresh: refreshOverview } = await useAsyncData(
  'dashboard-overview',
  () => getOverview(),
  { server: false },
)

const pendingMeetings = computed(() => overview.value?.pendingMeetings ?? [])
const pendingProjects = computed(() => overview.value?.pendingProjects ?? [])
const acceptingMeetingId = ref(null)
const acceptingProjectId = ref(null)

async function acceptMeeting(id) {
  acceptingMeetingId.value = id
  try {
    await acceptMeetingRequest(id)
    await refreshOverview()
    toast.success('Meeting accepted.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to accept meeting.'))
  } finally {
    acceptingMeetingId.value = null
  }
}

async function acceptProject(id) {
  acceptingProjectId.value = id
  try {
    await acceptProjectRequest(id)
    await refreshOverview()
    toast.success('Project accepted.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to accept project.'))
  } finally {
    acceptingProjectId.value = null
  }
}

function formatMeetingTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatProjectDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const scopeLabel = computed(() => (isAdmin.value ? 'All' : 'Your'))

const stats = computed(() => overview.value?.stats ?? {})

const primaryCards = computed(() => {
  const cards = [
    {
      label: 'Meetings',
      value: stats.value.meetings ?? '—',
      trend: `${scopeLabel.value} meetings`,
      iconBg: 'bg-indigo-50 text-indigo-600',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
    },
    {
      label: 'Projects',
      value: stats.value.projects ?? '—',
      trend: `${scopeLabel.value} projects`,
      iconBg: 'bg-sky-50 text-sky-600',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    },
  ]

  if (isAdmin.value) {
    cards.push({
      label: 'Employees',
      value: stats.value.employees ?? '—',
      trend: 'Active team',
      iconBg: 'bg-violet-50 text-violet-600',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    })
  }

  const meetingOutcomes = overview.value?.meetingOutcomeBreakdown ?? {}
  const projectStatuses = overview.value?.projectStatusBreakdown ?? {}
  const attentionBadges = [
    {
      label: 'Follow-up',
      count: meetingOutcomes.follow_up_required ?? 0,
      class: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Pending reply',
      count: meetingOutcomes.pending_reply ?? 0,
      class: 'bg-orange-50 text-orange-700',
    },
    {
      label: 'On hold',
      count: projectStatuses.on_hold ?? 0,
      class: 'bg-slate-100 text-slate-700',
    },
  ].filter((badge) => badge.count > 0)

  cards.push({
    label: 'Needs attention',
    value: stats.value.needsAttention ?? 0,
    trend: 'Follow-ups & on hold',
    badges: attentionBadges,
    iconBg: 'bg-amber-50 text-amber-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  })

  return cards
})

const statsGridClass = computed(() =>
  isAdmin.value
    ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid grid-cols-1 gap-5 sm:grid-cols-3',
)

const projectStatusMeta = {
  planning: { label: 'Planning', barClass: 'bg-slate-400' },
  active: { label: 'Active', barClass: 'bg-indigo-500' },
  on_hold: { label: 'On hold', barClass: 'bg-amber-500' },
  completed: { label: 'Completed', barClass: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', barClass: 'bg-red-400' },
}

const outcomeBarMeta = {
  won: { label: 'Won', barClass: 'bg-emerald-500' },
  holding: { label: 'Holding', barClass: 'bg-slate-400' },
  not_selected: { label: 'Not selected', barClass: 'bg-red-400' },
  follow_up_required: { label: 'Follow-up required', barClass: 'bg-amber-500' },
  pending_reply: { label: 'Pending reply', barClass: 'bg-orange-500' },
}

const projectBreakdown = computed(() => {
  const breakdown = overview.value?.projectStatusBreakdown ?? {}
  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0) || 1
  return Object.entries(projectStatusMeta).map(([key, meta]) => ({
    key,
    label: meta.label,
    count: breakdown[key] ?? 0,
    pct: Math.round(((breakdown[key] ?? 0) / total) * 100),
    barClass: meta.barClass,
  }))
})

const meetingBreakdown = computed(() => {
  const breakdown = overview.value?.meetingOutcomeBreakdown ?? {}
  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0) || 1
  return Object.entries(outcomeBarMeta).map(([key, meta]) => ({
    key,
    label: meta.label,
    count: breakdown[key] ?? 0,
    pct: Math.round(((breakdown[key] ?? 0) / total) * 100),
    barClass: meta.barClass,
  }))
})

function formatActivityTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
