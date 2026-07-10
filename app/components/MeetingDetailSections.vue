<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div>
        <h2 class="text-lg font-semibold text-fg">Project &amp; account details</h2>
        <p class="mt-1 text-sm text-fg-muted">Core meeting context and project information.</p>
      </div>

      <div v-if="readOnly" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt :class="readOnlyLabelClass">Project name</dt>
          <dd class="mt-1 text-sm text-fg">{{ form.project_name || '—' }}</dd>
        </div>
        <div>
          <dt :class="readOnlyLabelClass">Client name</dt>
          <dd class="mt-1 text-sm text-fg">{{ form.client_name || '—' }}</dd>
        </div>
        <div>
          <dt :class="readOnlyLabelClass">Upwork account</dt>
          <dd class="mt-1 text-sm text-fg">{{ upworkAccountLabel(form.upwork_account) }}</dd>
        </div>
        <div>
          <dt :class="readOnlyLabelClass">Upwork project type</dt>
          <dd class="mt-1 text-sm text-fg">{{ projectTypeLabel(form.project_type) }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt :class="readOnlyLabelClass">Job description</dt>
          <dd class="mt-2 whitespace-pre-wrap text-sm text-fg">{{ form.job_description || '—' }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt :class="readOnlyLabelClass">Upwork link</dt>
          <dd class="mt-2 text-sm">
            <a
              v-if="form.link_url"
              :href="form.link_url"
              target="_blank"
              rel="noopener noreferrer"
              class="break-all font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
            >
              {{ form.link_url }}
            </a>
            <span v-else class="text-fg">—</span>
          </dd>
        </div>
      </div>

      <div v-else class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label :class="labelClass">Project name <span class="text-red-500">*</span></label>
          <input v-model="form.project_name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
        </div>
        <div>
          <label :class="labelClass">Upwork account <span class="text-red-500">*</span></label>
          <AppSelect
            v-model="form.upwork_account"
            :options="upworkAccountOptions"
            placeholder="Select…"
            :input-class="inputClass"
          />
        </div>
        <div>
          <label :class="labelClass">Upwork project type <span class="text-red-500">*</span></label>
          <AppSelect
            v-model="form.project_type"
            :options="projectTypeOptions"
            placeholder="Select…"
            :input-class="inputClass"
          />
        </div>
        <div>
          <label :class="labelClass">Client name <span class="text-red-500">*</span></label>
          <input v-model="form.client_name" required type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
        </div>
        <div class="sm:col-span-2">
          <label :class="labelClass">Upwork link</label>
          <input v-model="form.link_url" type="url" placeholder="https://…" :class="inputClass" />
        </div>
        <div class="sm:col-span-2">
          <label :class="labelClass">Job description</label>
          <textarea v-model="form.job_description" rows="3" placeholder="Role / scope of work…" :class="inputClass" />
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div>
        <h2 class="text-lg font-semibold text-fg">Update timeline</h2>
        <p class="mt-1 text-sm text-fg-muted">
          {{ readOnly
            ? 'Every saved meeting update for this project and its logistics.'
            : 'Review every saved meeting update for this project and open any version to inspect its logistics.' }}
        </p>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div class="space-y-2">
          <button
            v-for="item in meetingUpdates"
            :key="item.id"
            type="button"
            class="w-full rounded-xl border px-4 py-3 text-left transition"
            :class="item.id === selectedUpdateId
              ? 'border-indigo-200 bg-indigo-50 dark:bg-indigo-950 shadow-sm'
              : 'border-border bg-surface hover:border-border hover:bg-elevated'"
            @click="selectUpdate(item.id)"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-fg">{{ formatTimelineLabel(item.meeting_at) }}</span>
              <span class="rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-fg-muted">
                {{ meetingOutcomeLabel(item.meeting_outcome) }}
              </span>
            </div>
            <p class="mt-1 text-sm text-fg-muted">{{ form.project_name || 'Untitled meeting' }}</p>
          </button>

          <div v-if="!meetingUpdates?.length" class="rounded-xl border border-dashed border-border bg-elevated px-4 py-5 text-sm text-fg-muted">
            No updates yet for this project.
          </div>
        </div>

        <div class="rounded-2xl border border-border bg-elevated p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-fg">{{ form.project_name || 'Untitled meeting' }}</p>
              <p class="mt-1 text-sm text-fg-muted">{{ form.client_name || '—' }}</p>
            </div>
            <span v-if="selectedUpdate" class="rounded-full bg-surface px-3 py-1 text-xs font-medium text-fg-muted shadow-sm">
              {{ formatTimelineLabel(selectedUpdate.meeting_at) }}
            </span>
          </div>

          <section class="mt-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 class="text-sm font-semibold text-fg">Meeting logistics</h3>

            <div v-if="selectedUpdate && readOnly" class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <dt :class="readOnlyLabelClass">Date &amp; time</dt>
                <dd class="mt-1 text-sm text-fg">{{ formatDateTime(selectedUpdate.meeting_at) }}</dd>
              </div>
              <div>
                <dt :class="readOnlyLabelClass">Meeting outcome</dt>
                <dd class="mt-1 text-sm text-fg">{{ meetingOutcomeLabel(selectedUpdate.meeting_outcome) }}</dd>
              </div>
              <div>
                <dt :class="readOnlyLabelClass">Duration</dt>
                <dd class="mt-1 text-sm text-fg">
                  {{ selectedUpdate.duration_minutes ? `${selectedUpdate.duration_minutes} min` : '—' }}
                </dd>
              </div>
              <div>
                <dt :class="readOnlyLabelClass">Budget discussed</dt>
                <dd class="mt-1 text-sm text-fg">{{ formatBudgetLabel(selectedUpdate.budget_discussed) }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt :class="readOnlyLabelClass">Deadline / expected timeline</dt>
                <dd class="mt-1 text-sm text-fg">{{ selectedUpdate.deadline || '—' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt :class="readOnlyLabelClass">Notes / meeting summary</dt>
                <dd class="mt-2 whitespace-pre-wrap text-sm text-fg">{{ selectedUpdate.notes || '—' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt :class="readOnlyLabelClass">Requirements discussed</dt>
                <dd class="mt-2 whitespace-pre-wrap text-sm text-fg">{{ selectedUpdate.requirements_discussed || '—' }}</dd>
              </div>
            </div>

            <div v-else-if="selectedUpdate" class="mt-6 grid grid-cols-1 gap-4">
              <div>
                <label :class="labelClass">Date &amp; time <span class="text-red-500">*</span></label>
                <DateTimePicker
                  :model-value="logisticsForm.meeting_at"
                  placeholder="Select date & time"
                  :input-class="inputClass"
                  full-width
                  @update:model-value="updateLogisticsField('meeting_at', $event)"
                />
              </div>
              <div>
                <label :class="labelClass">Duration (min)</label>
                <input
                  :value="logisticsForm.duration_minutes"
                  type="number"
                  min="0"
                  placeholder="30"
                  :class="inputClass"
                  @input="updateLogisticsField('duration_minutes', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div>
                <label :class="labelClass">Budget discussed</label>
                <BudgetInput
                  :model-value="logisticsForm.budget_discussed"
                  :input-class="inputClass"
                  @update:model-value="updateLogisticsField('budget_discussed', $event)"
                />
              </div>
              <div>
                <label :class="labelClass">Deadline / expected timeline</label>
                <input
                  :value="logisticsForm.deadline"
                  type="text"
                  placeholder="e.g. 6 weeks"
                  :class="inputClass"
                  @input="updateLogisticsField('deadline', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div>
                <label :class="labelClass">Notes / meeting summary</label>
                <textarea
                  :value="logisticsForm.notes"
                  rows="4"
                  placeholder="What was discussed…"
                  :class="inputClass"
                  @input="updateLogisticsField('notes', ($event.target as HTMLTextAreaElement).value)"
                />
              </div>
              <div>
                <label :class="labelClass">Requirements discussed</label>
                <textarea
                  :value="logisticsForm.requirements_discussed"
                  rows="4"
                  placeholder="Client requirements…"
                  :class="inputClass"
                  @input="updateLogisticsField('requirements_discussed', ($event.target as HTMLTextAreaElement).value)"
                />
              </div>
            </div>

            <p v-else class="mt-6 text-sm text-fg-muted">Choose a timeline entry to review its logistics.</p>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formInputClass as inputClass } from '~/utils/ui'
import type { MeetingUpdate } from '~/types/meetings'

const props = defineProps({
  readOnly: { type: Boolean, default: false },
  form: { type: Object, required: true },
  logisticsForm: { type: Object, default: () => ({}) },
  meetingUpdates: { type: Array as () => MeetingUpdate[], default: () => [] },
})

const selectedUpdateId = defineModel<string | null>('selectedUpdateId', { default: null })

const labelClass = 'mb-1 block text-sm font-medium text-fg'
const readOnlyLabelClass = 'text-xs font-medium uppercase tracking-wide text-fg-subtle'

const selectedUpdate = computed(() => {
  if (!props.meetingUpdates?.length) return null
  if (!selectedUpdateId.value) return props.meetingUpdates[0]
  return props.meetingUpdates.find((item) => item.id === selectedUpdateId.value) || props.meetingUpdates[0]
})

watch(
  () => props.meetingUpdates,
  (items) => {
    if (items?.length && !items.some((item) => item.id === selectedUpdateId.value)) {
      selectedUpdateId.value = items[0].id
    }
  },
  { immediate: true },
)

function selectUpdate(id: string) {
  selectedUpdateId.value = id
}

function updateLogisticsField(key: string, value: string) {
  if (props.logisticsForm) {
    props.logisticsForm[key] = value
  }
}

function formatTimelineLabel(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>
