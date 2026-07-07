<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">Welcome back, here's what's happening today.</p>
    </div>

    <!-- Primary stats -->
    <div :class="statsGridClass">
      <div
        v-for="card in primaryCards"
        :key="card.label"
        class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
          <span class="grid h-9 w-9 place-items-center rounded-xl" :class="card.iconBg" v-html="card.icon" />
        </div>
        <p class="mt-4 text-3xl font-bold tracking-tight">{{ card.value }}</p>
        <p class="mt-1 text-xs font-medium text-slate-400">{{ card.trend }}</p>
      </div>
    </div>

    <!-- Breakdowns -->
    <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-800">Project status</h2>
        <p class="mt-0.5 text-sm text-slate-500">{{ scopeLabel }} projects by status</p>
        <div class="mt-4 space-y-3">
          <div v-for="item in projectBreakdown" :key="item.key" class="flex items-center gap-3">
            <span class="w-24 shrink-0 text-sm text-slate-600">{{ item.label }}</span>
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

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-800">Meeting outcomes</h2>
        <p class="mt-0.5 text-sm text-slate-500">{{ scopeLabel }} meetings by outcome</p>
        <div class="mt-4 space-y-3">
          <div v-for="item in meetingBreakdown" :key="item.key" class="flex items-center gap-3">
            <span class="w-32 shrink-0 text-sm text-slate-600">{{ item.label }}</span>
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
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
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

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold">
          {{ isEmployee ? 'Meetings to Accept' : 'Quick Links' }}
        </h2>

        <!-- Employee: pending meetings -->
        <div v-if="isEmployee" class="mt-4 space-y-3">
          <div
            v-for="m in pendingMeetings"
            :key="m.id"
            class="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
          >
            <p class="text-sm font-medium text-slate-800">{{ m.project_name }}</p>
            <p class="mt-0.5 text-xs text-slate-500">{{ m.client_name }} · {{ formatMeetingTime(m.meeting_at) }}</p>
            <button
              class="mt-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              :disabled="acceptingId === m.id"
              @click="acceptMeeting(m.id)"
            >
              {{ acceptingId === m.id ? 'Accepting…' : 'Accept' }}
            </button>
          </div>
          <p v-if="!pendingMeetings.length" class="text-sm text-slate-400">No meetings awaiting acceptance.</p>
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
const { accept } = useMeetings()

const { data: overview, refresh: refreshOverview } = await useAsyncData(
  'dashboard-overview',
  () => getOverview(),
  { server: false },
)

const pendingMeetings = computed(() => overview.value?.pendingMeetings ?? [])
const acceptingId = ref(null)

async function acceptMeeting(id) {
  acceptingId.value = id
  try {
    await accept(id)
    await refreshOverview()
  } catch (e) {
    console.error(e)
  } finally {
    acceptingId.value = null
  }
}

function formatMeetingTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
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

  cards.push({
    label: 'Needs attention',
    value: stats.value.needsAttention ?? 0,
    trend: 'Follow-ups & on hold',
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
