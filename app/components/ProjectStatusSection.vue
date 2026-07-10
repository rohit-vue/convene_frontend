<template>
  <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-fg-subtle">Project status</h2>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <span class="text-sm text-fg-muted">Current</span>
      <span class="rounded-full px-3 py-1 text-xs font-medium" :class="statusMeta[currentStatus]?.badge">
        {{ statusMeta[currentStatus]?.label || currentStatus }}
      </span>
    </div>

    <div v-if="!readOnly" class="mt-5 space-y-4 rounded-xl border border-border bg-elevated/60 p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-fg">New status</label>
          <AppSelect
            v-model="newStatus"
            :options="statusSelectOptions"
            placeholder="Select…"
            :input-class="inputClass"
          />
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-fg">
          Comment <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="comment"
          rows="3"
          placeholder="Why is the status changing?"
          :class="inputClass"
        />
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          :disabled="!canSubmit || statusLoading"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="submitStatusChange"
        >
          {{ statusLoading ? 'Updating…' : 'Update status' }}
        </button>
      </div>
    </div>

    <div class="mt-6">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Timeline</h3>
      <div v-if="historyLoading" class="mt-3">
        <ContentLoader variant="table" :rows="3" :columns="3" />
      </div>
      <div v-else-if="!history?.length" class="mt-3 text-sm text-fg-subtle">No status history yet.</div>
      <ol v-else class="mt-4 space-y-0">
        <li
          v-for="(entry, index) in history"
          :key="entry.id"
          class="relative flex gap-4 pb-6"
          :class="index < history.length - 1 ? 'border-l border-border pl-6 ml-2' : 'pl-6 ml-2'"
        >
          <span
            class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white"
            :class="statusMeta[entry.to_status]?.dot || 'bg-slate-400'"
          />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="entry.from_status" class="text-sm text-fg-subtle">
                {{ projectStatusLabel(entry.from_status) }}
                <span class="mx-1">→</span>
              </span>
              <span class="text-sm font-semibold text-fg">
                {{ projectStatusLabel(entry.to_status) }}
              </span>
              <span class="text-xs text-fg-subtle">{{ formatStatusHistoryWhen(entry, history || [], startDate) }}</span>
            </div>
            <p class="mt-1 text-sm text-fg-muted">{{ entry.comment }}</p>
            <p v-if="entry.changed_by_name" class="mt-1 text-xs text-fg-subtle">
              by {{ entry.changed_by_name }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { formInputClass as inputClass } from '~/utils/ui'
const props = defineProps({
  projectId: { type: String, required: true },
  currentStatus: { type: String, required: true },
  startDate: { type: String, default: '' },
  readOnly: { type: Boolean, default: false },
})
const emit = defineEmits(['updated'])

const { getStatusHistory, changeStatus } = useProjects()


const statusMeta = {
  planning: { label: 'Planning', badge: 'bg-elevated text-fg-muted', dot: 'bg-slate-400' },
  active: { label: 'Active', badge: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  on_hold: { label: 'On hold', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', dot: 'bg-amber-500' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400', dot: 'bg-red-500' },
}

const statusSelectOptions = computed(() =>
  projectStatusOptions.map((s) => ({
    ...s,
    disabled: s.value === props.currentStatus,
  })),
)

const newStatus = ref('')
const comment = ref('')
const statusLoading = ref(false)
const toast = useToast()

const { data: history, pending: historyLoading, refresh: refreshHistory } = await useAsyncData(
  `project-status-history-${props.projectId}`,
  () => getStatusHistory(props.projectId),
  { server: false, default: () => [] },
)

const canSubmit = computed(() => {
  return Boolean(
    newStatus.value &&
    newStatus.value !== props.currentStatus &&
    comment.value.trim(),
  )
})

async function submitStatusChange() {
  if (!canSubmit.value) return
  statusLoading.value = true
  try {
    await changeStatus(props.projectId, {
      status: newStatus.value,
      comment: comment.value.trim(),
    })
    newStatus.value = ''
    comment.value = ''
    await refreshHistory()
    emit('updated')
    toast.success('Status updated.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to update status.'))
  } finally {
    statusLoading.value = false
  }
}
</script>
