<template>
  <div>
    <div class="mb-6 sm:mb-8">
      <h1 class="text-xl font-bold tracking-tight sm:text-2xl">Employees</h1>
      <p class="mt-1 text-sm text-fg-muted">All users with an employee account in Convene.</p>
    </div>

    <ContentLoader v-if="isLoading" variant="cards" :rows="6" />

    <div v-else-if="employees?.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="e in employees"
        :key="e.id"
        class="cursor-pointer rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-indigo-100 hover:shadow-md"
        @click="navigateTo(`/employees/${e.id}`)"
      >
        <div class="flex items-center gap-4">
          <div class="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white">
            {{ initials(e.name) }}
          </div>
          <div class="min-w-0">
            <p class="truncate font-semibold text-fg">{{ e.name }}</p>
            <p class="text-sm capitalize text-fg-muted">{{ e.role }}</p>
          </div>
        </div>

        <p class="mt-4 truncate text-sm text-fg-muted">{{ e.email || '—' }}</p>
      </div>
    </div>

    <div v-else class="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
      <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      </div>
      <h3 class="mt-4 font-semibold text-fg">No employees yet</h3>
      <p class="mt-1 text-sm text-fg-muted">Employees appear here when users sign up for an account.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'admin' })

const { list } = useEmployees()

const { data: employees, status } = await useAsyncData(
  'employees',
  () => list(),
  { server: false, default: () => [] },
)

const isLoading = computed(() => status.value !== 'success' && status.value !== 'error')

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
