<template>
  <div
    v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-lg rounded-2xl bg-surface shadow-xl">
      <div class="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 class="text-lg font-semibold text-fg">{{ isEdit ? 'Edit bid' : 'Add bid' }}</h2>
        <button
          class="grid h-8 w-8 place-items-center rounded-lg text-fg-subtle transition hover:bg-elevated hover:text-fg-muted"
          @click="close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <form class="space-y-5 px-6 py-5" @submit.prevent="save">
        <div>
          <label class="mb-1 block text-sm font-medium text-fg">
            Upwork account <span class="text-red-500">*</span>
          </label>
          <AppSelect
            v-model="form.upwork_account"
            :options="upworkAccountOptions"
            placeholder="Select account…"
            :input-class="inputClass"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">
            Job link <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.job_link"
            required
            type="url"
            placeholder="https://www.upwork.com/jobs/…"
            :class="inputClass"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Status</label>
            <AppSelect
              v-model="form.status"
              :options="bidStatusOptions"
              :input-class="inputClass"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">
              Project type <span class="text-red-500">*</span>
            </label>
            <AppSelect
              v-model="form.job_type"
              :options="bidJobTypeOptions"
              placeholder="Select…"
              :input-class="inputClass"
            />
          </div>
        </div>

        <div v-if="form.job_type === 'hourly'">
          <label class="mb-1 block text-sm font-medium text-fg">
            Hourly rate <span class="text-red-500">*</span>
          </label>
          <BudgetInput v-model="form.hourly_rate" :input-class="inputClass" placeholder="50" />
        </div>

        <div v-else-if="form.job_type === 'fixed'">
          <label class="mb-1 block text-sm font-medium text-fg">
            Fixed amount <span class="text-red-500">*</span>
          </label>
          <BudgetInput v-model="form.fixed_amount" :input-class="inputClass" placeholder="1000" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Bid date</label>
          <DatePicker
            v-model="form.bid_date"
            placeholder="Select date"
            :max="maxBidDate"
            :input-class="inputClass"
            full-width
          />
          <p class="mt-1 text-xs text-fg-subtle">Defaults to today if left unchanged.</p>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Optional context about this bid…"
            :class="inputClass"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex justify-end gap-3 border-t border-border pt-4">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-fg-muted hover:bg-elevated" @click="close">
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add bid' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">

import { formInputClass as inputClass } from '~/utils/ui'
import type { BidJobType, BidStatus, UpworkBid } from '~/types/bids'
import { bidJobTypeOptions, bidStatusOptions } from '~/utils/bids'

const props = defineProps<{
  open: boolean
  bid?: UpworkBid | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { create, update } = useBids()


const loading = ref(false)
const error = ref('')
const toast = useToast()

const isEdit = computed(() => Boolean(props.bid?.id))
const maxBidDate = todayDateKey()

function blankForm() {
  return {
    upwork_account: '',
    job_link: '',
    status: 'applied' as BidStatus,
    job_type: '' as BidJobType | '',
    hourly_rate: '',
    fixed_amount: '',
    bid_date: todayDateKey(),
    notes: '',
  }
}

const form = reactive(blankForm())

function hydrate() {
  if (props.bid) {
    Object.assign(form, {
      upwork_account: props.bid.upwork_account ?? '',
      job_link: props.bid.job_link ?? '',
      status: props.bid.status ?? 'applied',
      job_type: props.bid.job_type ?? '',
      hourly_rate: props.bid.hourly_rate != null ? String(props.bid.hourly_rate) : '',
      fixed_amount: props.bid.fixed_amount != null ? String(props.bid.fixed_amount) : '',
      bid_date: props.bid.bid_date?.slice(0, 10) || todayDateKey(),
      notes: props.bid.notes ?? '',
    })
  } else {
    Object.assign(form, blankForm())
  }
  error.value = ''
}

watch(
  () => form.job_type,
  (type) => {
    if (type === 'hourly') form.fixed_amount = ''
    if (type === 'fixed') form.hourly_rate = ''
  },
)

watch(
  () => [props.open, props.bid] as const,
  ([isOpen]) => {
    if (isOpen) hydrate()
  },
)

function close() {
  emit('close')
}

async function save() {
  if (!form.upwork_account) {
    error.value = 'Upwork account is required.'
    toast.error(error.value)
    return
  }
  if (!form.job_link.trim()) {
    error.value = 'Job link is required.'
    toast.error(error.value)
    return
  }
  if (!form.job_type) {
    error.value = 'Project type is required.'
    toast.error(error.value)
    return
  }
  if (form.job_type === 'hourly' && !form.hourly_rate) {
    error.value = 'Hourly rate is required for hourly bids.'
    toast.error(error.value)
    return
  }
  if (form.job_type === 'fixed' && !form.fixed_amount) {
    error.value = 'Fixed amount is required for fixed bids.'
    toast.error(error.value)
    return
  }

  loading.value = true
  error.value = ''
  const payload = {
    upwork_account: form.upwork_account,
    job_link: form.job_link.trim(),
    status: form.status,
    job_type: form.job_type as BidJobType,
    hourly_rate:
      form.job_type === 'hourly' ? sanitizeBudgetInput(form.hourly_rate) : undefined,
    fixed_amount:
      form.job_type === 'fixed' ? sanitizeBudgetInput(form.fixed_amount) : undefined,
    bid_date: form.bid_date || undefined,
    notes: form.notes.trim() || undefined,
  }

  try {
    if (isEdit.value && props.bid) {
      await update(props.bid.id, payload)
      toast.success('Bid updated.')
    } else {
      await create(payload)
      toast.success('Bid added.')
    }
    emit('saved')
    close()
  } catch (e: any) {
    error.value = toastErrorMessage(e, `Failed to ${isEdit.value ? 'update' : 'add'} bid.`)
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>
