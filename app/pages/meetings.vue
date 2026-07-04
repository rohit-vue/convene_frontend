<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Meetings</h1>
        <p class="mt-1 text-sm text-slate-500">Track and manage all ongoing meetings.</p>
      </div>
      <button class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
        + New Meeting
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-6 py-4 font-medium">Meeting</th>
            <th class="px-6 py-4 font-medium">Lead</th>
            <th class="px-6 py-4 font-medium">Status</th>
            <th class="px-6 py-4 font-medium">Progress</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="m in meetings" :key="m.id" class="transition hover:bg-slate-50">
            <td class="px-6 py-4 font-medium text-slate-800">{{ m.name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ m.lead }}</td>
            <td class="px-6 py-4">
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                :class="statusClass(m.status)"
              >
                {{ m.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                  <div class="h-2 rounded-full bg-indigo-500" :style="{ width: m.progress + '%' }" />
                </div>
                <span class="text-xs font-medium text-slate-500">{{ m.progress }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const { public: { apiBase } } = useRuntimeConfig()
const { data: meetings } = await useFetch(`${apiBase}/api/meetings`)

function statusClass(status) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700'
    case 'In Progress':
      return 'bg-indigo-50 text-indigo-700'
    case 'Planning':
      return 'bg-amber-50 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}
</script>
