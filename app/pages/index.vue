<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">Welcome back, here's what's happening today.</p>
    </div>

    
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.label"
        class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
          <span
            class="grid h-9 w-9 place-items-center rounded-xl"
            :class="card.iconBg"
            v-html="card.icon"
          />
        </div>
        <p class="mt-4 text-3xl font-bold tracking-tight">{{ card.value }}</p>
        <p class="mt-1 text-xs font-medium text-emerald-600">{{ card.trend }}</p>
      </div>
    </div>

 
    <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
        <h2 class="text-lg font-semibold">Recent Activity</h2>
        <ul class="mt-4 space-y-4">
          <li v-for="a in activity" :key="a.text" class="flex items-start gap-3">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
            <div>
              <p class="text-sm text-slate-700">{{ a.text }}</p>
              <p class="text-xs text-slate-400">{{ a.time }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold">Quick Links</h2>
        <div class="mt-4 space-y-3">
          <NuxtLink to="/meetings" class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            View all meetings <span>&rarr;</span>
          </NuxtLink>
          <NuxtLink to="/employees" class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            Manage employees <span>&rarr;</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { public: { apiBase } } = useRuntimeConfig()
const { data: stats } = await useFetch(`${apiBase}/api/dashboard/stats`)

const cards = computed(() => [
  {
    label: 'Meetings',
    value: stats.value?.meetings ?? '—',
    trend: '+2 this month',
    iconBg: 'bg-indigo-50 text-indigo-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
  },
  {
    label: 'Employees',
    value: stats.value?.employees ?? '—',
    trend: '+5 this month',
    iconBg: 'bg-violet-50 text-violet-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  },
  {
    label: 'Revenue',
    value: '$' + (stats.value?.revenue ?? 0).toLocaleString(),
    trend: '+12% vs last month',
    iconBg: 'bg-emerald-50 text-emerald-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  },
  {
    label: 'Tasks Done',
    value: (stats.value?.tasksDone ?? 0) + '%',
    trend: 'On track',
    iconBg: 'bg-amber-50 text-amber-600',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  },
])

const activity = [
  { text: 'Rohan Das completed the API Platform project.', time: '2 hours ago' },
  { text: 'Priya Nair added 3 new tasks to Mobile App.', time: '5 hours ago' },
  { text: 'Meera Iyer joined the Design System team.', time: 'Yesterday' },
  { text: 'Website Redesign reached 62% completion.', time: '2 days ago' },
]
</script>
