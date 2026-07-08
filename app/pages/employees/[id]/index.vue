<template>
  <div>
    <NuxtLink to="/employees" class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to employees
    </NuxtLink>

    <div v-if="error" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      Employee not found.
    </div>

    <div v-else-if="employee" class="space-y-6">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div class="flex flex-wrap items-center gap-5">
          <div class="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white">
            {{ initials(employee.name) }}
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="text-xl font-bold tracking-tight sm:text-2xl">{{ employee.name }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ employee.email || 'No email' }}</p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {{ employee.role }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-4 py-4 sm:px-6">
            <h2 class="text-lg font-semibold text-slate-800">Meetings</h2>
            <p class="mt-0.5 text-sm text-slate-500">{{ employee.meetings.length }} total</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[900px] text-sm">
              <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-medium sm:px-6">Project</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Client</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Upwork type</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Upwork account</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Date &amp; time</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Duration</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Budget</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Timeline</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Status</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Outcome</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="m in employee.meetings"
                  :key="m.id"
                  class="cursor-pointer transition hover:bg-slate-50"
                  @click="navigateTo(`/employees/${route.params.id}/meetings/${m.id}`)"
                >
                  <td class="px-4 py-3 font-medium text-slate-800 sm:px-6">{{ m.project_name }}</td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ m.client_name || '—' }}</td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ projectTypeLabel(m.project_type) }}</td>
                  <td class="max-w-[10rem] truncate px-4 py-3 text-slate-600 sm:px-6" :title="m.upwork_account || undefined">
                    {{ upworkAccountLabel(m.upwork_account) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-6">{{ formatDateTime(m.meeting_at) }}</td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ m.duration_minutes ? `${m.duration_minutes} min` : '—' }}</td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ formatBudgetLabel(m.budget_discussed) }}</td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ m.deadline || '—' }}</td>
                  <td class="px-4 py-3 sm:px-6">
                    <span
                      class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="statusBadgeClass(m.assignment_status)"
                    >
                      {{ assignmentStatusLabel(m.assignment_status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ meetingOutcomeLabel(m.meeting_outcome) }}</td>
                </tr>
                <tr v-if="employee.meetings.length === 0">
                  <td colspan="10" class="px-4 py-10 text-center text-slate-400 sm:px-6">No meetings assigned yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-4 py-4 sm:px-6">
            <h2 class="text-lg font-semibold text-slate-800">Projects</h2>
            <p class="mt-0.5 text-sm text-slate-500">{{ employee.projects.length }} total</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-sm">
              <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-medium sm:px-6">Project</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Client</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Status</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Job type</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Category</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Upwork account</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Start</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Created</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="p in employee.projects"
                  :key="p.id"
                  class="cursor-pointer transition hover:bg-slate-50"
                  @click="navigateTo(`/employees/${route.params.id}/projects/${p.id}`)"
                >
                  <td class="px-4 py-3 font-medium text-slate-800 sm:px-6">{{ p.name }}</td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ p.client_name || '—' }}</td>
                  <td class="px-4 py-3 sm:px-6">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      :class="statusMeta[p.status]?.badge || 'bg-slate-100 text-slate-600'"
                    >
                      {{ projectStatusLabel(p.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ jobTypeLabel(p.job_type) }}</td>
                  <td class="px-4 py-3 text-slate-600 sm:px-6">{{ jobCategoryLabel(p.job_category) }}</td>
                  <td class="max-w-[10rem] truncate px-4 py-3 text-slate-600 sm:px-6" :title="p.upwork_account || undefined">
                    {{ upworkAccountLabel(p.upwork_account) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-6">{{ formatDate(p.start_date) }}</td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-6">{{ formatDate(p.created_at) }}</td>
                </tr>
                <tr v-if="employee.projects.length === 0">
                  <td colspan="8" class="px-4 py-10 text-center text-slate-400 sm:px-6">No projects assigned yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div class="flex items-center gap-5">
          <div class="h-16 w-16 animate-pulse rounded-full bg-slate-100" />
          <div class="flex-1 space-y-2">
            <div class="h-6 w-48 animate-pulse rounded bg-slate-100" />
            <div class="h-4 w-56 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div class="h-5 w-24 animate-pulse rounded bg-slate-100" />
        </div>
        <ContentLoader variant="table" :rows="4" :columns="5" />
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div class="h-5 w-24 animate-pulse rounded bg-slate-100" />
        </div>
        <ContentLoader variant="table" :rows="4" :columns="5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const { getById } = useEmployees()

const { data: employee, error } = await useAsyncData(
  `employee-${route.params.id}`,
  () => getById(route.params.id as string),
  { server: false },
)

const statusMeta = {
  planning: { label: 'Planning', badge: 'bg-slate-100 text-slate-600' },
  active: { label: 'Active', badge: 'bg-indigo-50 text-indigo-700' },
  on_hold: { label: 'On hold', badge: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600' },
}

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

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusBadgeClass(status) {
  if (status === 'accepted') return 'bg-emerald-50 text-emerald-700'
  if (status === 'pending') return 'bg-amber-50 text-amber-700'
  if (status === 'declined') return 'bg-red-50 text-red-700'
  return 'bg-slate-100 text-slate-600'
}
</script>
