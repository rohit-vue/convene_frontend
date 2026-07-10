<template>
  <div>
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold tracking-tight">Upwork Bids</h1>
        <p class="mt-1 text-sm text-slate-500">
          Track bids submitted across your Upwork accounts, grouped by day.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isExporting || isLoading || !filteredBids.length"
          @click="exportPdf"
        >
          {{ isExporting ? 'Exporting…' : 'Export PDF' }}
        </button>
        <button
          type="button"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          @click="openAdd"
        >
          + Add bid
        </button>
      </div>
    </div>

    <div class="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label :class="filterLabelClass">Date</label>
            <DateFilterPicker
              v-model="filterDate"
              :marked-dates="markedDates"
              placeholder="All dates"
              :input-class="filterInputClass"
            />
          </div>
          <div>
            <label :class="filterLabelClass">Upwork account</label>
            <AppSelect
              v-model="filterUpworkAccount"
              :options="upworkFilterOptions"
              placeholder="All accounts"
              :input-class="filterInputClass"
              :full-width="false"
            />
          </div>
        </div>
      </div>
    </div>

    <ContentLoader v-if="isLoading" variant="groups" :rows="2" :columns="5" />

    <div v-else-if="!bidGroups.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
      <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
      </div>
      <h3 class="mt-4 font-semibold text-slate-800">
        {{ bids?.length && hasActiveFilters ? 'No matching bids' : 'No bids yet' }}
      </h3>
      <p class="mt-1 text-sm text-slate-500">
        {{ emptyMessage }}
      </p>
      <button
        class="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        @click="openAdd"
      >
        + Add bid
      </button>
    </div>

    <div v-else class="space-y-6">
      <section
        v-for="group in bidGroups"
        :key="group.date"
        class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
      >
        <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 class="text-sm font-semibold text-slate-800">
            {{ group.label }}
            <span class="font-normal text-slate-500">· {{ group.bids.length }} {{ group.bids.length === 1 ? 'bid' : 'bids' }}</span>
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1080px] table-fixed text-sm">
          <thead class="bg-white text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="w-[11%] px-4 py-3 font-medium">Upwork account</th>
              <th class="w-[21%] px-4 py-3 font-medium">Job link</th>
              <th class="w-[9%] px-4 py-3 font-medium">Status</th>
              <th class="w-[8%] px-4 py-3 font-medium">Project type</th>
              <th class="w-[8%] px-4 py-3 font-medium">Amount</th>
              <th class="w-[14%] px-4 py-3 font-medium">Notes</th>
              <th class="w-[14%] px-4 py-3 font-medium">Added at</th>
              <th class="w-[15%] min-w-[8.5rem] px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="bid in group.bids"
              :key="bid.id"
              class="cursor-pointer transition hover:bg-slate-50"
              @click="openView(bid)"
            >
              <td class="overflow-hidden px-4 py-4 font-medium text-slate-800">
                <span class="block truncate" :title="upworkAccountLabel(bid.upwork_account)">
                  {{ upworkAccountLabel(bid.upwork_account) }}
                </span>
              </td>
              <td class="overflow-hidden px-4 py-4" @click.stop>
                <a
                  :href="bid.job_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block truncate text-indigo-600 transition hover:text-indigo-700"
                  :title="bid.job_link"
                >
                  {{ bid.job_link }}
                </a>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="bidStatusBadgeClass(bid.status)"
                >
                  {{ bidStatusLabel(bid.status) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-slate-600">{{ bidJobTypeLabel(bid.job_type) }}</td>
              <td class="whitespace-nowrap px-4 py-4 font-medium text-slate-800">
                {{ formatBidAmount(bid) }}
              </td>
              <td class="overflow-hidden px-4 py-4 text-slate-600">
                <AppTooltip
                  v-if="bid.notes"
                  :content="bid.notes"
                  class="w-full"
                >
                  <span class="line-clamp-2 w-full break-words">{{ bid.notes }}</span>
                </AppTooltip>
                <span v-else>—</span>
              </td>
              <td class="overflow-hidden px-4 py-4 text-slate-500">
                <span class="block truncate" :title="formatDateTime(bid.created_at)">
                  {{ formatDateTime(bid.created_at) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-right" @click.stop>
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                  @click="openEdit(bid)"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </section>
    </div>

    <AdminAddBidModal
      :open="showModal"
      :bid="editingBid"
      @close="closeModal"
      @saved="onSaved"
    />

    <AdminViewBidModal
      :open="showViewModal"
      :bid="selectedBid"
      @close="closeView"
      @edit="openEditFromView"
    />

  </div>
</template>

<script setup lang="ts">
import type { UpworkBid } from '~/types/bids'
import { bidJobTypeLabel, bidStatusBadgeClass, bidStatusLabel, formatBidAmount, groupBidsByDay } from '~/utils/bids'
import { exportBidsPdf } from '~/utils/exportPdf'

definePageMeta({ middleware: 'admin' })

const { list } = useBids()
const toast = useToast()

const showModal = ref(false)
const showViewModal = ref(false)
const selectedBid = ref<UpworkBid | null>(null)
const editingBid = ref<UpworkBid | null>(null)
const isExporting = ref(false)
const filterDate = ref('')
const filterUpworkAccount = ref('')

const filterLabelClass = 'mb-1 block text-xs font-medium text-slate-500'
const filterInputClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

const upworkFilterOptions = computed(() => [
  { value: '', label: 'All accounts' },
  ...upworkAccountOptions,
])

const { data: bids, status, refresh } = await useAsyncData(
  'upwork-bids',
  () =>
    list(
      filterUpworkAccount.value
        ? { upwork_account: filterUpworkAccount.value }
        : undefined,
    ),
  { server: false, default: () => [], watch: [filterUpworkAccount] },
)

const isLoading = computed(() => status.value !== 'success' && status.value !== 'error')

const markedDates = computed(() =>
  collectDateKeys((bids.value || []).map((bid) => bid.bid_date)),
)

function bidDateKey(bid: UpworkBid): string {
  return bid.bid_date?.slice(0, 10) || bid.created_at.slice(0, 10)
}

const filteredBids = computed(() => {
  const items = bids.value || []
  if (!filterDate.value) return items
  return items.filter((bid) => bidDateKey(bid) === filterDate.value)
})

const bidGroups = computed(() => groupBidsByDay(filteredBids.value))

const hasActiveFilters = computed(() =>
  Boolean(filterDate.value || filterUpworkAccount.value),
)

const emptyMessage = computed(() => {
  if (!bids.value?.length) return 'Add your first bid to start tracking.'
  if (hasActiveFilters.value) return 'No bids match the selected filters.'
  return 'Add your first bid to start tracking.'
})

async function onSaved() {
  closeModal()
  await refresh()
}

async function exportPdf() {
  if (isExporting.value || !filteredBids.value.length) return
  isExporting.value = true
  try {
    await exportBidsPdf(filteredBids.value)
    toast.success('Bids PDF downloaded.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to export bids PDF.'))
  } finally {
    isExporting.value = false
  }
}

function openAdd() {
  editingBid.value = null
  showModal.value = true
}

function openEdit(bid: UpworkBid) {
  editingBid.value = bid
  showModal.value = true
}

function openEditFromView() {
  if (!selectedBid.value) return
  const bid = selectedBid.value
  closeView()
  openEdit(bid)
}

function closeModal() {
  showModal.value = false
  editingBid.value = null
}

function openView(bid: UpworkBid) {
  selectedBid.value = bid
  showViewModal.value = true
}

function closeView() {
  showViewModal.value = false
  selectedBid.value = null
}

function formatDateTime(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>
