<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-400">Milestones</h2>

    <div v-if="activeMilestone" class="mt-4 flex flex-wrap items-center gap-3">
      <span class="text-sm text-slate-500">Current</span>
      <span class="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
        Milestone {{ activeMilestone.milestone_number }} · {{ formatMilestoneCostLabel(activeMilestone.amount) }}
      </span>
      <span class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
    </div>
    <p v-else-if="!milestones?.length" class="mt-4 text-sm text-slate-500">No milestones added yet.</p>
    <p v-else-if="!readOnly && projectStatus !== 'active'" class="mt-4 text-sm text-slate-500">
      All milestones are closed while this project is not active.
    </p>
    <p v-else-if="!readOnly" class="mt-4 text-sm text-slate-500">No active milestone.</p>

    <div v-if="canAddMilestone" class="mt-5 space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            {{ nextMilestoneLabel }} amount <span class="text-red-500">*</span>
          </label>
          <BudgetInput v-model="newAmount" :input-class="inputClass" placeholder="5000" />
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">
          Comment <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="comment"
          rows="3"
          :placeholder="commentPlaceholder"
          :class="inputClass"
        />
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          :disabled="!canSubmit || saving"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="submitMilestone"
        >
          {{ saving ? 'Saving…' : submitLabel }}
        </button>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-else-if="ok" class="text-sm text-emerald-700">{{ ok }}</p>
      </div>
    </div>

    <p
      v-else-if="!readOnly"
      class="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
    >
      Set the project status to <strong>Active</strong> to add a new milestone.
    </p>

    <div class="mt-6">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400">All milestones</h3>
      <div v-if="milestonesLoading" class="mt-3 text-sm text-slate-400">Loading milestones…</div>
      <div v-else-if="!milestones?.length" class="mt-3 text-sm text-slate-400">No milestones yet.</div>
      <ol v-else class="mt-4 space-y-0">
        <li
          v-for="(entry, index) in sortedMilestones"
          :key="entry.id"
          class="relative flex gap-4 pb-6"
          :class="index < sortedMilestones.length - 1 ? 'border-l border-slate-200 pl-6 ml-2' : 'pl-6 ml-2'"
        >
          <span
            class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white"
            :class="entry.status === 'active' ? 'bg-emerald-500' : 'bg-violet-400'"
          />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-slate-800">
                Milestone {{ entry.milestone_number }}
              </span>
              <span class="text-sm text-slate-600">{{ formatMilestoneCostLabel(entry.amount) }}</span>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="entry.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ entry.status === 'active' ? 'Active' : 'Completed' }}
              </span>
              <span class="text-xs text-slate-400">{{ formatDateTime(entry.created_at) }}</span>
            </div>
            <p class="mt-1 text-sm text-slate-600">{{ entry.comment }}</p>
            <p v-if="entry.created_by_name" class="mt-1 text-xs text-slate-400">
              by {{ entry.created_by_name }}
            </p>
            <p v-if="entry.completed_at" class="mt-1 text-xs text-slate-400">
              Completed {{ formatDateTime(entry.completed_at) }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectMilestone } from '~/types/projects'

const props = defineProps({
  projectId: { type: String, required: true },
  projectStatus: { type: String, default: 'active' },
  readOnly: { type: Boolean, default: false },
  adminEmployeeId: { type: String, default: '' },
})

const emit = defineEmits(['updated'])

const { getMilestones, addMilestone, getAdminMilestones } = useProjects()

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

const newAmount = ref('')
const comment = ref('')
const saving = ref(false)
const error = ref('')
const ok = ref('')

const milestonesKey = computed(() =>
  props.adminEmployeeId
    ? `admin-milestones-${props.adminEmployeeId}-${props.projectId}`
    : `milestones-${props.projectId}`,
)

const fetchMilestones = () =>
  props.adminEmployeeId
    ? getAdminMilestones(props.adminEmployeeId, props.projectId)
    : getMilestones(props.projectId)

const { data: milestones, pending: milestonesLoading, refresh: refreshMilestones } = await useAsyncData(
  () => milestonesKey.value,
  () => fetchMilestones(),
  { server: false, default: () => [] as ProjectMilestone[] },
)

const sortedMilestones = computed(() =>
  [...(milestones.value || [])].sort((a, b) => b.milestone_number - a.milestone_number),
)

const activeMilestone = computed(() =>
  (milestones.value || []).find((entry) => entry.status === 'active') || null,
)

const canAddMilestone = computed(() => !props.readOnly && props.projectStatus === 'active')

watch(
  () => props.projectStatus,
  () => {
    refreshMilestones()
  },
)

const nextMilestoneNumber = computed(() => {
  const items = milestones.value || []
  if (!items.length) return 1
  return Math.max(...items.map((entry) => entry.milestone_number)) + 1
})

const nextMilestoneLabel = computed(() => `Milestone ${nextMilestoneNumber.value}`)

const submitLabel = computed(() =>
  activeMilestone.value ? `Complete & add milestone ${nextMilestoneNumber.value}` : 'Add milestone 1',
)

const commentPlaceholder = computed(() =>
  activeMilestone.value
    ? `e.g. Milestone ${activeMilestone.value.milestone_number} delivered, starting milestone ${nextMilestoneNumber.value}`
    : 'e.g. Initial contract milestone agreed with client',
)

const canSubmit = computed(() =>
  Boolean(sanitizeBudgetInput(newAmount.value) && comment.value.trim()),
)

async function submitMilestone() {
  if (!canSubmit.value) return
  saving.value = true
  error.value = ''
  ok.value = ''
  const completedNumber = activeMilestone.value?.milestone_number ?? null
  const addedNumber = nextMilestoneNumber.value
  try {
    await addMilestone(props.projectId, {
      amount: sanitizeBudgetInput(newAmount.value),
      comment: comment.value.trim(),
    })
    ok.value = completedNumber
      ? `Milestone ${completedNumber} completed. Milestone ${addedNumber} is now active.`
      : 'Milestone 1 added.'
    newAmount.value = ''
    comment.value = ''
    await refreshMilestones()
    emit('updated')
  } catch (e) {
    error.value = e?.data?.error || e?.message || 'Failed to add milestone.'
  } finally {
    saving.value = false
  }
}

function formatDateTime(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>
