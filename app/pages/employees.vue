<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Employees</h1>
        <p class="mt-1 text-sm text-slate-500">Your team at a glance.</p>
      </div>
      <button class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
        + Add Employee
      </button>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="e in employees"
        :key="e.id"
        class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <div class="flex items-center gap-4">
          <div class="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white">
            {{ initials(e.name) }}
          </div>
          <div>
            <p class="font-semibold text-slate-800">{{ e.name }}</p>
            <p class="text-sm text-slate-500">{{ e.role }}</p>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <p class="truncate text-sm text-slate-500">{{ e.email }}</p>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            :class="e.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="e.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'"
            />
            {{ e.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { public: { apiBase } } = useRuntimeConfig()
const { data: employees } = await useFetch(`${apiBase}/api/employees`)

function initials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>
