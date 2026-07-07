<template>
  <div
    v-if="open && bid"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="w-full max-w-md rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="delete-bid-title">
      <div class="px-6 pt-6">
        <div class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </div>

        <h2 id="delete-bid-title" class="mt-4 text-center text-lg font-semibold text-slate-800">
          Delete this bid?
        </h2>
        <p class="mt-2 text-center text-sm text-slate-500">
          This action cannot be undone. The bid will be permanently removed.
        </p>

        <div class="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
          <p class="font-medium text-slate-800">{{ upworkAccountLabel(bid.upwork_account) }}</p>
          <p class="mt-1 truncate text-slate-500" :title="bid.job_link">{{ bid.job_link }}</p>
          <p class="mt-1 text-slate-600">{{ formatBidAmount(bid) }} · {{ bidJobTypeLabel(bid.job_type) }}</p>
        </div>

        <p v-if="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</p>
      </div>

      <div class="mt-6 flex gap-3 border-t border-slate-100 px-6 py-4">
        <button
          type="button"
          class="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          :disabled="loading"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          :disabled="loading"
          @click="confirm"
        >
          {{ loading ? 'Deleting…' : 'Delete bid' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UpworkBid } from '~/types/bids'
import { bidJobTypeLabel, formatBidAmount } from '~/utils/bids'

defineProps<{
  open: boolean
  bid: UpworkBid | null
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

function close() {
  emit('close')
}

function confirm() {
  emit('confirm')
}
</script>
