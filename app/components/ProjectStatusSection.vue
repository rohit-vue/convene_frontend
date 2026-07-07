<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Project status</h2>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <span class="text-sm text-slate-500">Current</span>
      <span class="rounded-full px-3 py-1 text-xs font-medium" :class="statusMeta[currentStatus]?.badge">
        {{ statusMeta[currentStatus]?.label || currentStatus }}
      </span>
    </div>

    <div v-if="!readOnly" class="mt-5 space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">New status</label>
          <AppSelect
            v-model="newStatus"
            :options="statusSelectOptions"
            placeholder="Select…"
            :input-class="inputClass"
          />
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">
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
        <p v-if="statusError" class="text-sm text-red-600">{{ statusError }}</p>
        <p v-else-if="statusOk" class="text-sm text-emerald-700">Status updated.</p>
      </div>
    </div>

    <div class="mt-6">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400">Timeline</h3>
      <div v-if="historyLoading" class="mt-3 text-sm text-slate-400">Loading history…</div>
      <div v-else-if="!history?.length" class="mt-3 text-sm text-slate-400">No status history yet.</div>
      <ol v-else class="mt-4 space-y-0">
        <li
          v-for="(entry, index) in history"
          :key="entry.id"
          class="relative flex gap-4 pb-6"
          :class="index < history.length - 1 ? 'border-l border-slate-200 pl-6 ml-2' : 'pl-6 ml-2'"
        >
          <span
            class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white"
            :class="statusMeta[entry.to_status]?.dot || 'bg-slate-400'"
          />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="entry.from_status" class="text-sm text-slate-400">
                {{ projectStatusLabel(entry.from_status) }}
                <span class="mx-1">→</span>
              </span>
              <span class="text-sm font-semibold text-slate-800">
                {{ projectStatusLabel(entry.to_status) }}
              </span>
              <span class="text-xs text-slate-400">{{ formatDateTime(entry.created_at) }}</span>
            </div>
            <p class="mt-1 text-sm text-slate-600">{{ entry.comment }}</p>
            <p v-if="entry.changed_by_name" class="mt-1 text-xs text-slate-400">
              by {{ entry.changed_by_name }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  projectId: { type: String, required: true },
  currentStatus: { type: String, required: true },
  readOnly: { type: Boolean, default: false },
})
const emit = defineEmits(['updated'])

const { getStatusHistory, changeStatus } = useProjects()

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

const statusMeta = {
  planning: { label: 'Planning', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  active: { label: 'Active', badge: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500' },
  on_hold: { label: 'On hold', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
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
const statusError = ref('')
const statusOk = ref(false)

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
  statusError.value = ''
  statusOk.value = false
  try {
    await changeStatus(props.projectId, {
      status: newStatus.value,
      comment: comment.value.trim(),
    })
    statusOk.value = true
    newStatus.value = ''
    comment.value = ''
    await refreshHistory()
    emit('updated')
  } catch (e) {
    statusError.value = e?.data?.error || e?.message || 'Failed to update status.'
  } finally {
    statusLoading.value = false
  }
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>
