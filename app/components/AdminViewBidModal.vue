<template>
  <div
    v-if="open && bid"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 class="text-lg font-semibold text-slate-800">Bid details</h2>
        <button
          class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          @click="close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div class="space-y-5 px-6 py-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Upwork account</p>
            <p class="mt-1 text-sm font-semibold text-slate-800">{{ upworkAccountLabel(bid.upwork_account) }}</p>
          </div>
          <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
            :class="bidStatusBadgeClass(bid.status)"
          >
            {{ bidStatusLabel(bid.status) }}
          </span>
        </div>

        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Bid date</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ formatBidDate(bid.bid_date) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Project type</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ bidJobTypeLabel(bid.job_type) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Amount</dt>
            <dd class="mt-1 text-sm font-medium text-slate-800">{{ formatBidAmount(bid) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Added at</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ formatDateTime(bid.created_at) }}</dd>
          </div>
        </dl>

        <div>
          <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Job link</dt>
          <dd class="mt-1">
            <a
              :href="bid.job_link"
              target="_blank"
              rel="noopener noreferrer"
              class="break-all text-sm text-indigo-600 transition hover:text-indigo-700"
            >
              {{ bid.job_link }}
            </a>
          </dd>
        </div>

        <div>
          <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</dt>
          <dd class="mt-1 whitespace-pre-wrap text-sm text-slate-700">{{ bid.notes || '—' }}</dd>
        </div>
      </div>

      <div class="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          @click="close"
        >
          Close
        </button>
        <button
          type="button"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          @click="edit"
        >
          Edit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpworkBid } from '~/types/bids'
import { bidJobTypeLabel, bidStatusBadgeClass, bidStatusLabel, formatBidAmount } from '~/utils/bids'

const props = defineProps<{
  open: boolean
  bid: UpworkBid | null
}>()

const emit = defineEmits<{
  close: []
  edit: []
}>()

function close() {
  emit('close')
}

function edit() {
  emit('edit')
}

function formatBidDate(value: string) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>
