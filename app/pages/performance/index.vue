<template>
  <div>
    <div class="mb-6 sm:mb-8">
      <h1 class="text-xl font-bold tracking-tight sm:text-2xl">Performance</h1>
      <p class="mt-1 text-sm text-fg-muted">
        Win rates, project cycle time, and hours versus estimate across accounts.
      </p>
    </div>

    <div class="mb-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div class="bg-elevated px-4 py-4 sm:px-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
          <div class="w-full sm:w-auto">
            <label :class="filterLabelClass">From</label>
            <DatePicker
              v-model="filterFrom"
              placeholder="All time"
              :input-class="filterInputClass"
              full-width
            />
          </div>
          <div class="w-full sm:w-auto">
            <label :class="filterLabelClass">To</label>
            <DatePicker
              v-model="filterTo"
              placeholder="All time"
              :input-class="filterInputClass"
              full-width
            />
          </div>
          <div class="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              :disabled="isLoading"
              @click="applyFilters"
            >
              Apply
            </button>
            <button
              type="button"
              class="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-elevated disabled:opacity-60"
              :disabled="isLoading || (!filterFrom && !filterTo)"
              @click="clearFilters"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <ContentLoader v-if="isLoading" variant="dashboard" :stats-count="4" />

    <div
      v-else-if="loadError"
      class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ loadError }}
    </div>

    <div v-else-if="performance" class="space-y-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
        >
          <p class="text-sm font-medium text-fg-muted">{{ card.label }}</p>
          <p class="mt-3 text-3xl font-bold tracking-tight text-fg">{{ card.value }}</p>
          <p class="mt-1 text-xs text-fg-subtle">{{ card.hint }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div class="border-b border-border bg-elevated px-4 py-4 sm:px-6">
            <h2 class="text-lg font-semibold text-fg">Meeting win rate by account</h2>
            <p class="mt-0.5 text-sm text-fg-muted">Share of meetings marked won</p>
          </div>
          <div
            v-if="!meetingRows.length"
            class="px-4 py-10 text-center text-sm text-fg-subtle sm:px-6"
          >
            No meetings in this range.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[420px] text-sm">
              <thead class="bg-elevated text-left text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th class="px-4 py-3 font-medium sm:px-6">Account</th>
                  <th class="px-4 py-3 font-medium">Won</th>
                  <th class="px-4 py-3 font-medium">Total</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Rate</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="row in meetingRows" :key="`meet-${row.account}`">
                  <td class="px-4 py-3 font-medium text-fg sm:px-6">
                    {{ accountLabel(row.account) }}
                  </td>
                  <td class="px-4 py-3 text-fg-muted">{{ row.won }}</td>
                  <td class="px-4 py-3 text-fg-muted">{{ row.total }}</td>
                  <td class="px-4 py-3 sm:px-6">
                    <div class="flex items-center gap-2">
                      <div class="h-2 w-20 overflow-hidden rounded-full bg-elevated">
                        <div
                          class="h-full rounded-full bg-emerald-500"
                          :style="{ width: `${Math.round((row.rate || 0) * 100)}%` }"
                        />
                      </div>
                      <span class="tabular-nums font-semibold text-fg">{{ formatRate(row.rate) }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div class="border-b border-border bg-elevated px-4 py-4 sm:px-6">
            <h2 class="text-lg font-semibold text-fg">Bid accept rate by account</h2>
            <p class="mt-0.5 text-sm text-fg-muted">Share of bids marked accepted</p>
          </div>
          <div
            v-if="!bidRows.length"
            class="px-4 py-10 text-center text-sm text-fg-subtle sm:px-6"
          >
            No bids in this range.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[420px] text-sm">
              <thead class="bg-elevated text-left text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th class="px-4 py-3 font-medium sm:px-6">Account</th>
                  <th class="px-4 py-3 font-medium">Accepted</th>
                  <th class="px-4 py-3 font-medium">Total</th>
                  <th class="px-4 py-3 font-medium sm:px-6">Rate</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="row in bidRows" :key="`bid-${row.account}`">
                  <td class="px-4 py-3 font-medium text-fg sm:px-6">
                    {{ accountLabel(row.account) }}
                  </td>
                  <td class="px-4 py-3 text-fg-muted">{{ row.accepted }}</td>
                  <td class="px-4 py-3 text-fg-muted">{{ row.total }}</td>
                  <td class="px-4 py-3 sm:px-6">
                    <div class="flex items-center gap-2">
                      <div class="h-2 w-20 overflow-hidden rounded-full bg-elevated">
                        <div
                          class="h-full rounded-full bg-indigo-500"
                          :style="{ width: `${Math.round((row.rate || 0) * 100)}%` }"
                        />
                      </div>
                      <span class="tabular-nums font-semibold text-fg">{{ formatRate(row.rate) }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div class="border-b border-border bg-elevated px-4 py-4 sm:px-6">
          <h2 class="text-lg font-semibold text-fg">Hours vs estimate</h2>
          <p class="mt-0.5 text-sm text-fg-muted">
            Actual tracker hours from daily logs compared to estimated hours on each project.
          </p>
        </div>
        <div
          v-if="!hoursRows.length"
          class="px-4 py-10 text-center text-sm text-fg-subtle sm:px-6"
        >
          No projects with estimated hours in this range. Add estimates on project create/edit to track variance.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-sm">
            <thead class="bg-elevated text-left text-xs uppercase tracking-wide text-fg-muted">
              <tr>
                <th class="px-4 py-3 font-medium sm:px-6">Project</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium">Estimated</th>
                <th class="px-4 py-3 font-medium">Actual</th>
                <th class="px-4 py-3 font-medium sm:px-6">Variance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="row in hoursRows" :key="row.project_id">
                <td class="px-4 py-3 sm:px-6">
                  <p class="font-medium text-fg">{{ row.name }}</p>
                  <p v-if="row.client_name" class="text-xs text-fg-muted">{{ row.client_name }}</p>
                </td>
                <td class="px-4 py-3 text-fg-muted">{{ projectStatusLabel(row.status) }}</td>
                <td class="px-4 py-3 tabular-nums text-fg-muted">{{ formatHours(row.estimated_hours) }}</td>
                <td class="px-4 py-3 tabular-nums text-fg-muted">{{ formatHours(row.actual_hours) }}</td>
                <td class="px-4 py-3 sm:px-6">
                  <span class="tabular-nums font-semibold" :class="varianceClass(row.variance_hours)">
                    {{ formatVariance(row.variance_hours) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div
      v-else
      class="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-sm text-fg-muted"
    >
      Unable to load performance data.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PerformanceDashboard } from '~/types/dashboard'
import { filterInputClass, filterLabelClass } from '~/utils/ui'
import { projectStatusLabel } from '~/utils/projects'
import { upworkAccountLabel } from '~/utils/meetings'

definePageMeta({ middleware: 'admin' })

const { getPerformance } = useDashboard()

const filterFrom = ref('')
const filterTo = ref('')

const {
  data: performance,
  status,
  error,
  refresh,
} = await useAsyncData<PerformanceDashboard | null>(
  'performance-dashboard',
  () =>
    getPerformance({
      from: filterFrom.value || undefined,
      to: filterTo.value || undefined,
    }),
  {
    server: false,
    default: () => null,
  },
)

const isLoading = computed(() => status.value !== 'success' && status.value !== 'error')

const loadError = computed(() => {
  if (status.value !== 'error' || !error.value) return ''
  const err = error.value as { data?: { error?: string }; message?: string }
  return err?.data?.error || err?.message || 'Failed to load performance data.'
})

const summaryCards = computed(() => {
  const summary = performance.value?.summary
  if (!summary) return []
  return [
    {
      label: 'Meeting win rate',
      value: formatRate(summary.meeting_win_rate),
      hint: `${summary.meeting_won ?? 0} won / ${summary.meeting_total ?? 0} meetings`,
    },
    {
      label: 'Bid accept rate',
      value: formatRate(summary.bid_accept_rate),
      hint: `${summary.bids_accepted ?? 0} accepted / ${summary.bids_total ?? 0} bids`,
    },
    {
      label: 'Avg project cycle',
      value:
        summary.avg_project_cycle_days == null
          ? '—'
          : `${summary.avg_project_cycle_days}d`,
      hint: `${summary.cycle_sample_size ?? 0} completed project${summary.cycle_sample_size === 1 ? '' : 's'}`,
    },
    {
      label: 'Projects with estimate',
      value: String(summary.projects_with_estimate ?? 0),
      hint: 'Included in hours vs estimate',
    },
  ]
})

const meetingRows = computed(() => performance.value?.meeting_win_rate_by_account ?? [])
const bidRows = computed(() => performance.value?.bid_accept_rate_by_account ?? [])
const hoursRows = computed(() => performance.value?.hours_vs_estimate ?? [])

function accountLabel(account: string) {
  if (!account || account === 'unassigned') return 'Unassigned'
  return upworkAccountLabel(account)
}

function formatRate(rate: number | null | undefined) {
  if (rate == null || !Number.isFinite(rate)) return '—'
  return `${Math.round(rate * 100)}%`
}

function formatHours(hours: number) {
  return `${Number(hours || 0).toFixed(1)}h`
}

function formatVariance(hours: number) {
  const value = Number(hours || 0)
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}h`
}

function varianceClass(hours: number) {
  if (hours > 0.05) return 'text-red-600 dark:text-red-400'
  if (hours < -0.05) return 'text-emerald-600 dark:text-emerald-400'
  return 'text-fg-muted'
}

async function applyFilters() {
  await refresh()
}

async function clearFilters() {
  filterFrom.value = ''
  filterTo.value = ''
  await refresh()
}
</script>
