<template>
  <div :aria-busy="true" aria-live="polite">
    <span class="sr-only">Loading…</span>

    <!-- Table skeleton (inside existing card shell) -->
    <div v-if="variant === 'table'" class="overflow-x-auto">
      <div class="divide-y divide-slate-100">
        <div
          v-for="i in rows"
          :key="i"
          class="flex items-center gap-4 px-4 py-4 sm:px-6"
        >
          <div
            v-for="j in columns"
            :key="j"
            class="h-4 min-w-0 animate-pulse rounded bg-slate-200"
            :class="flexCellClass(j)"
          />
        </div>
      </div>
    </div>

    <!-- Card grid skeleton -->
    <div
      v-else-if="variant === 'cards'"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="i in rows"
        :key="i"
        class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-2">
            <div class="h-4 w-40 max-w-full animate-pulse rounded bg-slate-200" />
            <div class="h-3 w-28 max-w-full animate-pulse rounded bg-slate-200" />
          </div>
          <div class="h-6 w-16 shrink-0 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div class="mt-4 space-y-2">
          <div class="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
        </div>
        <div class="mt-4 flex gap-2">
          <div class="h-5 w-14 animate-pulse rounded-full bg-slate-200" />
          <div class="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>

    <!-- Dashboard stats + panels skeleton -->
    <div v-else-if="variant === 'dashboard'">
      <div :class="statsGridClass">
        <div
          v-for="i in statsCount"
          :key="i"
          class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6"
        >
          <div class="flex items-center justify-between">
            <div class="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
            <div class="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
          </div>
          <div class="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
          <div class="mt-2 h-3 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div
          v-for="i in 2"
          :key="`breakdown-${i}`"
          class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6"
        >
          <div class="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div class="mt-1.5 h-3 w-40 animate-pulse rounded bg-slate-200" />
          <div class="mt-4 space-y-3">
            <div v-for="j in 5" :key="j" class="flex items-center gap-3">
              <div class="h-3 w-16 shrink-0 animate-pulse rounded bg-slate-200 sm:w-24" />
              <div class="h-2 flex-1 animate-pulse rounded-full bg-slate-200" />
              <div class="h-3 w-6 shrink-0 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <div class="h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div class="mt-4 space-y-4">
            <div v-for="j in 4" :key="j" class="flex items-start gap-3">
              <div class="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-200" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-3.5 w-3/4 animate-pulse rounded bg-slate-200" />
                <div class="h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <div class="h-5 w-28 animate-pulse rounded bg-slate-200" />
          <div class="mt-4 space-y-3">
            <div
              v-for="j in 3"
              :key="j"
              class="h-12 animate-pulse rounded-xl bg-slate-100"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Grouped day-section tables (bids) -->
    <div v-else-if="variant === 'groups'" class="space-y-6">
      <div
        v-for="i in rows"
        :key="i"
        class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
      >
        <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div class="h-4 w-40 animate-pulse rounded bg-slate-200" />
        </div>
        <div class="divide-y divide-slate-100">
          <div
            v-for="j in 3"
            :key="j"
            class="flex items-center gap-4 px-4 py-4"
          >
            <div
              v-for="k in columns"
              :key="k"
              class="h-4 min-w-0 animate-pulse rounded bg-slate-200"
              :class="flexCellClass(k)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Profile sidebar + form -->
    <div
      v-else-if="variant === 'profile'"
      class="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]"
    >
      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div class="bg-slate-100 px-6 pb-10 pt-8 text-center">
          <div class="mx-auto h-24 w-24 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div class="space-y-3 px-6 pb-6 pt-4">
          <div class="mx-auto h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div class="mx-auto h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div class="mx-auto h-6 w-28 animate-pulse rounded-full bg-slate-200" />
          <div class="mt-6 space-y-3 border-t border-slate-100 pt-6">
            <div v-for="j in 3" :key="j" class="flex items-center gap-3">
              <div class="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-200" />
              <div class="flex-1 space-y-1.5">
                <div class="h-2.5 w-14 animate-pulse rounded bg-slate-200" />
                <div class="h-3.5 w-40 max-w-full animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-6 py-5">
          <div class="h-5 w-44 animate-pulse rounded bg-slate-200" />
          <div class="mt-2 h-3 w-64 max-w-full animate-pulse rounded bg-slate-200" />
        </div>
        <div class="space-y-5 p-6">
          <div v-for="j in 5" :key="j" class="space-y-1.5">
            <div class="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
            <div class="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
          <div class="border-t border-slate-100 pt-5">
            <div class="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'table' | 'cards' | 'dashboard' | 'groups' | 'profile'
    rows?: number
    columns?: number
    statsCount?: number
  }>(),
  {
    variant: 'table',
    rows: 6,
    columns: 5,
    statsCount: 4,
  },
)

const statsGridClass = computed(() =>
  props.statsCount >= 4
    ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid grid-cols-1 gap-5 sm:grid-cols-3',
)

/** Flex fractions — % widths collapse to 0 inside flex rows. */
const flexCycle = ['flex-[1.4]', 'flex-[1.8]', 'flex-1', 'flex-[1.2]', 'flex-[1.5]', 'flex-[0.9]']

function flexCellClass(index: number) {
  return flexCycle[(index - 1) % flexCycle.length]
}
</script>
