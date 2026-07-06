<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Employees</h1>
      <p class="mt-1 text-sm text-slate-500">All users with an employee account in Convene.</p>
    </div>

    <div v-if="employees?.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="e in employees"
        :key="e.id"
        class="cursor-pointer rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-indigo-100 hover:shadow-md"
        @click="navigateTo(`/employees/${e.id}`)"
      >
        <div class="flex items-center gap-4">
          <div class="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white">
            {{ initials(e.name) }}
          </div>
          <div class="min-w-0">
            <p class="truncate font-semibold text-slate-800">{{ e.name }}</p>
            <p class="text-sm capitalize text-slate-500">{{ e.role }}</p>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between gap-2">
          <p class="truncate text-sm text-slate-500">{{ e.email || '—' }}</p>
          <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Employee
          </span>
        </div>
      </div>
    </div>

    <div v-else-if="employees" class="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
      <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      </div>
      <h3 class="mt-4 font-semibold text-slate-800">No employees yet</h3>
      <p class="mt-1 text-sm text-slate-500">Employees appear here when users sign up for an account.</p>
    </div>

    <div v-else class="text-sm text-slate-400">Loading…</div>
  </div>
</template>

<script setup>
const { apiFetch } = useApi()

const { data: employees } = await useAsyncData(
  'employees',
  () => apiFetch('/api/employees'),
  { server: false, default: () => [] },
)

function initials(name) {
  if (!name) return '?'
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>
