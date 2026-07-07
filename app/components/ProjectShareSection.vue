<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Share project</h2>
    <p class="mt-1 text-sm text-slate-500">
      Grant another employee access to view this project and add their own daily logs.
    </p>

    <div class="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div class="min-w-[200px] flex-1">
        <label class="mb-1 block text-sm font-medium text-slate-700">Employee</label>
        <AppSelect
          v-model="selectedEmployeeId"
          :options="employeeSelectOptions"
          placeholder="Select employee…"
          :input-class="inputClass"
        />
      </div>
      <button
        type="button"
        :disabled="!selectedEmployeeId || sharing"
        class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        @click="grantShare"
      >
        {{ sharing ? 'Sharing…' : 'Share access' }}
      </button>
    </div>

    <p v-if="shareError" class="mt-3 text-sm text-red-600">{{ shareError }}</p>
    <p v-else-if="shareOk" class="mt-3 text-sm text-emerald-700">Access granted.</p>

    <div class="mt-6">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400">People with access</h3>
      <div v-if="sharesLoading" class="mt-3 text-sm text-slate-400">Loading…</div>
      <div v-else-if="!shares?.length" class="mt-3 text-sm text-slate-400">Not shared with anyone yet.</div>
      <ul v-else class="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
        <li
          v-for="share in shares"
          :key="share.id"
          class="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">{{ share.shared_with_name || 'Employee' }}</p>
            <p class="text-xs text-slate-400">
              Shared {{ formatDate(share.created_at) }}
              <span v-if="!share.can_edit_logs"> · view only</span>
            </p>
          </div>
          <button
            v-if="share.can_edit_logs"
            type="button"
            :disabled="revokingId === share.id"
            class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            @click="revoke(share.id)"
          >
            {{ revokingId === share.id ? 'Revoking…' : 'Revoke log access' }}
          </button>
          <span
            v-else
            class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500"
          >
            View only
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectShare } from '~/types/projects'

const props = defineProps({
  projectId: { type: String, required: true },
})

const { listShares, shareProject, revokeShare } = useProjects()
const { getOptions } = useEmployees()

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

const selectedEmployeeId = ref('')
const sharing = ref(false)
const shareError = ref('')
const shareOk = ref(false)
const revokingId = ref<string | null>(null)

const { data: employeeOptions } = await useAsyncData(
  'share-employee-options',
  () => getOptions(),
  { server: false, default: () => [] },
)

const { data: shares, pending: sharesLoading, refresh: refreshShares } = await useAsyncData(
  () => `project-shares-${props.projectId}`,
  () => listShares(props.projectId),
  { server: false, default: () => [] as ProjectShare[] },
)

const sharedWithIds = computed(() => new Set((shares.value || []).filter((s) => s.can_edit_logs).map((s) => s.shared_with)))

const employeeSelectOptions = computed(() =>
  (employeeOptions.value || [])
    .filter((e) => !sharedWithIds.value.has(e.id))
    .map((e) => ({ value: e.id, label: e.name || e.id })),
)

async function grantShare() {
  if (!selectedEmployeeId.value) return
  sharing.value = true
  shareError.value = ''
  shareOk.value = false
  try {
    await shareProject(props.projectId, { employee_id: selectedEmployeeId.value })
    shareOk.value = true
    selectedEmployeeId.value = ''
    await refreshShares()
  } catch (e) {
    shareError.value = e?.data?.error || e?.message || 'Failed to share project.'
  } finally {
    sharing.value = false
  }
}

async function revoke(shareId: string) {
  revokingId.value = shareId
  shareError.value = ''
  try {
    await revokeShare(props.projectId, shareId)
    await refreshShares()
  } catch (e) {
    shareError.value = e?.data?.error || e?.message || 'Failed to revoke access.'
  } finally {
    revokingId.value = null
  }
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
