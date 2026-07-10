<template>
  <div class="mb-3 flex items-center justify-between gap-1">
    <button
      type="button"
      class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg-muted transition hover:bg-elevated hover:text-fg"
      @click="$emit('prev')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6" /></svg>
    </button>

    <div class="relative flex min-w-0 items-center justify-center gap-1">
      <div class="relative">
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-fg transition hover:bg-elevated"
          :class="monthOpen ? 'bg-elevated' : ''"
          @click.stop="toggleMonth"
        >
          {{ monthLabel }}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-fg-subtle"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <div
          v-if="monthOpen"
          class="absolute left-1/2 top-full z-10 mt-1 max-h-48 w-36 -translate-x-1/2 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          <button
            v-for="option in monthOptions"
            :key="option.value"
            type="button"
            class="flex w-full px-3 py-1.5 text-left text-sm transition hover:bg-indigo-50 dark:bg-indigo-950"
            :class="option.value === yearMonth.month ? 'bg-indigo-50 dark:bg-indigo-950 font-medium text-indigo-700 dark:text-indigo-300' : 'text-fg'"
            @click.stop="selectMonth(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="relative">
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-fg transition hover:bg-elevated"
          :class="yearOpen ? 'bg-elevated' : ''"
          @click.stop="toggleYear"
        >
          {{ yearMonth.year }}
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-fg-subtle"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <div
          v-if="yearOpen"
          ref="yearList"
          class="absolute left-1/2 top-full z-10 mt-1 max-h-48 w-24 -translate-x-1/2 overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          <button
            v-for="year in yearOptions"
            :key="year"
            type="button"
            :data-year="year"
            class="flex w-full justify-center px-3 py-1.5 text-sm transition hover:bg-indigo-50 dark:bg-indigo-950"
            :class="year === yearMonth.year ? 'bg-indigo-50 dark:bg-indigo-950 font-medium text-indigo-700 dark:text-indigo-300' : 'text-fg'"
            @click.stop="selectYear(year)"
          >
            {{ year }}
          </button>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg-muted transition hover:bg-elevated hover:text-fg"
      @click="$emit('next')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
    </button>
  </div>
</template>

<script setup>
import {
  buildCalendarYearOptions,
  calendarMonthLabel,
  CALENDAR_MONTH_OPTIONS,
} from '~/utils/dates'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
})

const emit = defineEmits(['update:year', 'update:month', 'prev', 'next'])

const monthOpen = ref(false)
const yearOpen = ref(false)
const yearList = ref(null)

const yearMonth = computed(() => ({ year: props.year, month: props.month }))
const monthLabel = computed(() => calendarMonthLabel(props.month))
const monthOptions = CALENDAR_MONTH_OPTIONS
const yearOptions = buildCalendarYearOptions(new Date().getFullYear(), 100)

function closePickers() {
  monthOpen.value = false
  yearOpen.value = false
}

function toggleMonth() {
  yearOpen.value = false
  monthOpen.value = !monthOpen.value
}

function toggleYear() {
  monthOpen.value = false
  yearOpen.value = !yearOpen.value
  if (yearOpen.value) {
    nextTick(() => scrollSelectedYearIntoView())
  }
}

function selectMonth(month) {
  emit('update:month', month)
  monthOpen.value = false
}

function selectYear(year) {
  emit('update:year', year)
  yearOpen.value = false
}

function scrollSelectedYearIntoView() {
  const list = yearList.value
  if (!list) return
  const selected = list.querySelector(`[data-year="${props.year}"]`)
  if (selected) {
    selected.scrollIntoView({ block: 'center' })
  }
}

watch(
  () => [props.year, props.month],
  () => closePickers(),
)

defineExpose({ closePickers })
</script>
