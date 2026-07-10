<template>
  <div :aria-busy="true" aria-live="polite">
    <span class="sr-only">Loading…</span>

    <!-- Table skeleton (inside existing card shell) -->
    <div v-if="variant === 'table'" class="overflow-x-auto">
      <div class="divide-y divide-border">
        <div
          v-for="i in rows"
          :key="i"
          class="flex items-center gap-4 px-4 py-4 sm:px-6"
        >
          <div
            v-for="j in columns"
            :key="j"
            class="h-4 min-w-0 animate-pulse rounded bg-border"
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
        class="rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-2">
            <div class="h-4 w-40 max-w-full animate-pulse rounded bg-border" />
            <div class="h-3 w-28 max-w-full animate-pulse rounded bg-border" />
          </div>
          <div class="h-6 w-16 shrink-0 animate-pulse rounded-full bg-border" />
        </div>
        <div class="mt-4 space-y-2">
          <div class="h-3 w-full animate-pulse rounded bg-border" />
          <div class="h-3 w-11/12 animate-pulse rounded bg-border" />
          <div class="h-3 w-4/5 animate-pulse rounded bg-border" />
        </div>
        <div class="mt-4 flex gap-2">
          <div class="h-5 w-14 animate-pulse rounded-full bg-border" />
          <div class="h-5 w-16 animate-pulse rounded-full bg-border" />
        </div>
      </div>
    </div>

    <!-- Dashboard stats + panels skeleton -->
    <div v-else-if="variant === 'dashboard'">
      <div :class="statsGridClass">
        <div
          v-for="i in statsCount"
          :key="i"
          class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
        >
          <div class="flex items-center justify-between">
            <div class="h-3.5 w-20 animate-pulse rounded bg-border" />
            <div class="h-9 w-9 animate-pulse rounded-xl bg-border" />
          </div>
          <div class="mt-4 h-8 w-16 animate-pulse rounded bg-border" />
          <div class="mt-2 h-3 w-24 animate-pulse rounded bg-border" />
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div
          v-for="i in 2"
          :key="`breakdown-${i}`"
          class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
        >
          <div class="h-5 w-32 animate-pulse rounded bg-border" />
          <div class="mt-1.5 h-3 w-40 animate-pulse rounded bg-border" />
          <div class="mt-4 space-y-3">
            <div v-for="j in 5" :key="j" class="flex items-center gap-3">
              <div class="h-3 w-16 shrink-0 animate-pulse rounded bg-border sm:w-24" />
              <div class="h-2 flex-1 animate-pulse rounded-full bg-border" />
              <div class="h-3 w-6 shrink-0 animate-pulse rounded bg-border" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6 lg:col-span-2">
          <div class="h-5 w-36 animate-pulse rounded bg-border" />
          <div class="mt-4 space-y-4">
            <div v-for="j in 4" :key="j" class="flex items-start gap-3">
              <div class="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-border" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-3.5 w-3/4 animate-pulse rounded bg-border" />
                <div class="h-3 w-24 animate-pulse rounded bg-border" />
              </div>
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          <div class="h-5 w-28 animate-pulse rounded bg-border" />
          <div class="mt-4 space-y-3">
            <div
              v-for="j in 3"
              :key="j"
              class="h-12 animate-pulse rounded-xl bg-elevated"
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
        class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      >
        <div class="border-b border-border bg-elevated px-6 py-4">
          <div class="h-4 w-40 animate-pulse rounded bg-border" />
        </div>
        <div class="divide-y divide-border">
          <div
            v-for="j in 3"
            :key="j"
            class="flex items-center gap-4 px-4 py-4"
          >
            <div
              v-for="k in columns"
              :key="k"
              class="h-4 min-w-0 animate-pulse rounded bg-border"
              :class="flexCellClass(k)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Profile wide card -->
    <div v-else-if="variant === 'profile'" class="space-y-6">
      <div class="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div class="grid min-h-[22rem] grid-cols-1 md:grid-cols-[minmax(280px,380px)_1fr]">
          <!-- Left: identity -->
          <div class="flex flex-col items-center justify-center bg-elevated px-8 py-10 text-center">
            <div class="h-32 w-32 animate-pulse rounded-2xl bg-border" />
            <div class="mt-6 h-7 w-44 animate-pulse rounded bg-border" />
            <div class="mt-2 h-4 w-36 animate-pulse rounded bg-border" />
            <div class="mt-4 h-7 w-32 animate-pulse rounded-full bg-border" />
          </div>

          <!-- Right: details + edit -->
          <div class="flex flex-col justify-between gap-8 px-8 py-8 sm:px-10 sm:py-10">
            <div class="space-y-6">
              <div v-for="j in 3" :key="j" class="flex items-center gap-4">
                <div class="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-border" />
                <div class="min-w-0 flex-1 space-y-2">
                  <div class="h-3.5 w-20 animate-pulse rounded bg-border" />
                  <div
                    class="h-5 animate-pulse rounded bg-border"
                    :class="j === 1 ? 'w-56 max-w-full' : 'w-40'"
                  />
                </div>
              </div>
            </div>
            <div class="flex justify-end border-t border-border pt-6">
              <div class="h-12 w-36 animate-pulse rounded-xl bg-border" />
            </div>
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
