<template>
  <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Share project</h2>
    <p class="mt-1 text-sm text-fg-muted">
      Grant another employee access to view this project and add their own daily logs.
    </p>

    <div class="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-elevated/60 p-4">
      <div class="min-w-0 w-full flex-1 sm:min-w-[200px]">
        <label class="mb-1 block text-sm font-medium text-fg">Employee</label>
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
        class="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        @click="grantShare"
      >
        {{ sharing ? 'Sharing…' : 'Share access' }}
      </button>
    </div>

    <div class="mt-6">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-fg-subtle">People with access</h3>
      <div v-if="sharesLoading" class="mt-3">
        <ContentLoader variant="table" :rows="2" :columns="3" />
      </div>
      <div v-else-if="!shares?.length" class="mt-3 text-sm text-fg-subtle">Not shared with anyone yet.</div>
      <ul v-else class="mt-4 divide-y divide-border rounded-xl border border-border">
        <li
          v-for="share in shares"
          :key="share.id"
          class="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div>
            <p class="text-sm font-medium text-fg">{{ share.shared_with_name || 'Employee' }}</p>
            <p class="text-xs text-fg-subtle">
              Shared {{ formatDate(share.created_at) }}
              <span v-if="!share.can_edit_logs"> · view only</span>
            </p>
          </div>
          <button
            v-if="share.can_edit_logs"
            type="button"
            :disabled="revokingId === share.id"
            class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted transition hover:bg-elevated disabled:opacity-60"
            @click="revoke(share.id)"
          >
            {{ revokingId === share.id ? 'Revoking…' : 'Revoke log access' }}
          </button>
          <span
            v-else
            class="rounded-full bg-elevated px-2.5 py-0.5 text-xs font-medium text-fg-muted"
          >
            View only
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formInputClass as inputClass } from '~/utils/ui'
import type { ProjectShare } from '~/types/projects'

const props = defineProps({
  projectId: { type: String, required: true },
})

const { listShares, shareProject, revokeShare } = useProjects()
const { getOptions } = useEmployees()


const selectedEmployeeId = ref('')
const sharing = ref(false)
const toast = useToast()
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
  try {
    await shareProject(props.projectId, { employee_id: selectedEmployeeId.value })
    selectedEmployeeId.value = ''
    await refreshShares()
    toast.success('Project shared.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to share project.'))
  } finally {
    sharing.value = false
  }
}

async function revoke(shareId: string) {
  revokingId.value = shareId
  try {
    await revokeShare(props.projectId, shareId)
    await refreshShares()
    toast.success('Access revoked.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to revoke access.'))
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
